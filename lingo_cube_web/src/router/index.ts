import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
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
    {
      path: '/review',
      name: 'review',
      component: () => import('@/views/ReviewPage.vue'),
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('@/views/AchievementsPage.vue'),
    },
    {
      path: '/word-demo',
      name: 'WordCardDemo',
      component: () => import('@/views/WordCardDemo.vue'),
    },
    {
      path: '/word-bank',
      name: 'wordBank',
      component: () => import('@/views/WordBankManager.vue'),
    },
  ],
})

export default router
