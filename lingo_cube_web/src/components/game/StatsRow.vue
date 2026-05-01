<script setup lang="ts">
defineProps<{
  score: number
  combo: number
  currentIndex: number
  totalRounds: number
  isSpeed: boolean
}>()
</script>

<template>
  <div class="stats-row">
    <div class="stat">
      <span class="stat-label">Score</span>
      <span class="stat-value">{{ score }}</span>
    </div>
    <div class="stat">
      <span class="stat-label">{{ isSpeed ? 'Combo' : 'Correct' }}</span>
      <span class="stat-value" :class="{ fire: combo >= 5 }">
        {{ isSpeed ? `${combo >= 5 ? '🔥 ' : ''}${combo}x` : `${currentIndex} / ${totalRounds}` }}
      </span>
    </div>
    <div class="stat">
      <span class="stat-label">{{ isSpeed ? 'Round' : 'Progress' }}</span>
      <span class="stat-value">{{ currentIndex + 1 }} / {{ totalRounds }}</span>
    </div>
  </div>
</template>

<style scoped>
.stats-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 28px;
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
}

.stat {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--stat-bg);
  border: 1px solid var(--stat-border);
  border-radius: 14px;
  padding: 12px 8px;
  min-width: 0;
}
.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--stat-text);
  margin-bottom: 4px;
  white-space: nowrap;
}
.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  white-space: nowrap;
  color: var(--text-primary);
}

.fire {
  animation: fire-glow 0.6s ease-in-out infinite alternate;
}
@keyframes fire-glow {
  from {
    text-shadow: 0 0 8px rgba(255, 146, 43, 0.5);
  }
  to {
    text-shadow: 0 0 20px rgba(255, 146, 43, 0.9);
  }
}
</style>
