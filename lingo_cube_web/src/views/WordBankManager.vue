<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { wordBank, type WordEntry } from './wordBank'
import { useTheme } from '@/composables/useTheme'
import { useSpeech } from '@/composables/useSpeech'
import CuteDeco from '@/components/CuteDeco.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import BackButton from '@/components/common/BackButton.vue'
import WordList from '@/components/common/WordList.vue'
import Icon from '@/components/common/Icon.vue'

const { theme } = useTheme()
const { speak } = useSpeech()

// 👆 Theme class
const themeClass = computed(() => {
  if (theme.value === 'ins') return 'theme-ins'
  if (theme.value === 'cute') return 'theme-cute'
  return ''
})

// 🔍 Search
const searchQuery = ref('')
const ITEMS_PER_PAGE = 20
const currentPage = ref(1)
const activeSpeaking = ref<string | null>(null)

// Filter words by search query
const filteredWords = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return [...wordBank]
  return wordBank.filter(
    w =>
      w.english.toLowerCase().includes(q) ||
      w.chinese.toLowerCase().includes(q)
  )
})

// Reset page when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// 📄 Pagination
const totalPages = computed(() =>
  Math.ceil(filteredWords.value.length / ITEMS_PER_PAGE)
)

const paginatedWords = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filteredWords.value.slice(start, start + ITEMS_PER_PAGE)
})

const startIndex = computed(() =>
  Math.min((currentPage.value - 1) * ITEMS_PER_PAGE + 1, filteredWords.value.length)
)
const endIndex = computed(() =>
  Math.min(currentPage.value * ITEMS_PER_PAGE, filteredWords.value.length)
)

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// 🔊 TTS
function handleSpeak(text: string) {
  activeSpeaking.value = text
  speak(text)
  // Reset after animation
  setTimeout(() => {
    if (activeSpeaking.value === text) {
      activeSpeaking.value = null
    }
  }, 1500)
}

// 📋 Word detail modal
const selectedWord = ref<WordEntry | null>(null)

function openDetail(word: WordEntry) {
  selectedWord.value = word
}

function closeDetail() {
  selectedWord.value = null
}
</script>

<template>
  <div :class="['review-wrapper', themeClass]">
    <ThemeToggle />
    <CuteDeco />
    <BackButton to="/" />

    <!-- Header -->
    <div class="wbm-header">
      <h1 class="wbm-title">📚 Word Bank</h1>
      <p class="wbm-subtitle">Browse all {{ wordBank.length }} words</p>
    </div>

    <!-- Search -->
    <div class="wbm-search">
      <Icon class="wbm-search-icon" name="search" :size="18" />
      <input
        v-model="searchQuery"
        type="text"
        class="wbm-search-input"
        placeholder="Search English or Chinese..."
      />
    </div>

    <!-- Word count -->
    <div class="wbm-count" v-if="filteredWords.length > 0">
      Showing {{ startIndex }}–{{ endIndex }} of {{ filteredWords.length }} words
    </div>
    <div class="wbm-count wbm-count--empty" v-else>
      No words match "{{ searchQuery }}"
    </div>

    <!-- Word list -->
    <WordList
      :words="paginatedWords"
      :max-width="460"
      :speaking-word="activeSpeaking"
      @word-click="openDetail"
      @speak="handleSpeak"
    />

    <!-- Pagination -->
    <div class="wbm-pagination" v-if="totalPages > 1">
      <button
        class="wbm-page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        ‹ Prev
      </button>
      <span class="wbm-page-info">
        {{ currentPage }} / {{ totalPages }}
      </span>
      <button
        class="wbm-page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        Next ›
      </button>
    </div>

    <!-- Detail modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="selectedWord" class="wbm-modal-mask" @click.self="closeDetail">
          <div class="wbm-modal" :class="themeClass">
            <button class="wbm-modal-close" @click="closeDetail" title="Close">
              <Icon name="close" :size="20" />
            </button>

            <div class="wbm-modal-word">
              <span class="wbm-modal-english">{{ selectedWord.english }}</span>
              <button
                class="wbm-modal-speak"
                :class="{ speaking: activeSpeaking === selectedWord.english }"
                @click.stop="handleSpeak(selectedWord.english)"
                title="Listen"
              >
                <Icon name="speaker" :size="20" />
              </button>
            </div>

            <div class="wbm-modal-phonetic" v-if="selectedWord.phonetic">
              /{{ selectedWord.phonetic }}/
            </div>

            <div class="wbm-modal-chinese">
              {{ selectedWord.chinese }}
            </div>

            <div class="wbm-modal-examples" v-if="selectedWord.examples?.length">
              <h3 class="wbm-modal-section-title">Examples</h3>
              <ul class="wbm-modal-example-list">
                <li v-for="(ex, i) in selectedWord.examples" :key="i" class="wbm-modal-example">
                  {{ ex.text }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ===== Layout (follows review-wrapper pattern) ===== */
.review-wrapper {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-gradient);
   color: var(--text-primary);
   position: relative;
  padding: 0 16px;
  overflow-y: auto;
}

