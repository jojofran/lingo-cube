import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import type { WordEntry, GameMode, SessionRecord } from '@/types'

const STORAGE_KEY = 'lingo-session-history'
const MAX_RECORDS = 200

function loadHistory(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(records: SessionRecord[]) {
  const trimmed = records.slice(-MAX_RECORDS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
}

export const useGameSessionStore = defineStore('gameSession', () => {
  // ---- Existing state ----
  const mode = ref<GameMode>('normal')
  /** @deprecated — replaced by sessionHistory */
  const scoreHistory = ref<number[]>([])
  /** @deprecated — replaced by bestComboEver (computed from sessionHistory) */
  const bestCombo = ref(0)

  // ---- New game state ----
  const currentIndex = ref(0)
  const score = ref(0)
  const combo = ref(0)
  const maxCombo = ref(0)
  const failedWords = shallowRef<WordEntry[]>([])

  // ---- Session history state ----
  const sessionHistory = ref<SessionRecord[]>(loadHistory())

  // ---- Computed ----
  const grade = computed(() => {
    if (score.value >= 400) return { label: '🏆 Legendary', emoji: '🌟' }
    if (score.value >= 250) return { label: '🔥 Excellent', emoji: '🎉' }
    if (score.value >= 150) return { label: '👍 Good Job', emoji: '✨' }
    return { label: '💪 Keep Practicing', emoji: '📖' }
  })

  const totalGames = computed(() => sessionHistory.value.length)
  const averageScore = computed(() => {
    if (!sessionHistory.value.length) return 0
    return Math.round(
      sessionHistory.value.reduce((a, b) => a + b.score, 0) /
        sessionHistory.value.length,
    )
  })
  const bestScoreEver = computed(() =>
    Math.max(...sessionHistory.value.map((s) => s.score), 0),
  )
  const bestComboEver = computed(() =>
    Math.max(...sessionHistory.value.map((s) => s.combo), 0),
  )

  // ---- Methods ----
  function setMode(m: GameMode) {
    mode.value = m
    currentIndex.value = 0
    score.value = 0
    combo.value = 0
    maxCombo.value = 0
    failedWords.value = []
  }

  function onCorrect(isSpeed: boolean, timeLeft: number, mode?: GameMode): void {
    combo.value++
    if (combo.value > maxCombo.value) {
      maxCombo.value = combo.value
    }
    const bonus = Math.min(combo.value * 2, 20)
    let base: number
    if (isSpeed) {
      base = 15
    } else if (mode === 'listen') {
      base = 15
    } else if (mode === 'spell') {
      base = 12
    } else {
      base = 10
    }
    score.value += base + bonus
    if (isSpeed) {
      score.value += Math.max(0, timeLeft * 2)
    }
  }

  function onWrong(word: WordEntry): void {
    combo.value = 0
    failedWords.value.push(word)
  }

  function resetScore(): void {
    score.value = 0
    combo.value = 0
    maxCombo.value = 0
    failedWords.value = []
  }

  /** @deprecated — use recordSession() instead */
  function recordGame(s: number, c: number) {
    scoreHistory.value.push(s)
    if (c > bestCombo.value) {
      bestCombo.value = c
    }
  }

  function recordSession(result: {
    score: number
    maxCombo: number
    mode: GameMode
    totalRounds: number
    correctCount: number
    wrongCount: number
    duration?: number
  }): void {
    const record: SessionRecord = {
      id: Date.now().toString(),
      date: Date.now(),
      mode: result.mode,
      score: result.score,
      combo: result.maxCombo,
      totalRounds: result.totalRounds,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      accuracy:
        result.totalRounds > 0
          ? Math.round((result.correctCount / result.totalRounds) * 100)
          : 0,
      duration: result.duration,
    }
    sessionHistory.value = [...sessionHistory.value, record]
    saveHistory(sessionHistory.value)
  }

  return {
    // state
    mode,
    scoreHistory,
    bestCombo,
    currentIndex,
    score,
    combo,
    maxCombo,
    failedWords,
    sessionHistory,
    // computed
    grade,
    totalGames,
    averageScore,
    bestScoreEver,
    bestComboEver,
    // methods
    setMode,
    onCorrect,
    onWrong,
    resetScore,
    recordGame,
    recordSession,
  }
})
