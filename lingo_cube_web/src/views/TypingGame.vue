<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { wordBank, shuffleWords, type WordEntry } from './wordBank'
import { fetchRandomWords } from '@/api/word'
import soundGreat from '@/assets/audio/great.mp3'
import soundExcellent from '@/assets/audio/excellent.wav'
import soundAmazing from '@/assets/audio/amazing.mp3'
import soundUnbelievable from '@/assets/audio/unbelievable.wav'
import soundNext from '@/assets/audio/next.wav'

type GameMode = 'normal' | 'speed'
type Screen = 'select' | 'playing' | 'finished'
type WordResult = 'correct' | 'wrong' | null

const TOTAL_ROUNDS = 20
const SPEED_TIME = 8

const screen = ref<Screen>('select')
const mode = ref<GameMode>('normal')
const theme = ref<'dark' | 'ins' | 'cute'>('dark')

const themeLabel = computed(() => {
  const m: Record<string, string> = { dark: '🌙 Dark', ins: '🌸 INS', cute: '🍬 Cute' }
  return m[theme.value]
})
const themeShort = computed(() => {
  const m: Record<string, string> = { dark: '🌙', ins: '🌸', cute: '🍬' }
  return m[theme.value]
})

function cycleTheme() {
  const order: ('dark' | 'ins' | 'cute')[] = ['dark', 'ins', 'cute']
  const i = order.indexOf(theme.value)
  theme.value = order[(i + 1) % order.length]
}
const wordList = ref<WordEntry[]>([])
const currentIndex = ref(0)
const userInput = ref('')
const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const timeLeft = ref(SPEED_TIME)
const result = ref<WordResult>(null)
const resultMsg = ref('')
const failedWords = ref<WordEntry[]>([])
const shakeActive = ref(false)
const burstActive = ref(false)
const speaking = ref(false)

// Speech synthesis
let synth: SpeechSynthesis | null = null
let timer: ReturnType<typeof setInterval> | null = null

// Canvas confetti
const canvasRef = ref<HTMLCanvasElement | null>(null)
let confetti: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; rotation: number; rv: number; life: number }> = []
let animating = false
const palette = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8', '#20c997', '#f06595']

// Audio
let audioCtx: AudioContext | null = null

const currentWord = computed(() => wordList.value[currentIndex.value] ?? null)
const isSpeed = computed(() => mode.value === 'speed')
const timerColor = computed(() => {
  if (timeLeft.value > 5) return '#6bcb77'
  if (timeLeft.value > 2) return '#ffd93d'
  return '#ff6b6b'
})
const inputClass = computed(() => {
  if (result.value === 'correct') return 'input-correct'
  if (result.value === 'wrong') return 'input-wrong'
  return ''
})
const grade = computed(() => {
  if (score.value >= 400) return { label: '🏆 Legendary', emoji: '🌟' }
  if (score.value >= 250) return { label: '🔥 Excellent', emoji: '🎉' }
  if (score.value >= 150) return { label: '👍 Good Job', emoji: '✨' }
  return { label: '💪 Keep Practicing', emoji: '📖' }
})

// ---- Audio ----
const sounds: Record<string, HTMLAudioElement> = {}

function playSound(name: string) {
  const s = sounds[name]
  if (s) {
    s.currentTime = 0
    s.play().catch(() => {})
  }
}

function initAudio() {
  try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)() } catch { audioCtx = null }
  sounds['great'] = new Audio(soundGreat)
  sounds['excellent'] = new Audio(soundExcellent)
  sounds['amazing'] = new Audio(soundAmazing)
  sounds['unbelievable'] = new Audio(soundUnbelievable)
  sounds['next'] = new Audio(soundNext)
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(vol, now + start)
  gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur)
  osc.connect(gain).connect(audioCtx.destination)
  osc.start(now + start)
  osc.stop(now + start + dur)
}

function playSuccess() {
  ;[523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.08, 0.3))
}

function playFail() {
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(280, now)
  osc.frequency.linearRampToValueAtTime(180, now + 0.25)
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
  osc.connect(gain).connect(audioCtx.destination)
  osc.start(now); osc.stop(now + 0.3)
}

function playFinish() {
  ;[523.25, 587.33, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.12, 0.4))
}

// ---- Speech ----
function speak(word: string) {
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

function autoSpeak() {
  if (currentWord.value) {
    // slight delay so browser has time to render new word before TTS kicks in
    setTimeout(() => speak(currentWord.value!.english), 200)
  }
}

// ---- Confetti ----
function launchConfetti() {
  animating = true
  const c = canvasRef.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  c.width = window.innerWidth; c.height = window.innerHeight
  for (let i = 0; i < 120; i++) {
    confetti.push({
      x: Math.random() * c.width, y: Math.random() * c.height * 0.3 - 20,
      vx: (Math.random() - 0.5) * 8, vy: Math.random() * 6 + 3,
      size: Math.random() * 10 + 4, color: palette[Math.floor(Math.random() * palette.length)],
      rotation: Math.random() * Math.PI * 2, rv: (Math.random() - 0.5) * 0.3, life: 100 + Math.random() * 60,
    })
  }
  requestAnimationFrame(drawConfetti)
}

function drawConfetti() {
  const c = canvasRef.value
  if (!c || !animating) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, c.width, c.height)
  confetti = confetti.filter(p => p.life > 0)
  for (const p of confetti) {
    p.x += p.vx; p.vy += 0.12; p.y += p.vy; p.rotation += p.rv; p.life--
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation)
    ctx.globalAlpha = Math.min(1, p.life / 60); ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore()
  }
  if (confetti.length > 0) requestAnimationFrame(drawConfetti)
  else animating = false
}

// ---- Game Logic ----
async function selectMode(m: GameMode) {
  mode.value = m
  currentIndex.value = 0
  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  userInput.value = ''
  result.value = null
  resultMsg.value = ''
  failedWords.value = []

  // Try fetching from API first, fall back to local word bank
  try {
    wordList.value = await fetchRandomWords(TOTAL_ROUNDS)
  } catch {
    wordList.value = shuffleWords(wordBank).slice(0, TOTAL_ROUNDS)
  }

  screen.value = 'playing'
  if (isSpeed.value) { timeLeft.value = SPEED_TIME; startTimer() }
  nextTick(() => {
    document.getElementById('typing-input')?.focus()
    if (window.innerWidth <= 768) {
      document.querySelector('.stats-row')?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    autoSpeak()
  })
}

function startTimer() {
  clearInterval(timer!)
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) timeout()
  }, 1000)
}

