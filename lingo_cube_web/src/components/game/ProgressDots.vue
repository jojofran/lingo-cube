<script setup lang="ts">
defineProps<{
  currentIndex: number
  totalRounds: number
  isCurrentWrong: boolean
}>()
</script>

<template>
  <div class="dots-scroll">
    <div class="dots-row">
      <span
        v-for="i in totalRounds"
        :key="i"
        class="dot"
        :class="{
          done: i <= currentIndex,
          current: i === currentIndex + 1,
          fail: i <= currentIndex && isCurrentWrong && i === currentIndex,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.dots-row {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-top: 8px;
  padding: 0 8px;
}
.dots-scroll {
  overflow-x: auto;
  width: 100%;
  max-width: 420px;
  display: flex;
  justify-content: center;
}
.dots-scroll::-webkit-scrollbar {
  display: none;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dot-bg);
  transition: background 0.3s;
  flex-shrink: 0;
}
.dot.done {
  background: var(--dot-done-bg);
}
.dot.current {
  background: var(--dot-current-bg);
  box-shadow: var(--dot-current-shadow);
}
.dot.fail {
  background: var(--dot-fail-bg);
}
</style>
