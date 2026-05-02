<script setup lang="ts">
import { ref, computed, onMounted, nextTick, defineAsyncComponent } from 'vue'
import { wordBank } from './wordBank'
import { useTheme } from '@/composables/useTheme'
import { useAudio } from '@/composables/useAudio'
import { useSpeech } from '@/composables/useSpeech'
import { useTimer } from '@/composables/useTimer'
import { useConfetti } from '@/composables/useConfetti'
import { useAchievements } from '@/composables/useAchievements'
import { useGameSessionStore } from '@/stores/gameSession'
import { useWordProvider } from '@/composables/useWordProvider'
import CuteDeco from '@/components/CuteDeco.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import BackButton from '@/components/common/BackButton.vue'
import AchievementToast from '@/components/common/AchievementToast.vue'
import ModeSelect from '@/components/game/ModeSelect.vue'
import GamePlay from '@/components/game/GamePlay.vue'
const GameFinished = defineAsyncComponent({
  loader: () => import('@/components/game/GameFinished.vue'),
  loadingComponent: { template: '<div class="finish-loading">Loading...</div>' },
  delay: 200,
})
import soundGreat from '@/assets/audio/great.mp3'
import soundExcellent from '@/assets/audio/excellent.wav'
import soundAmazing from '@/assets/audio/amazing.mp3'
import soundUnbelievable from '@/assets/audio/unbelievable.wav'
import soundNext from '@/assets/audio/next.wav'
import type { GameMode, Screen, WordResult } from '@/types'

const { theme } = useTheme()
const { initAudio, playSound, playFail, playFinish } = useAudio()
const { speak, speaking } = useSpeech()
const { timeLeft, startTimer, stopTimer } = useTimer()
const { canvasRef, launchConfetti } = useConfetti()
const gameSession = useGameSessionStore()
const { fetchWords, wordList } = useWordProvider()
const achievements = useAchievements()

const TOTAL_ROUNDS = 20
const SPEED_TIME = 8

const screen = ref<Screen>('select')
const userInput = ref('')
const result = ref<WordResult>(null)
const resultMsg = ref('')
const failedAtBottom = ref(false)
const shakeActive = ref(false)
const burstActive = ref(false)

const praiseStrings = ['Great! 🎉', 'Nice! ✨', 'Perfect! 💯', 'Excellent! 🌟', 'Amazing! 🔥', 'Superb! 👏', 'Unbelievable! 💎'] as const
const praise = (): string => praiseStrings[Math.floor(Math.random() * praiseStrings.length)]

const regretStrings = ["Keep trying! 💪", "Almost there! 🎯", "Next one! 🚀", "Don't give up! ⚡", "You'll get it! 🍀"] as const
const regret = (): string => regretStrings[Math.floor(Math.random() * regretStrings.length)]

// Praise text → sound name mapping for manual sound playback
const praiseToSound: Record<string, string> = {
  'Great! 🎉': 'great',
  'Nice! ✨': 'next',
  'Perfect! 💯': 'next',
  'Excellent! 🌟': 'excellent',
  'Amazing! 🔥': 'amazing',
  'Superb! 👏': 'next',
  'Unbelievable! 💎': 'unbelievable'
}

const currentWord = computed(() => wordList.value[gameSession.currentIndex] ?? null)
const isSpeed = computed(() => gameSession.mode === 'speed')
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

function autoSpeak() {
  if (currentWord.value) {
    // slight delay so browser has time to render new word before TTS kicks in
    setTimeout(() => speak(currentWord.value!.english), 200)
  }
}

