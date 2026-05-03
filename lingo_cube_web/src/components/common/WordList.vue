<script setup lang="ts">
import type { WordEntry } from '@/types'
import WordListItem from '@/components/word/WordListItem.vue'

defineProps<{
  words: WordEntry[]
  maxWidth?: number
  speakingWord?: string | null
}>()

const emit = defineEmits<{
  'word-click': [word: WordEntry]
  speak: [text: string]
}>()
</script>

<template>
  <div class="word-list" :style="{ maxWidth: maxWidth + 'px' || '460px' }">
    <div
      v-for="word in words"
      :key="word.english"
      class="word-list-row"
      :class="{ clickable: $attrs.onWordClick }"
      @click="emit('word-click', word)"
    >
      <WordListItem :word="word" :speaking="speakingWord === word.english" @speak="emit('speak', $event)" />
      <slot name="action" :word="word" />
    </div>
  </div>
</template>

<style scoped>
.word-list {
  width: 100%;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius, 16px);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.word-list-row {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.15s;
  cursor: default;
}

.word-list-row:not(.clickable) {
  cursor: default;
}

.word-list-row:hover {
  background: var(--stat-bg);
}

.word-list-row :deep(.list-item) {
  flex: 1;
  min-width: 0;
  max-width: none;
  margin-bottom: 0;
  border-radius: 0;
}
</style>
