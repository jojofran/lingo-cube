/** Word entry with optional example sentences */
export interface WordEntry {
  english: string
  chinese: string
  phonetic: string
  examples?: { text: string; weight: number }[]
}
