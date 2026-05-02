<script setup lang="ts">
import { computed } from 'vue'
import type { WordEntry } from '@/types'
import WordCard from './WordCard.vue'
import WordSpeaker from '@/components/word/WordSpeaker.vue'

const props = withDefaults(defineProps<{
  word: WordEntry | null
  primary?: 'chinese' | 'english'
  showPhonetic?: boolean
  showSpeak?: boolean
  showSecondary?: boolean
  speaking?: boolean
  exampleIndex?: number
}>(), {
  exampleIndex: 0,
  showPhonetic: true,
  showSpeak: true,
  showSecondary: true,
})

const emit = defineEmits<{
  speak: [text: string]
}>()

const currentExample = computed<{ text: string; weight: number } | null>(() => {
  return props.word?.examples?.[props.exampleIndex] ?? null
})
</script>

<template>
  <WordCard
    :word="word"
    :primary="primary"
    :show-phonetic="showPhonetic"
    :show-speak="showSpeak"
    :show-secondary="showSecondary"
    :speaking="speaking"
    @speak="emit('speak', $event)"
  >
    <template v-if="currentExample" #default>
      <slot v-if="$slots.example" name="example" :example="currentExample" />
      <div v-else class="wx-example">
        <span class="wx-example-label">Example</span>
        <div class="wx-example-body">
          <span class="wx-example-text">{{ currentExample.text }}</span>
          <WordSpeaker
            :speaking="speaking"
            @click.stop
            @speak="emit('speak', currentExample.text)"
          />
        </div>
      </div>
    </template>
  </WordCard>
</template>

<style scoped>
.wx-example {
  margin-top: 4px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--example-bg, rgba(255,255,255,0.04));
  border: 1px solid var(--card-border);
  text-align: left;
}
.wx-example-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted, rgba(255,255,255,0.35));
  margin-bottom: 8px;
}
.wx-example-body {
  display: flex;
  align-items: center;
  gap: 10px;
}
.wx-example-text {
  flex: 1;
  min-width: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--example-text, rgba(255,255,255,0.75));
  font-style: italic;
}
</style>