function submit() {
  const v = userInput.value.trim()
  if (!v || !currentWord.value) return
  if (result.value) return
  clearInterval(timer!)

  if (v.toLowerCase() === currentWord.value.english.toLowerCase()) {
    result.value = 'correct'
    resultMsg.value = praise()
    combo.value++
    if (combo.value > maxCombo.value) maxCombo.value = combo.value
    const bonus = Math.min(combo.value * 2, 20)
    score.value += (isSpeed.value ? 15 : 10) + bonus
    burstActive.value = true
    playSuccess()
    launchConfetti()
    if (isSpeed.value) { score.value += Math.max(0, timeLeft.value * 2) }
  } else {
    result.value = 'wrong'
    resultMsg.value = regret()
    combo.value = 0
    shakeActive.value = true
    playFail()
    failedWords.value.push(currentWord.value)
  }
  setTimeout(() => next(), 1500)
}

function timeout() {
  clearInterval(timer!)
  result.value = 'wrong'
  resultMsg.value = "Time's up! ⏱"
  combo.value = 0
  shakeActive.value = true
  playFail()
  if (currentWord.value) failedWords.value.push(currentWord.value)
  setTimeout(() => next(), 1500)
}

function next() {
  if (currentIndex.value >= TOTAL_ROUNDS - 1) {
    screen.value = 'finished'
    launchConfetti()
    playFinish()
    return
  }
  userInput.value = ''
  result.value = null
  resultMsg.value = ''
  shakeActive.value = false
  burstActive.value = false
  currentIndex.value++
  if (isSpeed.value) { timeLeft.value = SPEED_TIME; startTimer() }
  nextTick(() => {
    document.getElementById('typing-input')?.focus()
    if (window.innerWidth <= 768) {
      document.querySelector('.stats-row')?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    autoSpeak()
  })
}

function praise() {
  const p = [
    { text: 'Great! 🎉', sound: 'next' },
    { text: 'Nice! ✨', sound: 'next' },
    { text: 'Perfect! 💯', sound: 'next' },
    { text: 'Excellent! 🌟', sound: 'excellent' },
    { text: 'Amazing! 🔥', sound: 'amazing' },
    { text: 'Superb! 👏', sound: 'next' },
    { text: 'Unbelievable! 💎', sound: 'unbelievable' }
  ]
  const r = p[Math.floor(Math.random() * p.length)]
  playSound(r.sound)
  return r.text
}

function regret() {
  const r = ["Keep trying! 💪", "Almost there! 🎯", "Next one! 🚀", "Don't give up! ⚡", "You'll get it! 🍀"]
  return r[Math.floor(Math.random() * r.length)]
}

function restart() {
  screen.value = 'select'
}

// HTML 输入中按空格 = 下一个词（normal mode）
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && userInput.value.trim() && !result.value) {
    e.preventDefault()
    submit()
  }
}

onMounted(() => { initAudio() })
onUnmounted(() => { clearInterval(timer!); animating = false; confetti = []; audioCtx?.close() })
</script>

