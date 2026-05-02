<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { WordEntry } from '@/types'
import { useSpeech } from '@/composables/useSpeech'
import { useVocabBook } from '@/composables/useVocabBook'
import ReviewCard from '@/components/common/ReviewCard.vue'

const props = withDefaults(defineProps<{
  words: WordEntry[]
  onComplete?: () => void
}>(), {
  words: () => [],
})

const emit = defineEmits<{
  complete: []
}>()

const { speak } = useSpeech()
const { addToVocab, isInVocab } = useVocabBook()

const reviewIndex = ref(0)
const rememberedWords = ref<Set<string>>(new Set())

const currentWord = computed<WordEntry | null>(() =>
  props.words[reviewIndex.value] ?? null
)

const progress = computed(() =>
  `${reviewIndex.value + 1} / ${props.words.length}`
)

const inVocab = computed(() =>
  currentWord.value ? isInVocab(currentWord.value.english) : false
)

const currentWordWithExample = computed<WordEntry>(() => {
  const word = currentWord.value
  if (!word) return { english: '', chinese: '', phonetic: '' }
  if (word.examples?.length) return word
  return {
    ...word,
    examples: [{ text: `This is test example to show ${word.english}`, weight: 1 }],
  }
})

function nextWord() {
  if (reviewIndex.value >= props.words.length - 1) {
    const stillLearning = props.words.filter((_, i) =>
      !rememberedWords.value.has(props.words[i].english)
    )
    if (stillLearning.length === 0) {
      emit('complete')
      props.onComplete?.()
      return
    }
    // loop with unremembered words
    reviewIndex.value = 0
    return
  }
  reviewIndex.value++
  nextTick(() => speak(currentWord.value?.english))
}

function markRemembered() {
  const word = currentWord.value
  if (word) rememberedWords.value.add(word.english)
  nextWord()
}

function toggleVocab() {
  const word = currentWord.value
  if (!word) return
  if (isInVocab(word.english)) {
    // already in vocab, skip
  } else {
    addToVocab(word)
  }
  nextWord()
}
</script>

<template>
  <ReviewCard
    v-if="currentWordWithExample"
    :word="currentWordWithExample"
    @speak="speak"
  >
    <div class="rs-actions">
      <button class="rs-btn rs-btn-remember" @click="markRemembered">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Got it
      </button>
      <button class="rs-btn rs-btn-vocab" :class="{ active: inVocab }" @click="toggleVocab">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        {{ inVocab ? 'Saved' : 'Vocab' }}
      </button>
    </div>
    <div class="rs-progress">{{ progress }}</div>
  </ReviewCard>
</template>

<style scoped>
.rs-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 12px;
}

.rs-btn {
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}
.rs-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.rs-btn-remember {
  background: var(--accent-secondary, #6bcb77);
}

.rs-btn-vocab {
  background: var(--accent-tertiary, #ff922b);
}
.rs-btn-vocab.active {
  background: var(--accent, #4d96ff);
}

.rs-progress {
  margin-top: 16px;
  text-align: center;
  color: var(--stat-text, rgba(255,255,255,0.4));
  font-size: 0.85rem;
}
</style>
