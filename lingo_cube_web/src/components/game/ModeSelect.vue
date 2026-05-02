<script setup lang="ts">
import type { GameMode } from '@/types'

defineProps<{
  totalRounds: number
  wordBankCount: number
}>()

const emit = defineEmits<{
  'select-mode': [mode: GameMode]
}>()
</script>

<template>
  <div class="select-screen">
    <div class="orb orb-1" /><div class="orb orb-2" /><div class="orb orb-3" />

    <div class="select-card">
      <div class="select-icon">🎯</div>
      <h2 class="select-heading">Choose Your Mode</h2>
      <p class="select-desc">Read Chinese, listen, spell English</p>

      <div class="mode-buttons">
        <button class="mode-btn normal" @click="emit('select-mode', 'normal')">
          <span class="mode-icon">📖</span>
          <span class="mode-label">Library Mode</span>
          <span class="mode-desc">No timer · Learn at your pace</span>
        </button>
        <button class="mode-btn speed" @click="emit('select-mode', 'speed')">
          <span class="mode-icon">⚡</span>
          <span class="mode-label">Speed Mode</span>
          <span class="mode-desc">8 seconds · Challenge high score</span>
        </button>
        <button class="mode-btn spell" @click="emit('select-mode', 'spell')">
          <span class="mode-icon">✍️</span>
          <span class="mode-label">Spelling Mode</span>
          <span class="mode-desc">See Chinese · Type the English</span>
        </button>
        <button class="mode-btn listen" @click="emit('select-mode', 'listen')">
          <span class="mode-icon">🎧</span>
          <span class="mode-label">Listening Mode</span>
          <span class="mode-desc">Hear the word · Type what you hear</span>
        </button>
      </div>
      <p class="select-hint">{{ totalRounds }} words / round · {{ wordBankCount }} word bank</p>
    </div>
  </div>
</template>

<style scoped>
.select-screen {
  position: relative;
  max-width: 460px;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ===== Floating Orbs ===== */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: var(--orb-opacity);
  animation: orb-float 6s ease-in-out infinite;
}
.orb-1 {
  width: 200px;
  height: 200px;
  background: var(--orb-1);
  top: -80px;
  left: -60px;
}
.orb-2 {
  width: 160px;
  height: 160px;
  background: var(--orb-2);
  bottom: -50px;
  right: -40px;
  animation-delay: -2s;
}
.orb-3 {
  width: 120px;
  height: 120px;
  background: var(--orb-3);
  bottom: 100px;
  left: 50%;
  animation-delay: -4s;
}
@keyframes orb-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

/* ===== Card ===== */
.select-card {
  background: var(--card-bg);
  backdrop-filter: var(--card-blur, blur(20px));
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: 36px 32px;
  text-align: center;
  position: relative;
  z-index: 1;
}
.select-icon {
  font-size: 3rem;
  margin-bottom: 8px;
  animation: bounce 1.5s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.select-heading {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--text-primary);
}
.select-desc {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-bottom: 28px;
}

/* ===== Mode Buttons ===== */
.mode-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  min-width: 280px;
}
.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 18px 24px;
  border-radius: 16px;
  border: 2px solid var(--card-border);
  background: var(--card-bg);
  color: var(--text-primary);
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: all 0.25s;
  min-width: 240px;
}
.mode-btn:hover {
  transform: translateY(-3px);
}
.mode-btn.normal:hover {
  border-color: var(--accent);
}
.mode-btn.speed:hover {
  border-color: var(--accent-secondary);
}
.mode-btn.spell:hover {
  border-color: var(--accent-tertiary);
}
.mode-btn.listen:hover {
  border-color: var(--accent);
}
.mode-icon {
  font-size: 1.6rem;
}
.mode-label {
  font-size: 1.1rem;
  font-weight: 700;
}
.mode-desc {
  font-size: 0.75rem;
  color: var(--text-dim);
}

/* ===== Hint ===== */
.select-hint {
  font-size: 0.75rem;
  color: var(--text-dim);
}
</style>
