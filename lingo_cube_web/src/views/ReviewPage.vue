<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { wordBank, type WordEntry } from './wordBank'
import { useTheme } from '@/composables/useTheme'
import { useGameSessionStore } from '@/stores/gameSession'
import { useSpeech } from '@/composables/useSpeech'
import ReviewSessionCard from '@/components/review/ReviewSessionCard.vue'
import CuteDeco from '@/components/CuteDeco.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import BackButton from '@/components/common/BackButton.vue'

const { theme } = useTheme()
const themeClass = computed(() =>
  theme.value === 'ins' ? 'theme-ins' :
  theme.value === 'cute' ? 'theme-cute' : ''
)
const { speak } = useSpeech()
const gameSession = useGameSessionStore()
const router = useRouter()

const words = ref<WordEntry[]>([])

onMounted(() => {
  if (gameSession.failedWords.length > 0) {
    words.value = [...gameSession.failedWords]
  }
  if (words.value.length === 0) {
    words.value = wordBank.slice(0, 5)
  }
  // speak first word
  if (words.value[0]) speak(words.value[0].english)
})

function onComplete() {
  router.push('/typing')
}
</script>

<template>
  <div :class="['review-wrapper', themeClass]">
    <ThemeToggle />
    <CuteDeco />

    <div class="review-header">
      <h1 class="review-title">📖 Review</h1>
      <p class="review-subtitle">Learn from your mistakes</p>
    </div>

    <ReviewSessionCard
      v-if="words.length"
      :words="words"
      @complete="onComplete"
    />

    <BackButton to="/typing" />
  </div>
</template>

<style scoped>
.review-wrapper {
  height: 100vh; height: 100dvh;
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
}
</style>
