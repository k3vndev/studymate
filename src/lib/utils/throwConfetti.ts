import confetti from 'canvas-confetti'

export const throwConfetti = () => {
  const main = document?.querySelector('#main')
  if (main === null || typeof window === 'undefined') return

  const { innerWidth } = window
  const { left, width } = main.getBoundingClientRect()
  const origin = { x: (left + width / 2) / innerWidth, y: 0.65 }

  confetti({ origin, spread: 60, particleCount: 70 })
}
