<script setup lang="ts">
import type { WordEntry } from '@/types'
import WordCardEx from './WordCardEx.vue'

defineProps<{
  word: WordEntry
  speaking?: boolean
}>()

const emit = defineEmits<{
  speak: [text: string]
}>()
</script>

<template>
  <WordCardEx
    :word="word"
    primary="english"
    :show-secondary="true"
    :speaking="speaking"
    class="review-card"
    @speak="emit('speak', $event)"
  >
    <slot />
  </WordCardEx>
</template>

<style scoped>
.review-card {
  --wc-radius: var(--card-radius, 24px);
}

.review-card :deep(.word-card) {
  border-radius: var(--wc-radius);
}
</style>