// ---- Game Logic ----
async function selectMode(m: GameMode) {
  gameSession.setMode(m)
  userInput.value = ''
  result.value = null
  resultMsg.value = ''

  await fetchWords(TOTAL_ROUNDS)

  screen.value = 'playing'
  if (isSpeed.value) { startTimer(SPEED_TIME, () => timeout()) }
  nextTick(() => {
    document.getElementById('typing-input')?.focus()
    if (window.innerWidth <= 768) {
      document.querySelector('.stats-row')?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    if (gameSession.mode === 'listen') {
      speak(currentWord.value?.english ?? '')
    } else {
      autoSpeak()
    }
  })
}

function submit() {
  const v = userInput.value.trim()
  if (!v || !currentWord.value) return
  if (result.value) return
  stopTimer()

  if (v.toLowerCase() === currentWord.value.english.toLowerCase()) {
    result.value = 'correct'
    const msg = praise()
    resultMsg.value = msg
    gameSession.onCorrect(isSpeed.value, isSpeed.value ? timeLeft.value : 0, gameSession.mode)
    burstActive.value = true
    launchConfetti()
    const soundName = praiseToSound[msg] || 'next'
    playSound(soundName)
  } else {
    result.value = 'wrong'
    resultMsg.value = regret()
    gameSession.onWrong(currentWord.value)
    shakeActive.value = true
    playFail()
  }
  setTimeout(() => next(), 1500)
}

function timeout() {
  stopTimer()
  result.value = 'wrong'
  resultMsg.value = "Time's up! ⏱"
  gameSession.onWrong(currentWord.value!)
  shakeActive.value = true
  playFail()
  setTimeout(() => next(), 1500)
}

function next() {
  if (gameSession.currentIndex >= TOTAL_ROUNDS - 1) {
    gameSession.recordGame(gameSession.score, gameSession.combo)
    screen.value = 'finished'
    launchConfetti()
    playFinish()

    const modesPlayed: string[] =
      gameSession.mode !== 'normal' ? [gameSession.mode] : []
    achievements.checkAll({
      gamesPlayed: 1,
      bestCombo: gameSession.maxCombo,
      bestScore: gameSession.score,
      modesPlayed,
    })
    return
  }
  userInput.value = ''
  result.value = null
  resultMsg.value = ''
  shakeActive.value = false
  burstActive.value = false
  gameSession.currentIndex++
  if (isSpeed.value) { startTimer(SPEED_TIME, () => timeout()) }
  nextTick(() => {
    document.getElementById('typing-input')?.focus()
    if (window.innerWidth <= 768) {
      document.querySelector('.stats-row')?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    if (gameSession.mode === 'listen') {
      speak(currentWord.value?.english ?? '')
    } else {
      autoSpeak()
    }
  })
}

function restart() {
  screen.value = 'select'
  failedAtBottom.value = false
}

function startReview() {
  if (gameSession.failedWords.length === 0) return
  // Save failed words to localStorage and navigate to review page
  localStorage.setItem('failedWords', JSON.stringify(gameSession.failedWords))
  window.location.href = '/lingo-cube/#/review'
}

// HTML 输入中按 Enter 提交
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && userInput.value.trim() && !result.value) {
    e.preventDefault()
    submit()
  }
}

onMounted(() => {
  initAudio({ great: soundGreat, excellent: soundExcellent, amazing: soundAmazing, unbelievable: soundUnbelievable, next: soundNext })
})
</script>

<template>
  <div class="game-wrapper" :class="{ 'theme-ins': theme === 'ins', 'theme-cute': theme === 'cute' }">
    <canvas ref="canvasRef" class="confetti-layer" />

    <ThemeToggle />

    <!-- Cute theme decorations -->
    <CuteDeco />

    <!-- Achievement toasts -->
    <AchievementToast />

    <!-- Title -->
    <div class="game-header">
      <h1 class="game-title">⌨️ Lingo Cube</h1>
      <p class="game-subtitle">IELTS Typing Practice</p>
    </div>

    <!-- ============ MODE SELECT ============ -->
    <ModeSelect
      v-if="screen === 'select'"
      :total-rounds="TOTAL_ROUNDS"
      :word-bank-count="wordBank.length"
      @select-mode="selectMode"
    />

    <!-- ============ PLAYING ============ -->
    <GamePlay
      v-if="screen === 'playing'"
      :mode="gameSession.mode"
      :score="gameSession.score"
      :combo="gameSession.combo"
      :current-index="gameSession.currentIndex"
      :time-left="timeLeft"
      :total-rounds="TOTAL_ROUNDS"
      :speed-time="SPEED_TIME"
      :current-word="currentWord"
      :user-input="userInput"
      :result="result"
      :result-msg="resultMsg"
      :shake-active="shakeActive"
      :burst-active="burstActive"
      :speaking="speaking"
      :is-speed="isSpeed"
      :timer-color="timerColor"
      :input-class="inputClass"
      :is-disabled="!!result"
      @submit="submit"
      @speak="speak"
      @update:user-input="userInput = $event"
      @keydown="onKeydown"
    />

    <!-- ============ FINISHED ============ -->
    <GameFinished
      v-if="screen === 'finished'"
      :score="gameSession.score"
      :max-combo="gameSession.maxCombo"
      :failed-words="gameSession.failedWords"
      :total-rounds="TOTAL_ROUNDS"
      :grade="gameSession.grade"
      :failed-at-bottom="failedAtBottom"
      @restart="restart"
      @review="startReview"
      @speak="speak"
    />

    <!-- Back to home -->
    <BackButton to="/" />

  </div>
