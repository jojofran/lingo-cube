import { ref, onUnmounted } from 'vue'

export function useTimer() {
  const timeLeft = ref<number>(0)
  let timer: ReturnType<typeof setInterval> | null = null

  const startTimer = (seconds: number, onExpired: () => void) => {
    stopTimer()
    timeLeft.value = seconds
    timer = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        stopTimer()
        onExpired()
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const resetTimer = (seconds: number) => {
    stopTimer()
    timeLeft.value = seconds
  }

  onUnmounted(() => {
    stopTimer()
  })

  return {
    timeLeft,
    startTimer,
    stopTimer,
    resetTimer
  }
}
