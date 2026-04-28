<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { watchEffect } from 'vue'

const { theme } = useTheme()

watchEffect(() => {
  document.body.className = `theme-${theme.value}`
})
</script>

<template>
  <RouterView />
</template>
