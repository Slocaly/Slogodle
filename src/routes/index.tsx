// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useGameState } from '../hooks/useGameState'
import { GameHeader } from '../components/GameHeader'
import { ArchivePanel } from '../components/ArchivePanel'
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
    <div className="page">
      <GameHeader
        archiveOpen={g.archiveOpen}
        onToggleArchive={g.toggleArchive}
        dark={g.dark}
        onToggleDark={g.toggleDark}
      />
      <ArchivePanel open={g.archiveOpen} dayIndex={g.dayIndex} history={g.history} />
      <main className="game-area">
        <div className="card">
          <LogoCard dayIndex={g.dayIndex} status={g.status} logo={g.logo} />
          <GuessTiles guesses={g.guesses} />
          {isPlaying && (
            <GuessForm
              value={g.value}
              onChange={g.setValue}
              onSubmit={g.submitGuess}
              logo={g.logo}
              attemptCount={g.guesses.length}
              maxTries={g.maxTries}
            />
          )}
          {!isPlaying && (
            <RevealPanel logo={g.logo} guesses={g.guesses} maxTries={g.maxTries} streak={g.streak} />
          )}
        </div>
      </main>
      {import.meta.env.DEV && <DevtoolsPanel />}
    </div>
  )
}
