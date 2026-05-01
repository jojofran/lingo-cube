<script setup lang="ts">
import type { WordEntry } from '@/types'

defineProps<{
  word: WordEntry | null
  shakeActive: boolean
  burstActive: boolean
  speaking: boolean
}>()

const emit = defineEmits<{
  speak: [word: string]
}>()
</script>

<template>
  <div
    v-if="word"
    class="prompt-card"
    :class="{ shake: shakeActive, burst: burstActive }"
    @click="emit('speak', word.english)"
  >
    <svg
      class="speak-icon"
      :class="{ speaking }"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
    <span class="chinese-word">{{ word.chinese }}</span>
    <span class="phonetic">{{ word.phonetic }}</span>
  </div>
</template>

<style scoped>
.prompt-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
  padding: 20px 28px 16px;
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
.prompt-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}
.prompt-card:active {
  transform: scale(0.99);
}

.speak-icon {
  position: absolute;
  top: 8px;
  right: 10px;
  opacity: 0.3;
  transition: opacity 0.25s;
  color: var(--text-primary);
}
.prompt-card:hover .speak-icon {
  opacity: 0.6;
}
.speak-icon.speaking {
  opacity: 0.8;
  color: #ffd93d;
  animation: speak-pulse 0.6s ease-in-out infinite;
}
@keyframes speak-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.chinese-word {
  font-size: clamp(1.4rem, 4.5vw, 2.2rem);
  font-weight: 800;
  letter-spacing: 3px;
  text-shadow: 0 0 50px rgba(77, 150, 255, 0.3);
  overflow-wrap: break-word;
  word-break: keep-all;
  line-height: 1.2;
  text-align: center;
  color: var(--text-primary);
}
.phonetic {
  font-size: 0.95rem;
  color: var(--phonetic-color, rgba(255, 255, 255, 0.55));
  font-family: 'Times New Roman', 'STIX Two Text', serif;
  letter-spacing: 0.5px;
  text-align: center;
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
