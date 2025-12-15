<template>
    <div class="container mt-4">
        <h1 class="page-title">NoteVault</h1>
        <h2>Sign up</h2>

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

        <!-- Email -->
        <div class="mb-3">
            <input
                type="text"
                v-model="email"
                class="form-control"
                placeholder="Enter email"
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

        <div class="flex-center login-actions">
          <button class="btn-message" @click="login">
            Register
          </button>
          <p class="login-or">Already have an account?</p>
          <router-link to="/login" class="btn-message btn-secondary">
            Login
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
      email: '',
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
      if (!this.email.trim()) {
        this.message = 'Please enter email'
        return
      }

      try {
        const res = await fetch('http://localhost:3000/api/v1/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: this.password, email: this.email })
        })

        if (!res.ok) throw new Error('Failed to register')

        this.message = 'Registered successfully'
        this.username = ''
        this.password = ''
        this.email = ''
      } catch (err) {
        this.message = err.message
      }
    }
  }
}
</script>
