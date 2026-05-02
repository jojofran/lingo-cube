<script setup lang="ts">
import type { WordEntry } from '@/types'
import WordSpeaker from '@/components/word/WordSpeaker.vue'

type WordPrimary = 'chinese' | 'english'

const props = withDefaults(defineProps<{
  word: WordEntry | null
  primary?: WordPrimary
  showSecondary?: boolean
  showPhonetic?: boolean
  showSpeak?: boolean
  animatable?: boolean
  shakeActive?: boolean
  burstActive?: boolean
  speaking?: boolean
}>(), {
  primary: 'chinese',
  showSecondary: true,
  showPhonetic: true,
  showSpeak: true,
})

const emit = defineEmits<{
  speak: [word: string]
}>()

function onCardClick() {
  if (props.showSpeak === false || !props.word) return
  // WordCard 只负责播单词。播例句是 WordCardEx 的行为
  emit('speak', props.word.english)
}
</script>

<template>
  <div
    v-if="word"
    class="word-card"
    :class="{
      shake: animatable !== false && shakeActive,
      burst: animatable !== false && burstActive,
    }"
    @click="onCardClick"
  >
    <WordSpeaker
      v-if="showSpeak !== false"
      class="word-card__speaker"
      :speaking="speaking"
      @click.stop
      @speak="emit('speak', word.english)"
    />

    <!-- primary='chinese': Chinese as primary word -->
    <template v-if="primary === 'chinese'">
      <span class="word-primary">{{ word.chinese }}</span>
      <span v-if="showPhonetic !== false" class="phonetic">{{ word.phonetic }}</span>
    </template>

    <!-- primary='english': English as primary word, optional Chinese as secondary -->
    <template v-else>
      <span class="word-primary">{{ word.english }}</span>
      <span v-if="showPhonetic !== false" class="phonetic">{{ word.phonetic }}</span>
      <span v-if="showSecondary !== false" class="word-secondary">{{ word.chinese }}</span>
    </template>

    <div v-if="$slots.default" class="word-card__extra">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.word-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--card-border);
  border-radius: 20px;
  background: var(--card-bg);
  cursor: pointer;
  transition: border-color 0.3s, background 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.word-card:hover {
  border-color: var(--prompt-hover-border);
  background: var(--prompt-hover-bg);
}

.word-card:active {
  transform: scale(0.99);
}

.word-primary {
  font-size: clamp(1.5rem, 5vw, 2.4rem);
  font-weight: 800;
  letter-spacing: 3px;
  text-shadow: var(--chinese-text-shadow);
  overflow-wrap: break-word;
  word-break: keep-all;
  line-height: 1.2;
  text-align: center;
  color: var(--word-color, #ffd93d);
}

.word-secondary {
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 2px;
  overflow-wrap: break-word;
  word-break: keep-all;
  line-height: 1.3;
  text-align: center;
  margin-top: 10px;
  color: var(--word-secondary-color, var(--text-primary));
}

.word-card__speaker {
  position: absolute;
  top: 8px;
  right: 10px;
  opacity: 0.3;
  transition: opacity 0.25s;
  color: var(--text-primary);
}

.word-card:hover .word-card__speaker {
  opacity: 0.6;
}

.phonetic {
  font-size: 1.3rem;
  color: var(--phonetic-color, rgba(255, 255, 255, 0.55));
  font-family: 'Times New Roman', 'STIX Two Text', serif;
  letter-spacing: 0.5px;
  text-align: center;
  margin-top: 8px;
}

.word-card__extra {
  width: 100%;
  margin-top: 8px;
}

.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  50%,
  90% {
    transform: translateX(-8px);
  }
  30%,
  70% {
    transform: translateX(8px);
  }
}

.burst {
  animation: burst 0.8s ease;
}

@keyframes burst {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.08);
    filter: brightness(1.5);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}
</style>
