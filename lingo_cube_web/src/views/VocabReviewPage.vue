<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useSpeech } from '@/composables/useSpeech'
import { useVocabBook } from '@/composables/useVocabBook'
import ReviewSessionCard from '@/components/review/ReviewSessionCard.vue'
import WordListItem from '@/components/word/WordListItem.vue'
import CuteDeco from '@/components/CuteDeco.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import BackButton from '@/components/common/BackButton.vue'
import Icon from '@/components/common/Icon.vue'

const { theme } = useTheme()
const { speak } = useSpeech()
const { getVocab, removeFromVocab } = useVocabBook()

const reviewing = ref(false)
const words = ref(getVocab())

const themeClass = computed(() =>
  theme.value === 'ins' ? 'theme-ins' : theme.value === 'cute' ? 'theme-cute' : ''
)

function removeWord(english: string) {
  removeFromVocab(english)
  words.value = getVocab()
}

function startReview() {
  if (words.value.length) reviewing.value = true
}

function onComplete() {
  reviewing.value = false
  words.value = getVocab()
}
</script>

<template>
  <div :class="['review-wrapper', themeClass]">
    <CuteDeco />
    <ThemeToggle />
    <BackButton to="/" />

    <!-- Empty state -->
    <template v-if="!words.length">
      <div class="review-header">
        <h1 class="review-title">📂 Vocab Book</h1>
        <p class="review-subtitle">0 saved words</p>
      </div>
      <div class="empty-state">
        <p class="empty-icon">📂</p>
        <p class="empty-text">No saved words yet</p>
        <p class="empty-hint">Words you add to Vocab during review will appear here</p>
      </div>
    </template>

    <!-- List mode -->
    <template v-else-if="!reviewing">
      <div class="review-header">
        <h1 class="review-title">📂 Vocab Book</h1>
        <p class="review-subtitle">{{ words.length }} saved words</p>
        <button class="start-review-btn" @click="startReview">
          ▶ Review All {{ words.length }} Words
        </button>
      </div>

      <div class="vocab-list">
        <div v-for="w in words" :key="w.english" class="vocab-row">
          <WordListItem :word="w" @speak="speak" />
          <button class="remove-btn" @click="removeWord(w.english)" title="Remove from vocab">
            <Icon name="close" :size="16" />
          </button>
        </div>
      </div>
    </template>

    <!-- Review mode -->
    <template v-else>
      <div class="review-header">
        <h1 class="review-title">📂 Vocab Review</h1>
        <p class="review-subtitle">{{ words.length }} words</p>
      </div>
      <ReviewSessionCard
        :words="words"
        @complete="onComplete"
      />
    </template>
  </div>
</template>

<style scoped>
.review-wrapper {
  min-height: 100vh; min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-gradient);
   color: var(--text-primary, #fff);
   position: relative;
  padding: 0 16px;
}

.review-header {
  text-align: center;
  padding-top: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.review-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 4px;
  color: var(--title-color);
}
.review-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.start-review-btn {
  padding: 10px 24px;
  border-radius: 12px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--accent, #4d96ff);
  color: #fff;
}
.start-review-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.vocab-list {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius, 16px);
  overflow: hidden;
}

.vocab-row {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  max-width: 420px;
}
.vocab-row :deep(.list-item) {
  flex: 1;
  min-width: 0;
}
.vocab-row :deep(.list-item-english) {
  flex: 0 1 auto;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.remove-btn:hover {
  color: #ff6b6b;
  background: rgba(255,107,107,0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
  gap: 8px;
}
.empty-icon { font-size: 3rem; }
.empty-text { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
.empty-hint { font-size: 0.85rem; color: var(--text-muted); max-width: 280px; text-align: center; }
</style>
