import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'
import Subjects from './views/Subjects.vue'
import ProfileView from './views/Profile.vue'
import Login from './views/Login.vue'
import Signup from './views/Signup.vue'
import Notefile from './views/Notefile.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/subjects', name: 'subjects', component: Subjects },
  { path: '/profile/view', name: 'profile-view', component: ProfileView },
  { path: '/login', name: 'login', component: Login },
  { path: '/signup', name: 'signup', component: Signup },
  { path: '/notefile/:id', name: 'notefile', component: Notefile }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
