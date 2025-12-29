<template>
  <div id="layout-wrapper"> <header class="main-header">
    <h1 class="page-title">NoteVault</h1>
    <nav id="nav" v-if="loginChecked">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/about" class="nav-link">About</router-link>
      <router-link v-if="isLoggedIn" to="/subjects" class="nav-link">Subjects</router-link>
      <router-link v-if="isLoggedIn" to="/profile/view" class="nav-link">Profile</router-link>
      <a v-if="isLoggedIn" href="#" @click.prevent="logout" class="nav-link">Logout</a>
    </nav>
  </header>

  <main id="app">
    <router-view v-if="loginChecked"/>
  </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const isLoggedIn = ref(false)
const loginChecked = ref(false)
const route = useRoute()
const router = useRouter()

const checkLogin = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/users/cookies',
      {
        method: 'GET',
        credentials: 'include'
      }
    )
    if (res.status === 204) {
      isLoggedIn.value = false
      return
    }
    const data = await res.json()
    isLoggedIn.value = !!data.status
  } catch {
    isLoggedIn.value = false
    return false
  } finally {
    loginChecked.value = true
  }
}

const logout = async () => {
  try {
    await fetch('http://localhost:3000/api/v1/users/logout',
      {
        method: 'POST',
        credentials: 'include'
      }
    )
  } catch (err) {
    console.error('Logout Error:', err)
  } finally {
    isLoggedIn.value = false
    router.push('/')
  }
}

onMounted(checkLogin)

// re-check login when route changes
watch(
  () => route.path, async () => { await checkLogin() }, { immediate: true })

</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  display: flex;
  justify-content: center;
  gap: 0.5rem; /* spacing between links */
}

</style>