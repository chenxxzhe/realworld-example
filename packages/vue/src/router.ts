import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { name: 'home', path: '', component },
  { name: 'login', path: '', component },
  { name: 'article', path: '', component },
  { name: 'editor', path: '', component },
  { name: 'profile', path: '', component },
  { name: 'setting', path: '', component },
  { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
