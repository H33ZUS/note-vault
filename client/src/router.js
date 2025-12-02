import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'
import Subjects from './views/Subjects.vue'
import Login from './views/Login.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
   { path: '/subjects', name: 'subjects', component: Subjects },
  { path: '/login', name: 'login', component: Login }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
