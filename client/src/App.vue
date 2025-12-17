<template>
  <div id="app">
    <div id="nav" v-if="loginChecked">
      <router-link v-if="isLoggedIn" to="/subjects">Subjects</router-link>
      <router-link v-if="isLoggedIn" to="/profile/view">Profile</router-link>
    </div>
    <!-- Render the content of the current page view -->
    <router-view v-if="loginChecked"/>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const isLoggedIn = ref(false)
const loginChecked = ref(false)
const route = useRoute()

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
