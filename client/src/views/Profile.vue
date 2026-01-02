<template>
  <div class="container mt-5">
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">{{ username.charAt(0).toUpperCase() }}</div>

        <h2 class="feed-title">User Profile</h2>
        <p class="feed-subtitle">Manage your account</p>
      </div>

      <div class="profile-body">
        <div class="profile-field">
          <label class="field-label">Username</label>
          <div v-if="edit" class="field-input-wrapper">
            <input type="text" v-model="username" class="notecommit-input" />
          </div>
          <div v-else class="field-value">
            <span class="username-badge" style="font-size: 1.1rem; padding: 5px 12px;">
              {{ username }}
            </span>
          </div>
        </div>

        <div class="profile-field">
          <label class="field-label">Email</label>
          <div v-if="edit" class="field-input-wrapper">
            <input type="text" v-model="email" class="notecommit-input" />
          </div>
          <div v-else class="field-value text-white">
            {{ email }}
          </div>
        </div>
      </div>

      <div class="profile-footer">
        <button class="btn-message" @click="toggleEdit">
          {{ edit ? 'Save Changes' : 'Update Profile' }}
        </button>
        <p v-if="message" class="status-message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      email: '',
      message: '',
      edit: false
    }
  },
  mounted() {
    this.getUserData()
  },

  methods: {
    async toggleEdit() {
      try {
        if (this.edit) {
          const res = await fetch('http://localhost:3000/api/v1/users/', {
            method: 'PATCH',
            headers: { 'Content-type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              username: this.username,
              email: this.email
            })
          })

          if (!res.ok) throw new Error('Failed to update')
        }
        this.edit = !this.edit
        this.message = 'Profile updated'
      } catch (err) {
        this.message = 'Error' + err.message
      }
    },
    async getUserData() {
      try {
        const res = await fetch('http://localhost:3000/api/v1/users/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (!res.ok) {
          this.$router.replace('login')
          throw new Error('Failed to get user')
        }

        const data = await res.json()

        this.username = data.username
        this.email = data.email
      } catch (err) {
        this.message = 'Error: ' + err.message
      }
    }
  }
}
</script>
