<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WordEntry } from '@/types'

const props = defineProps<{
  score: number
  maxCombo: number
  failedWords: WordEntry[]
  totalRounds: number
  grade: { label: string; emoji: string }
  failedAtBottom: boolean
}>()

defineEmits<{
  restart: []
  review: []
  speak: [word: string]
}>()

const localFailedAtBottom = ref(props.failedAtBottom)

watch(() => props.failedAtBottom, (val) => {
  localFailedAtBottom.value = val
})

function onFailedScroll(e: Event) {
  const el = e.target as HTMLElement
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20
  localFailedAtBottom.value = atBottom
}
</script>

<template>
  <div class="finish-screen">
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
          <span class="finish-num">{{ totalRounds - failedWords.length }} / {{ totalRounds }}</span>
          <span class="finish-label">Accuracy</span>
        </div>
      </div>

      <!-- Failed words review -->
      <div v-if="failedWords.length" class="failed-list">
        <h3 class="failed-title">Review Needed</h3>
        <div class="failed-scroll" @scroll="onFailedScroll">
          <div v-for="w in failedWords" :key="w.english" class="failed-item">
            <button class="mini-speak" @click="$emit('speak', w.english)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>
            <span class="failed-cn">{{ w.chinese }}</span>
            <span class="failed-en">{{ w.english }}</span>
          </div>
        </div>
        <div v-if="failedWords.length > 3 && !localFailedAtBottom" class="外-scroll-hint">
          <div class="scroll-hint-circle">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="finish-buttons">
        <button class="restart-btn" @click="$emit('restart')">Play Again</button>
        <button class="restart-btn review-btn" @click="$emit('review')" :disabled="failedWords.length === 0">Review</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finish-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.finish-card {
  background: var(--card-bg);
  backdrop-filter: var(--card-blur, blur(20px));
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  max-width: 460px;
  width: 100%;
  box-shadow: var(--card-shadow);
  animation: slideUp 0.5s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.finish-emoji {
  font-size: 3rem;
  margin-bottom: 4px;
}
.finish-grade {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: var(--text-primary);
}
.finish-stats {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 24px;
}
.finish-stat {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--stat-bg);
  border: 1px solid var(--stat-border);
  border-radius: 16px;
  padding: 16px;
  min-width: 0;
  box-shadow: var(--card-shadow);
}
.finish-num {
  font-size: 1.8rem;
  font-weight: 800;
  white-space: nowrap;
  background: linear-gradient(135deg, var(--word-color), var(--accent-tertiary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.finish-label {
  font-size: 0.6rem;
  color: var(--stat-text);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 3px;
  white-space: nowrap;
}

/* Failed words */
.failed-list {
  margin-bottom: 18px;
  text-align: left;
  width: 100%;
}
.failed-scroll {
  max-height: 240px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--card-border) transparent;
  background: var(--stat-bg);
  border-radius: 10px;
  padding: 4px;
}
.failed-scroll::-webkit-scrollbar {
  width: 5px;
}
.failed-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.failed-scroll::-webkit-scrollbar-thumb {
  background: var(--card-border);
  border-radius: 3px;
}
.failed-title {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: 1px;
}
.failed-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--stat-bg);
  margin-bottom: 6px;
  font-size: 0.85rem;
}
.failed-cn {
  color: var(--text-dim);
  min-width: 0;
  flex: 0 1 auto;
  margin-right: 6px;
}
.failed-en {
  color: var(--word-color);
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: 1px;
  flex: 1 1 auto;
}
.mini-speak {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px;
  color: var(--text-dim);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.mini-speak:hover {
  color: var(--accent);
}

.finish-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 14px;
}
.restart-btn {
  padding: 14px 40px;
  border-radius: 14px;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  background: var(--accent);
  color: var(--text-primary);
  transition: all 0.25s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.restart-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
.review-btn {
  background: var(--accent-tertiary);
}
.review-btn:hover {
  background: var(--accent-tertiary);
  filter: brightness(0.9);
}
.review-btn:disabled {
  opacity: 0.4;
  cursor: default;
  box-shadow: none;
  transform: none;
}

.外-scroll-hint {
  display: flex;
  justify-content: center;
  margin-top: -12px;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}
.scroll-hint-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--stat-bg);
  border: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scroll-bounce 1.2s ease-in-out infinite;
}
.scroll-hint-circle svg {
  color: var(--text-dim);
}
@keyframes scroll-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}
</style>
