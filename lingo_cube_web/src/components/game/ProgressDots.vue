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
  background: #6bcb77;
}
.dot.current {
  background: #4d96ff;
  box-shadow: 0 0 8px rgba(77, 150, 255, 0.5);
}
.dot.fail {
  background: #ff6b6b;
}
</style>
