import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTimer } from '../../src/composables/useTimer'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('startTimer(seconds, onEnd) starts countdown', () => {
    const { timeLeft, startTimer } = useTimer()
    const onEnd = vi.fn()

    startTimer(10, onEnd)

    expect(timeLeft.value).toBe(10)

    vi.advanceTimersByTime(3000)

    expect(timeLeft.value).toBe(7)
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('stopTimer() pauses countdown', () => {
    const { timeLeft, startTimer, stopTimer } = useTimer()
    const onEnd = vi.fn()

    startTimer(10, onEnd)
    vi.advanceTimersByTime(3000)

    expect(timeLeft.value).toBe(7)

    stopTimer()
    vi.advanceTimersByTime(5000)

    expect(timeLeft.value).toBe(7)
    expect(onEnd).not.toHaveBeenCalled()
  })

  it('Timer reaching 0 triggers onEnd callback', () => {
    const { startTimer } = useTimer()
    const onEnd = vi.fn()

    startTimer(3, onEnd)

    vi.advanceTimersByTime(1000)
    expect(onEnd).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(onEnd).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('timeLeft ref decreases correctly', () => {
    const { timeLeft, startTimer } = useTimer()
    const onEnd = vi.fn()

    startTimer(5, onEnd)

    expect(timeLeft.value).toBe(5)

    vi.advanceTimersByTime(1000)
    expect(timeLeft.value).toBe(4)

    vi.advanceTimersByTime(1000)
    expect(timeLeft.value).toBe(3)

    vi.advanceTimersByTime(1000)
    expect(timeLeft.value).toBe(2)

    vi.advanceTimersByTime(1000)
    expect(timeLeft.value).toBe(1)

    vi.advanceTimersByTime(1000)
    expect(timeLeft.value).toBe(0)
  })
})
