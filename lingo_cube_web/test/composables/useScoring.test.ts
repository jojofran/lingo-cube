import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameSessionStore } from '../../src/stores/gameSession'
import type { WordEntry } from '../../src/types'

describe('useScoring (gameSession store)', () => {
  let store: ReturnType<typeof useGameSessionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameSessionStore()
  })

  describe('onCorrect', () => {
    it('increases score, combo, and maxCombo on correct answer', () => {
      const initialScore = store.score
      const initialCombo = store.combo

      store.onCorrect(false, 0, 'normal')

      expect(store.score).toBeGreaterThan(initialScore)
      expect(store.combo).toBe(initialCombo + 1)
      expect(store.maxCombo).toBe(store.combo)
    })

    it('applies combo bonus capped at 20', () => {
      store.resetScore()

      store.onCorrect(false, 0, 'normal')
      const scoreAfterCombo1 = store.score

      store.onCorrect(false, 0, 'normal')
      const scoreAfterCombo2 = store.score

      expect(scoreAfterCombo1).toBe(12)
      expect(scoreAfterCombo2).toBe(26)
    })

    it('caps combo bonus at 20 for high combos', () => {
      store.resetScore()

      for (let i = 0; i < 10; i++) {
        store.onCorrect(false, 0, 'normal')
      }
      const scoreAtCombo10 = store.score

      store.onCorrect(false, 0, 'normal')
      const scoreAtCombo11 = store.score

      const pointsGained = scoreAtCombo11 - scoreAtCombo10
      expect(pointsGained).toBe(30)
    })

    it('adds speed bonus when isSpeed is true', () => {
      store.resetScore()

      store.onCorrect(true, 5, 'speed')

      expect(store.score).toBe(27)
    })

    it('uses correct base score for different modes', () => {
      store.resetScore()

      store.onCorrect(false, 0, 'listen')
      expect(store.score).toBe(17)

      store.onCorrect(false, 0, 'spell')
      expect(store.score).toBe(33)
    })

    it('tracks maxCombo correctly after wrong answer', () => {
      store.resetScore()

      store.onCorrect(false, 0, 'normal')
      store.onCorrect(false, 0, 'normal')
      expect(store.maxCombo).toBe(2)

      store.onWrong({ english: 'test', chinese: '测试', phonetic: 'test' })
      store.onCorrect(false, 0, 'normal')
      expect(store.maxCombo).toBe(2)
    })
  })

  describe('onWrong', () => {
    it('resets combo to 0 on wrong answer', () => {
      store.resetScore()
      store.onCorrect(false, 0, 'normal')
      store.onCorrect(false, 0, 'normal')
      expect(store.combo).toBe(2)

      store.onWrong({ english: 'test', chinese: '测试', phonetic: 'test' })
      expect(store.combo).toBe(0)
    })

    it('adds word to failedWords on wrong answer', () => {
      store.resetScore()
      const word: WordEntry = { english: 'apple', chinese: '苹果', phonetic: '/ˈæpl/' }

      store.onWrong(word)

      expect(store.failedWords).toContain(word)
      expect(store.failedWords.length).toBe(1)
    })

    it('accumulates multiple failed words', () => {
      store.resetScore()
      const word1: WordEntry = { english: 'apple', chinese: '苹果', phonetic: '/ˈæpl/' }
      const word2: WordEntry = { english: 'banana', chinese: '香蕉', phonetic: '/bəˈnɑːnə/' }

      store.onWrong(word1)
      store.onWrong(word2)

      expect(store.failedWords.length).toBe(2)
      expect(store.failedWords[0]).toEqual(word1)
      expect(store.failedWords[1]).toEqual(word2)
    })
  })

  describe('resetScore', () => {
    it('resets all state to initial values', () => {
      store.onCorrect(false, 0, 'normal')
      store.onCorrect(false, 0, 'normal')
      store.onWrong({ english: 'test', chinese: '测试', phonetic: 'test' })

      expect(store.score).toBeGreaterThan(0)
      expect(store.failedWords.length).toBeGreaterThan(0)

      store.resetScore()

      expect(store.score).toBe(0)
      expect(store.combo).toBe(0)
      expect(store.maxCombo).toBe(0)
      expect(store.failedWords).toEqual([])
    })
  })
})
