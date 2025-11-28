<template>
    <div class="container mt-4">
        <h2>Profile overview</h2>

        <!-- Username -->
        <div v-if="edit">
            <label>Username</label>
            <input type="text" v-model="username" class="form-control"/>
        </div>
        <div v-else>
            <h3>Username: {{username}}</h3>
        </div>

        <h3>Email: {{email}}</h3>
        <h3>Password: {{passwordHidden}}</h3>

        <!-- EditButton -->
        <button class="btn btn-primary mt-3" @click="toggleEdit">
            {{ edit ? 'Save update' : 'update info' }}
        </button>

        <div v-if="edit">
            <h3></h3>
        </div>
        <div v-else>
            <h3>{{message}}</h3>
        </div>

    </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      passwordHidden: '',
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
          const res = await fetch('http://localhost:3000/api/v1/users/6924d1a33ca69fb646002ab6', {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({
              username: this.username,
              password: this.password,
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
        const res = await fetch('http://localhost:3000/api/v1/users/6924d1a33ca69fb646002ab6', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }) // temp user

        if (!res.ok) throw new Error('Failed to get user')

        const data = await res.json()

        this.username = data.username
        this.email = data.email
        this.password = data.password

        for (let i = 0; i < this.password.length; i++) {
          this.passwordHidden += '*'
        }
      } catch (err) {
        this.message = 'Error: ' + err.message
      }
    }
  }
}
</script>
