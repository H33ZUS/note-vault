<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <div class="container mt-5">
    <div class="feed-header">
      <div class="header-content">
        <h2 class="feed-title">Notes for: {{ subjectName }}</h2>
        <p class="feed-subtitle">{{ notes.length }} notes shared</p>
      </div>
      <button class="btn-create-note" @click="showEditor = true">
        <span class="plus-icon">+ Create Note</span>
      </button>
    </div>

    <main class="notefile-feed">
      <div v-if="notes.length === 0" class="empty-state">
        <p>No notes yet. Be the first to create one!</p>
      </div>

      <!--NoteCommits-->
      <div v-for="notecommit in notes" :key="notecommit._id">
        <noteCommit
          :topic="notecommit.topic"
          :note="notecommit.note"
          :likes="notecommit.likes"
          :dislikes="notecommit.dislikes"
          :id="notecommit._id"
          :subjectId="this.subjectId"
          :noteFileId="this.noteFileId"
          :user="this.userId"
          :username="notecommit.createdBy"
          @refreshNotes="getNotes()"
        />

        <!--Comments-->
        <div v-for="comment in notecommit.comments" :key="comment._id">
          <comment
            :content="comment.comment"
            :username="comment.createdBy.username"
            :likes="comment.likes"
            :dislikes="comment.dislikes"
            :depth=0
            :comments="comment.comments"
            :id="comment._id"
            :noteCommitId="notecommit._id"
            :subjectId="this.subjectId"
            :noteFileId="this.noteFileId"
            @refreshNotes="getNotes()"
            :user="this.user"
          />
        </div>
      </div>
    </main>

    <Transition name="fade">
      <div v-if="showEditor" class="editor-overlay">
        <div class="editor-modal">
          <div class="modal-header">
            <h3>New Study Note</h3>
          </div>

          <div class="modal-body">
            <input 
              type="text"
              v-model="topic"
              placeholder="Topic title..."
              class="modal-topic-input"
            />

            <QuillEditor
              ref="editor"
              v-model:content="note"
              content-type="html"
              :options="editorOptions"
            />
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="showEditor = false">Discard</button>
            <button class="btn-message" style="margin-top: 0.5rem;" @click="handleUpload ">Post Note</button>
          </div>
        </div>
      </div>
    </Transition>  
  </div>
</template>

<script>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

export default {
  components: { QuillEditor },
  data() {
    return {
      note: '',
      newComment: {},
      topic: '',
      message: '',
      edit: false,
      notes: [],
      subjectId: '',
      noteFileId: '',
      commentedOnId: '',
      commentDepth: 123,
      user: '',
      userId: '',
      subjectName: '',
      showEditor: false,
      editorOptions: {
        theme: 'snow',
        placeholder: 'Start writing your notes here...'
      }
    }
  },
  mounted() {
    this.getNotefile()
    this.getUserData()
    this.getSubject()
  },

  methods: {
    async handleUpload() {
      if (!this.topic || !this.note) {
        alert('Please fill in both the topic and note fields.');
        return;
      }

      await this.uploadNote();

      this.showEditor = false;
      this.topic = '';
      this.note = '';
    },

    async uploadNote() {
      try {
        console.log('Note content:', this.note)
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}/noteFiles/${this.noteFileId}/noteCommits`, {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            note: this.note,
            topic: this.topic
          })
        })

        if (!res.ok) throw new Error('Failed to update')

        this.edit = !this.edit
        this.message = 'Note posted'
        this.note = ''
        this.topic = ''
        this.$refs.editor.setContents([])

        await this.getNotes()
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
          this.$router.replace('/login')
          throw new Error('Failed to get user')
        }

        const data = await res.json()

        this.user = data.username
        this.userId = data._id
      } catch (err) {
        this.message = 'Error: ' + err.message
      }
    },

    async uploadCommentOnComment(id) {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}/noteFiles/${this.noteFileId}/noteCommits/${id}/comments/`, {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            comment: this.comment,
            commentedOnComment: id
          })
        })

        if (!res.ok) throw new Error('Failed to update')

        this.edit = !this.edit
        this.message = 'Comment posted'
        this.comment = ''

        await this.getNotes()
      } catch (err) {
        this.message = 'Error' + err.message
      }
    },
    async getSubject() {
      try {
        this.subjectId = this.$route.params.id
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (!res.ok) {
          this.$router.replace('/login')
        }

        const data = await res.json()
        this.subjectName = data.title
        this.message = this.notes
      } catch (err) {
        this.message = 'Error: ' + err.message
      }
    },

    async getNotefile() {
      try {
        this.subjectId = this.$route.params.id
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}/noteFiles`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (!res.ok) {
          this.$router.replace('/login')
          throw new Error('Failed to get notefile')
        }

        const data = await res.json()
        this.noteFileId = data[0]._id

        this.getNotes()

        this.message = this.notes
      } catch (err) {
        this.message = 'Error: ' + err.message
      }
    },
    async getNotes() {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}/noteFiles/${this.noteFileId}/noteCommits`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (res.status === 404) {
          throw new Error('This note file is empty')
        } else if (res.status === 401) {
          this.$router.replace('/login')
          throw new Error('You must be logged in to access this resource')
        }

        const data = await res.json()

        for (const note of data) {
          const id = note._id
          const comments = await this.getComments(id)
          note.comments = comments
        }

        this.notes = data
      } catch (err) {
        this.notes = []
      }
    },

    async getComments(noteCommitId) {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}/noteFiles/${this.noteFileId}/noteCommits/${noteCommitId}/comments/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        return res.json()
      } catch (err) {
        this.message = err.message
      }
    }
  }
}

</script>
