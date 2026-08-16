// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { useGameState } from '../hooks/useGameState'
import { GameHeader } from '../components/GameHeader'
import { ArchivePanel } from '../components/ArchivePanel'
import { PhysicsLogoPile, type PhysicsLogoPileHandle } from '../components/PhysicsLogoPile'
import { LogoCard } from '../components/LogoCard'
import { GuessTiles } from '../components/GuessTiles'
import { GuessForm } from '../components/GuessForm'
import { RevealPanel } from '../components/RevealPanel'
import { DevtoolsPanel } from '../components/DevtoolsPanel'
import shared from '../styles/shared.module.css'
import styles from './index.module.css'

export const Route = createFileRoute('/')({
  ssr: false,
  component: Home,
})

function Home() {
  const g = useGameState()
  const isPlaying = g.status === 'playing'
  const pileRef = useRef<PhysicsLogoPileHandle>(null)

  function handleGuess(text: string) {
    const result = g.submitGuess(text)
    if (result?.status === 'won') {
      pileRef.current?.launchWin(g.maxTries + 1 - result.attempts)
    }
  }

  function handleFakeLaunch() {
    pileRef.current?.launchWin(g.maxTries)
  }

  return (
    <>
      <PhysicsLogoPile ref={pileRef} dayIndex={g.dayIndex} logo={g.logo} />
      <div className={shared.page}>
        <div className={styles.headerWrap}>
          <GameHeader
            archiveOpen={g.archiveOpen}
            onToggleArchive={g.toggleArchive}
            dark={g.dark}
            onToggleDark={g.toggleDark}
          />
          <ArchivePanel
            open={g.archiveOpen}
            dayIndex={g.todayIndex}
            activeDayIndex={g.dayIndex}
            history={g.history}
            onSelectDay={g.viewDay}
          />
        </div>
        <main className={shared.gameArea} id="main">
          <div className={shared.card}>
            <LogoCard
              dayIndex={g.dayIndex}
              status={g.status}
              logo={g.logo}
              isToday={g.isToday}
              onBackToday={g.returnToToday}
            />
            <GuessTiles guesses={g.guesses} />
            {isPlaying && (
              <GuessForm
                key={g.dayIndex}
                onSubmit={handleGuess}
                logo={g.logo}
                attemptCount={g.guesses.length}
                maxTries={g.maxTries}
              />
            )}
            {!isPlaying && (
              <RevealPanel
                logo={g.logo}
                guesses={g.guesses}
                maxTries={g.maxTries}
                streak={g.streak}
                isToday={g.isToday}
                onBackToday={g.returnToToday}
              />
            )}
          </div>
        </main>
        {import.meta.env.DEV && <DevtoolsPanel onResetDay={g.resetDay} onFakeLaunch={handleFakeLaunch} />}
      </div>
    </>
  )
}
