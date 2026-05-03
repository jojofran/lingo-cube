<script setup lang="ts">
import type { GameMode, WordEntry, WordResult } from '@/types'
import StatsRow from './StatsRow.vue'
import TimerRing from './TimerRing.vue'
import WordCard from '@/components/common/WordCard.vue'
import ResultBar from './ResultBar.vue'
import InputArea from './InputArea.vue'
import ProgressDots from './ProgressDots.vue'

defineProps<{
  mode: GameMode
  score: number
  combo: number
  currentIndex: number
  timeLeft: number
  totalRounds: number
  speedTime: number
  currentWord: WordEntry | null
  userInput: string
  result: WordResult
  resultMsg: string
  shakeActive: boolean
  burstActive: boolean
  speaking: boolean
  isSpeed: boolean
  timerColor: string
  inputClass: string
  isDisabled: boolean
}>()

const emit = defineEmits<{
  submit: []
  speak: [word: string]
  'update:userInput': [value: string]
  keydown: [e: KeyboardEvent]
}>()
</script>

<template>
  <div class="playing-screen">
    <!-- Mode badge -->
    <div class="mode-badge" :class="mode">
      {{ mode === 'speed' ? '⚡ Speed' : mode === 'spell' ? '✍️ Spell' : mode === 'listen' ? '🎧 Listen' : '📖 Library' }}
    </div>

    <StatsRow
      :score="score"
      :combo="combo"
      :current-index="currentIndex"
      :total-rounds="totalRounds"
      :is-speed="isSpeed"
    />

    <TimerRing
      v-if="isSpeed"
      :time-left="timeLeft"
      :speed-time="speedTime"
      :timer-color="timerColor"
    />

    <template v-if="mode === 'listen'">
      <div class="listening-card">
        <div class="listening-icon">🎧</div>
        <div class="listening-text">Listen & Type</div>
        <div v-if="currentWord" class="listening-phonetic">{{ currentWord.phonetic }}</div>
      </div>
    </template>
    <WordCard
      v-else
      :word="currentWord"
      :animatable="true"
      :shake-active="shakeActive"
      :burst-active="burstActive"
      :speaking="speaking"
      @speak="emit('speak', $event)"
    />

    <ResultBar
      :result="result"
      :result-msg="resultMsg"
      :answer-word="currentWord?.english ?? null"
    />

    <InputArea
      :user-input="userInput"
      :input-class="inputClass"
      :is-disabled="isDisabled"
      :is-speed="isSpeed"
      @update:user-input="emit('update:userInput', $event)"
      @submit="emit('submit')"
      @keydown="emit('keydown', $event)"
    />

    <ProgressDots
      :current-index="currentIndex"
      :total-rounds="totalRounds"
      :is-current-wrong="result === 'wrong'"
    />
  </div>
</template>

<style scoped>
.playing-screen {
  max-width: 620px;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  min-height: 0;
}

.mode-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 5px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
  letter-spacing: 1.5px;
  white-space: nowrap;
}
.mode-badge.normal {
  background: var(--mode-badge-normal-bg);
  color: var(--mode-badge-normal-color);
}
.mode-badge.speed {
  background: var(--mode-badge-speed-bg);
  color: var(--mode-badge-speed-color);
}
.mode-badge.spell {
  background: var(--mode-badge-spell-bg);
  color: var(--mode-badge-spell-color);
}
.mode-badge.listen {
  background: var(--mode-badge-listen-bg);
  color: var(--mode-badge-listen-color);
}

/* ===== Listening Card ===== */
.listening-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--card-border);
  border-radius: 20px;
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s, background 0.3s;
}
.listening-card:hover {
  border-color: var(--prompt-hover-border);
  background: var(--prompt-hover-bg);
}
.listening-icon {
  font-size: 2.4rem;
  margin-bottom: 8px;
  animation: listen-pulse 1.8s ease-in-out infinite;
}
@keyframes listen-pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.08); opacity: 1; }
}
.listening-phonetic {
  margin-top: 12px;
  font-size: 1.3rem;
  color: var(--phonetic-color, rgba(255,255,255,0.55));
  font-family: 'Times New Roman', serif;
}
.listening-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 2px;
}

@media (max-width: 768px) {
  .playing-screen {
    flex: 1;
    justify-content: flex-start;
    overflow: hidden;
    min-height: 0;
    padding-top: 48px;
  }
  .mode-badge {
    margin-bottom: 16px;
    font-size: 0.65rem;
    padding: 3px 12px;
    flex-shrink: 0;
  }
  .listening-icon {
    font-size: 1.8rem;
  }
  .listening-text {
    font-size: 0.9rem;
  }
}
</style>
