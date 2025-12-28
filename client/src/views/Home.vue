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

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: whitesmoke;
}

.hero {
  text-align: center;
  margin-bottom: 4rem;
  padding: 3rem 1rem;
  background-color: #10063e;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.3);
}

.big-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero-text {
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto 2rem auto;
  color: #ccc !important;
  font-weight: normal;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cta-buttons {
  margin-top: 2rem;
}

.cta-btn {
  min-width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.big-btn {
  padding: 0.8rem 2rem;
  font-size: 1.2rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-secondary {
  background-color: transparent !important;
  border: 2px solid #ef7b45 !important;
  color: #ef7b45 !important;
}

.btn-secondary:hover {
  background-color: #ef7b45 !important;
  color: white !important;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: #1a1240;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s;
  border: 1px solid #2c3e50;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: #ef7b45;
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #ef7b45;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #ccc !important;
  font-weight: normal;
}

@media (max-width: 768px) {
  .big-title {
    font-size: 2rem;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
