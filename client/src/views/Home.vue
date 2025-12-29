<template>
  <div class="home-container">

    <section class="hero">
      <h1 class="page-title big-title">Master Your Subjects with NoteVault</h1>
      <p class="hero-text">
        The collaborative platform for students and teachers.
        Create subjects, share rich-text notes and get feedback from your peers.
      </p>
      <div class="cta-buttons">
        <div v-if="isLoggedIn">
          <p>Welcome back, {{ username }}!</p>
          <router-link to="/subjects" class="btn-message big-btn">
            Go to My Subjects
          </router-link>
        </div>
        <div v-else class="flex-center button-group" style="gap: 1rem;">
          <router-link to="/signup" class="btn-message big-btn cta-btn">
            Get Started
          </router-link>
          <router-link to="/login" class="btn-message btn-secondary big-btn cta-btn">
            Login
          </router-link>
        </div>
      </div>
    </section>

    <section class="features-grid">
      <div class="feature-card">
        <div class="icon">📚</div>
        <h3>Organized Subjects</h3>
        <p>Join classes or create your own. Keep all your study material sorted by subjects and topics.</p>
      </div>

      <div class="feature-card">
        <div class="icon">✍️</div>
        <h3>Rich Notes</h3>
        <p>Write beautiful notes with our rich text editor. Format code, highlight key points and keep it clean.</p>
      </div>

      <div class="feature-card">
        <div class="icon">💬</div>
        <h3>Community Feedback</h3>
        <p>Vote on the best notes and discuss topics in threaded comments. Help your peers study better.</p>
      </div>
    </section>

  </div>
</template>

<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'home',
  data() {
    return {
      isLoggedIn: false,
      username: ''
    }
  },
  mounted() {
    this.checkLoginStatus()
  },
  methods: {
    async checkLoginStatus() {
      try {
        const res = await fetch('http://localhost:3000/api/v1/users/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (res.ok) {
          const data = await res.json()
          this.isLoggedIn = true
          this.username = data.username
        } else {
          this.isLoggedIn = false
        }
      } catch (err) {
        this.isLoggedIn = false
      }
    }
  }
}
</script>