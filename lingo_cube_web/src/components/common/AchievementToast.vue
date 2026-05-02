<script setup lang="ts">
import { watch } from 'vue'
import { useAchievements } from '@/composables/useAchievements'

const { toasts } = useAchievements()

const DISMISS_DELAY = 4000

watch(
  () => toasts.value.length,
  (len) => {
    if (len > 0) {
      setTimeout(() => {
        toasts.value.shift()
      }, DISMISS_DELAY)
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="achievement-toast" tag="div" class="toast-container">
      <div
        v-for="item in toasts"
        :key="item.id"
        class="toast-item"
      >
        <span class="toast-icon">{{ item.icon }}</span>
        <div class="toast-body">
          <div class="toast-title">Achievement Unlocked!</div>
          <div class="toast-label">{{ item.label }}</div>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  border-radius: var(--card-radius, 16px);
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  backdrop-filter: var(--card-blur, blur(20px));
  box-shadow: var(--card-shadow), 0 8px 32px rgba(0, 0, 0, 0.25);
  color: var(--text-primary);
  pointer-events: auto;
  min-width: 260px;
}

.toast-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.toast-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toast-title {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--accent);
}

.toast-label {
  font-size: 1rem;
  font-weight: 700;
}

/* TransitionGroup animations */
.achievement-toast-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.achievement-toast-leave-active {
  transition: all 0.3s ease;
}
.achievement-toast-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.85);
}
.achievement-toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.achievement-toast-move {
  transition: transform 0.3s ease;
}
</style>
