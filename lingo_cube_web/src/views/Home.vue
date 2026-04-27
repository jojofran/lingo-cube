<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { computed } from 'vue'
import CuteDeco from '@/components/CuteDeco.vue'

const { theme, themeLabel, themeShort, cycleTheme } = useTheme()

const themeClass = computed(() => {
  return theme.value === 'ins' ? 'theme-ins' : theme.value === 'cute' ? 'theme-cute' : ''
})
</script>

<template>
  <div :class="['home', themeClass]">
    <div class="theme-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
    <CuteDeco />

    <button class="theme-toggle-global" @click="cycleTheme" :title="themeLabel">
      {{ themeShort }}
    </button>

    <h1 class="theme-title">Lingo Cube</h1>
    <p class="subtitle text-dim">Welcome to Lingo Cube !</p>
    <router-link to="/typing" class="game-link">
      <span class="game-icon">⌨️</span>
      <span class="game-label">Typing Challenge</span>
      <span class="game-desc text-dim">Practice & Improve Your Spelling</span>
    </router-link>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-gradient);
  color: var(--text-primary);
  transition: background 0.3s, color 0.3s;
  position: relative;
}

.home > *:not(.theme-orbs) {
  position: relative;
  z-index: 1;
}

.theme-title {
  font-size: 3rem;
}

.subtitle {
  margin: 0 0 40px;
}

.game-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 24px 36px;
  border-radius: var(--card-radius, 16px);
  border: 1px solid var(--card-border);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.25s;
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}

.game-link:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.game-icon {
  font-size: 2rem;
  margin-bottom: 4px;
}

.game-label {
  font-size: 1.1rem;
  font-weight: 600;
}

.game-desc {
  font-size: 0.8rem;
}
</style>