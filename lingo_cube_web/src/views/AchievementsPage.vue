<script setup lang="ts">
import { computed } from 'vue'
import { useAchievements } from '@/composables/useAchievements'
import { useTheme } from '@/composables/useTheme'
import CuteDeco from '@/components/CuteDeco.vue'
import BackButton from '@/components/common/BackButton.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const { theme } = useTheme()
const { getDisplayList, totalUnlocked, totalAchievements, isAllUnlocked } =
  useAchievements()

const themeClass = computed(() => {
  if (theme.value === 'ins') return 'theme-ins'
  if (theme.value === 'cute') return 'theme-cute'
  return ''
})

const progressPct = computed(() =>
  Math.round((totalUnlocked.value / totalAchievements) * 100),
)
</script>

<template>
  <div :class="['achievements-page', themeClass]">
    <CuteDeco />
    <ThemeToggle />
    <BackButton to="/" />

    <header class="page-header">
      <h1 class="page-title">🏆 Achievements</h1>
      <p class="page-subtitle">
        <span class="progress-bar-bg">
          <span
            class="progress-bar-fill"
            :style="{ width: progressPct + '%' }"
          />
        </span>
        <span class="progress-text">
          {{ totalUnlocked }} / {{ totalAchievements }} unlocked
          <template v-if="isAllUnlocked"> · 🎉 All Complete!</template>
        </span>
      </p>
    </header>

    <div class="achievement-grid">
      <div
        v-for="ach in getDisplayList"
        :key="ach.id"
        class="achievement-card"
        :class="{ locked: !ach.unlocked }"
      >
        <span class="card-icon">{{ ach.icon }}</span>
        <div class="card-body">
          <div class="card-label">{{ ach.label }}</div>
          <div class="card-desc">{{ ach.desc }}</div>
        </div>
        <span v-if="ach.unlocked" class="card-check">✓</span>
        <span v-else class="card-lock">🔒</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievements-page {
  min-height: 100vh;
  background: var(--bg-gradient);
  color: var(--text-primary);
  transition: background 0.3s, color 0.3s;
  padding: 64px 16px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 2px;
  background: var(--title-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: var(--title-fill);
  background-clip: text;
  color: var(--title-color);
  margin-bottom: 8px;
  margin-top: 0;
}

.page-subtitle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.progress-text {
  font-size: 0.85rem;
  color: var(--text-dim);
}

.progress-bar-bg {
  display: block;
  width: 200px;
  height: 6px;
  border-radius: 3px;
  background: var(--dot-bg, rgba(255, 255, 255, 0.15));
  overflow: hidden;
}

.progress-bar-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 640px;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: var(--card-radius, 16px);
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  backdrop-filter: var(--card-blur, blur(20px));
  box-shadow: var(--card-shadow);
  transition: all 0.3s;
}

.achievement-card.locked {
  opacity: 0.4;
  filter: grayscale(1);
}

.card-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 0.95rem;
  font-weight: 700;
}

.card-desc {
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-top: 2px;
}

.card-check {
  font-size: 1.1rem;
  color: var(--accent-secondary);
  flex-shrink: 0;
}

.card-lock {
  font-size: 0.9rem;
  flex-shrink: 0;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .achievements-page {
    padding: 56px 12px 32px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .achievement-grid {
    grid-template-columns: 1fr;
    max-width: 420px;
  }
}
</style>
