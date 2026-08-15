// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useGameState } from '../hooks/useGameState'
import { GameHeader } from '../components/GameHeader'
import { ArchivePanel } from '../components/ArchivePanel'
import { PhysicsLogoPile } from '../components/PhysicsLogoPile'
import { LogoCard } from '../components/LogoCard'
import { GuessTiles } from '../components/GuessTiles'
import { GuessForm } from '../components/GuessForm'
import { RevealPanel } from '../components/RevealPanel'
import { DevtoolsPanel } from '../components/DevtoolsPanel'

export const Route = createFileRoute('/')({
  ssr: false,
  component: Home,
})

function Home() {
  const g = useGameState()
  const isPlaying = g.status === 'playing'

  return (
    <>
      <PhysicsLogoPile dayIndex={g.dayIndex} excludeName={g.logo.name} />
      <div className="page">
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
        <main className="game-area">
          <div className="card">
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
                onSubmit={g.submitGuess}
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
        {import.meta.env.DEV && <DevtoolsPanel />}
      </div>
    </>
  )
}
