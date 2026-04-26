<script setup lang="ts">
</script>

<template>
  <div class="home">
    <h1>Lingo Cube</h1>
    <p class="subtitle">Welcome to Lingo Cube</p>
    <router-link to="/typing" class="game-link">
      <span class="game-icon">⌨️</span>
      <span class="game-label">Typing Challenge</span>
      <span class="game-desc">IELTS Vocabulary Practice</span>
    </router-link>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.subtitle {
  margin-bottom: 32px;
  color: #666;
}

.game-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 24px 36px;
  border-radius: 16px;
  border: 2px solid #e0e0e0;
  text-decoration: none;
  color: #333;
  transition: all 0.25s;
  background: #fff;
}

.game-link:hover {
  border-color: #4d96ff;
  box-shadow: 0 8px 30px rgba(77, 150, 255, 0.15);
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
  color: #999;
}
</style>
