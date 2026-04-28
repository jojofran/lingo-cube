<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { wordBank, type WordEntry } from './wordBank'
import { useTheme } from '@/composables/useTheme'
import CuteDeco from '@/components/CuteDeco.vue'

const { theme, themeLabel, themeShort, cycleTheme } = useTheme()
const router = useRouter()

// Get failed words from localStorage (set by TypingGame)
const failedWords = ref<WordEntry[]>([])
const reviewIndex = ref(0)
const rememberedWords = ref<Set<string>>(new Set())
const selectedExample = ref<{ text: string; weight: number } | null>(null)
const speaking = ref(false)

// Speech synthesis
let synth: SpeechSynthesis | null = null
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

onUnmounted(() => {
  synth?.cancel()
})

function speak(word: string | undefined) {
  if (!word) return
  synth?.cancel()
  synth = window.speechSynthesis
  const u = new SpeechSynthesisUtterance(word)
  u.lang = 'en-US'
  u.rate = 0.85
  u.pitch = 1
  speaking.value = true
  u.onend = () => { speaking.value = false }
  u.onerror = () => { speaking.value = false }
  synth.speak(u)
}

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

    <!-- Global theme toggle -->
    <button class="theme-toggle-global" @click="cycleTheme" :title="themeLabel">
      {{ themeShort }}
    </button>

    <!-- Cute theme decorations -->
    <CuteDeco />

    <!-- Header -->
    <div class="review-header">
      <h1 class="review-title">📖 Review</h1>
      <p class="review-subtitle">Learn from your mistakes</p>
    </div>

    <!-- Review Card -->
    <div v-if="currentWord" class="review-card">
      <div class="review-progress">{{ progress }}</div>

      <div class="word-section" @click="speak(currentWord.english)">
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
    </div>

    <!-- Back to home -->
    <router-link to="/typing" class="back-icon" title="Back">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </router-link>
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
.review-title { font-size: 2rem; font-weight: 800; letter-spacing: 2px; margin-bottom: 4px; }
.review-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.45); letter-spacing: 4px; text-transform: uppercase; }

.review-card {
  background: var(--card-bg);
  backdrop-filter: var(--card-blur, blur(20px));
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: 28px 20px;
  text-align: center;
  max-width: 420px; width: 100%;
  animation: slideUp 0.5s ease;
}

