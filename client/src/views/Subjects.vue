<template>
    <div class="container mt-4">
        <h2>Subject Management</h2>

        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: currentTab === 'create' }"
              @click="currentTab = 'create'"
              >Create Subject</a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: currentTab === 'join' }"
              @click="currentTab = 'join'; fetchAvailableSubjects()"
              >Join Subject</a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: currentTab === 'my' }"
              @click="currentTab = 'my'; fetchMySubjects()"
              >My Subjects</a>
          </li>
        </ul>

        <!-- Create subject -->
        <div v-if="currentTab === 'create'">
          <h2>Create Subject</h2>
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

        <div v-if="createMessage" class="alert alert-info mt-3">
            {{ createMessage }}
        </div>
    </div>

    <div v-else-if="currentTab === 'join'">
      <h2>Join Subject</h2>
      <div v-if="loadingJoin">Loading...</div>

      <div v-else-if="availableSubjects.length === 0" class="alert alert-warning">
        No subjects available to join.
      </div>

      <div v-for="subject in availableSubjects" :key="subject._id" class="card p-3 mb-3">
        <h4>{{ subject.title }}</h4>
        <button class="btn btn-primary" @click="joinSubject(subject._id)">
          Join
        </button>
      </div>

      <div v-if="joinMessage" class="alert alert-info mt-3">
        {{ joinMessage }}
      </div>
    </div>

    <div v-else-if="currentTab === 'my'">
      <h2>My Subjects</h2>

      <div v-if="loadingMy">Loading...</div>

      <div v-else-if="mySubjects.length === 0" class="alert alert-warning">
        You are not enrolled in any subjects.
      </div>

      <div v-for="subject in mySubjects" :key="subject._id" class="card p3 mb-3">
        <h4>{{ subject.title }}</h4>
        <button class="btn btn-prmary" @click="leaveSubject(subject._id)">
          Leave
        </button>
      </div>

      <div v-if="myMessage" class="alert alert-info mt-3">{{ myMessage }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'create',
      subjectTitle: '',
      createMessage: '',

      availableSubjects: [],
      loadingJoin: false,
      joinMessage: '',

      mySubjects: [],
      loadingMy: false,
      myMessage: ''
    }
  },

  methods: {
    async createSubject() {
      if (!this.subjectTitle.trim()) {
        this.createMessage = 'Please enter a title'
        return
      }

      try {
        const res = await fetch('http://localhost:3000/api/v1/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title: this.subjectTitle })
        })

        if (!res.ok) throw new Error('Failed to create subject')

        this.createMessage = 'Subject created successfully'
        this.subjectTitle = ''
      } catch (err) {
        this.createMessage = 'Error: ' + err.message
      }
    },

    async fetchAvailableSubjects() {
      this.loadingJoin = true
      this.joinMessage = ''

      try {
        const res = await fetch('http://localhost:3000/api/v1/subjects/available', {
          credentials: 'include'
        })
        if (!res.ok) throw new Error('Failed to load subjects')
        this.availableSubjects = await res.json()
      } catch (err) {
        this.joinMessage = 'Failed to load subjects: ' + err.message 
      }
      this.loadingJoin = false
    },
    
    async joinSubject(subjectId) {
      
      try {
        const res = await fetch(`http://localhost:3000/api/v1/enrollments/${subjectId}/enroll`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ subjectId }),
        })
        if (!res.ok) throw new Error('Failed to join')
        this.joinMessage = 'Successfully joined'
        this.availableSubjects = this.availableSubjects.filter(s => s._id !== subjectId) // remove subject from available
      } catch (err) {
        this.joinMessage = 'Error: ' + err.message
      }
    },

    async fetchMySubjects() {

      this.loadingMy = true
      this.myMessage = ''

      try {
        const res = await fetch('http://localhost:3000/api/v1/subjects/enrolled', {
          credentials: 'include'
        })
        if (!res.ok) throw new Error('Failed to load enrolled subjects')
        this.mySubjects = await res.json()
      } catch (err) {
        this.myMessage = 'Failed to load: ' + err.message
      }
      this.loadingMy = false
    },

    async leaveSubject(subjectId) {

      try {
        const res = await fetch(`http://localhost:3000/api/v1/enrollments/${subjectId}/enroll`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (!res.ok) throw new Error('Failed to leave')
        this.myMessage = 'Left subject successfully'
        this.mySubjects = this.mySubjects.filter(s => s._id !== subjectId);
      } catch (err) {
        this.myMessage = 'Error: ' + err.message
      }
    }
  }
}
</script>
