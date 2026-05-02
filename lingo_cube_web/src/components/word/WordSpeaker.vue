<script setup lang="ts">
defineProps<{ speaking?: boolean }>()
const emit = defineEmits<{ speak: [] }>()
</script>

<template>
  <button class="word-speaker" :class="{ speaking }" @click="emit('speak')">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  </button>
</template>

<style scoped>
.word-speaker {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  color: var(--text-muted);
  transition: color 0.2s, opacity 0.25s;
  border-radius: 50%;
}
.word-speaker:hover {
  color: var(--accent);
  background: var(--btn-bg);
}
.word-speaker.speaking {
  color: var(--speak-active-color, #ffd93d);
  opacity: 0.8;
  animation: speaker-pulse 0.6s ease-in-out infinite;
}
@keyframes speaker-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>
