// src/lib/physicsLogoPile.ts
import Matter from 'matter-js'

const WALL_THICKNESS = 60
const BODY_SIZE_MIN = 64
const BODY_SIZE_MAX = 104
const RESIZE_DEBOUNCE_MS = 150
// Logos spawn staggered above the viewport's top edge (behind the header, which sits
// in front due to z-index) and fall the full page height into the band. The ceiling
// must sit above every possible spawn point (with margin), or bodies land on top of
// it instead of falling through.
const SPAWN_STAGGER = 300
const CEILING_MARGIN = 100
const CURSOR_RADIUS = 45
const CURSOR_PUSH_RADIUS = CURSOR_RADIUS + 70
const CURSOR_PUSH_FORCE = 0.15
const EXPLOSION_RADIUS = 425
const EXPLOSION_STRENGTH = 82
const LAUNCH_STAGGER = 90
const LAUNCH_SPEED = 42
const LAUNCH_SPEED_VARIANCE = 12
const LAUNCH_HEIGHT_LIFT_RATIO = 0.3
const LAUNCH_UPWARD_SPEED = 15
const LAUNCH_UPWARD_SPEED_VARIANCE = 12

export interface PileLogo {
  key: string
}

export interface CreateLogoPileSimulationOptions {
  container: HTMLElement
  logos: PileLogo[]
  getElement: (key: string) => SVGSVGElement | null
  reducedMotion: boolean
}

export interface LogoPileSimulation {
  destroy(): void
  /** Flings the given (already-mounted) element keys in from a screen edge, staggered. */
  launchFromSide(keys: string[], side: 'left' | 'right'): void
}

// Crops an element's viewBox to its drawn content and sizes it within the pile's
// body-size range. Shared by the initial top-down spawn and side launches.
function sizeElement(el: SVGSVGElement): { width: number; height: number } | null {
  const bbox = el.getBBox()
  if (bbox.width <= 0 || bbox.height <= 0) return null
  el.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)
  const aspect = bbox.width / bbox.height

  const longEdge = BODY_SIZE_MIN + Math.random() * (BODY_SIZE_MAX - BODY_SIZE_MIN)
  const width = aspect >= 1 ? longEdge : longEdge * aspect
  const height = aspect >= 1 ? longEdge / aspect : longEdge

  el.style.width = `${width}px`
  el.style.height = `${height}px`
  return { width, height }
}

function createPileBody(x: number, y: number, width: number, height: number): Matter.Body {
  return Matter.Bodies.rectangle(x, y, width, height, {
    chamfer: { radius: Math.min(width, height) * 0.18 },
    restitution: 0.15,
    friction: 0.6,
    frictionAir: 0.02,
    angle: Math.random() * Math.PI * 2,
  })
}

function createBoundaries(width: number, height: number, ceilingY: number) {
  const options: Matter.IChamferableBodyDefinition = { isStatic: true, friction: 0.8 }
  const spanTop = ceilingY
  const spanHeight = height - spanTop
  return [
    // floor
    Matter.Bodies.rectangle(width / 2, height + WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS, options),
    // ceiling — positioned above every possible spawn point, see ceilingY above
    Matter.Bodies.rectangle(width / 2, spanTop - WALL_THICKNESS / 2, width + WALL_THICKNESS * 2, WALL_THICKNESS, options),
    // left wall
    Matter.Bodies.rectangle(-WALL_THICKNESS / 2, spanTop + spanHeight / 2, WALL_THICKNESS, spanHeight + WALL_THICKNESS * 2, options),
    // right wall
    Matter.Bodies.rectangle(width + WALL_THICKNESS / 2, spanTop + spanHeight / 2, WALL_THICKNESS, spanHeight + WALL_THICKNESS * 2, options),
  ]
}

