// src/components/PhysicsLogoPile.tsx
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { flushSync } from 'react-dom'
import { LOGOS, type Logo } from '../data/logos'
import { createLogoPileSimulation, type LogoPileSimulation } from '../lib/physicsLogoPile'
import { getStickerIconSrc } from '../lib/stickerIcons'
import styles from './PhysicsLogoPile.module.css'

const STICKER_LOGOS = import.meta.env.VITE_STICKER_LOGOS !== 'false'

export interface PhysicsLogoPileHandle {
  /** Flings `count` copies of today's logo in from a random screen edge. */
  launchWin(count: number): void
  /** Flings `count` random logos in from a random screen edge, purely visual. */
  addRandomLogos(count: number): void
  /** Clears any launched (win or random) logos, leaving only the found ones. */
  resetToFound(): void
}

interface PhysicsLogoPileProps {
  dayIndex: number
  logo: Logo
  foundLogos: { dayIndex: number; logo: Logo; count: number }[]
  ref?: Ref<PhysicsLogoPileHandle>
}

interface PileSlot {
  slotKey: string
  name: string
  icon: string
  aspect: number
}

export function PhysicsLogoPile({ dayIndex, logo, foundLogos, ref }: PhysicsLogoPileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRefs = useRef(new Map<string, HTMLDivElement>())
  const imgRefs = useRef(new Map<string, HTMLImageElement>())
  const simRef = useRef<LogoPileSimulation | null>(null)
  const launchBatchRef = useRef(0)
  const [launchSlots, setLaunchSlots] = useState<PileSlot[]>([])

  // Snapshot of everything already found as of page load (across all days). Taken
  // once so a win during this session is only ever added via launchWin, never here.
  const [initialSlots] = useState<PileSlot[]>(() =>
    foundLogos.flatMap((entry) =>
      Array.from({ length: entry.count }, (_, i) => ({
        slotKey: `found-${entry.dayIndex}#${i}`,
        name: entry.logo.name,
        icon: entry.logo.icon,
        aspect: entry.logo.aspect,
      })),
    ),
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
      logos: initialSlots.map((slot) => ({ key: slot.slotKey, aspect: slot.aspect })),
      getElement: (key) => elementRefs.current.get(key) ?? null,
      reducedMotion,
    })
    simRef.current = simulation

    return () => {
      simRef.current = null
      simulation.destroy()
    }
  }, [initialSlots])

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
      addRandomLogos(count) {
        const sim = simRef.current
        if (!sim) return
        const side: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right'
        const batchId = launchBatchRef.current++
        const newSlots: PileSlot[] = Array.from({ length: count }, (_, i) => {
          const random = LOGOS[Math.floor(Math.random() * LOGOS.length)]
          return {
            slotKey: `random-${batchId}-${i}`,
            name: random.name,
            icon: random.icon,
            aspect: random.aspect,
          }
        })
        flushSync(() => setLaunchSlots((prev) => [...prev, ...newSlots]))
        sim.launchFromSide(
          newSlots.map((s) => ({ key: s.slotKey, aspect: s.aspect })),
          side,
        )
      },
      resetToFound() {
        const sim = simRef.current
        if (!sim) return
        sim.removeAllExcept(initialSlots.map((s) => s.slotKey))
        setLaunchSlots([])
      },
    }),
    [logo, initialSlots],
  )

  return (
    <div className={styles.physicsPile} ref={containerRef} aria-hidden="true">
      {[...initialSlots, ...launchSlots].map((slot) => (
        <div
          key={slot.slotKey}
          ref={(el) => {
            if (el) {
              elementRefs.current.set(slot.slotKey, el)
            } else {
              elementRefs.current.delete(slot.slotKey)
            }
          }}
          className={styles.physicsPileItem}
        >
          <div className={styles.physicsPileRotate} data-pile-rotate>
            <img
              ref={(el) => {
                if (el) {
                  imgRefs.current.set(slot.slotKey, el)
                  if (STICKER_LOGOS) {
                    getStickerIconSrc(slot.icon).then((src) => {
                      if (imgRefs.current.get(slot.slotKey) === el) el.src = src
                    })
                  }
                } else {
                  imgRefs.current.delete(slot.slotKey)
                }
              }}
              className={styles.physicsPileLogo}
              src={slot.icon}
              alt=""
            />
          </div>
          <span className={styles.physicsPileTooltip}>{slot.name}</span>
        </div>
      ))}
    </div>
  )
}
