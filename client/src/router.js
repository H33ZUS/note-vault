import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/Home.vue'
import About from './views/About.vue'
import Subjects from './views/Subjects.vue'
import ProfileView from './views/Profile.vue'
import Login from './views/Login.vue'
import Signup from './views/Signup.vue'
import Notefile from './views/Notefile.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/about', name: 'about', component: About },
  { path: '/subjects', name: 'subjects', component: Subjects, meta: { requiresAuth: true } },
  { path: '/profile/view', name: 'profile-view', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/signup', name: 'signup', component: Signup, meta: { guestOnly: true } },
  { path: '/notefile/:id', name: 'notefile', component: Notefile, meta: { requiresAuth: true } }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  try {
    if (!to.meta.requiresAuth && !to.meta.guestOnly) {
      return next()
    }

    const res = await fetch(
      'http://localhost:3000/api/v1/users/cookies',
      { credentials: 'include' }
    )

    if (!res.ok) {
      if (to.meta.requiresAuth) return next('/login')
      return next()
    }

    const data = await res.json()
    const isLoggedIn = data.status

    // not logged in, needs auth
    if (to.meta.requiresAuth && !isLoggedIn) {
      return next('/login')
    }

    // logged in
    if (to.meta.guestOnly && isLoggedIn) {
      return next('/subjects')
    }

    next()
  } catch (err) {
    if (to.meta.requiresAuth) next('/login')
    else next()
  }
})

export default router
