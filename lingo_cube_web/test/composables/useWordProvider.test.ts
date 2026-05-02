import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWordProvider } from '@/composables/useWordProvider'
import { fetchRandomWords } from '@/api/word'
import { wordBank, shuffleWords } from '@/views/wordBank'
import { ref } from 'vue'

vi.mock('@/api/word', () => ({
  fetchRandomWords: vi.fn(),
}))

vi.mock('@/views/wordBank', async () => {
  const actual = await vi.importActual<typeof import('@/views/wordBank')>('@/views/wordBank')
  return {
    ...actual,
    shuffleWords: vi.fn((words: typeof wordBank) => words),
  }
})

describe('useWordProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchWords populates wordList with the right count', async () => {
    const mockWords = [
      { english: 'apple', chinese: '苹果', phonetic: 'æpl' },
      { english: 'banana', chinese: '香蕉', phonetic: 'bəˈnɑːnə' },
    ] as typeof wordBank

    vi.mocked(fetchRandomWords).mockResolvedValue(mockWords)

    const { fetchWords, wordList } = useWordProvider()
    await fetchWords(2)

    expect(fetchRandomWords).toHaveBeenCalledWith(2)
    expect(wordList.value).toEqual(mockWords)
  })

  it('falls back to local wordBank when API fails', async () => {
    vi.mocked(fetchRandomWords).mockRejectedValue(new Error('API Error'))

    const shuffledWords = [
      { english: 'cat', chinese: '猫', phonetic: 'kæt' },
    ] as typeof wordBank

    vi.mocked(shuffleWords).mockReturnValue(shuffledWords)

    const { fetchWords, wordList } = useWordProvider()
    await fetchWords(1)

    expect(fetchRandomWords).toHaveBeenCalledWith(1)
    expect(shuffleWords).toHaveBeenCalledWith(wordBank)
    expect(wordList.value).toEqual(shuffledWords.slice(0, 1))
  })

  it('loading state is correct during fetch', async () => {
    let resolvePromise: (value: typeof wordBank) => void
    const promise = new Promise<typeof wordBank>((resolve) => {
      resolvePromise = resolve
    })

    vi.mocked(fetchRandomWords).mockReturnValue(promise)

    const { fetchWords, loading } = useWordProvider()

    expect(loading.value).toBe(false)

    const fetchPromise = fetchWords(2)
    expect(loading.value).toBe(true)

    resolvePromise!([{ english: 'test', chinese: '测试', phonetic: 'test' }] as typeof wordBank)
    await fetchPromise

    expect(loading.value).toBe(false)
  })

  it('loading is false after API failure', async () => {
    vi.mocked(fetchRandomWords).mockRejectedValue(new Error('API Error'))

    const { fetchWords, loading } = useWordProvider()

    expect(loading.value).toBe(false)

    await fetchWords(2)

    expect(loading.value).toBe(false)
  })
})
