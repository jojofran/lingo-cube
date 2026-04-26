import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/typing',
      name: 'typing',
      component: () => import('@/views/TypingGame.vue'),
    },
  ],
})

export default router
