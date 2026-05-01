import { ref, computed, readonly } from 'vue'
import type { WordEntry } from '@/types'

export function useScoring() {
  const _score = ref(0)
  const _combo = ref(0)
  const _maxCombo = ref(0)
  const failedWords = ref<WordEntry[]>([])

  const score = readonly(_score)
  const combo = readonly(_combo)
  const maxCombo = readonly(_maxCombo)

  const grade = computed(() => {
    if (_score.value >= 400) return { label: '🏆 Legendary', emoji: '🌟' }
    if (_score.value >= 250) return { label: '🔥 Excellent', emoji: '🎉' }
    if (_score.value >= 150) return { label: '👍 Good Job', emoji: '✨' }
    return { label: '💪 Keep Practicing', emoji: '📖' }
  })

  const praiseStrings = [
    'Great! 🎉',
    'Nice! ✨',
    'Perfect! 💯',
    'Excellent! 🌟',
    'Amazing! 🔥',
    'Superb! 👏',
    'Unbelievable! 💎'
  ] as const

  const praise = (): string => {
    const randomIndex = Math.floor(Math.random() * praiseStrings.length)
    return praiseStrings[randomIndex]
  }

  const regretStrings = [
    "Keep trying! 💪",
    "Almost there! 🎯",
    "Next one! 🚀",
    "Don't give up! ⚡",
    "You'll get it! 🍀"
  ] as const

  const regret = (): string => {
    const randomIndex = Math.floor(Math.random() * regretStrings.length)
    return regretStrings[randomIndex]
  }

  const onCorrect = (isSpeed: boolean, timeLeft: number): void => {
    _combo.value++
    if (_combo.value > _maxCombo.value) {
      _maxCombo.value = _combo.value
    }
    const bonus = Math.min(_combo.value * 2, 20)
    const base = isSpeed ? 15 : 10
    _score.value += base + bonus
    if (isSpeed) {
      _score.value += Math.max(0, timeLeft * 2)
    }
  }

  const onWrong = (word: WordEntry): void => {
    _combo.value = 0
    failedWords.value.push(word)
  }

  const resetScore = (): void => {
    _score.value = 0
    _combo.value = 0
    _maxCombo.value = 0
    failedWords.value = []
  }

  return {
    score,
    combo,
    maxCombo,
    grade,
    praise,
    regret,
    onCorrect,
    onWrong,
    resetScore,
    failedWords
  }
}
