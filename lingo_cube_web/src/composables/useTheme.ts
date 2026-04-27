import { ref, computed } from 'vue'

export type Theme = 'dark' | 'ins' | 'cute'

const theme = ref<Theme>('dark')

const themeLabel = computed(() => {
  const m: Record<string, string> = { dark: '🌙 Dark', ins: '🌸 INS', cute: '🍬 Cute' }
  return m[theme.value]
})

const themeShort = computed(() => {
  const m: Record<string, string> = { dark: '🌙', ins: '🌸', cute: '🍬' }
  return m[theme.value]
})

function cycleTheme() {
  const order: Theme[] = ['dark', 'ins', 'cute']
  const i = order.indexOf(theme.value)
  theme.value = order[(i + 1) % order.length]
}

export function useTheme() {
  return {
    theme,
    themeLabel,
    themeShort,
    cycleTheme,
  }
}