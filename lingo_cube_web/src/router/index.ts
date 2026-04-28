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
  ],
})

export default router
