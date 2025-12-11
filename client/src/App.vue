<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link v-if="isLoggedIn" to="/subjects">Subjects</router-link>
      <router-link v-if="isLoggedIn" to="/profile/view">Profile</router-link>
      <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
      <router-link v-if="!isLoggedIn" to="/signup">Register</router-link>
    </div>
    <!-- Render the content of the current page view -->
    <router-view/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isLoggedIn = ref(false)

onMounted(async () => {
  const res = await fetch('http://localhost:3000/api/v1/users/cookies', {
    method: 'GET',
    credentials: 'include'
  })
  const data = await res.json()
  isLoggedIn.value = data.status
})

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

#nav > *:not(:last-child)::after {
  content: "|";
  margin-left: 0.5rem;
}
</style>
-->
