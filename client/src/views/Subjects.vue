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

      <button class="btn-message" @click="createSubject">
        Create subject
      </button>

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

      <div class="subjects-grid">
        <TransitionGroup name="list">
          <div v-for="subject in availableSubjects" :key="subject._id" class="subject-card">
            <div class="card-content">
              <div v-if="editingSubjectId === subject._id">
                <input
                  type="text"
                  v-model="editedTitle"
                  class="form-control"
                  @keyup.enter="saveSubjectName(subject._id)"
                />
              </div>
              <h4 class="subject-title" v-else>{{ subject.title }}</h4>
            </div>

            <div class="card-actions">
              <button class="btn-action join" @click="joinSubject(subject._id)">
                Join
              </button>

              <div v-if="isAdminOrTeacher" class="menu-wrapper" @click.stop>
                <button class="icon-menu-btn" @click="toggleMenu(subject._id)">
                  <span class="dots">⋮</span>
                </button>

                <div v-if="openMenuId === subject._id" class="menu-dropdown">
                  <button @click="startEditing(subject)">Edit</button>
                  <button class="delete-opt" @click="deleteSubject(subject._id)">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
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

      <div class="subjects-grid">
        <TransitionGroup name="list">
          <router-link v-for="subject in mySubjects" :key="subject._id" :to="`/notefile/${subject._id}`" class="subject-card clickable-card">
            <div class="card-content">
              <h4 class="subject-title">{{ subject.title }}</h4>
            </div>

            <div class="card-actions">
              <button class="btn-action leave" @click.stop.prevent="prepareToLeave(subject)">
                Leave
              </button>
            </div>
          </router-link>
        </TransitionGroup>
      </div>
      <div v-if="myMessage" class="alert alert-info mt-3">{{ myMessage }}</div>
    </div>

    <div v-if="subjectToLeave" class="modal-overlay" @click="subjectToLeave = null">
      <div class="modal-content" @click.stop>
        <h3>Leave Subject?</h3>
        <p>Are you sure you want to leave <strong>{{ subjectToLeave.title }}</strong>? You will lose access to all notes in this subject.</p>

        <div class="modal-actions">
          <button class="btn-modal-secondary" @click="subjectToLeave = null">Cancel</button>
          <button class="btn-danger" @click="confirmLeave">Yes, Leave Subject</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { TransitionGroup } from 'vue';

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

      openMenuId: null,
      subjectToLeave: null
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

    closeMenuOnOutsideClick(event) {
      if (!event.target.closest('.menu-wrapper')) {
        this.openMenuId = null;
        document.removeEventListener('click', this.closeMenuOnOutsideClick)
      }
    },

    toggleMenu(subjectId) {
      if (this.openMenuId === subjectId) {
        this.openMenuId = null;
      } else {
        this.openMenuId = subjectId;
        setTimeout(() => {
          document.addEventListener('click', this.closeMenuOnOutsideClick)
        }, 0)
      }
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
    },

    prepareToLeave(subject) {
      this.subjectToLeave = subject;
    },

    async confirmLeave() {
      const subjectId = this.subjectToLeave._id;
      try {
        const res = await fetch(`http://localhost:3000/api/v1/enrollments/${subjectId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to leave subject');

        this.mySubjects = this.mySubjects.filter(s => s._id !== subjectId);
        this.subjectToLeave = null;
        this.myMessage = 'Left subject successfully';
      } catch (err) {
        this.myMessage = 'Error: ' + err.message;
      }
    }
  }
}
</script>