/* Theme-specific styles (override global for specific elements if needed) */
.review-wrapper.theme-ins .review-title { color: #667eea; }
.review-wrapper.theme-ins .review-subtitle { color: rgba(45,52,54,0.45); }
.review-wrapper.theme-ins .review-word { color: #667eea; }
.review-wrapper.theme-ins .review-phonetic { color: rgba(45,52,54,0.5); }
.review-wrapper.theme-ins .review-chinese { color: #2d3436; }
.review-wrapper.theme-ins .review-example { background: rgba(102,126,234,0.05); }
.review-wrapper.theme-ins .example-label { color: rgba(45,52,54,0.45); }
.review-wrapper.theme-ins .example-text { color: rgba(45,52,54,0.7); }
.review-wrapper.theme-ins .review-progress { color: rgba(45,52,54,0.45); }

.review-wrapper.theme-cute .review-card { background: #fff; border-color: rgba(124,197,176,0.25); }
.review-wrapper.theme-cute .review-title { color: #7cc5b0; }
.review-wrapper.theme-cute .review-subtitle { color: rgba(74,74,74,0.45); }
.review-wrapper.theme-cute .review-word { color: #7cc5b0; }
.review-wrapper.theme-cute .review-phonetic { color: rgba(74,74,74,0.5); }
.review-wrapper.theme-cute .review-chinese { color: #4a4a4a; }
.review-wrapper.theme-cute .review-example { background: rgba(124,197,176,0.06); }
.review-wrapper.theme-cute .example-label { color: rgba(74,74,74,0.45); }
.review-wrapper.theme-cute .example-text { color: rgba(74,74,74,0.7); }
.review-wrapper.theme-cute .review-progress { color: rgba(74,74,74,0.45); }

@media (max-width: 480px) {
  .review-card { padding: 20px 16px; border-radius: 20px; }
  .review-title { font-size: 1.6rem; }
  .review-word { font-size: 1.8rem; }
  .review-chinese { font-size: 1.1rem; }
  .action-btn { padding: 8px 12px; font-size: 0.8rem; }
  .action-btn svg { width: 16px; height: 16px; }
}

.back-icon, .back-link { color: rgba(255,255,255,0.55); text-decoration: none; transition: color 0.2s; }
.back-icon:hover, .back-link:hover { color: #4d96ff; }
.back-icon { position: fixed; top: 16px; left: 16px; z-index: 200; width: 40px; height: 40px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
.back-icon svg, .theme-toggle-global { width: 20px; height: 20px; }

.theme-toggle-global {
  position: fixed; top: 16px; right: 16px;
  width: 40px; height: 40px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  font-size: 1.1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.25s; z-index: 200;
  backdrop-filter: blur(8px); color: #fff;
}
.theme-toggle-global:hover {
  border-color: rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.15);
  transform: scale(1.1);
}

@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

.review-progress { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-bottom: 16px; letter-spacing: 1px; }

.word-section {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  margin-bottom: 8px;
}
.review-word { font-size: 2.4rem; font-weight: 800; color: #ffd93d; letter-spacing: 2px; }

.review-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 16px; }
.action-btn {
  padding: 10px 16px; border-radius: 10px; border: none;
  font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.25s;
  display: flex; align-items: center; gap: 6px;
}
.remembered-action { background: #6bcb77; color: #fff; }
.remembered-action:hover { background: #5abb67; transform: translateY(-2px); }
.vocab-action { background: #ff922b; color: #fff; }
.vocab-action:hover { background: #e8821a; transform: translateY(-2px); }

/* Theme-specific action buttons */
.review-wrapper.theme-ins .remembered-action { background: #6bcb77; }
.review-wrapper.theme-ins .remembered-action:hover { background: #5abb67; }
.review-wrapper.theme-ins .vocab-action { background: #f5a0b0; }
.review-wrapper.theme-ins .vocab-action:hover { background: #e8828d; }

.review-wrapper.theme-cute .remembered-action { background: #f5a0b0; }
.review-wrapper.theme-cute .remembered-action:hover { background: #e8828d; }
.review-wrapper.theme-cute .vocab-action { background: #c8a0d0; }
.review-wrapper.theme-cute .vocab-action:hover { background: #b88fc0; }
.mini-speak {
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.45); padding: 6px;
  display: flex; align-items: center; transition: all 0.2s; border-radius: 50%;
}
.mini-speak:hover { color: #fff; background: rgba(255,255,255,0.1); }
.review-wrapper.theme-ins .mini-speak { color: rgba(45,52,54,0.5); }
.review-wrapper.theme-ins .mini-speak:hover { color: #667eea; background: rgba(102,126,234,0.1); }
.review-wrapper.theme-cute .mini-speak { color: rgba(74,74,74,0.5); }
.review-wrapper.theme-cute .mini-speak:hover { color: #7cc5b0; background: rgba(124,197,176,0.1); }

.review-phonetic { font-size: 1rem; color: rgba(255,255,255,0.55); font-family: 'Times New Roman', serif; margin-bottom: 12px; }
.review-chinese { font-size: 1.3rem; color: rgba(255,255,255,0.8); margin-bottom: 24px; }

.review-example {
  background: rgba(255,255,255,0.05); border-radius: 12px;
  padding: 14px; margin-bottom: 20px; text-align: left;
  display: flex; align-items: center; gap: 10px;
}
.example-speak-btn {
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.45); padding: 6px;
  display: flex; align-items: center; transition: all 0.2s; border-radius: 50%;
}
.example-speak-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
.review-wrapper.theme-ins .example-speak-btn { color: rgba(45,52,54,0.5); }
.review-wrapper.theme-ins .example-speak-btn:hover { color: #667eea; background: rgba(102,126,234,0.1); }
.review-wrapper.theme-cute .example-speak-btn { color: rgba(74,74,74,0.5); }
.review-wrapper.theme-cute .example-speak-btn:hover { color: #7cc5b0; background: rgba(124,197,176,0.1); }

.review-wrapper.theme-cute .review-example { background: rgba(124,197,176,0.05); }

/* Theme-specific buttons */
.review-wrapper.theme-ins .back-icon { color: rgba(45,52,54,0.5); border-color: rgba(45,52,54,0.2); background: rgba(255,255,255,0.5); }
.review-wrapper.theme-ins .back-icon:hover { border-color: #667eea; color: #667eea; }
.review-wrapper.theme-ins .theme-toggle-global { color: rgba(45,52,54,0.6); border-color: rgba(45,52,54,0.2); background: rgba(255,255,255,0.5); }
.review-wrapper.theme-ins .theme-toggle-global:hover { border-color: #667eea; color: #667eea; background: rgba(102,126,234,0.1); }

.review-wrapper.theme-cute .back-icon { color: rgba(74,74,74,0.5); border-color: rgba(124,197,176,0.3); background: rgba(255,255,255,0.6); }
.review-wrapper.theme-cute .back-icon:hover { border-color: #7cc5b0; color: #7cc5b0; }
.review-wrapper.theme-cute .theme-toggle-global { color: rgba(74,74,74,0.6); border-color: rgba(124,197,176,0.3); background: rgba(255,255,255,0.6); }
.review-wrapper.theme-cute .theme-toggle-global:hover { border-color: #7cc5b0; color: #7cc5b0; background: rgba(124,197,176,0.1); }
</style>
