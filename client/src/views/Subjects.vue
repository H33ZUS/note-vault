<template>
    <div class="container mt-4">
        <h2>Subject Management</h2>

        <ul class="nav nav-tabs mb-4">
          <li class="nav-item" v-if="isAdminOrTeacher">
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
        <div v-if="currentTab === 'create' && isAdminOrTeacher">
          <h2>Create Subject</h2>
          <div class="mb-3">
            <input
                type="text"
                v-model="subjectTitle"
                class="form-control"
                placeholder="Enter subject title"
              />
        </div>
        <div class="flex-center mt-2" style="flex-direction: column">
        <button class="btn-message" @click="createSubject">
            Create subject
        </button>

          <button
            v-if="isAdminOrTeacher"
            class="btn-danger-message mt-3"
            @click="deleteAllSubjects"
          >
          Delete subjects
        </button>
        </div>

        <div v-if="createMessage" class="alert alert-info mt-3">
            {{ createMessage }}
        </div>
    </div>

    <!--Join subject-->
    <div v-else-if="currentTab === 'join'">
      <h2>Join Subject</h2>
      <div v-if="loadingJoin">Loading...</div>

      <div v-else-if="availableSubjects.length === 0" class="alert alert-warning">
        No subjects available to join.
      </div>

      <div v-for="subject in availableSubjects" :key="subject._id" class="subject-card">
        <div v-if="editingSubjectId === subject._id">
          <input
            type="text"
            v-model="editedTitle"
            class="form-control me-2"
            @keyup.enter="saveSubjectName(subject._id)"
          />
        </div>
        <h4 class="mb-0" v-else>{{ subject.title }}</h4>
        <div class="subject-actions">
          <button class="btn-message" @click="joinSubject(subject._id)">
            Join
        </button>

        <div v-if="isAdminOrTeacher" class="menu-wrapper" @click.stop>
          <button class="menu-btn" @click="toggleMenu(subject._id)">
            ⋮
          </button>

          <div v-if="openMenuId === subject._id" class="menu-dropdown">
            <button @click="startEditing(subject)">Edit</button>
            <button @click="deleteSubject(subject._id)">Delete</button>
          </div>
        </div>
      </div>
     </div>

      <div v-if="joinMessage" class="alert alert-info mt-3">
        {{ joinMessage }}
      </div>
    </div>

    <!--Enrolled subjects-->
    <div v-else-if="currentTab === 'my'">
      <h2>My Subjects</h2>

      <div v-if="loadingMy">Loading...</div>

      <div v-else-if="mySubjects.length === 0" class="alert alert-warning">
        You are not enrolled in any subjects.
      </div>

      <div v-for="subject in mySubjects" :key="subject._id" class="subject-card">
        <h4><router-link :to="`/notefile/${subject._id}`">{{subject.title}}</router-link></h4>
        <button class="btn-message" @click="leaveSubject(subject._id)">
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
      myMessage: '',
      isAdminOrTeacher: false,

      editingSubjectId: null,
      editedTitle: '',

      openMenuId: null
    }
  },
  mounted() {
    this.checkUserRoles()
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
        const res = await fetch('http://localhost:3000/api/v1/subjects?filter=available', {
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
        const res = await fetch(`http://localhost:3000/api/v1/enrollments/${subjectId}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ subjectId })
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
        const res = await fetch('http://localhost:3000/api/v1/subjects?filter=enrolled', {
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
        const res = await fetch(`http://localhost:3000/api/v1/enrollments/${subjectId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (!res.ok) throw new Error('Failed to leave')
        this.myMessage = 'Left subject successfully'
        this.mySubjects = this.mySubjects.filter(s => s._id !== subjectId)
      } catch (err) {
        this.myMessage = 'Error: ' + err.message
      }
    },

    async deleteAllSubjects() {
      const confirmed = confirm('Are you sure you want to delete all subjects?')

      if (!confirmed) return

      try {
        const res = await fetch('http://localhost:3000/api/v1/subjects', {
          method: 'DELETE',
          credentials: 'include'
        })
        if (!res.ok) throw new Error('Failed to delete all subjects')
        this.availableSubjects = []
        this.mySubjects = []
        this.joinMessage = ''
        this.myMessage = 'Deleted all subjects successfully'
      } catch (err) {
        console.error(err)
        this.myMessage('Error deleting subjects')
      }
    },

    async checkUserRoles() {
      try {
        const res = await fetch('http://localhost:3000/api/v1/users/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-type': 'applications/json' }
        })

        if (res.ok) {
          const data = await res.json()

          const roles = data.roles || []

          this.isAdminOrTeacher = roles.includes('admin') || roles.includes('teacher')

          if (!this.isAdminOrTeacher && this.currentTab === 'create') {
            this.currentTab = 'join'
            this.fetchAvailableSubjects()
          }
        } else {
          this.$router.replace('/login')
          this.isAdminOrTeacher = false
        }
      } catch (err) {
        console.error('Failed to fetch user role', err)
        this.$router.replace('/login')
        this.isAdminOrTeacher = false
      }
    },

    async deleteSubject(subjectId) {
      if (!confirm('Are you sure you want to delete this subject?')) {
        return
      }

      try {
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${subjectId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (!res.ok) {
          throw new Error('Failed to delete subject')
        }
        this.joinMessage = 'Subject deleted successfully'
        this.availableSubjects = this.availableSubjects.filter(s => s._id !== subjectId)
      } catch (err) {
        this.joinMessage = 'Error deleting subject: ' + err.message
      }
    },

    toggleMenu(subjectId) {
      this.openMenuId = this.openMenuId === subjectId ? null : subjectId
    },

    // iniates editing mode
    startEditing(subject) {
      this.openMenuId = null
      this.editingSubjectId = subject._id
      this.editedTitle = subject.title
      this.joinMessage = ''
    },

    async saveSubjectName(subjectId) {
      if (!this.editedTitle.trim()) {
        this.joinMessage = 'Subject title cannot be empty'
      }

      try {
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${subjectId}`, {
          method: 'PATCH',
          headers: { 'Content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title: this.editedTitle })
        })
        if (!res.ok) throw new Error('Failed to update subject title')

        const updatedSubject = await res.json()
        const index = this.availableSubjects.findIndex(s => s._id === subjectId)
        if (index !== -1) {
          this.availableSubjects[index].title = updatedSubject.title
        }
        this.joinMessage = `Subject "${updatedSubject.title}" updated successfully`
        this.editingSubjectId = null
      } catch (err) {
        this.joinMessage = 'Error updating subject: ' + err.message
      }
    }
  }
}
</script>
