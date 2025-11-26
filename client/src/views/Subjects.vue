<template>
    <div class="container mt-4">
        <h2>Create subject</h2>

        <!-- Create subject -->
        <div class="mb-3">
            <label class="form-label">Subject Title</label>
            <input
                type="text"
                v-model="subjectTitle"
                class="form-control"
                placeholder="Enter subject title"
                />
        </div>

        <button class="btn btn-primary" @click="createSubject">
            Create subject
        </button>

        <div v-if="message" class="alert alert-info mt-3">
            {{message}}
        </div>
    </div>
    </template>

<script>
export default {
  data() {
    return {
      subjectTitle: '',
      message: ''
    }
  },

  methods: {
    async createSubject() {
      if (!this.subjectTitle.trim()) {
        this.message = 'Please enter a title'
        return
      }

      try {
        const res = await fetch('http://localhost:3000/api/v1/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: this.subjectTitle, createdBy: '65abcdef1234567890abcdef' }) // temp user
        })

        if (!res.ok) throw new Error('Failed to create subject')

        this.message = 'Subject created successfully'
        this.subjectTitle = ''
      } catch (err) {
        this.message = 'Error: ' + err.message
      }
    }
  }
}
</script>
