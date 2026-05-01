<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { wordBank, type WordEntry } from './wordBank'
import { useTheme } from '@/composables/useTheme'
import { useSpeech } from '@/composables/useSpeech'
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
    <div v-if="currentWord" class="review-card">
      <div class="word-section">
        <span class="word-spacer"></span>
        <div class="review-word">{{ currentWord.english }}</div>
        <button class="mini-speak">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </button>
      </div>

      <div class="review-phonetic">{{ currentWord.phonetic }}</div>
      <div class="review-chinese">{{ currentWord.chinese }}</div>

      <!-- Example -->
      <div class="review-example">
        <span class="example-label">Example:</span>
        <div class="example-text-wrapper">
          <div class="example-text">{{ selectedExample?.text }}</div>
        </div>
        <button class="example-speak-btn" @click="speak(selectedExample?.text)">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </button>
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
    </div>

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

.review-card {
  background: var(--card-bg);
  backdrop-filter: var(--card-blur, blur(20px));
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius, 24px);
  padding: 28px 20px;
  text-align: center;
  max-width: 420px; width: 100%;
  animation: slideUp 0.5s ease;
}

.review-word { font-size: 2.4rem; font-weight: 800; color: var(--word-color, #ffd93d); letter-spacing: 2px; }
.review-phonetic { font-size: 1.3rem; color: var(--phonetic-color, rgba(255,255,255,0.55)); font-family: 'Times New Roman', serif; margin-bottom: 4px; }
.review-chinese { font-size: 1.3rem; color: var(--text-primary); margin-bottom: 24px; }

.review-example {
  background: var(--example-bg);
  border-radius: 12px;
  padding: 14px; margin-bottom: 20px; text-align: left;
  display: flex; align-items: center; gap: 10px;
}
.example-label { color: var(--example-label); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
.example-text { color: var(--example-text); font-size: 0.95rem; line-height: 1.5; }

.example-speak-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); padding: 6px;
  display: flex; align-items: center; transition: all 0.2s; border-radius: 50%;
  margin-left: auto;
}
.example-speak-btn:hover { color: var(--accent); background: var(--btn-bg); }

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

.mini-speak {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); padding: 6px;
  display: flex; align-items: center; transition: all 0.2s; border-radius: 50%;
}
.mini-speak:hover { color: var(--accent); background: var(--btn-bg); }

.review-progress { color: var(--stat-text); font-size: 0.85rem; }

.word-section { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 4px; }
.word-spacer { width: 40px; flex-shrink: 0; }

@media (max-width: 480px) {
  .review-card { padding: 20px 16px; border-radius: 20px; }
  .review-title { font-size: 1.6rem; }
  .review-word { font-size: 1.8rem; }
  .review-chinese { font-size: 1.1rem; }
  .action-btn { padding: 8px 12px; font-size: 0.8rem; }
  .action-btn svg { width: 16px; height: 16px; }
}

@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
