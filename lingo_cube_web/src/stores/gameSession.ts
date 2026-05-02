import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import type { WordEntry, GameMode } from '@/types'

export const useGameSessionStore = defineStore('gameSession', () => {
  // ---- Existing state ----
  const mode = ref<GameMode>('normal')
  const scoreHistory = ref<number[]>([])
  const bestCombo = ref(0)

  // ---- New game state ----
  const currentIndex = ref(0)
  const score = ref(0)
  const combo = ref(0)
  const maxCombo = ref(0)
  const failedWords = shallowRef<WordEntry[]>([])

  // ---- Computed ----
  const grade = computed(() => {
    if (score.value >= 400) return { label: '🏆 Legendary', emoji: '🌟' }
    if (score.value >= 250) return { label: '🔥 Excellent', emoji: '🎉' }
    if (score.value >= 150) return { label: '👍 Good Job', emoji: '✨' }
    return { label: '💪 Keep Practicing', emoji: '📖' }
  })

  // ---- Methods ----
  function setMode(m: GameMode) {
    mode.value = m
    currentIndex.value = 0
    score.value = 0
    combo.value = 0
    maxCombo.value = 0
    failedWords.value = []
  }

  function onCorrect(isSpeed: boolean, timeLeft: number): void {
    combo.value++
    if (combo.value > maxCombo.value) {
      maxCombo.value = combo.value
    }
    const bonus = Math.min(combo.value * 2, 20)
    const base = isSpeed ? 15 : 10
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

  function recordGame(s: number, c: number) {
    scoreHistory.value.push(s)
    if (c > bestCombo.value) {
      bestCombo.value = c
    }
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
    // computed
    grade,
    // methods
    setMode,
    onCorrect,
    onWrong,
    resetScore,
    recordGame,
  }
})
