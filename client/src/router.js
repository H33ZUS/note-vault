import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'
import CreateSubjects from './views/Subjects.vue'
import ProfileView from './views/Profile.vue'
import Login from './views/Login.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/subjects/create', name: 'create-subjects', component: CreateSubjects },
  { path: '/profile/view', name: 'profile-view', component: ProfileView },
  { path: '/login', name: 'login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
