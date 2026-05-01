<script setup lang="ts">
defineProps<{
  timeLeft: number
  speedTime: number
  timerColor: string
}>()
</script>

<template>
  <div class="timer-ring-wrap">
    <svg class="timer-ring" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" class="timer-bg" />
      <circle
        cx="50"
        cy="50"
        r="45"
        class="timer-fg"
        :style="{
          strokeDashoffset: 283 * (1 - timeLeft / speedTime),
          stroke: timerColor,
        }"
      />
    </svg>
    <span class="timer-text" :style="{ color: timerColor }">{{ timeLeft }}</span>
  </div>
</template>

<style scoped>
.timer-ring-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto 28px;
}
.timer-ring {
  width: 88px;
  height: 88px;
  transform: rotate(-90deg);
}
.timer-bg {
  fill: none;
  stroke: var(--timer-ring-bg);
  stroke-width: 4;
}
.timer-fg {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s linear, stroke 0.3s;
}
.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.6rem;
  font-weight: 700;
  transition: color 0.3s;
}
</style>
