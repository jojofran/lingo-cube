<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { wordBank, type WordEntry } from './wordBank'
import { useTheme } from '@/composables/useTheme'
import { useSpeech } from '@/composables/useSpeech'
import ReviewCard from '@/components/common/ReviewCard.vue'
import WordSpeaker from '@/components/word/WordSpeaker.vue'
import CuteDeco from '@/components/CuteDeco.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import BackButton from '@/components/common/BackButton.vue'

const { theme } = useTheme()
const { speak } = useSpeech()
const router = useRouter()

// Get failed words from localStorage (set by TypingGame)
const failedWords = ref<WordEntry[]>([])
const reviewIndex = ref(0)
const rememberedWords = ref<Set<string>>(new Set())
const selectedExample = ref<{ text: string; weight: number } | null>(null)

const canvasRef = ref<HTMLCanvasElement | null>(null)

const currentWord = computed(() => failedWords.value[reviewIndex.value] ?? null)
const progress = computed(() => `${reviewIndex.value + 1} / ${failedWords.value.length}`)

// Load failed words from localStorage on mount
onMounted(() => {
  const stored = localStorage.getItem('failedWords')
  if (stored) {
    try {
      failedWords.value = JSON.parse(stored)
    } catch {
      failedWords.value = []
    }
  }
  if (failedWords.value.length === 0) {
    // If no failed words, use some from wordBank for demo
    failedWords.value = wordBank.slice(0, 5)
  }
  selectExample()
  speak(currentWord.value?.english)
})


function selectExample() {
  const word = currentWord.value
  if (word?.examples && word.examples.length > 0) {
    // Weighted random selection
    const totalWeight = word.examples.reduce((sum, ex) => sum + (ex.weight || 1), 0)
    let random = Math.random() * totalWeight
    for (const example of word.examples) {
      random -= (example.weight || 1)
      if (random <= 0) {
        selectedExample.value = example
        return
      }
    }
    selectedExample.value = word.examples[0]
  } else {
    selectedExample.value = {
      text: `This is test example to show ${word?.english || 'word'}`,
      weight: 1
    }
  }
}

function nextWord() {
  if (reviewIndex.value >= failedWords.value.length - 1) {
    const stillLearning = failedWords.value.filter(w => !rememberedWords.value.has(w.english))
    if (stillLearning.length === 0) {
      router.push('/typing')
      return
    }
    failedWords.value = stillLearning
    reviewIndex.value = 0
  } else {
    reviewIndex.value++
  }
  selectExample()
  nextTick(() => speak(currentWord.value?.english))
}

function markRemembered() {
  const current = currentWord.value
  if (current) {
    rememberedWords.value.add(current.english)
  }
  nextWord()
}

function addToVocab() {
  const vocab = JSON.parse(localStorage.getItem('vocab') || '[]')
  const current = currentWord.value
  if (current && !vocab.find((w: any) => w.english === current.english)) {
    vocab.push(current)
    localStorage.setItem('vocab', JSON.stringify(vocab))
  }
  nextWord()
}
</script>

<template>
  <div class="review-wrapper" :class="{ 'theme-ins': theme === 'ins', 'theme-cute': theme === 'cute' }">
    <canvas ref="canvasRef" class="confetti-layer" />

    <ThemeToggle />

    <!-- Cute theme decorations -->
    <CuteDeco />

    <!-- Header -->
    <div class="review-header">
      <h1 class="review-title">📖 Review</h1>
      <p class="review-subtitle">Learn from your mistakes</p>
    </div>

    <!-- Review Card -->
    <ReviewCard v-if="currentWord" :word="currentWord" :speaking="false" @speak="speak">
      <!-- Example -->
      <div class="review-example">
        <span class="example-label">Example:</span>
        <div class="example-text-wrapper">
          <div class="example-text">{{ selectedExample?.text }}</div>
        </div>
        <WordSpeaker @speak="speak(selectedExample?.text || '')" />
      </div>

      <!-- Actions -->
      <div class="review-actions">
        <button class="action-btn remembered-action" @click="markRemembered">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Got it
        </button>
        <button class="action-btn vocab-action" @click="addToVocab">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Vocab
        </button>
      </div>

      <div class="review-progress">{{ progress }}</div>
    </ReviewCard>

    <BackButton to="/typing" />
  </div>
</template>

<style scoped>
.review-wrapper {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--bg-gradient, linear-gradient(135deg, #0f0c29, #302b63, #24243e));
  color: var(--text-primary, #fff);
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  position: relative;
  padding: 0 16px;
}

.confetti-layer {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 100;
}

.review-header { text-align: center; padding-top: 16px; margin-bottom: 20px; flex-shrink: 0; }
.review-title { font-size: 2rem; font-weight: 800; letter-spacing: 2px; margin-bottom: 4px; color: var(--title-color); }
.review-subtitle { font-size: 0.9rem; color: var(--text-muted); letter-spacing: 4px; text-transform: uppercase; }

.review-example {
  margin: 4px 0 24px;
  padding: 16px;
  border-radius: 14px;
  background: var(--example-bg, rgba(255,255,255,0.04));
  border: 1px solid var(--card-border);
  text-align: left;
}
.example-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted, rgba(255,255,255,0.35));
  margin-bottom: 10px;
}
.example-text {
  flex: 1;
  min-width: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-primary);
  font-style: italic;
}
.example-text-wrapper {
  flex: 1;
  min-width: 0;
}

.review-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
.action-btn {
  padding: 10px 16px; border-radius: 10px; border: none;
  font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.25s;
  display: flex; align-items: center; gap: 6px;
}
.remembered-action { background: var(--accent-secondary); color: #fff; }
.remembered-action:hover { filter: brightness(1.1); transform: translateY(-2px); }
.vocab-action { background: var(--accent-tertiary); color: #fff; }
.vocab-action:hover { filter: brightness(1.1); transform: translateY(-2px); }

.review-progress { color: var(--stat-text); font-size: 0.85rem; }

@media (max-width: 480px) {
  .review-title { font-size: 1.6rem; }
  .action-btn { padding: 8px 12px; font-size: 0.8rem; }
  .action-btn svg { width: 16px; height: 16px; }
}
</style>