</template>

<style scoped>
.game-wrapper {
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
  /* overflow: hidden; -- removed to allow theme toggle button to show */
  padding: 0 16px;
}

.game-wrapper > :deep(.back-icon) {
  /* keep back-icon visible */
}

.confetti-layer {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 100;
}

/* ===== Header ===== */
.game-header { text-align: center; padding-top: 16px; margin-bottom: 8px; flex-shrink: 0; }

@media (max-width: 768px) {
  .game-header { display: none; }
  .game-wrapper { padding-top: 12px; }
}

.game-title {
  font-size: 2.2rem; font-weight: 800; letter-spacing: 2px;
  background: var(--title-gradient);
  -webkit-background-clip: text; -webkit-text-fill-color: var(--title-fill);
  background-clip: text; color: var(--title-color);
  margin-bottom: 4px;
}
.game-subtitle {
  font-size: 0.9rem; color: var(--text-muted);
  letter-spacing: 4px; text-transform: uppercase;
}

/* ===== Select Screen ===== */
.select-screen { position: relative; max-width: 460px; width: 100%; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.25; animation: orb-float 6s ease-in-out infinite; }
.orb-1 { width: 200px; height: 200px; background: #4d96ff; top: -80px; left: -60px; }
.orb-2 { width: 160px; height: 160px; background: #ff6b6b; bottom: -50px; right: -40px; animation-delay: -2s; }
.orb-3 { width: 120px; height: 120px; background: #ffd93d; bottom: 100px; left: 50%; animation-delay: -4s; }
@keyframes orb-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}
.select-card {
  background: var(--card-bg);
  backdrop-filter: var(--card-blur, blur(20px));
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: 36px 32px;
  text-align: center;
  position: relative; z-index: 1;
}
.select-icon { font-size: 3rem; margin-bottom: 8px; animation: bounce 1.5s ease-in-out infinite; }
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.select-heading { font-size: 1.6rem; font-weight: 700; margin-bottom: 6px; }
.select-desc { color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 28px; }
.mode-buttons { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; min-width: 280px; }
.mode-btn {
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; padding: 18px 24px;
  border-radius: 16px; border: 2px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05); color: #fff;
  cursor: pointer; transition: all 0.25s;
  min-width: 240px;
}
.mode-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
.mode-btn.normal:hover { background: rgba(77,150,255,0.15); border-color: #4d96ff; }
.mode-btn.speed:hover { background: rgba(255,107,107,0.15); border-color: #ff6b6b; }
.mode-icon { font-size: 1.6rem; }
.mode-label { font-size: 1.1rem; font-weight: 700; }
.mode-desc { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
.select-hint { font-size: 0.75rem; color: rgba(255,255,255,0.3); }

/* ===== Playing Screen ===== */
.playing-screen { max-width: 620px; width: 100%; flex: 1; display: flex; flex-direction: column; align-items: center; overflow: hidden; min-height: 0; }

@media (max-width: 768px) {
  .playing-screen { flex: 1; justify-content: flex-start; overflow: hidden; min-height: 0; padding-top: 48px; }
  .playing-screen .chinese-word { font-size: clamp(1.2rem, 5vw, 1.8rem); }
  .playing-screen .phonetic { font-size: 0.8rem; margin-top: 4px; }
  .playing-screen .input-area { margin-top: auto; flex-shrink: 0; padding-bottom: env(safe-area-inset-bottom, 8px); width: 100%; max-width: 420px; box-sizing: border-box; align-self: center; }
  .playing-screen .stats-row { margin-bottom: 16px; padding: 0; gap: 6px; flex-shrink: 0; width: 100%; max-width: 420px; }
  .playing-screen .stat { padding: 8px 6px; }
  .playing-screen .stat-value { font-size: 0.95rem; }
  .playing-screen .stat-label { font-size: 0.6rem; }
  .playing-screen .mode-badge { margin-bottom: 16px; font-size: 0.65rem; padding: 3px 12px; flex-shrink: 0; }
  .playing-screen .timer-ring-wrap { width: 56px; height: 56px; margin: 0 auto 12px; }
  .playing-screen .timer-ring { width: 56px; height: 56px; }
  .playing-screen .timer-text { font-size: 1.1rem; }
  .playing-screen .dots-row { margin-top: 12px; }
  .playing-screen .dot { width: 5px; height: 5px; }
  .playing-screen .enter-btn { padding: 10px 24px; font-size: 0.9rem; }
  .playing-screen .typing-input { padding: 12px 18px; font-size: 1rem; }
  .playing-screen .input-row { gap: 12px; margin-bottom: 8px; }
  .back-icon { top: 12px; }
  .theme-toggle-global { top: 12px; }
}

.mode-badge {
  font-size: 0.75rem; font-weight: 600;
  padding: 5px 16px; border-radius: 20px; margin-bottom: 20px;
  letter-spacing: 1.5px;
  white-space: nowrap;
}
.mode-badge.normal { background: rgba(77,150,255,0.2); color: #4d96ff; }
.mode-badge.speed { background: rgba(255,107,107,0.2); color: #ff6b6b; }

.stats-row { display: flex; gap: 12px; justify-content: center; margin-bottom: 28px; width: 100%; max-width: 420px; box-sizing: border-box; }

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
.input-area { width: 100%; max-width: 420px; box-sizing: border-box; }
.input-row { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-bottom: 20px; }
.typing-input {
  width: 100%; box-sizing: border-box;
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
  background: var(--card-bg);
  backdrop-filter: var(--card-blur, blur(20px));
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  max-width: 460px; width: 100%;
  animation: slideUp 0.5s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.finish-emoji { font-size: 3rem; margin-bottom: 4px; }
.finish-grade { font-size: 1.4rem; font-weight: 700; margin-bottom: 18px; }
.finish-stats { display: flex; gap: 6px; justify-content: center; margin-bottom: 24px; }
.finish-stat {
  flex: 1 1 0;
  display: flex; flex-direction: column; align-items: center;
  background: rgba(255,255,255,0.05); border-radius: 16px; padding: 16px 16px;
  min-width: 0;
}
.finish-num { font-size: 1.8rem; font-weight: 800; white-space: nowrap;
  background: linear-gradient(135deg, #ffd93d, #ff922b);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.finish-label { font-size: 0.6rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px; white-space: nowrap; }

/* Failed words */
.failed-list { margin-bottom: 18px; text-align: left; width: 100%; }
.failed-scroll { max-height: 240px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent; background: rgba(255,255,255,0.03); border-radius: 10px; padding: 4px; }
.failed-scroll::-webkit-scrollbar { width: 5px; }
.failed-scroll::-webkit-scrollbar-track { background: transparent; }
.failed-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
.failed-title { font-size: 0.8rem; color: rgba(255,255,255,0.45); margin-bottom: 8px; font-weight: 600; letter-spacing: 1px; }
.failed-item { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 12px; background: rgba(255,107,107,0.06); margin-bottom: 6px; font-size: 0.85rem; }
.finish-buttons { display: flex; gap: 12px; justify-content: center; margin-bottom: 14px; }
.restart-btn {
  padding: 14px 40px; border-radius: 14px; border: none;
  font-size: 1.1rem; font-weight: 700; cursor: pointer;
  background: #4d96ff; color: #fff; transition: all 0.25s;
  box-shadow: 0 4px 16px rgba(77,150,255,0.2);
}
.restart-btn:hover { background: #3a7bd5; transform: translateY(-3px); box-shadow: 0 10px 30px rgba(77,150,255,0.3); }
.review-btn { background: #ff922b; box-shadow: 0 4px 16px rgba(255,146,43,0.2); }
.review-btn:hover { background: #e8821a; box-shadow: 0 10px 30px rgba(255,146,43,0.3); }
.review-btn:disabled { background: #ccc; cursor: default; box-shadow: none; }

.外-scroll-hint { display: flex; justify-content: center; margin-top: -12px; margin-bottom: 8px; position: relative; z-index: 1; }
.scroll-hint-circle {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  animation: scroll-bounce 1.2s ease-in-out infinite;
}
.scroll-hint-circle svg { color: rgba(255,255,255,0.7); }
@keyframes scroll-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }

.mode-choice { display: flex; gap: 10px; justify-content: center; margin-bottom: 14px; }
.sub-btn {
  padding: 8px 20px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
  font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
}
.sub-btn:hover { border-color: rgba(255,255,255,0.3); color: #fff; }

</style>
