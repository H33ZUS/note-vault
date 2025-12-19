<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <div class="">
    <br>
    <h2>Notes for: {{subjectName}}</h2>
    <div class="noteCommitCreate">
    <!-- Create Note -->
    <h2>Create note</h2>
    <div >
        <label>Topic</label>
        <input type="text" v-model="topic" class="inputNoteCommit"/>
    </div>
    <div>
  <label>Note</label>
  <quill-editor
  ref="editor"
  v-model:content="note"
  content-type="html"
  :options="{ theme: 'snow' }"
/>
<br>

</div>

    <!-- upload note -->
    <button class="btn-message" @click="uploadNote">
        Post note
    </button>
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
        <div class="commentEnd">
          <br>
        </div>
      </div>
    </div>
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
      subjectName: ''
    }
  },
  mounted() {
    this.getNotefile()
    this.getUserData()
    this.getSubject()
  },

  methods: {
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

        if (!res.ok) {
          this.$router.replace('/login')
          throw new Error('Failed to get notes')
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
