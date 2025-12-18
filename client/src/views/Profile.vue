<template>
    <div class="container mt-4">
        <h2>Profile overview</h2>

        <!-- Username -->
        <div v-if="edit" class="mb-3">
            <label>Username</label>
            <input type="text" v-model="username" class="form-control"/>
        </div>
        <div v-else>
          <div class="profile-row">
            <span class="label">Username:</span>
            <span class="value">{{ username }}</span>
          </div>
        </div>

        <div v-if="edit" class="mb-3">
            <label>Email</label>
            <input type="text" v-model="email" class="form-control"/>
        </div>
        <div v-else>
          <div class="profile-row">
            <span class="label">Email:</span>
            <span class="value">{{ email }}</span>
          </div>
        </div>

        <!-- EditButton -->
        <div class="flex-center">
          <button class="btn-message mt-3" @click="toggleEdit">
            {{ edit ? 'Save update' : 'Update info' }}
          </button>
        </div>
        <div v-if="edit">
          <h3></h3>
        </div>
        <div v-else>
          <div class="mt-2">
            <p>{{message}}</p>
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
