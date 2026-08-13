// src/components/PhysicsLogoPile.tsx
import { useEffect, useMemo, useRef } from 'react'
import { LOGOS } from '../data/logos'
import { pickDailySequence } from '../lib/dailyRandom'
import { createLogoPileSimulation } from '../lib/physicsLogoPile'

const PILE_SIZE = 150
const TINTS = ['var(--accent-pink)', 'var(--accent-mint)', 'var(--accent-yellow)', 'var(--accent-lavender)']

interface PhysicsLogoPileProps {
  dayIndex: number
  excludeName: string
}

interface PileSlot {
  slotKey: string
  name: string
  viewBox: string
  svgPath: string
}

export function PhysicsLogoPile({ dayIndex, excludeName }: PhysicsLogoPileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRefs = useRef(new Map<string, SVGSVGElement>())

  const slots = useMemo<PileSlot[]>(
    () =>
      pickDailySequence(LOGOS.filter((logo) => logo.name !== excludeName), dayIndex * 97 + 13, PILE_SIZE).map(
        (logo, i) => ({ slotKey: `${logo.name}#${i}`, name: logo.name, viewBox: logo.viewBox, svgPath: logo.svgPath }),
      ),
    [dayIndex, excludeName],
  )

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

    return () => simulation.destroy()
  }, [slots])

  return (
    <div className="physics-pile" ref={containerRef} aria-hidden="true">
      {slots.map((slot, i) => (
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
          // svgPath comes from our own static data/logos.ts, never from user input
          dangerouslySetInnerHTML={{ __html: slot.svgPath }}
        />
      ))}
    </div>
  )
}
