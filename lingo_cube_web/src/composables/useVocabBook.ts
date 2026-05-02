import type { WordEntry } from '@/types'

const STORAGE_KEY = 'lingo-vocab'

export function useVocabBook() {
  function getVocab(): WordEntry[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  function addToVocab(word: WordEntry): boolean {
    const list = getVocab()
    if (list.some(w => w.english === word.english)) return false
    list.push(word)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return true
  }

  function removeFromVocab(english: string): boolean {
    const list = getVocab()
    const idx = list.findIndex(w => w.english === english)
    if (idx === -1) return false
    list.splice(idx, 1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return true
  }

  function isInVocab(english: string): boolean {
    return getVocab().some(w => w.english === english)
  }

  return { getVocab, addToVocab, removeFromVocab, isInVocab }
}
