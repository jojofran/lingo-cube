<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { wordBank } from './wordBank'
import { useTheme } from '@/composables/useTheme'
import { useAudio } from '@/composables/useAudio'
import { useSpeech } from '@/composables/useSpeech'
import { useTimer } from '@/composables/useTimer'
import { useConfetti } from '@/composables/useConfetti'
import { useScoring } from '@/composables/useScoring'
import { useWordProvider } from '@/composables/useWordProvider'
import CuteDeco from '@/components/CuteDeco.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import BackButton from '@/components/common/BackButton.vue'
import ModeSelect from '@/components/game/ModeSelect.vue'
import GamePlay from '@/components/game/GamePlay.vue'
import GameFinished from '@/components/game/GameFinished.vue'
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
const { score, combo, maxCombo, grade, praise, regret, onCorrect, onWrong, resetScore, failedWords } = useScoring()
const { fetchWords, wordList } = useWordProvider()

const TOTAL_ROUNDS = 20
const SPEED_TIME = 8

const screen = ref<Screen>('select')
const mode = ref<GameMode>('normal')

const currentIndex = ref(0)
const userInput = ref('')
const result = ref<WordResult>(null)
const resultMsg = ref('')
const failedAtBottom = ref(false)
const shakeActive = ref(false)
const burstActive = ref(false)

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

function autoSpeak() {
  if (currentWord.value) {
    // slight delay so browser has time to render new word before TTS kicks in
    setTimeout(() => speak(currentWord.value!.english), 200)
  }
}

// ---- Game Logic ----
async function selectMode(m: GameMode) {
  mode.value = m
  currentIndex.value = 0
  userInput.value = ''
  result.value = null
  resultMsg.value = ''
  resetScore()

  await fetchWords(TOTAL_ROUNDS)

  screen.value = 'playing'
  if (isSpeed.value) { startTimer(SPEED_TIME, () => timeout()) }
  nextTick(() => {
    document.getElementById('typing-input')?.focus()
    if (window.innerWidth <= 768) {
      document.querySelector('.stats-row')?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    autoSpeak()
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
    onCorrect(isSpeed.value, isSpeed.value ? timeLeft.value : 0)
    burstActive.value = true
    launchConfetti()
    const soundName = praiseToSound[msg] || 'next'
    playSound(soundName)
  } else {
    result.value = 'wrong'
    resultMsg.value = regret()
    onWrong(currentWord.value)
    shakeActive.value = true
    playFail()
  }
  setTimeout(() => next(), 1500)
}

function timeout() {
  stopTimer()
  result.value = 'wrong'
  resultMsg.value = "Time's up! ⏱"
  onWrong(currentWord.value!)
  shakeActive.value = true
  playFail()
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
  if (isSpeed.value) { startTimer(SPEED_TIME, () => timeout()) }
  nextTick(() => {
    document.getElementById('typing-input')?.focus()
    if (window.innerWidth <= 768) {
      document.querySelector('.stats-row')?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    autoSpeak()
  })
}

function restart() {
  screen.value = 'select'
  failedAtBottom.value = false
}

function startReview() {
  if (failedWords.value.length === 0) return
  // Save failed words to localStorage and navigate to review page
  localStorage.setItem('failedWords', JSON.stringify(failedWords.value))
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
      :mode="mode"
      :score="score"
      :combo="combo"
      :current-index="currentIndex"
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
      :score="score"
      :max-combo="maxCombo"
      :failed-words="failedWords"
      :total-rounds="TOTAL_ROUNDS"
      :grade="grade"
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
  background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; margin-bottom: 4px;
}
.game-subtitle {
  font-size: 0.9rem; color: rgba(255,255,255,0.45);
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
  .playing-screen .prompt-card { flex-shrink: 0; margin-bottom: 16px; padding: 14px 24px 12px; width: 100%; max-width: 420px; box-sizing: border-box; align-self: center; }
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

/* Prompt */
.prompt-card {
  position: relative;
  width: 100%; max-width: 420px; box-sizing: border-box;
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
.failed-cn { color: rgba(255,255,255,0.65); min-width: 0; flex: 0 1 auto; margin-right: 6px; }
.failed-en { color: #ffd93d; font-weight: 600; font-family: 'SF Mono', 'Fira Code', monospace; letter-spacing: 1px; flex: 1 1 auto; }
.mini-speak { background: none; border: none; cursor: pointer; font-size: 0.9rem; padding: 4px; color: rgba(255,255,255,0.4); flex-shrink: 0; display: flex; align-items: center; transition: color 0.2s; }
.mini-speak:hover { color: #fff; }

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

@media (max-width: 768px) {
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
.game-wrapper.theme-ins .failed-scroll { background: rgba(0,0,0,0.03); scrollbar-color: rgba(0,0,0,0.1) transparent; }
.game-wrapper.theme-ins .failed-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }

.game-wrapper.theme-ins .restart-btn {
  background: #667eea;
  box-shadow: 0 4px 16px rgba(102,126,234,0.2);
}
.game-wrapper.theme-ins .restart-btn:hover {
  background: #5865e0; box-shadow: 0 6px 24px rgba(102,126,234,0.35);
}
.game-wrapper.theme-ins .scroll-hint-circle { background: rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.1); }
.game-wrapper.theme-ins .scroll-hint-circle svg { color: var(--text-dim); }

.game-wrapper.theme-ins .sub-btn {
  background: var(--card-bg); border: 1px solid var(--card-border);
  color: var(--text-primary, #555); box-shadow: var(--card-shadow);
}
.game-wrapper.theme-ins .sub-btn:hover { border-color: #667eea; color: #667eea; }

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
.game-wrapper.theme-cute .failed-scroll { background: rgba(124,197,176,0.04); scrollbar-color: rgba(124,197,176,0.2) transparent; }
.game-wrapper.theme-cute .failed-scroll::-webkit-scrollbar-thumb { background: rgba(124,197,176,0.2); }

.game-wrapper.theme-cute .restart-btn {
  background: #7cc5b0;
  box-shadow: 0 4px 16px rgba(124,197,176,0.2);
}
.game-wrapper.theme-cute .restart-btn:hover {
  background: #6bb8a0; box-shadow: 0 6px 24px rgba(124,197,176,0.3);
}
.game-wrapper.theme-cute .scroll-hint-circle { background: rgba(124,197,176,0.12); border-color: rgba(124,197,176,0.25); }
.game-wrapper.theme-cute .scroll-hint-circle svg { color: #7cc5b0; }

.game-wrapper.theme-cute .sub-btn {
  background: var(--card-bg); border: 1px solid var(--card-border);
  color: var(--text-primary); box-shadow: var(--card-shadow);
}
.game-wrapper.theme-cute .sub-btn:hover { border-color: #7cc5b0; color: #7cc5b0; }

/* Cute decorations */
.cute-deco { pointer-events: none; z-index: 0; position: fixed; inset: 0; overflow: hidden; display: var(--cute-deco-display, none); }
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
