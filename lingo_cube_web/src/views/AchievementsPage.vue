<script setup lang="ts">
import { computed } from 'vue'
import { useAchievements } from '@/composables/useAchievements'
import { useGameSessionStore } from '@/stores/gameSession'
import { useTheme } from '@/composables/useTheme'
import CuteDeco from '@/components/CuteDeco.vue'
import BackButton from '@/components/common/BackButton.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const { theme } = useTheme()
const gameSession = useGameSessionStore()
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

const recentScores = computed(() =>
  gameSession.sessionHistory.slice(-12),
)

const maxRecentScore = computed(() =>
  Math.max(...recentScores.value.map((s) => s.score), 1),
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

    <!-- Stats Summary -->
    <section v-if="gameSession.sessionHistory.length" class="stats-section">
      <h2 class="stats-heading">📊 Your Statistics</h2>
      <div class="stats-row">
        <div class="stats-card">
          <span class="stats-num">{{ gameSession.totalGames }}</span>
          <span class="stats-label">Total Games</span>
        </div>
        <div class="stats-card">
          <span class="stats-num">{{ gameSession.averageScore }}</span>
          <span class="stats-label">Avg Score</span>
        </div>
        <div class="stats-card">
          <span class="stats-num">{{ gameSession.bestScoreEver }}</span>
          <span class="stats-label">Best Score</span>
        </div>
        <div class="stats-card highlight">
          <span class="stats-num">{{ gameSession.bestComboEver }}</span>
          <span class="stats-label">Best Combo</span>
        </div>
      </div>

      <div v-if="recentScores.length >= 2" class="trend-section">
        <span class="trend-label">Score Trend — last {{ recentScores.length }} games</span>
        <div class="trend-chart">
          <div
            v-for="(s, i) in recentScores"
            :key="s.id"
            class="trend-bar"
            :style="{
              height: (s.score / maxRecentScore * 100) + '%',
            }"
            :title="`#${i + 1}: ${s.score} pts`"
          >
            <span class="trend-tip">{{ s.score }}</span>
          </div>
        </div>
      </div>
    </section>

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

/* ===== Stats Section ===== */
.stats-section {
  width: 100%;
  max-width: 640px;
  margin-bottom: 32px;
}

.stats-heading {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--text-primary);
  text-align: center;
  letter-spacing: 0.5px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.stats-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px;
  border-radius: 14px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: var(--card-blur, blur(20px));
  box-shadow: var(--card-shadow);
  transition: transform 0.2s;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-card.highlight {
  border-color: var(--accent);
  box-shadow: 0 0 16px rgba(77, 150, 255, 0.15);
}

.stats-num {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.stats-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
}

/* ===== Trend Chart ===== */
.trend-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-radius: 14px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  backdrop-filter: var(--card-blur, blur(20px));
  box-shadow: var(--card-shadow);
}

.trend-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--text-muted);
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  width: 100%;
  height: 80px;
  padding: 0 4px;
}

.trend-bar {
  flex: 1;
  min-width: 4px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(to top, var(--accent), var(--accent-hover, #3a7bd5));
  transition: background 0.3s, opacity 0.2s;
  position: relative;
}

.trend-bar:hover {
  opacity: 0.85;
}

.trend-tip {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
}

.trend-bar:hover .trend-tip {
  opacity: 1;
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

  .stats-section {
    max-width: 420px;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-num {
    font-size: 1.2rem;
  }
}
</style>
