// src/components/PhysicsLogoPile.tsx
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react'
import { flushSync } from 'react-dom'
import { LOGOS, type Logo } from '../data/logos'
import { pickDailySequence } from '../lib/dailyRandom'
import { createLogoPileSimulation, type LogoPileSimulation } from '../lib/physicsLogoPile'

const PILE_SIZE = 50
const TINTS = ['var(--accent-pink)', 'var(--accent-mint)', 'var(--accent-yellow)', 'var(--accent-lavender)']

export interface PhysicsLogoPileHandle {
  /** Flings `count` copies of today's logo in from a random screen edge. */
  launchWin(count: number): void
}

interface PhysicsLogoPileProps {
  dayIndex: number
  logo: Logo
  ref?: Ref<PhysicsLogoPileHandle>
}

interface PileSlot {
  slotKey: string
  name: string
  viewBox: string
  svgPath: string
}

export function PhysicsLogoPile({ dayIndex, logo, ref }: PhysicsLogoPileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRefs = useRef(new Map<string, SVGSVGElement>())
  const simRef = useRef<LogoPileSimulation | null>(null)
  const launchBatchRef = useRef(0)
  const [launchSlots, setLaunchSlots] = useState<PileSlot[]>([])

  const slots = useMemo<PileSlot[]>(
    () =>
      pickDailySequence(LOGOS.filter((l) => l.name !== logo.name), dayIndex * 97 + 13, PILE_SIZE).map((l, i) => ({
        slotKey: `${l.name}#${i}`,
        name: l.name,
        viewBox: l.viewBox,
        svgPath: l.svgPath,
      })),
    [dayIndex, logo.name],
  )

  // A win's launched logos belong to that day only — drop them when navigating away.
  useEffect(() => {
    setLaunchSlots([])
  }, [dayIndex])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const simulation = createLogoPileSimulation({
      container,
      logos: slots.map((slot) => ({ key: slot.slotKey })),
      getElement: (key) => elementRefs.current.get(key) ?? null,
      reducedMotion,
    })
    simRef.current = simulation

    return () => {
      simRef.current = null
      simulation.destroy()
    }
  }, [slots])

  useImperativeHandle(
    ref,
    () => ({
      launchWin(count) {
        const sim = simRef.current
        if (!sim) return
        const side: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right'
        const batchId = launchBatchRef.current++
        const newSlots: PileSlot[] = Array.from({ length: count }, (_, i) => ({
          slotKey: `win-${batchId}-${i}`,
          name: logo.name,
          viewBox: logo.viewBox,
          svgPath: logo.svgPath,
        }))
        // Elements must be mounted (for their bounding box) before the simulation can grab them.
        flushSync(() => setLaunchSlots((prev) => [...prev, ...newSlots]))
        sim.launchFromSide(
          newSlots.map((s) => s.slotKey),
          side,
        )
      },
    }),
    [logo],
  )

  return (
    <div className="physics-pile" ref={containerRef} aria-hidden="true">
      {[...slots, ...launchSlots].map((slot, i) => (
        <svg
          key={slot.slotKey}
          ref={(el) => {
            if (el) elementRefs.current.set(slot.slotKey, el)
            else elementRefs.current.delete(slot.slotKey)
          }}
          className="physics-pile-logo"
          viewBox={slot.viewBox}
          style={{ color: TINTS[i % TINTS.length] }}
          xmlns="http://www.w3.org/2000/svg"
          dangerouslySetInnerHTML={{ __html: slot.svgPath }}
        />
      ))}
    </div>
  )
}
