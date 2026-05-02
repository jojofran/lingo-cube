import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import GamePlay from '@/components/game/GamePlay.vue'
import type { GameMode, WordEntry, WordResult } from '@/types'

const mockWord: WordEntry = {
  english: 'apple',
  chinese: '苹果',
  phonetic: '/ˈæp.əl/',
}

function mountGamePlay(overrides: Partial<{
  mode: GameMode
  score: number
  combo: number
  currentIndex: number
  timeLeft: number
  totalRounds: number
  speedTime: number
  currentWord: WordEntry | null
  userInput: string
  result: WordResult
  resultMsg: string
  shakeActive: boolean
  burstActive: boolean
  speaking: boolean
  isSpeed: boolean
  timerColor: string
  inputClass: string
  isDisabled: boolean
}> = {}) {
  const props = {
    mode: 'normal' as GameMode,
    score: 0,
    combo: 0,
    currentIndex: 0,
    timeLeft: 10,
    totalRounds: 20,
    speedTime: 8,
    currentWord: mockWord,
    userInput: '',
    result: null as WordResult,
    resultMsg: '',
    shakeActive: false,
    burstActive: false,
    speaking: false,
    isSpeed: false,
    timerColor: '#6bcb77',
    inputClass: '',
    isDisabled: false,
    ...overrides,
  }
  return mount(GamePlay, { props })
}

describe('GamePlay.vue', () => {
  it('renders mode badge correctly for each mode', () => {
    const modes: { mode: GameMode; expectedText: string; expectedClass: string }[] = [
      { mode: 'normal', expectedText: '📖 Library', expectedClass: 'normal' },
      { mode: 'speed', expectedText: '⚡ Speed', expectedClass: 'speed' },
      { mode: 'spell', expectedText: '✍️ Spell', expectedClass: 'spell' },
      { mode: 'listen', expectedText: '🎧 Listen', expectedClass: 'listen' },
    ]

    for (const { mode, expectedText, expectedClass } of modes) {
      const wrapper = mountGamePlay({ mode })
      const badge = wrapper.find('.mode-badge')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe(expectedText)
      expect(badge.classes()).toContain(expectedClass)
    }
  })

  it('passes correct props to WordCard', () => {
    const wrapper = mountGamePlay({
      currentWord: mockWord,
      shakeActive: true,
      burstActive: false,
      speaking: true,
    })

    const wordCard = wrapper.findComponent({ name: 'WordCard' })
    expect(wordCard.exists()).toBe(true)
    expect(wordCard.props('word')).toEqual(mockWord)
    expect(wordCard.props('animatable')).toBe(true)
    expect(wordCard.props('shakeActive')).toBe(true)
    expect(wordCard.props('burstActive')).toBe(false)
    expect(wordCard.props('speaking')).toBe(true)
  })

  it('shows listening card when mode is listen instead of WordCard', () => {
    const wrapper = mountGamePlay({ mode: 'listen' })
    expect(wrapper.findComponent({ name: 'WordCard' }).exists()).toBe(false)
    expect(wrapper.find('.listening-card').exists()).toBe(true)
    expect(wrapper.find('.listening-icon').text()).toBe('🎧')
  })

  it('emits submit event when InputArea emits submit', async () => {
    const wrapper = mountGamePlay()
    const inputArea = wrapper.findComponent({ name: 'InputArea' })
    expect(inputArea.exists()).toBe(true)

    await inputArea.vm.$emit('submit')
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')!.length).toBe(1)
  })

  it('binds userInput prop to InputArea and emits update:userInput', async () => {
    const wrapper = mountGamePlay({ userInput: 'test' })
    const inputArea = wrapper.findComponent({ name: 'InputArea' })
    expect(inputArea.props('userInput')).toBe('test')

    await inputArea.vm.$emit('update:userInput', 'new value')
    expect(wrapper.emitted('update:userInput')).toBeTruthy()
    expect(wrapper.emitted('update:userInput')![0]).toEqual(['new value'])
  })

  it('passes isDisabled to InputArea', () => {
    const wrapper = mountGamePlay({ isDisabled: true })
    const inputArea = wrapper.findComponent({ name: 'InputArea' })
    expect(inputArea.props('isDisabled')).toBe(true)
  })

  it('shows TimerRing only when isSpeed is true', () => {
    const wrapperNormal = mountGamePlay({ isSpeed: false })
    expect(wrapperNormal.findComponent({ name: 'TimerRing' }).exists()).toBe(false)

    const wrapperSpeed = mountGamePlay({ isSpeed: true, timeLeft: 5 })
    const timerRing = wrapperSpeed.findComponent({ name: 'TimerRing' })
    expect(timerRing.exists()).toBe(true)
    expect(timerRing.props('timeLeft')).toBe(5)
  })
})
