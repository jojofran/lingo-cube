import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useVocabBook } from '../../src/composables/useVocabBook'
import type { WordEntry } from '../../src/types'

const STORAGE_KEY = 'lingo-vocab'

const mockWord1: WordEntry = {
  english: 'apple',
  chinese: '苹果',
  phonetic: '/ˈæpl/',
}

const mockWord2: WordEntry = {
  english: 'banana',
  chinese: '香蕉',
  phonetic: '/bəˈnɑːnə/',
}

describe('useVocabBook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('getVocab', () => {
    it('returns empty array initially when localStorage is empty', () => {
      const { getVocab } = useVocabBook()
      const result = getVocab()
      expect(result).toEqual([])
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual([])
    })

    it('returns stored words from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([mockWord1]))
      const { getVocab } = useVocabBook()
      const result = getVocab()
      expect(result).toEqual([mockWord1])
    })
  })

  describe('addToVocab', () => {
    it('adds a word and returns true', () => {
      const { addToVocab, getVocab } = useVocabBook()
      const result = addToVocab(mockWord1)
      expect(result).toBe(true)
      expect(getVocab()).toEqual([mockWord1])
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual([mockWord1])
    })

    it('returns false for duplicate word', () => {
      const { addToVocab } = useVocabBook()
      addToVocab(mockWord1)
      const result = addToVocab(mockWord1)
      expect(result).toBe(false)
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual([mockWord1])
    })

    it('can add multiple different words', () => {
      const { addToVocab, getVocab } = useVocabBook()
      addToVocab(mockWord1)
      addToVocab(mockWord2)
      expect(getVocab()).toEqual([mockWord1, mockWord2])
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual([mockWord1, mockWord2])
    })
  })

  describe('removeFromVocab', () => {
    it('removes existing word and returns true', () => {
      const { addToVocab, removeFromVocab, getVocab } = useVocabBook()
      addToVocab(mockWord1)
      addToVocab(mockWord2)

      const result = removeFromVocab('apple')
      expect(result).toBe(true)
      expect(getVocab()).toEqual([mockWord2])
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual([mockWord2])
    })

    it('returns false for non-existing word', () => {
      const { removeFromVocab } = useVocabBook()
      const result = removeFromVocab('nonexistent')
      expect(result).toBe(false)
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual([])
    })

    it('can remove the last word and leave empty array', () => {
      const { addToVocab, removeFromVocab, getVocab } = useVocabBook()
      addToVocab(mockWord1)
      removeFromVocab('apple')
      expect(getVocab()).toEqual([])
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual([])
    })
  })

  describe('isInVocab', () => {
    it('returns true for existing word', () => {
      const { addToVocab, isInVocab } = useVocabBook()
      addToVocab(mockWord1)
      expect(isInVocab('apple')).toBe(true)
    })

    it('returns false for non-existing word', () => {
      const { isInVocab } = useVocabBook()
      expect(isInVocab('nonexistent')).toBe(false)
    })

    it('returns false after word is removed', () => {
      const { addToVocab, removeFromVocab, isInVocab } = useVocabBook()
      addToVocab(mockWord1)
      removeFromVocab('apple')
      expect(isInVocab('apple')).toBe(false)
    })
  })

  describe('persistence', () => {
    it('after addToVocab, a new useVocabBook() call can read it', () => {
      const { addToVocab } = useVocabBook()
      addToVocab(mockWord1)

      const { getVocab, isInVocab } = useVocabBook()
      expect(getVocab()).toEqual([mockWord1])
      expect(isInVocab('apple')).toBe(true)
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual([mockWord1])
    })

    it('after removeFromVocab, a new useVocabBook() call reflects the removal', () => {
      const { addToVocab } = useVocabBook()
      addToVocab(mockWord1)
      addToVocab(mockWord2)

      const { removeFromVocab } = useVocabBook()
      removeFromVocab('apple')

      const { getVocab, isInVocab } = useVocabBook()
      expect(getVocab()).toEqual([mockWord2])
      expect(isInVocab('apple')).toBe(false)
      expect(isInVocab('banana')).toBe(true)
    })
  })
})
