// src/lib/tiltGravity.ts
// Turns the phone's inclination into a gravity vector for the logo pile.
// Held upright in portrait = full downward gravity; flat = ~zero; tilted sideways = sideways pull.

const SMOOTHING = 0.15
const DEAD_ZONE = 0.04
// Gravity multiplier at full tilt (1 = the pile's normal gravity). Raise it for a snappier pile.
const TILT_STRENGTH = 3

type OrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export interface TiltGravityController {
  /** Call from a user gesture (tap). On iOS this prompts for motion access; elsewhere it just starts. */
  enable(): void
  destroy(): void
}

export function isTiltCapable(): boolean {
  return (
    typeof window !== 'undefined' &&
    'DeviceOrientationEvent' in window &&
    window.matchMedia('(pointer: coarse)').matches
  )
}

export function createTiltGravity(onGravity: (x: number, y: number) => void): TiltGravityController {
  let listening = false
  let requested = false
  // True once a real sensor reading arrived, i.e. motion access is already granted.
  let receiving = false
  let sx = 0
  let sy = TILT_STRENGTH

  function handle(event: DeviceOrientationEvent) {
    if (event.beta == null || event.gamma == null) return
    receiving = true
    const beta = (event.beta * Math.PI) / 180
    const gamma = (event.gamma * Math.PI) / 180
    let x = Math.sin(gamma) * Math.cos(beta)
    let y = Math.sin(beta)
    if (Math.abs(x) < DEAD_ZONE) x = 0
    if (Math.abs(y) < DEAD_ZONE) y = 0
    sx += (x * TILT_STRENGTH - sx) * SMOOTHING
    sy += (y * TILT_STRENGTH - sy) * SMOOTHING
    onGravity(sx, sy)
  }

  function start() {
    if (listening) return
    listening = true
    window.addEventListener('deviceorientation', handle)
  }

  // Listen right away: if motion access was already granted (always on Android, or
  // earlier on iOS) readings flow without any tap. Otherwise nothing fires until enable().
  if (isTiltCapable()) start()

  return {
    enable() {
      if (requested || receiving || !isTiltCapable()) return
      requested = true
      const Ctor = DeviceOrientationEvent as OrientationEventWithPermission
      if (typeof Ctor.requestPermission === 'function') {
        Ctor.requestPermission()
          .then((state) => {
            if (state === 'granted') start()
            else requested = false
          })
          .catch((error) => {
            console.warn('[tilt] motion permission failed', error)
            requested = false // allow a retry on the next tap
          })
      } else {
        start()
      }
    },
    destroy() {
      window.removeEventListener('deviceorientation', handle)
      listening = false
    },
  }
}
