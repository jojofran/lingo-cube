// REFACTORED: F-A-1
export type GameMode = 'normal' | 'speed' | 'spell' | 'listen'

export type Screen = 'select' | 'playing' | 'finished'

export type WordResult = 'correct' | 'wrong' | null

// REFACTORED: F-E-2
export interface SessionRecord {
  id: string
  date: number
  mode: GameMode
  score: number
  combo: number
  totalRounds: number
  correctCount: number
  wrongCount: number
  accuracy: number
  duration?: number
}
