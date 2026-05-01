import axios from 'axios'
import type { WordEntry } from '@/types'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface WordListData {
  words: WordEntry[]
  total: number
}

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

export async function fetchRandomWords(count = 20): Promise<WordEntry[]> {
  const { data } = await api.get<ApiResponse<WordListData>>('/words/random', {
    params: { count },
  })
  return data.data.words
}

export async function fetchAllWords(): Promise<WordEntry[]> {
  const { data } = await api.get<ApiResponse<WordListData>>('/words')
  return data.data.words
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const { data } = await api.get<ApiResponse<unknown>>('/health')
    return data.code === 0
  } catch {
    return false
  }
}
