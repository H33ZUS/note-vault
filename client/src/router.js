import { createRouter, createWebHistory } from 'vue-router'

// import Home from './views/Home.vue'
import Subjects from './views/Subjects.vue'
import ProfileView from './views/Profile.vue'
import Login from './views/Login.vue'
import Signup from './views/Signup.vue'
import Notefile from './views/Notefile.vue'

const routes = [
  { path: '/', redirect: '/login' },
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
    const res = await fetch(
      'http://localhost:3000/api/v1/users/cookies',
      { credentials: 'include' }
    )
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