export function createLogoPileSimulation(options: CreateLogoPileSimulationOptions): LogoPileSimulation {
  const { container, logos, getElement, reducedMotion } = options
  const engine = Matter.Engine.create()

  let width = 0
  let height = 0
  let boundaries: Matter.Body[] = []
  let pileBodies: { body: Matter.Body; el: SVGSVGElement; width: number; height: number }[] = []
  let spawned = false

  function sync() {
    for (const { body, el, width: w, height: h } of pileBodies) {
      el.style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`
    }
  }
  Matter.Events.on(engine, 'afterUpdate', sync)

  const runner = Matter.Runner.create()
  Matter.Runner.run(runner, engine)

  const mouse = Matter.Mouse.create(container)
  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  })
  Matter.Composite.add(engine.world, mouseConstraint)

  // A static body that follows the pointer so it physically bumps logos aside on
  // hover/touch-move, without needing to click-and-drag anything.
  const cursorBody = Matter.Bodies.circle(-9999, -9999, CURSOR_RADIUS, {
    isStatic: true,
    friction: 0,
  })
  Matter.Composite.add(engine.world, cursorBody)

  function handlePointerMove(event: PointerEvent) {
    const rect = container.getBoundingClientRect()
    Matter.Body.setPosition(cursorBody, { x: event.clientX - rect.left, y: event.clientY - rect.top })
  }
  function handlePointerLeave() {
    Matter.Body.setPosition(cursorBody, { x: -9999, y: -9999 })
  }
  container.addEventListener('pointermove', handlePointerMove)
  container.addEventListener('pointerleave', handlePointerLeave)

  // On top of the passive block above, actively shove any logo the cursor gets
  // close to — falloff with distance so it feels like a touch, not a constant wind.
  function applyCursorPush() {
    const cx = cursorBody.position.x
    const cy = cursorBody.position.y
    for (const { body } of pileBodies) {
      const dx = body.position.x - cx
      const dy = body.position.y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist === 0 || dist > CURSOR_PUSH_RADIUS) continue
      const strength = (1 - dist / CURSOR_PUSH_RADIUS) * CURSOR_PUSH_FORCE
      Matter.Body.applyForce(body, body.position, { x: (dx / dist) * strength, y: (dy / dist) * strength })
    }
  }
  Matter.Events.on(engine, 'beforeUpdate', applyCursorPush)

  // A one-shot radial impulse on click/tap — everything nearby gets flung outward
  // at once, on top of whatever velocity it already had.
  function handlePointerDown(event: PointerEvent) {
    const rect = container.getBoundingClientRect()
    const cx = event.clientX - rect.left
    const cy = event.clientY - rect.top
    for (const { body } of pileBodies) {
      const dx = body.position.x - cx
      const dy = body.position.y - cy
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      if (dist > EXPLOSION_RADIUS) continue
      const impulse = (1 - dist / EXPLOSION_RADIUS) * EXPLOSION_STRENGTH
      Matter.Body.setVelocity(body, {
        x: body.velocity.x + (dx / dist) * impulse,
        y: body.velocity.y + (dy / dist) * impulse,
      })
      Matter.Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * 0.6)
    }
  }
  container.addEventListener('pointerdown', handlePointerDown)

  function applySize(w: number, h: number) {
    width = w
    height = h

    // Local y that corresponds to the viewport's own top edge (page y = 0), since the
    // container is pinned to the bottom of the viewport at height `height`.
    const viewportTop = -(window.innerHeight - height)
    const spawnTop = viewportTop - SPAWN_STAGGER
    const ceilingY = spawnTop - CEILING_MARGIN

    if (boundaries.length) Matter.Composite.remove(engine.world, boundaries)
    boundaries = createBoundaries(width, height, ceilingY)
    Matter.Composite.add(engine.world, boundaries)

    if (spawned) return
    spawned = true

    pileBodies = logos.flatMap((logo) => {
      const el = getElement(logo.key)
      if (!el) return []

      // Crop to the actual drawn content (not the padded viewBox) so the physics
      // hitbox matches the visible logo instead of leaving gaps around it.
      const sized = sizeElement(el)
      if (!sized) return []
      const { width: bodyWidth, height: bodyHeight } = sized
      const x = bodyWidth / 2 + Math.random() * Math.max(width - bodyWidth, 1)
      const y = reducedMotion
        ? height - bodyHeight / 2 - Math.random() * 60
        : viewportTop - bodyHeight - Math.random() * SPAWN_STAGGER

      const body = createPileBody(x, y, bodyWidth, bodyHeight)

      if (!reducedMotion) {
        // A strong sideways kick and spin on entry so the fall reads as tumbling
        // confetti rather than everything dropping straight down in lockstep.
        Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 60, y: Math.random() * 6 })
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 1)
      }

      return [{ body, el, width: bodyWidth, height: bodyHeight }]
    })
    Matter.Composite.add(engine.world, pileBodies.map((entry) => entry.body))
  }

  const launchTimers: ReturnType<typeof setTimeout>[] = []

  function launchFromSide(keys: string[], side: 'left' | 'right') {
    keys.forEach((key, i) => {
      const timer = setTimeout(() => {
        const el = getElement(key)
        if (!el) return
        const sized = sizeElement(el)
        if (!sized) return
        const { width: bodyWidth, height: bodyHeight } = sized

        const x = reducedMotion
          ? bodyWidth / 2 + Math.random() * Math.max(width - bodyWidth, 1)
          : side === 'left'
            ? bodyWidth / 2 + 10
            : width - bodyWidth / 2 - 10
        const y = reducedMotion
          ? height - bodyHeight / 2 - Math.random() * 60
          : bodyHeight + Math.random() * Math.max(height - bodyHeight * 3, 1) - height * LAUNCH_HEIGHT_LIFT_RATIO

        const body = createPileBody(x, y, bodyWidth, bodyHeight)

        if (!reducedMotion) {
          // A strong horizontal kick from the chosen edge, angled upward, so it visibly
          // flies across and up the screen before gravity and the floor take over.
          const speed = LAUNCH_SPEED + Math.random() * LAUNCH_SPEED_VARIANCE
          const upwardSpeed = LAUNCH_UPWARD_SPEED + Math.random() * LAUNCH_UPWARD_SPEED_VARIANCE
          Matter.Body.setVelocity(body, { x: side === 'left' ? speed : -speed, y: -upwardSpeed })
          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 1)
        }

        pileBodies.push({ body, el, width: bodyWidth, height: bodyHeight })
        Matter.Composite.add(engine.world, body)
      }, i * LAUNCH_STAGGER)
      launchTimers.push(timer)
    })
  }

  let resizeTimer: ReturnType<typeof setTimeout> | undefined
  const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    const { width: w, height: h } = entry.contentRect
    if (w <= 0 || h <= 0) return

    if (!spawned) {
      // First valid measurement: set up boundaries and spawn bodies immediately,
      // no debounce — nothing exists yet, so there's no flicker to guard against.
      applySize(w, h)
      return
    }

    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => applySize(w, h), RESIZE_DEBOUNCE_MS)
  })
  resizeObserver.observe(container)

  return {
    launchFromSide,
    destroy() {
      clearTimeout(resizeTimer)
      for (const timer of launchTimers) clearTimeout(timer)
      resizeObserver.disconnect()
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerleave', handlePointerLeave)
      container.removeEventListener('pointerdown', handlePointerDown)
      Matter.Events.off(engine, 'beforeUpdate', applyCursorPush)
      Matter.Events.off(engine, 'afterUpdate', sync)
      Matter.Runner.stop(runner)
      Matter.Composite.clear(engine.world, false)
      Matter.Engine.clear(engine)
    },
  }
}
