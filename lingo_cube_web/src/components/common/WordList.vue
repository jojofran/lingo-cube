<script setup lang="ts">
import { ref } from 'vue'
import type { WordEntry } from '@/types'
import WordListItem from '@/components/word/WordListItem.vue'
import WordCard from '@/components/common/WordCard.vue'
import WordCardEx from '@/components/common/WordCardEx.vue'

const props = withDefaults(defineProps<{
  words: WordEntry[]
  maxWidth?: number
  speakingWord?: string | null
  showCardOnClick?: boolean
}>(), {
  showCardOnClick: false,
})

const emit = defineEmits<{
  'word-click': [word: WordEntry]
  speak: [text: string]
}>()

const selectedWord = ref<WordEntry | null>(null)

function onRowClick(word: WordEntry) {
  if (props.showCardOnClick) {
    selectedWord.value = word
  } else {
    emit('word-click', word)
  }
}

function closeCard() {
  selectedWord.value = null
}
</script>

<template>
  <div class="word-list" :style="{ maxWidth: maxWidth + 'px' || '460px' }">
    <div
      v-for="word in words"
      :key="word.english"
      class="word-list-row"
      :class="{ clickable: showCardOnClick || $attrs.onWordClick }"
      @click="onRowClick(word)"
    >
      <WordListItem :word="word" :speaking="speakingWord === word.english" @speak="emit('speak', $event)" />
      <slot name="action" :word="word" />
    </div>
  </div>

  <!-- Word card modal -->
  <Teleport to="body">
    <Transition name="card-modal">
      <div v-if="selectedWord" class="card-modal-mask" @click.self="closeCard">
        <div class="card-modal">
          <button class="card-modal-close" @click="closeCard">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <WordCardEx
            v-if="selectedWord.examples?.length"
            :word="selectedWord"
            primary="chinese"
            @speak="emit('speak', $event)"
          >
            <div class="card-modal-hint">Click outside to close</div>
          </WordCardEx>

          <WordCard
            v-else
            :word="selectedWord"
            primary="chinese"
            @speak="emit('speak', $event)"
          >
            <div class="card-modal-hint">Click outside to close</div>
          </WordCard>
        </div>
      </div>
    </Transition>
  </Teleport>
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

/* ===== Card Modal ===== */
.card-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.card-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
}

.card-modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--btn-bg);
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.card-modal-close:hover {
  color: var(--text-primary);
}

.card-modal-hint {
  margin-top: 12px;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

/* Modal transition */
.card-modal-enter-active,
.card-modal-leave-active {
  transition: opacity 0.25s ease;
}

.card-modal-leave-active .card-modal,
.card-modal-enter-active .card-modal {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.card-modal-enter-from,
.card-modal-leave-to {
  opacity: 0;
}

.card-modal-enter-from .card-modal {
  transform: translateY(20px) scale(0.96);
  opacity: 0;
}

.card-modal-leave-to .card-modal {
  transform: translateY(10px) scale(0.98);
  opacity: 0;
}
</style>