/* ===== Header ===== */
.wbm-header {
  text-align: center;
  padding-top: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.wbm-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 4px;
  color: var(--title-color);
}

.wbm-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  letter-spacing: 3px;
  text-transform: uppercase;
}

/* ===== Search ===== */
.wbm-search {
  position: relative;
  width: 100%;
  max-width: 440px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.wbm-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.wbm-search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border-radius: var(--card-radius, 16px);
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--input-text);
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.wbm-search-input::placeholder {
  color: var(--input-placeholder);
}

.wbm-search-input:focus {
  border-color: var(--accent);
  box-shadow: var(--input-focus-shadow);
}

/* ===== Count ===== */
.wbm-count {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-bottom: 8px;
  flex-shrink: 0;
}

.wbm-count--empty {
  color: var(--text-muted);
  margin-top: 24px;
  font-size: 0.95rem;
}

/* ===== Pagination ===== */
.wbm-pagination {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0 32px;
  flex-shrink: 0;
}

.wbm-page-btn {
  padding: 8px 18px;
  border-radius: var(--card-radius, 16px);
  border: 1px solid var(--btn-border);
  background: var(--btn-bg);
  color: var(--btn-color);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  font-family: inherit;
}

.wbm-page-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.wbm-page-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.wbm-page-info {
  font-size: 0.85rem;
  color: var(--text-dim);
  min-width: 64px;
  text-align: center;
}

/* ===== Modal ===== */
.wbm-modal-mask {
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

.wbm-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius, 16px);
  padding: 28px 24px 24px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
}

.wbm-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
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

.wbm-modal-close:hover {
  color: var(--text-primary);
}

.wbm-modal-word {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.wbm-modal-english {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--word-color);
  font-family: monospace;
  letter-spacing: 2px;
}

.wbm-modal-speak {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  border-radius: 50%;
  color: var(--text-muted);
  transition: color 0.2s;
  flex-shrink: 0;
}

.wbm-modal-speak:hover {
  color: var(--accent);
  background: var(--btn-bg);
}

.wbm-modal-speak.speaking {
  color: var(--speak-active-color, #ffd93d);
  animation: modal-speak-pulse 0.6s ease-in-out infinite;
}

@keyframes modal-speak-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.wbm-modal-phonetic {
  font-size: 1.1rem;
  color: var(--phonetic-color);
  margin-bottom: 8px;
  font-family: monospace;
}

.wbm-modal-chinese {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.wbm-modal-section-title {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.wbm-modal-example-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wbm-modal-example {
  font-size: 0.9rem;
  color: var(--example-text);
  background: var(--example-bg);
  padding: 8px 12px;
  border-radius: 8px;
  line-height: 1.5;
}

/* ===== Modal transition ===== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .wbm-modal,
.modal-fade-leave-active .wbm-modal {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .wbm-modal {
  transform: translateY(20px) scale(0.96);
  opacity: 0;
}

.modal-fade-leave-to .wbm-modal {
  transform: translateY(10px) scale(0.98);
  opacity: 0;
}

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .wbm-title {
    font-size: 1.5rem;
  }

  .wbm-modal {
    max-width: 92vw;
    padding: 24px 20px 20px;
  }

  .wbm-modal-english {
    font-size: 1.5rem;
  }
}
</style>
