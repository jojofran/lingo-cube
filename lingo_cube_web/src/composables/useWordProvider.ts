import { ref, readonly } from 'vue'
import type { WordEntry } from '@/types'
import { fetchRandomWords } from '@/api/word'
import { wordBank, shuffleWords } from '@/views/wordBank'

export function useWordProvider() {
  const wordList = ref<WordEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchWords = async (count: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const words = await fetchRandomWords(count)
      wordList.value = words
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch words from API'
      wordList.value = shuffleWords(wordBank).slice(0, count)
    } finally {
      loading.value = false
    }
  }

  return {
    fetchWords,
    wordList,
    loading: readonly(loading),
    error: readonly(error)
  }
}
