<script setup lang="ts">
import type { GameMode, WordEntry, WordResult } from '@/types'
import StatsRow from './StatsRow.vue'
import TimerRing from './TimerRing.vue'
import PromptCard from './PromptCard.vue'
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
      {{ isSpeed ? '⚡ Speed' : '📖 Library' }}
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

    <PromptCard
      :word="currentWord"
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
  background: rgba(77, 150, 255, 0.2);
  color: #4d96ff;
}
.mode-badge.speed {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
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
}
</style>
