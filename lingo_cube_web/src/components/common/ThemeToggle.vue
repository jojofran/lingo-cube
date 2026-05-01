<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { themeLabel, themeShort, cycleTheme } = useTheme()
</script>

<template>
  <button class="theme-toggle-global" @click="cycleTheme" :title="themeLabel">
    {{ themeShort }}
  </button>
</template>
