import { ref, readonly, onUnmounted } from 'vue'

export function useSpeech() {
  const speaking = ref(false)

  const getSynth = (): SpeechSynthesis | null => {
    if (typeof window === 'undefined') return null
    return window.speechSynthesis || null
  }

  const cancel = () => {
    const synth = getSynth()
    if (synth) {
      synth.cancel()
    }
  }

  const speak = (word: string | undefined) => {
    if (!word) return
    const synth = getSynth()
    if (!synth) return

    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    utterance.pitch = 1

    speaking.value = true

    utterance.onend = () => {
      speaking.value = false
    }

    utterance.onerror = () => {
      speaking.value = false
    }

    synth.speak(utterance)
  }

  onUnmounted(() => {
    cancel()
  })

  return {
    speak,
    speaking: readonly(speaking),
    cancel
  }
}
