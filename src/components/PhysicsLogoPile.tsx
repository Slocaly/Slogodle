// src/components/PhysicsLogoPile.tsx
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react'
import { flushSync } from 'react-dom'
import { LOGOS, type Logo } from '../data/logos'
import { pickDailySequence } from '../lib/dailyRandom'
import { createLogoPileSimulation, type LogoPileSimulation } from '../lib/physicsLogoPile'
import { getStickerIconSrc } from '../lib/stickerIcons'

const PILE_SIZE = 50
const STICKER_LOGOS = import.meta.env.VITE_STICKER_LOGOS !== 'false'

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
  icon: string
  aspect: number
}

export function PhysicsLogoPile({ dayIndex, logo, ref }: PhysicsLogoPileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRefs = useRef(new Map<string, HTMLImageElement>())
  const simRef = useRef<LogoPileSimulation | null>(null)
  const launchBatchRef = useRef(0)
  const [launchSlots, setLaunchSlots] = useState<PileSlot[]>([])

  const slots = useMemo<PileSlot[]>(
    () =>
      pickDailySequence(LOGOS.filter((l) => l.name !== logo.name), dayIndex * 97 + 13, PILE_SIZE).map((l, i) => ({
        slotKey: `${l.name}#${i}`,
        name: l.name,
        icon: l.icon,
        aspect: l.aspect,
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
      logos: slots.map((slot) => ({ key: slot.slotKey, aspect: slot.aspect })),
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
          icon: logo.icon,
          aspect: logo.aspect,
        }))
        // Elements must be mounted before the simulation can grab them.
        flushSync(() => setLaunchSlots((prev) => [...prev, ...newSlots]))
        sim.launchFromSide(
          newSlots.map((s) => ({ key: s.slotKey, aspect: s.aspect })),
          side,
        )
      },
    }),
    [logo],
  )

  return (
    <div className="physics-pile" ref={containerRef} aria-hidden="true">
      {[...slots, ...launchSlots].map((slot) => (
        <img
          key={slot.slotKey}
          ref={(el) => {
            if (el) {
              elementRefs.current.set(slot.slotKey, el)
              if (STICKER_LOGOS) {
                getStickerIconSrc(slot.icon).then((src) => {
                  if (elementRefs.current.get(slot.slotKey) === el) el.src = src
                })
              }
            } else {
              elementRefs.current.delete(slot.slotKey)
            }
          }}
          className="physics-pile-logo"
          src={slot.icon}
          alt=""
        />
      ))}
    </div>
  )
}