<template>
  <div class="game-wrapper" :class="{ 'theme-ins': theme === 'ins', 'theme-cute': theme === 'cute' }">
    <canvas ref="canvasRef" class="confetti-layer" />

    <!-- Global theme toggle (top-right) -->
    <button class="theme-toggle-global" @click="cycleTheme" :title="themeLabel">
      {{ themeShort }}
    </button>

    <!-- Cute theme decorations -->
    <div v-if="theme === 'cute'" class="cute-deco" aria-hidden="true">
      <!-- flower -->
      <svg class="deco deco-1" viewBox="0 0 40 40" width="44" height="44" fill="none" stroke="#e888a0" stroke-width="1.8" stroke-linecap="round">
        <path d="M20 12c-4 0-6 3-6 6 0 4 2 6 6 6s6-2 6-6c0-3-2-6-6-6z" fill="rgba(232,136,160,0.35)"/>
        <path d="M20 12c-3-3-6-3-7-2-2 1-1 5 2 8 3-1 5-3 5-6z" fill="rgba(232,136,160,0.3)"/>
        <path d="M20 12c3-3 6-3 7-2 2 1 1 5-2 8-3-1-5-3-5-6z" fill="rgba(232,136,160,0.3)"/>
        <path d="M20 22c2 3 2 6 1 7-1 2-5 1-7-2 1-3 3-5 6-5z" fill="rgba(232,136,160,0.3)"/>
        <path d="M20 22c-2 3-2 6-1 7 1 2 5 1 7-2-1-3-3-5-6-5z" fill="rgba(232,136,160,0.3)"/>
        <circle cx="20" cy="17" r="2.5" fill="#f0c890"/>
      </svg>
      <!-- star -->
      <svg class="deco deco-2" viewBox="0 0 36 36" width="40" height="40" fill="none" stroke="#e8b840" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 4l3.5 10.5L32 14l-9 7.5 3 11.5L18 26l-8 7 3-11.5L4 14l10.5.5z" fill="rgba(232,184,64,0.35)"/>
      </svg>
      <!-- butterfly -->
      <svg class="deco deco-3" viewBox="0 0 36 36" width="42" height="42" fill="none" stroke="#b888c8" stroke-width="1.6" stroke-linecap="round">
        <path d="M18 18c-2-5-7-9-11-7-3 1-2 6 2 9 4 3 9 3 9 3s5 0 9-3c4-3 5-8 2-9-4-2-9 2-11 7z" fill="rgba(184,136,200,0.35)"/>
        <path d="M18 18v14" stroke-dasharray="2 2"/>
        <path d="M14 26c2-1 4-1 4-1s2 0 4 1"/>
      </svg>
      <!-- small flower -->
      <svg class="deco deco-4" viewBox="0 0 28 28" width="30" height="30" fill="none" stroke="#e888a0" stroke-width="1.6" stroke-linecap="round">
        <circle cx="14" cy="14" r="2" fill="#f0c890"/>
        <path d="M14 6c-1 3 0 6 0 8" stroke="#e8b840"/>
        <path d="M14 22c-1-3 0-6 0-8" stroke="#e8b840"/>
        <path d="M6 14c3-1 6 0 8 0" stroke="#e8b840"/>
        <path d="M22 14c-3-1-6 0-8 0" stroke="#e8b840"/>
      </svg>
      <!-- heart -->
      <svg class="deco deco-5" viewBox="0 0 32 32" width="34" height="34" fill="none" stroke="#e888a0" stroke-width="1.8" stroke-linecap="round">
        <path d="M16 26c0 0-12-7-12-14 0-4 3-7 6-7 3 0 6 2 6 2s3-2 6-2c3 0 6 3 6 7 0 7-12 14-12 14z" fill="rgba(232,136,160,0.3)"/>
      </svg>
      <!-- butterfly 2 -->
      <svg class="deco deco-6" viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="#6bb8a0" stroke-width="1.6" stroke-linecap="round">
        <path d="M16 16c-2-4-6-7-9-6-2 1-2 5 1 8 3 2 8 2 8 2s5 0 8-2c3-3 3-7 1-8-3-1-7 2-9 6z" fill="rgba(107,184,160,0.3)"/>
        <path d="M16 16v12" stroke-dasharray="1.5 2"/>
      </svg>
      <!-- cloud -->
      <svg class="deco deco-7" viewBox="0 0 44 24" width="50" height="28" fill="none" stroke="#b8c8d8" stroke-width="1.6" stroke-linecap="round">
        <path d="M8 18c-3 0-5-2-5-4 0-2 2-4 4-4 1-4 5-7 10-7 4 0 7 2 9 5 2-1 5-1 7 1 2 2 2 5-1 7 0 1-1 2-3 2H8z" fill="rgba(184,200,216,0.25)"/>
      </svg>
      <!-- sparkle -->
      <svg class="deco deco-8" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#e8b840" stroke-width="1.5" stroke-linecap="round">
        <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" fill="rgba(232,184,64,0.35)"/>
        <path d="M12 2v14M5 9h14" stroke="rgba(232,184,64,0.35)"/>
      </svg>
      <!-- heart small -->
      <svg class="deco deco-9" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e888a0" stroke-width="1.6" stroke-linecap="round">
        <path d="M12 20c0 0-9-5-9-11 0-3 2-5 4-5 2 0 5 2 5 2s3-2 5-2c2 0 4 2 4 5 0 6-9 11-9 11z" fill="rgba(232,136,160,0.25)"/>
      </svg>
      <!-- flower -->
      <svg class="deco deco-10" viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#6bb8a0" stroke-width="1.5" stroke-linecap="round">
        <circle cx="14" cy="14" r="2" fill="#e8b840"/>
        <path d="M14 6c-1 3 0 6 0 8"/><path d="M14 22c-1-3 0-6 0-8"/>
        <path d="M6 14c3-1 6 0 8 0"/><path d="M22 14c-3-1-6 0-8 0"/>
      </svg>
      <!-- star small -->
      <svg class="deco deco-11" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#e8b840" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3l2 6 6.5.5L15 13l1.5 6.5L12 16l-4.5 3.5L9 13 4.5 9.5 11 9z" fill="rgba(232,184,64,0.25)"/>
      </svg>
      <!-- dot cluster -->
      <svg class="deco deco-12" viewBox="0 0 40 20" width="36" height="18" fill="none" stroke="#b888c8" stroke-width="1.5" stroke-linecap="round">
        <circle cx="10" cy="10" r="2.5" fill="rgba(184,136,200,0.25)"/>
        <circle cx="22" cy="5" r="1.8" fill="rgba(184,136,200,0.2)"/>
        <circle cx="30" cy="12" r="2" fill="rgba(184,136,200,0.25)"/>
      </svg>
      <!-- butterfly small -->
      <svg class="deco deco-13" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e888a0" stroke-width="1.4" stroke-linecap="round">
        <path d="M12 12c-1-3-4-5-7-4-2 1-1 4 1 6 3 2 6 2 6 2s3 0 6-2c2-2 3-5 1-6-3-1-6 2-7 4z" fill="rgba(232,136,160,0.2)"/>
        <path d="M12 12v8" stroke-dasharray="1.5 2"/>
      </svg>
      <!-- sparkle small -->
      <svg class="deco deco-14" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#e8b840" stroke-width="1.3" stroke-linecap="round">
        <path d="M10 2l1 4 4.5.5L12 8.5 13 13l-3-2-3 2 1-4.5L3.5 6.5 8 6z" fill="rgba(232,184,64,0.25)"/>
      </svg>
      <!-- heart small 2 -->
      <svg class="deco deco-15" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="#6bb8a0" stroke-width="1.4" stroke-linecap="round">
        <path d="M10 17c0 0-8-4-8-9 0-3 2-4 4-4 2 0 4 1.5 4 1.5S12 4 14 4c2 0 4 1 4 4 0 5-8 9-8 9z" fill="rgba(107,184,160,0.25)"/>
      </svg>
      <!-- leaf -->
      <svg class="deco deco-16" viewBox="0 0 20 24" width="18" height="22" fill="none" stroke="#6bb8a0" stroke-width="1.4" stroke-linecap="round">
        <path d="M16 2C10-2 3 8 8 14c4 5 9 4 9 4s1-5-1-10c-2 3-5 4-6 3-2-1 0-7 6-9z" fill="rgba(107,184,160,0.2)"/>
      </svg>
    </div>

    <!-- Title -->
    <div class="game-header">
      <h1 class="game-title">⌨️ Lingo Cube</h1>
      <p class="game-subtitle">IELTS Typing Practice</p>
    </div>

    <!-- ============ MODE SELECT ============ -->
    <div v-if="screen === 'select'" class="select-screen">
      <div class="orb orb-1" /><div class="orb orb-2" /><div class="orb orb-3" />

      <div class="select-card">
        <div class="select-icon">🎯</div>
        <h2 class="select-heading">Choose Your Mode</h2>
        <p class="select-desc">Read Chinese, listen, spell English</p>

        <div class="mode-buttons">
          <button class="mode-btn normal" @click="selectMode('normal')">
            <span class="mode-icon">📖</span>
            <span class="mode-label">Library Mode</span>
            <span class="mode-desc">No timer · Learn at your pace</span>
          </button>
          <button class="mode-btn speed" @click="selectMode('speed')">
            <span class="mode-icon">⚡</span>
            <span class="mode-label">Speed Mode</span>
            <span class="mode-desc">{{ SPEED_TIME }} seconds · Challenge high score</span>
          </button>
        </div>
        <p class="select-hint">{{ TOTAL_ROUNDS }} words / round · {{ wordBank.length }} word bank</p>
      </div>
    </div>

    <!-- ============ PLAYING ============ -->
    <div v-if="screen === 'playing'" class="playing-screen">
      <!-- Mode badge -->
      <div class="mode-badge" :class="mode">
        {{ isSpeed ? '⚡ Speed' : '📖 Library' }}
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat">
          <span class="stat-label">Score</span>
          <span class="stat-value">{{ score }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ isSpeed ? 'Combo' : 'Correct' }}</span>
          <span class="stat-value" :class="{ fire: combo >= 5 }">
            {{ isSpeed ? `${combo >= 5 ? '🔥 ' : ''}${combo}x` : `${currentIndex} / ${TOTAL_ROUNDS}` }}
          </span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ isSpeed ? 'Round' : 'Progress' }}</span>
          <span class="stat-value">{{ currentIndex + 1 }} / {{ TOTAL_ROUNDS }}</span>
        </div>
      </div>

      <!-- Timer ring (speed only) -->
      <div v-if="isSpeed" class="timer-ring-wrap">
        <svg class="timer-ring" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" class="timer-bg" />
          <circle cx="50" cy="50" r="45" class="timer-fg"
            :style="{ strokeDashoffset: (283 * (1 - timeLeft / SPEED_TIME)), stroke: timerColor }" />
        </svg>
        <span class="timer-text" :style="{ color: timerColor }">{{ timeLeft }}</span>
      </div>

      <!-- Chinese Prompt -->
      <div v-if="currentWord" class="prompt-card" :class="{ shake: shakeActive, burst: burstActive }" @click="speak(currentWord.english)">
        <svg class="speak-icon" :class="{ speaking }" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
        <span class="chinese-word">{{ currentWord.chinese }}</span>
        <span class="phonetic">{{ currentWord.phonetic }}</span>
      </div>

      <!-- Result (between word and input, visible on mobile) -->
      <transition :name="result === 'correct' ? 'fly-top' : 'fly-side'">
        <div v-if="result" class="result-bar" :class="result">
          <span class="result-emoji">{{ result === 'correct' ? '🎉' : '😢' }}</span>
          <span class="result-text">{{ resultMsg }}</span>
          <span v-if="result === 'wrong' && currentWord" class="result-answer">
             Answer: <strong>{{ currentWord.english }}</strong>
          </span>
        </div>
      </transition>

      <!-- Input -->
      <div class="input-area">
        <form class="input-row" @submit.prevent="submit">
          <input
            id="typing-input"
            v-model="userInput"
            :class="inputClass"
            type="text"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            :placeholder="isSpeed ? 'Type fast...' : 'Type in English...'"
            :disabled="!!result"
            class="typing-input"
            @keydown="onKeydown"
          />
          <button type="submit" class="enter-btn" :disabled="!userInput.trim() || !!result"
            :class="{ 'btn-ok': result === 'correct', 'btn-bad': result === 'wrong' }">
            Confirm
          </button>
        </form>
      </div>

      <!-- Progress dots -->
      <div class="dots-scroll">
        <div class="dots-row">
          <span v-for="i in TOTAL_ROUNDS" :key="i"
            class="dot"
            :class="{
              done: i <= currentIndex,
              current: i === currentIndex + 1 && !result,
              fail: i <= currentIndex && result === 'wrong' && i === currentIndex,
            }" />
        </div>
      </div>
    </div>

    <!-- ============ FINISHED ============ -->
    <div v-if="screen === 'finished'" class="finish-screen">
      <div class="finish-card">
        <div class="finish-emoji">🎊</div>
        <h2 class="finish-grade">{{ grade.label }}</h2>
        <div class="finish-stats">
          <div class="finish-stat">
            <span class="finish-num">{{ score }}</span>
            <span class="finish-label">Total Score</span>
          </div>
          <div class="finish-stat">
            <span class="finish-num">🔥 {{ maxCombo }}</span>
            <span class="finish-label">Best Combo</span>
          </div>
          <div class="finish-stat">
            <span class="finish-num">{{ TOTAL_ROUNDS - failedWords.length }} / {{ TOTAL_ROUNDS }}</span>
            <span class="finish-label">Accuracy</span>
          </div>
        </div>

        <!-- Failed words review -->
        <div v-if="failedWords.length" class="failed-list">
          <h3 class="failed-title">Review Needed</h3>
          <div v-for="w in failedWords" :key="w.english" class="failed-item">
            <span class="failed-cn">{{ w.chinese }}</span>
            <span class="failed-arrow">→</span>
            <span class="failed-en">{{ w.english }}</span>
            <button class="mini-speak" @click="speak(w.english)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>
          </div>
        </div>

        <button class="restart-btn" @click="restart">Play Again 🔄</button>
        <div class="mode-choice">
          <button class="sub-btn" @click="screen = 'select'; mode = 'normal'">Library</button>
          <button class="sub-btn" @click="screen = 'select'; mode = 'speed'">Speed</button>
        </div>
        <router-link to="/" class="home-link">← Back to Home</router-link>
      </div>
    </div>

    <!-- Back to home -->
    <router-link v-if="screen !== 'finished'" to="/" class="back-link">← Home</router-link>
  </div>
