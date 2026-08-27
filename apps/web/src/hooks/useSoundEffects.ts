import useSound from 'use-sound'

export function useSoundEffects(soundEnabled: boolean) {
  const [playClick] = useSound('/sounds/click.wav', { soundEnabled })
  const [playWrongGuess] = useSound('/sounds/error.wav', { soundEnabled })
  const [playWin] = useSound('/sounds/confirm.wav', { soundEnabled })
  const [playLose] = useSound('/sounds/error-final.wav', { soundEnabled })
  const [playBubble] = useSound('/sounds/bubble.wav', { soundEnabled })

  return { playClick, playWrongGuess, playWin, playLose, playBubble }
}
