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
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
      </svg>
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
        <div class="speak-icon" :class="{ speaking }">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        </div>
      </div>

      <div class="review-phonetic">{{ currentWord.phonetic }}</div>
      <div class="review-chinese">{{ currentWord.chinese }}</div>

      <!-- Example -->
      <div class="review-example">
        <div class="example-label">Example:</div>
        <div class="example-text">{{ selectedExample?.text }}</div>
        <button class="example-btn" @click="selectExample">Another Example</button>
      </div>

      <!-- Actions -->
      <div class="review-actions">
        <button class="action-btn speak-action" @click="speak(currentWord.english)">
          🔊 Speak
        </button>
        <button class="action-btn remembered-action" @click="markRemembered">
          ✅ Remembered
        </button>
        <button class="action-btn vocab-action" @click="addToVocab">
          📖 Add to Vocab
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
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 36px 28px;
  text-align: center;
  max-width: 500px; width: 100%;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

.review-progress { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-bottom: 16px; letter-spacing: 1px; }

.word-section {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  cursor: pointer; margin-bottom: 8px;
}
.review-word { font-size: 2.4rem; font-weight: 800; color: #ffd93d; letter-spacing: 2px; }
.speak-icon { opacity: 0.4; transition: all 0.25s; color: #fff; }
.speak-icon:hover { opacity: 0.7; }
.speak-icon.speaking { opacity: 0.9; color: #ffd93d; animation: speak-pulse 0.6s ease-in-out infinite; }
@keyframes speak-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }

.review-phonetic { font-size: 1rem; color: rgba(255,255,255,0.55); font-family: 'Times New Roman', serif; margin-bottom: 12px; }
.review-chinese { font-size: 1.3rem; color: rgba(255,255,255,0.8); margin-bottom: 24px; }

.review-example {
  background: rgba(255,255,255,0.05); border-radius: 12px;
  padding: 16px; margin-bottom: 24px; text-align: left;
}
.example-label { font-size: 0.7rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.example-text { font-size: 0.95rem; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 10px; font-style: italic; }
.example-btn {
  padding: 6px 14px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.15); background: transparent;
  color: rgba(255,255,255,0.5); font-size: 0.75rem; cursor: pointer; transition: all 0.2s;
}
.example-btn:hover { border-color: rgba(255,255,255,0.3); color: #fff; }

.review-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.action-btn {
  padding: 12px 24px; border-radius: 12px; border: none;
  font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.25s;
}
.speak-action { background: #4d96ff; color: #fff; }
.speak-action:hover { background: #3a7bd5; transform: translateY(-2px); }
.remembered-action { background: #6bcb77; color: #fff; }
.remembered-action:hover { background: #5abb67; transform: translateY(-2px); }
.vocab-action { background: #ff922b; color: #fff; }
.vocab-action:hover { background: #e8821a; transform: translateY(-2px); }

.back-icon {
  position: fixed; top: 16px; left: 16px; z-index: 200;
  width: 40px; height: 40px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.55); text-decoration: none;
  backdrop-filter: blur(8px); transition: all 0.25s;
}
.back-icon svg, .theme-toggle-global svg { width: 20px; height: 20px; }
.back-icon:hover { border-color: #4d96ff; color: #4d96ff; }

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
.theme-toggle-global:hover { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.15); transform: scale(1.1); }

/* Theme styles */
.game-wrapper.theme-ins,
.review-wrapper.theme-ins {
  --bg-gradient: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 25%, #ede7f6 50%, #e3f2fd 75%, #e0f7fa 100%);
  --text-primary: #2d3436;
}
.review-wrapper.theme-ins .review-title { color: #667eea; }
.review-wrapper.theme-ins .review-word { color: #667eea; }
.review-wrapper.theme-ins .review-card { background: rgba(255,255,255,0.82); border-color: rgba(0,0,0,0.06); }
.review-wrapper.theme-ins .speak-icon { color: rgba(45,52,54,0.4); }
.review-wrapper.theme-ins .speak-icon.speaking { color: #667eea; }

.review-wrapper.theme-cute {
  --bg-gradient: #fdf0f5;
  --text-primary: #4a4a4a;
}
.review-wrapper.theme-cute .review-title { color: #7cc5b0; }
.review-wrapper.theme-cute .review-word { color: #7cc5b0; }
.review-wrapper.theme-cute .review-card { background: rgba(255,255,255,0.88); border-color: rgba(0,0,0,0.05); }
.review-wrapper.theme-cute .speak-icon { color: rgba(74,74,74,0.4); }
.review-wrapper.theme-cute .speak-icon.speaking { color: #f5a0b0; }
</style>
