<template>
    <div class="container mt-4">
        <h2>Login</h2>

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
                type="text"
                v-model="password"
                class="form-control"
                placeholder="Enter password"
                />
        </div>

        <button class="btn btn-primary" @click="login">
            Login
        </button>

        <div v-if="message" class="alert alert-info mt-3">
            {{message}}
        </div>
    </div>
    </template>

<script>

import router from '../router'

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

        this.message = 'Logged in successfully'
        this.username = ''
        this.password = ''

        router.push('/').then(() => {
          window.location.reload()
        })
      } catch (err) {
        this.message = err.message
      }
    }
  }
}
</script>