</template>

<style scoped>
.game-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--bg-gradient, linear-gradient(135deg, #0f0c29, #302b63, #24243e));
  color: var(--text-primary, #fff);
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  position: relative;
  overflow: hidden;
  padding: 80px 24px 40px;
}

.confetti-layer {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 100;
}

/* ===== Header ===== */
.game-header { text-align: center; margin-bottom: 24px; }

@media (max-width: 768px) {
  .game-header { display: none; }
}

.game-title {
  font-size: 2.2rem; font-weight: 800; letter-spacing: 2px;
  background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; margin-bottom: 4px;
}
.game-subtitle {
  font-size: 0.9rem; color: rgba(255,255,255,0.45);
  letter-spacing: 4px; text-transform: uppercase;
}

/* ===== Select Screen ===== */
.select-screen { position: relative; max-width: 460px; width: 100%; }
.orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.25; animation: orb-float 6s ease-in-out infinite; }
.orb-1 { width: 200px; height: 200px; background: #4d96ff; top: -80px; left: -60px; }
.orb-2 { width: 160px; height: 160px; background: #ff6b6b; bottom: -50px; right: -40px; animation-delay: -2s; }
.orb-3 { width: 120px; height: 120px; background: #ffd93d; bottom: 100px; left: 50%; animation-delay: -4s; }
@keyframes orb-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}
.select-card {
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 36px 32px;
  text-align: center;
  position: relative; z-index: 1;
}
.select-icon { font-size: 3rem; margin-bottom: 8px; animation: bounce 1.5s ease-in-out infinite; }
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.select-heading { font-size: 1.6rem; font-weight: 700; margin-bottom: 6px; }
.select-desc { color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 28px; }
.mode-buttons { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.mode-btn {
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; padding: 18px 24px;
  border-radius: 16px; border: 2px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05); color: #fff;
  cursor: pointer; transition: all 0.25s;
}
.mode-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
.mode-btn.normal:hover { background: rgba(77,150,255,0.15); border-color: #4d96ff; }
.mode-btn.speed:hover { background: rgba(255,107,107,0.15); border-color: #ff6b6b; }
.mode-icon { font-size: 1.6rem; }
.mode-label { font-size: 1.1rem; font-weight: 700; }
.mode-desc { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
.select-hint { font-size: 0.75rem; color: rgba(255,255,255,0.3); }

/* ===== Playing Screen ===== */
.playing-screen { max-width: 620px; width: 100%; display: flex; flex-direction: column; align-items: center; }

@media (max-width: 768px) {
  .playing-screen { height: auto; justify-content: flex-start; overflow: visible; min-height: auto; }
  .playing-screen .prompt-card { flex: none; margin-bottom: 8px; padding: 14px 24px 12px; }
  .playing-screen .chinese-word { font-size: clamp(1.2rem, 5vw, 1.8rem); }
  .playing-screen .phonetic { font-size: 0.8rem; margin-top: 4px; }
  .playing-screen .input-area { margin-top: 0; }
  .playing-screen .stats-row { margin-bottom: 8px; padding: 0; gap: 6px; position: static; }
  .playing-screen .stat { padding: 8px 6px; }
  .playing-screen .stat-value { font-size: 0.95rem; }
  .playing-screen .stat-label { font-size: 0.6rem; }
  .playing-screen .mode-badge { margin-bottom: 8px; font-size: 0.65rem; padding: 3px 12px; }
  .playing-screen .timer-ring-wrap { width: 56px; height: 56px; margin: 0 auto 8px; }
  .playing-screen .timer-ring { width: 56px; height: 56px; }
  .playing-screen .timer-text { font-size: 1.1rem; }
  .playing-screen .dots-row { margin-top: 4px; }
  .playing-screen .dot { width: 5px; height: 5px; }
  .playing-screen .enter-btn { padding: 10px 24px; font-size: 0.9rem; }
  .playing-screen .typing-input { padding: 12px 18px; font-size: 1rem; }
  .playing-screen .input-row { gap: 8px; margin-bottom: 8px; }
}

.mode-badge {
  font-size: 0.75rem; font-weight: 600;
  padding: 5px 16px; border-radius: 20px; margin-bottom: 20px;
  letter-spacing: 1.5px;
  white-space: nowrap;
}
.mode-badge.normal { background: rgba(77,150,255,0.2); color: #4d96ff; }
.mode-badge.speed { background: rgba(255,107,107,0.2); color: #ff6b6b; }

.stats-row { display: flex; gap: 12px; justify-content: center; margin-bottom: 28px; width: 100%; max-width: 420px; }

.stat {
  flex: 1 1 0;
  display: flex; flex-direction: column; align-items: center;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 12px 8px;
  min-width: 0;
}
.stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.4); margin-bottom: 4px; white-space: nowrap; }
.stat-value { font-size: 1.2rem; font-weight: 700; white-space: nowrap; }
.fire { animation: fire-glow 0.6s ease-in-out infinite alternate; }
@keyframes fire-glow {
  from { text-shadow: 0 0 8px rgba(255,146,43,0.5); }
  to { text-shadow: 0 0 20px rgba(255,146,43,0.9); }
}

/* Timer */
.timer-ring-wrap { position: relative; width: 88px; height: 88px; margin: 0 auto 28px; }
.timer-ring { width: 88px; height: 88px; transform: rotate(-90deg); }
.timer-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 4; }
.timer-fg { fill: none; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 283; transition: stroke-dashoffset 1s linear, stroke 0.3s; }
.timer-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 1.6rem; font-weight: 700; transition: color 0.3s; }

/* Prompt */
.prompt-card {
  position: relative;
  width: 100%; max-width: 420px;
  padding: 20px 28px 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  background: rgba(255,255,255,0.04);
  cursor: pointer;
  transition: border-color 0.3s, background 0.3s;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.prompt-card:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); }
.prompt-card:active { transform: scale(0.99); }

.speak-icon {
  position: absolute; top: 8px; right: 10px;
  opacity: 0.3; transition: opacity 0.25s;
  color: #fff;
}
.prompt-card:hover .speak-icon { opacity: 0.6; }
.speak-icon.speaking { opacity: 0.8; color: #ffd93d; animation: speak-pulse 0.6s ease-in-out infinite; }
@keyframes speak-pulse {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.chinese-word {
  font-size: clamp(1.4rem, 4.5vw, 2.2rem);
  font-weight: 800; letter-spacing: 3px;
  text-shadow: 0 0 50px rgba(77,150,255,0.3);
  overflow-wrap: break-word;
  word-break: keep-all;
  line-height: 1.2;
  text-align: center;
}
.phonetic {
  font-size: 0.95rem; color: rgba(255,255,255,0.55);
  font-family: 'Times New Roman', 'STIX Two Text', serif;
  letter-spacing: 0.5px;
  text-align: center;
  margin-top: 8px;
}
.shake { animation: shake 0.5s ease-in-out; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  10%,50%,90% { transform: translateX(-8px); }
  30%,70% { transform: translateX(8px); }
}
.burst { animation: burst 0.8s ease; }
@keyframes burst {
  0% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.08); filter: brightness(1.5); }
  100% { transform: scale(1); filter: brightness(1); }
}


/* Input */
.input-area { width: 100%; max-width: 420px; }
.input-row { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-bottom: 20px; }
.typing-input {
  width: 100%;
  padding: 16px 24px; font-size: 1.25rem; letter-spacing: 3px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  border: 2px solid rgba(255,255,255,0.18);
  border-radius: 16px; background: rgba(255,255,255,0.07);
  color: #fff; outline: none; transition: all 0.3s;
  text-align: left;
}
.typing-input::placeholder { color: rgba(255,255,255,0.2); font-size: 0.9rem; letter-spacing: 1px; }
.typing-input:focus { border-color: #4d96ff; box-shadow: 0 0 30px rgba(77,150,255,0.15); }
.input-correct { border-color: #6bcb77 !important; background: rgba(107,203,119,0.1) !important; box-shadow: 0 0 24px rgba(107,203,119,0.25) !important; }
.input-wrong { border-color: #ff6b6b !important; background: rgba(255,107,107,0.1) !important; box-shadow: 0 0 24px rgba(255,107,107,0.25) !important; }

.enter-btn {
  padding: 12px 36px; border-radius: 14px;
  border: 2px solid #4d96ff;
  background: #fff; color: #1a3d7a;
  font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; gap: 6px;
  letter-spacing: 1.5px;
}
.enter-btn:not(:disabled):hover { background: #eef4ff; border-color: #3a7bd5; }
.enter-btn:disabled { border-color: #c0d0e8; background: #f5f7fa; color: #a0b0c8; cursor: default; }
.btn-ok { border-color: #6bcb77 !important; background: #f0faf2 !important; color: #2d7a38 !important; }
.btn-bad { border-color: #ff6b6b !important; background: #fef0f0 !important; color: #b33a3a !important; }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }

/* Result */
.result-bar {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 10px 20px; border-radius: 14px; margin-bottom: 10px;
  min-height: 40px;
  width: 100%; max-width: 420px;
}
.result-bar.correct { color: #6bcb77; background: rgba(107,203,119,0.08); }
.result-bar.wrong { color: #ff6b6b; background: rgba(255,107,107,0.08); }
.result-emoji { font-size: 1.6rem; }
.result-text { font-size: 1.15rem; font-weight: 600; }
.result-answer { font-size: 1rem; color: rgba(255,255,255,0.5); margin-top: 2px; }
.result-answer strong { color: #ffd93d; font-weight: 700; }

/* Fly from top (correct) */
.fly-top-enter-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.fly-top-leave-active { transition: all 0.15s ease; }
.fly-top-enter-from { opacity: 0; transform: translateY(-60px) scale(0.8); }
.fly-top-leave-to { opacity: 0; transform: translateY(-20px); }

/* Fly from right side (wrong) */
.fly-side-enter-active { transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.fly-side-leave-active { transition: all 0.15s ease; }
.fly-side-enter-from { opacity: 0; transform: translateX(80px) scale(0.85); }
.fly-side-leave-to { opacity: 0; transform: translateX(40px); }

/* Dots */
.dots-row { display: flex; gap: 4px; justify-content: center; margin-top: 8px; padding: 0 8px; }
.dots-scroll { overflow-x: auto; width: 100%; max-width: 420px; display: flex; justify-content: center; }
.dots-scroll::-webkit-scrollbar { display: none; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.1); transition: background 0.3s; flex-shrink: 0; }
.dot.done { background: #6bcb77; }
.dot.current { background: #4d96ff; box-shadow: 0 0 8px rgba(77,150,255,0.5); }
.dot.fail { background: #ff6b6b; }

/* ===== Finished Screen ===== */
.finish-screen { display: flex; align-items: center; justify-content: center; width: 100%; }
.finish-card {
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  max-width: 460px; width: 100%;
  animation: slideUp 0.5s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.finish-emoji { font-size: 3rem; margin-bottom: 4px; }
.finish-grade { font-size: 1.4rem; font-weight: 700; margin-bottom: 18px; }
.finish-stats { display: flex; gap: 10px; justify-content: center; margin-bottom: 22px; }
.finish-stat {
  flex: 1 1 0;
  display: flex; flex-direction: column; align-items: center;
  background: rgba(255,255,255,0.05); border-radius: 14px; padding: 12px 8px;
  min-width: 0;
}
.finish-num { font-size: 1.25rem; font-weight: 800; white-space: nowrap;
  background: linear-gradient(135deg, #ffd93d, #ff922b);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.finish-label { font-size: 0.6rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px; white-space: nowrap; }

/* Failed words */
.failed-list { margin-bottom: 18px; text-align: left; width: 100%; }
.failed-title { font-size: 0.8rem; color: rgba(255,255,255,0.45); margin-bottom: 8px; font-weight: 600; letter-spacing: 1px; }
.failed-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; background: rgba(255,107,107,0.06); margin-bottom: 6px; font-size: 0.85rem; }
.failed-cn { color: rgba(255,255,255,0.65); min-width: 0; flex: 0 1 auto; }
.failed-arrow { color: rgba(255,255,255,0.15); flex-shrink: 0; font-size: 0.75rem; }
.failed-en { color: #ffd93d; font-weight: 600; font-family: 'SF Mono', 'Fira Code', monospace; letter-spacing: 1px; flex: 1 1 auto; }
.mini-speak { background: none; border: none; cursor: pointer; font-size: 0.9rem; padding: 4px; color: rgba(255,255,255,0.4); flex-shrink: 0; display: flex; align-items: center; transition: color 0.2s; }
.mini-speak:hover { color: #fff; }

.restart-btn {
  padding: 14px 40px; border-radius: 14px; border: none;
  font-size: 1.1rem; font-weight: 700; cursor: pointer;
  background: #4d96ff; color: #fff; transition: all 0.25s; margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(77,150,255,0.2);
}
.restart-btn:hover { background: #3a7bd5; transform: translateY(-3px); box-shadow: 0 10px 30px rgba(77,150,255,0.3); }

.mode-choice { display: flex; gap: 10px; justify-content: center; margin-bottom: 14px; }
.sub-btn {
  padding: 8px 20px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
  font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
}
.sub-btn:hover { border-color: rgba(255,255,255,0.3); color: #fff; }

.home-link, .back-link { color: rgba(255,255,255,0.55); font-size: 0.8rem; text-decoration: none; transition: color 0.2s; }
.home-link:hover, .back-link:hover { color: #4d96ff; }
.back-link { position: fixed; top: 16px; left: 16px; z-index: 200; }

.theme-toggle-global {
  position: fixed; top: 16px; right: 16px;
  width: 40px; height: 40px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  font-size: 1.1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.25s; z-index: 200;
  backdrop-filter: blur(8px);
}
.theme-toggle-global:hover {
  border-color: rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.15);
  transform: scale(1.1);
}

/* ===== INS Theme ===== */
.game-wrapper.theme-ins {
  --bg-gradient: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 25%, #ede7f6 50%, #e3f2fd 75%, #e0f7fa 100%);
  --text-primary: #2d3436;
  --text-dim: rgba(45,52,54,0.6);
  --text-muted: rgba(45,52,54,0.35);
  --card-bg: rgba(255,255,255,0.82);
  --card-border: rgba(0,0,0,0.06);
  --card-shadow: 0 4px 24px rgba(0,0,0,0.06);
  --stat-bg: rgba(255,255,255,0.75);
  --stat-border: rgba(0,0,0,0.05);
  --stat-text: #555;
  --input-bg: rgba(255,255,255,0.92);
  --input-border: rgba(0,0,0,0.1);
  --input-text: #2d3436;
  --input-placeholder: rgba(0,0,0,0.2);
  --dot-bg: rgba(0,0,0,0.08);
}

.game-wrapper.theme-ins .game-title {
  background: none;
  -webkit-text-fill-color: #667eea;
  color: #667eea;
}

.game-wrapper.theme-ins .game-subtitle { color: var(--text-dim); }

.game-wrapper.theme-ins .orb { opacity: 0.12; }
.game-wrapper.theme-ins .orb-1 { background: #e8a87c; }
.game-wrapper.theme-ins .orb-2 { background: #d49aa0; }
.game-wrapper.theme-ins .orb-3 { background: #a0a8d0; }

.game-wrapper.theme-ins .select-card,
.game-wrapper.theme-ins .finish-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-ins .select-heading,
.game-wrapper.theme-ins .finish-grade { color: var(--text-primary); }
.game-wrapper.theme-ins .select-desc,
.game-wrapper.theme-ins .select-hint { color: var(--text-dim); }

.game-wrapper.theme-ins .mode-btn {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--text-primary);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-ins .mode-btn:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.1); }
.game-wrapper.theme-ins .mode-btn .mode-desc { color: var(--text-dim); }

.game-wrapper.theme-ins .mode-badge.normal {
  background: rgba(102,126,234,0.12); color: #667eea;
}
.game-wrapper.theme-ins .mode-badge.speed {
  background: rgba(208,140,120,0.12); color: #c08060;
}

.game-wrapper.theme-ins .stat {
  background: var(--stat-bg); border: 1px solid var(--stat-border);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-ins .stat-label { color: var(--stat-text); }
.game-wrapper.theme-ins .stat-value { color: var(--text-primary); }

.game-wrapper.theme-ins .timer-bg { stroke: rgba(0,0,0,0.06); }
.game-wrapper.theme-ins .timer-text { color: var(--text-primary); }

.game-wrapper.theme-ins .prompt-card {
  border-color: var(--card-border);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-ins .prompt-card:hover { border-color: rgba(0,0,0,0.12); background: #fff; }
.game-wrapper.theme-ins .chinese-word {
  color: var(--text-primary);
  text-shadow: none;
}
.game-wrapper.theme-ins .speak-icon { color: var(--text-dim); }
.game-wrapper.theme-ins .speak-icon.speaking { color: #667eea; }
.game-wrapper.theme-ins .phonetic { color: rgba(45,52,54,0.5); }

.game-wrapper.theme-ins .typing-input {
  background: var(--input-bg); border: 1px solid var(--input-border);
  color: var(--input-text); box-shadow: var(--card-shadow);
}
.game-wrapper.theme-ins .typing-input::placeholder { color: var(--input-placeholder); }
.game-wrapper.theme-ins .typing-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.15);
}

.game-wrapper.theme-ins .enter-btn {
  border-color: #667eea !important;
  background: #fff !important; color: #2a3f8a !important;
}
.game-wrapper.theme-ins .enter-btn:not(:disabled):hover { background: #f0f1ff !important; border-color: #5865e0 !important; }
.game-wrapper.theme-ins .enter-btn:disabled { border-color: #c0c8ec !important; background: #f5f6fc !important; color: #909cc8 !important; }
.game-wrapper.theme-ins .enter-btn.btn-ok { border-color: #6bcb77 !important; background: #f0faf2 !important; color: #2d7a38 !important; }
.game-wrapper.theme-ins .enter-btn.btn-bad { border-color: #e03131 !important; background: #fef0f0 !important; color: #b33a3a !important; }

.game-wrapper.theme-ins .result-bar.correct {
  color: #38b000; background: rgba(107,203,119,0.1);
}
.game-wrapper.theme-ins .result-bar.wrong {
  color: #e03131; background: rgba(255,107,107,0.1);
}
.game-wrapper.theme-ins .result-answer strong { color: #667eea; }
.game-wrapper.theme-ins .result-answer { color: rgba(45,52,54,0.5); }

.game-wrapper.theme-ins .dot { background: var(--dot-bg); }

.game-wrapper.theme-ins .finish-num {
  color: #667eea;
  background: none;
  -webkit-text-fill-color: #667eea;
}
.game-wrapper.theme-ins .finish-stat {
  background: var(--stat-bg); border: 1px solid var(--stat-border);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-ins .finish-label { color: var(--text-dim); }

.game-wrapper.theme-ins .failed-item { background: rgba(255,107,107,0.06); }
.game-wrapper.theme-ins .failed-cn { color: var(--text-primary); }
.game-wrapper.theme-ins .failed-title { color: var(--text-dim); }
.game-wrapper.theme-ins .failed-en { color: #c08060; }
.game-wrapper.theme-ins .mini-speak { color: var(--text-dim); }
.game-wrapper.theme-ins .mini-speak:hover { color: #667eea; }

.game-wrapper.theme-ins .restart-btn {
  background: #667eea;
  box-shadow: 0 4px 16px rgba(102,126,234,0.2);
}
.game-wrapper.theme-ins .restart-btn:hover {
  background: #5865e0; box-shadow: 0 6px 24px rgba(102,126,234,0.35);
}

.game-wrapper.theme-ins .sub-btn {
  background: var(--card-bg); border: 1px solid var(--card-border);
  color: var(--text-primary, #555); box-shadow: var(--card-shadow);
}
.game-wrapper.theme-ins .sub-btn:hover { border-color: #667eea; color: #667eea; }

.game-wrapper.theme-ins .theme-toggle-global {
  border-color: var(--card-border);
  background: var(--card-bg);
  color: var(--text-primary);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-ins .theme-toggle-global:hover { border-color: #667eea; color: #667eea; }

.game-wrapper.theme-ins .home-link,
.game-wrapper.theme-ins .back-link {
  color: var(--text-primary);
  font-weight: 500;
}
.game-wrapper.theme-ins .home-link:hover,
.game-wrapper.theme-ins .back-link:hover { color: #667eea; }
.game-wrapper.theme-ins .back-link {
  background: var(--card-bg);
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  font-size: 0.8rem;
  top: 16px;
  left: 16px;
}

/* ===== Cute Theme (mint + pink) ===== */
.game-wrapper.theme-cute {
  --bg-gradient: #fdf0f5;
  --text-primary: #4a4a4a;
  --text-dim: rgba(74,74,74,0.55);
  --text-muted: rgba(74,74,74,0.3);
  --card-bg: rgba(255,255,255,0.88);
  --card-border: rgba(0,0,0,0.05);
  --card-shadow: 0 4px 20px rgba(136,180,170,0.15);
  --stat-bg: rgba(255,255,255,0.8);
  --stat-border: rgba(0,0,0,0.04);
  --stat-text: #777;
  --input-bg: rgba(255,255,255,0.92);
  --input-border: rgba(0,0,0,0.08);
  --input-text: #4a4a4a;
  --input-placeholder: rgba(74,74,74,0.2);
  --dot-bg: rgba(74,74,74,0.08);
}

.game-wrapper.theme-cute .game-title {
  background: none;
  -webkit-text-fill-color: #7cc5b0;
  color: #7cc5b0;
}

.game-wrapper.theme-cute .game-subtitle { color: var(--text-dim); }

.game-wrapper.theme-cute .orb { opacity: 0.12; }
.game-wrapper.theme-cute .orb-1 { background: #7cc5b0; }
.game-wrapper.theme-cute .orb-2 { background: #f5a0b0; }
.game-wrapper.theme-cute .orb-3 { background: #c8a0d0; }

.game-wrapper.theme-cute .select-card,
.game-wrapper.theme-cute .finish-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-cute .select-heading,
.game-wrapper.theme-cute .finish-grade { color: var(--text-primary); }
.game-wrapper.theme-cute .select-desc,
.game-wrapper.theme-cute .select-hint { color: var(--text-dim); }

.game-wrapper.theme-cute .mode-btn {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--text-primary);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-cute .mode-btn:hover { box-shadow: 0 6px 24px rgba(124,197,176,0.15); }
.game-wrapper.theme-cute .mode-btn .mode-desc { color: var(--text-dim); }

.game-wrapper.theme-cute .mode-badge.normal {
  background: rgba(124,197,176,0.12); color: #7cc5b0;
}
.game-wrapper.theme-cute .mode-badge.speed {
  background: rgba(245,160,176,0.12); color: #f5a0b0;
}

.game-wrapper.theme-cute .stat {
  background: var(--stat-bg); border: 1px solid var(--stat-border);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-cute .stat-label { color: var(--stat-text); }
.game-wrapper.theme-cute .stat-value { color: var(--text-primary); }

.game-wrapper.theme-cute .timer-bg { stroke: rgba(0,0,0,0.05); }
.game-wrapper.theme-cute .timer-text { color: var(--text-primary); }

.game-wrapper.theme-cute .prompt-card {
  border-color: var(--card-border);
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-cute .prompt-card:hover {
  border-color: #f5a0b0; background: #fff;
}
.game-wrapper.theme-cute .chinese-word {
  color: var(--text-primary);
  text-shadow: none;
}
.game-wrapper.theme-cute .speak-icon { color: var(--text-dim); }
.game-wrapper.theme-cute .speak-icon.speaking { color: #f5a0b0; }
.game-wrapper.theme-cute .phonetic { color: rgba(74,74,74,0.5); }

.game-wrapper.theme-cute .typing-input {
  background: var(--input-bg); border: 1px solid var(--input-border);
  color: var(--input-text); box-shadow: var(--card-shadow);
}
.game-wrapper.theme-cute .typing-input::placeholder { color: var(--input-placeholder); }
.game-wrapper.theme-cute .typing-input:focus {
  border-color: #7cc5b0;
  box-shadow: 0 0 0 3px rgba(124,197,176,0.12);
}

.game-wrapper.theme-cute .enter-btn {
  border-color: #7cc5b0 !important;
  background: #fff !important; color: #2a7a68 !important;
}
.game-wrapper.theme-cute .enter-btn:not(:disabled):hover { background: #f0faf6 !important; border-color: #6bb8a0 !important; }
.game-wrapper.theme-cute .enter-btn:disabled { border-color: #b8ddd0 !important; background: #f5fbf8 !important; color: #7ab8a8 !important; }
.game-wrapper.theme-cute .enter-btn.btn-ok { border-color: #6bcb77 !important; background: #f0faf2 !important; color: #2d7a38 !important; }
.game-wrapper.theme-cute .enter-btn.btn-bad { border-color: #f5a0b0 !important; background: #fef5f6 !important; color: #b35a68 !important; }

.game-wrapper.theme-cute .result-bar.correct {
  color: #5ca385; background: rgba(124,197,176,0.1);
}
.game-wrapper.theme-cute .result-bar.wrong {
  color: #e88598; background: rgba(245,160,176,0.1);
}
.game-wrapper.theme-cute .result-answer strong { color: #7cc5b0; }
.game-wrapper.theme-cute .result-answer { color: rgba(74,74,74,0.55); }

.game-wrapper.theme-cute .dot { background: var(--dot-bg); }

.game-wrapper.theme-cute .finish-num {
  color: #7cc5b0;
  background: none;
  -webkit-text-fill-color: #7cc5b0;
}
.game-wrapper.theme-cute .finish-stat {
  background: var(--stat-bg); border: 1px solid var(--stat-border);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-cute .finish-label { color: var(--text-dim); }

.game-wrapper.theme-cute .failed-item { background: rgba(245,160,176,0.06); }
.game-wrapper.theme-cute .failed-cn { color: var(--text-primary); }
.game-wrapper.theme-cute .failed-title { color: var(--text-dim); }
.game-wrapper.theme-cute .failed-en { color: #f5a0b0; }
.game-wrapper.theme-cute .mini-speak { color: var(--text-dim); }
.game-wrapper.theme-cute .mini-speak:hover { color: #7cc5b0; }

.game-wrapper.theme-cute .restart-btn {
  background: #7cc5b0;
  box-shadow: 0 4px 16px rgba(124,197,176,0.2);
}
.game-wrapper.theme-cute .restart-btn:hover {
  background: #6bb8a0; box-shadow: 0 6px 24px rgba(124,197,176,0.3);
}

.game-wrapper.theme-cute .sub-btn {
  background: var(--card-bg); border: 1px solid var(--card-border);
  color: var(--text-primary); box-shadow: var(--card-shadow);
}
.game-wrapper.theme-cute .sub-btn:hover { border-color: #7cc5b0; color: #7cc5b0; }

.game-wrapper.theme-cute .theme-toggle-global {
  border-color: var(--card-border);
  background: var(--card-bg);
  color: var(--text-primary);
  box-shadow: var(--card-shadow);
}
.game-wrapper.theme-cute .theme-toggle-global:hover { border-color: #7cc5b0; color: #7cc5b0; }

.game-wrapper.theme-cute .home-link,
.game-wrapper.theme-cute .back-link {
  color: var(--text-primary);
  font-weight: 500;
}
.game-wrapper.theme-cute .home-link:hover,
.game-wrapper.theme-cute .back-link:hover { color: #7cc5b0; }
.game-wrapper.theme-cute .back-link {
  background: var(--card-bg);
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
  font-size: 0.8rem;
  top: 16px;
  left: 16px;
}

/* Cute decorations */
.cute-deco { pointer-events: none; z-index: 0; position: fixed; inset: 0; overflow: hidden; }
.deco {
  position: absolute; opacity: 0.4;
  animation: deco-float 10s ease-in-out infinite;
  user-select: none;
}
.deco-1 { top: 6%; left: 5%; animation-delay: 0s; }
.deco-2 { top: 12%; right: 7%; animation-delay: -1.5s; }
.deco-3 { bottom: 18%; left: 8%; animation-delay: -3s; }
.deco-4 { top: 38%; right: 4%; animation-delay: -4.5s; }
.deco-5 { bottom: 8%; right: 10%; animation-delay: -2s; }
.deco-6 { top: 60%; left: 3%; animation-delay: -5.5s; }
.deco-7 { bottom: 32%; left: 15%; animation-delay: -1s; }
.deco-8 { top: 72%; right: 8%; animation-delay: -3.5s; }
.deco-9 { top: 22%; left: 16%; animation-delay: -6s; }
.deco-10 { top: 48%; right: 14%; animation-delay: -0.5s; }
.deco-11 { bottom: 28%; right: 18%; animation-delay: -4s; }
.deco-12 { top: 52%; left: 12%; animation-delay: -2.5s; }
.deco-13 { top: 68%; right: 20%; animation-delay: -5s; }
.deco-14 { bottom: 16%; left: 22%; animation-delay: -1.8s; }
.deco-15 { top: 30%; right: 22%; animation-delay: -3.8s; }
.deco-16 { bottom: 42%; right: 6%; animation-delay: -6.5s; }
@keyframes deco-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-14px) rotate(4deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(10px) rotate(-4deg); }
}
</style>
