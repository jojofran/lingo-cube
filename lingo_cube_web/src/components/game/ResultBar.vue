<script setup lang="ts">
import type { WordResult } from '@/types'

defineProps<{
  result: WordResult
  resultMsg: string
  answerWord: string | null
}>()
</script>

<template>
  <transition :name="result === 'correct' ? 'fly-top' : 'fly-side'">
    <div v-if="result" class="result-bar" :class="result">
      <span class="result-emoji">{{ result === 'correct' ? '🎉' : '😢' }}</span>
      <span class="result-text">{{ resultMsg }}</span>
      <span v-if="result === 'wrong' && answerWord" class="result-answer">
        Answer: <strong>{{ answerWord }}</strong>
      </span>
    </div>
  </transition>
</template>

<style scoped>
.result-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 20px;
  border-radius: 14px;
  margin-bottom: 10px;
  min-height: 40px;
  width: 100%;
  max-width: 420px;
}
.result-bar.correct {
  color: #6bcb77;
  background: rgba(107, 203, 119, 0.08);
}
.result-bar.wrong {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.08);
}
.result-emoji {
  font-size: 1.6rem;
}
.result-text {
  font-size: 1.15rem;
  font-weight: 600;
}
.result-answer {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}
.result-answer strong {
  color: #ffd93d;
  font-weight: 700;
}

/* Fly from top (correct) */
.fly-top-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fly-top-leave-active {
  transition: all 0.15s ease;
}
.fly-top-enter-from {
  opacity: 0;
  transform: translateY(-60px) scale(0.8);
}
.fly-top-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Fly from right side (wrong) */
.fly-side-enter-active {
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fly-side-leave-active {
  transition: all 0.15s ease;
}
.fly-side-enter-from {
  opacity: 0;
  transform: translateX(80px) scale(0.85);
}
.fly-side-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
