<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { computed } from 'vue'
import CuteDeco from '@/components/CuteDeco.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const { theme } = useTheme()

const themeClass = computed(() => {
  return theme.value === 'ins' ? 'theme-ins' : theme.value === 'cute' ? 'theme-cute' : ''
})
</script>

<template>
  <div :class="['home', themeClass]">
    <!-- Hand-drawn background decorations (new cute theme layer) -->
    <div class="cute-hand-drawn">
      <div class="hand-item h1" />
      <div class="hand-item h2" />
      <div class="hand-item h3" />
      <div class="hand-item h4" />
      <div class="hand-item h5" />
    </div>

    <div class="theme-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
    <CuteDeco />

    <ThemeToggle />

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
  /* overflow: hidden;  -- removed to allow theme toggle button to show */
}

.home > *:not(.theme-orbs):not(.theme-toggle-global):not(.cute-deco) {
  position: relative;
  z-index: 1;
}

.theme-title {
  font-size: 3rem;
}

.subtitle {
  margin: 0 0 40px;
}

.cute-hand-drawn {
  pointer-events: none;
  z-index: 0;
  position: fixed;
  inset: 0;
  overflow: hidden;
  display: var(--cute-deco-display, block);
}

.hand-item {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.18;
  will-change: transform;
}

.h1 { width: 22%; height: 22%; background: var(--hand-h1, #7cc5b0); top: 8%; left: 6%; animation: float1 12s ease-in-out infinite; }
  .h2 { width: 14%; height: 14%; background: var(--hand-h2, #f5a0b0); top: 82%; left: 82%; animation: float2 10s ease-in-out infinite; }
  .h3 { width: 18%; height: 18%; background: var(--hand-h3, #c8a0d0); top: 12%; left: 88%; animation: float3 14s ease-in-out infinite; }
  .h4 { width: 10%; height: 10%; background: var(--hand-h4, #ffd93d); top: 86%; left: 14%; animation: float4 9s ease-in-out infinite; }
  .h5 { width: 16%; height: 16%; background: var(--hand-h5, #ff8fab); top: 50%; left: 50%; animation: float5 16s ease-in-out infinite; }

  @keyframes float1 {
    0%, 100% { transform: translateY(0) rotate(12deg) scale(1.3); }
    50% { transform: translateY(-20px) rotate(18deg) scale(1.43); }
  }
  @keyframes float2 {
    0%, 100% { transform: translateY(0) rotate(-10deg) scale(0.9); }
    50% { transform: translateY(-14px) rotate(-15deg) scale(0.95); }
  }
  @keyframes float3 {
    0%, 100% { transform: translateY(0) rotate(8deg) scale(1.1); }
    50% { transform: translateY(-18px) rotate(12deg) scale(1.27); }
  }
  @keyframes float4 {
    0%, 100% { transform: translateY(0) rotate(-6deg) scale(0.8); }
    50% { transform: translateY(-12px) rotate(-9deg) scale(0.86); }
  }
  @keyframes float5 {
    0%, 100% { transform: translateY(0) rotate(18deg) scale(0.6); }
    50% { transform: translateY(-22px) rotate(26deg) scale(0.72); }
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