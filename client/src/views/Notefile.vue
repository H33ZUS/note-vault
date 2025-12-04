<template>
    <div class="container mt-4">
        <h2>Profile overview</h2>

        <!-- Username -->
         <div>
            <label>Topic</label>
            <input type="text" v-model="topic" class="form-control"/>
        </div>
        <div>
            <label>Note</label>
            <input type="text" v-model="note" class="form-control"/>
        </div>

        <!-- EditButton -->
        <button class="btn btn-primary mt-3" @click="uploadNote">
            Post note
        </button>

        <div v-for="notecommit in notes" :key="notecommit._id" class="card p3 mb-3">
          <h1>{{notecommit.topic}}</h1>
          <h3>{{notecommit.note}}</h3>

          <h2>Comments</h2>
          <div>
            <label>Comment</label>
            <input type="text" v-model="newComment[notecommit._id]" class="form-control"/>
          </div>
          <button class="btn btn-primary mt-3" @click="uploadComment(notecommit._id)">
            Post comment
          </button>

          <!--Comments-->
          <div v-for="comment in notecommit.comments" :key="comment._id" class="card p3 mb-3">
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
    </div>
</template>

<script>
export default {
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
      user: ''
    }
  },
  mounted() {
    this.getNotefile()
    this.getUserData()
  },

  methods: {
    async uploadNote() {
      try {
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

        if (!res.ok) throw new Error('Failed to get user')

        const data = await res.json()

        this.user = data.username
      } catch (err) {
        this.message = 'Error: ' + err.message
      }
    },

    async uploadComment(id) {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}/noteFiles/${this.noteFileId}/${id}/comments/`, {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            comment: this.newComment[id],
            commentedOnNote: id
          })
        })

        if (!res.ok) throw new Error('Failed to update')

        this.edit = !this.edit
        this.message = 'Comment posted'
        this.newComment[id] = ''

        await this.getNotes()
      } catch (err) {
        this.message = 'Error' + err.message
      }
    },

    async uploadCommentOnComment(id) {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}/noteFiles/${this.noteFileId}/${id}/comments/`, {
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

    async getNotefile() {
      try {
        this.subjectId = this.$route.params.id
        const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}/noteFiles`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (!res.ok) throw new Error('Failed to get notefile')

        const data = await res.json()
        this.noteFileId = data[0]._id

        this.getNotes()

        this.message = this.notes
      } catch (err) {
        this.message = 'Error: ' + err.message
      }
    },
    async getNotes() {
      const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}/noteFiles/${this.noteFileId}/noteCommits`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (!res.ok) throw new Error('Failed to get notes')
      const data = await res.json()

      for (const note of data) {
        const id = note._id
        const comments = await this.getComments(id)
        note.comments = comments
      }

      this.notes = data
    },

    async getComments(noteCommitId) {
      const res = await fetch(`http://localhost:3000/api/v1/subjects/${this.subjectId}/noteFiles/${this.noteFileId}/${noteCommitId}/comments/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      return res.json()
    }
  }
}

</script>
