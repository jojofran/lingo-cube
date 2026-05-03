import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('default theme is "dark" when localStorage is empty', async () => {
    const { useTheme } = await import('../../src/composables/useTheme')
    const { theme } = useTheme()
    expect(theme.value).toBe('dark')
  })

  it('loads theme from localStorage if stored', async () => {
    localStorage.setItem('lingo-theme', 'ins')
    const { useTheme } = await import('../../src/composables/useTheme')
    const { theme } = useTheme()
    expect(theme.value).toBe('ins')
  })

  it('cycleTheme cycles through dark → ins → cute → dark', async () => {
    const { useTheme } = await import('../../src/composables/useTheme')
    const { theme, cycleTheme } = useTheme()

    expect(theme.value).toBe('dark')

    cycleTheme()
    expect(theme.value).toBe('ins')

    cycleTheme()
    expect(theme.value).toBe('cute')

    cycleTheme()
    expect(theme.value).toBe('dark')
  })

  it('cycleTheme saves to localStorage', async () => {
    const { useTheme } = await import('../../src/composables/useTheme')
    const { theme, cycleTheme } = useTheme()

    cycleTheme()
    expect(theme.value).toBe('ins')
    expect(localStorage.getItem('lingo-theme')).toBe('ins')

    cycleTheme()
    expect(theme.value).toBe('cute')
    expect(localStorage.getItem('lingo-theme')).toBe('cute')

    cycleTheme()
    expect(theme.value).toBe('dark')
    expect(localStorage.getItem('lingo-theme')).toBe('dark')
  })
})
