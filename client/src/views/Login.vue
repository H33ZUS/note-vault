<template>
    <div class="container mt-4">
        <h1 class="page-title">NoteVault</h1>
        <h2>Login</h2>

        <div class="login-register-card">
        <!-- Username -->
        <div class="mb-3">
            <input
                type="text"
                v-model="username"
                class="form-control"
                placeholder="Enter username"
                />
        </div>

        <!-- Password -->
        <div class="mb-3">
            <input
                type="password"
                v-model="password"
                class="form-control"
                placeholder="Enter password"
                />
        </div>
        <div class="flex-center login-actions">
          <button class="btn-message" @click="login">
            Login
          </button>
          <p class="login-or">Or</p>
          <router-link to="/signup" class="btn-message btn-secondary">
            Register
          </router-link>
        </div>
        </div>

        <div v-if="message" class="alert alert-info mt-3">
            {{message}}
        </div>
    </div>
    </template>

<script>

export default {
  data() {
    return {
      username: '',
      password: '',
      message: ''
    }
  },

  methods: {
    async login() {
      if (!this.username.trim()) {
        this.message = 'Please enter username'
        return
      }
      if (!this.password.trim()) {
        this.message = 'Please enter password'
        return
      }

      try {
        const res = await fetch('http://localhost:3000/api/v1/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: this.password }),
          credentials: 'include'
        })

        if (!res.ok) throw new Error('Failed to login')

        if (res.status !== 204) {
          await res.json()
        }

        this.message = 'Logged in successfully'
        this.username = ''
        this.password = ''

        this.$router.replace('/subjects')
      } catch (err) {
        this.message = err.message
      }
    }
  }
}
</script>
