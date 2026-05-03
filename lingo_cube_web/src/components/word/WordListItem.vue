<script setup lang="ts">
import type { WordEntry } from '@/types'
import WordSpeaker from './WordSpeaker.vue'

defineProps<{
  word: WordEntry
  speaking?: boolean
}>()
const emit = defineEmits<{
  speak: [text: string]
}>()
</script>

<template>
  <div class="list-item">
    <WordSpeaker
      :speaking="speaking"
      @speak="emit('speak', word.english)"
    />
    <span class="list-item-chinese">{{ word.chinese }}</span>
    <span class="list-item-phonetic">{{ word.phonetic }}</span>
    <span class="list-item-english">{{ word.english }}</span>
  </div>
</template>

<style scoped>
.list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--card-border);
  background: var(--card-bg);
  border-radius: 12px;
}

.list-item:hover {
  background: var(--stat-bg);
}

.list-item:last-child {
  border-bottom: none;
}

.list-item-chinese {
  flex: 0 1 auto;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.list-item-phonetic {
  flex: 0 1 auto;
  font-size: 0.8rem;
  color: var(--phonetic-color, rgba(255,255,255,0.55));
  font-family: 'Times New Roman', serif;
}

.list-item-english {
  flex: 1 1 auto;
  text-align: right;
  font-weight: 600;
  color: var(--word-color, #ffd93d);
  letter-spacing: 1px;
  font-family: monospace;
}
</style>
