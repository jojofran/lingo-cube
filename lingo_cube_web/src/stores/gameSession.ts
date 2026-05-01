import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GameMode } from '@/types'

export const useGameSessionStore = defineStore('gameSession', () => {
  const mode = ref<GameMode>('normal')
  const scoreHistory = ref<number[]>([])
  const bestCombo = ref(0)

  function recordGame(score: number, combo: number) {
    scoreHistory.value.push(score)
    if (combo > bestCombo.value) {
      bestCombo.value = combo
    }
  }

  return { mode, scoreHistory, bestCombo, recordGame }
})
