<!-- eslint-disable vue/no-v-model-argument -->
<template>
    <div class="noteCommit">

        <div v-if="edit">
            <h1>{{topic}}</h1>

            <label>Note</label>
            <quill-editor v-model:content="newNote" content-type="html" :options="{ theme: 'snow' }" />

        </div>
        <div v-else>
            <h1>{{topic}}</h1>
            <div class="noteCommit">
            <div v-html="safeNote"></div>
            </div>
        </div>

        <!--Edit and delete note-->
        <div class="noteCommitMenu">
          <div class="likeCounter">
            <button class="likebtn" @click="likeNoteCommit(true)">
                  👍 </button> {{likes}} <button class="likebtn" @click="likeNoteCommit(false)">
                  👎 </button> {{dislikes}}
          </div>
          <button v-if="user === username" class="menu-btn" @click="toggleMenu">⋮</button>
            <div v-if="editMenu" class="menu-dropdown" style="top: 3rem">
              <div>
              <button v-if="user === username" @click="editNote">
              Edit Note
              </button>
              </div>
              <div>
              <button v-if="user === username"  @click="deleteNote">
              Delete Note
              </button>
              </div>
            </div>
        </div>
        <!--Create comment on note-->
        <div class="createComment">
          <div>
              <label>Comment</label>
              <input type="text" v-model="newComment" class="inputNoteCommit"/>
          </div>
          <br>
          <button class="btn-message" @click="uploadComment">
              Post comment
          </button>
          <br>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DOMPurify from 'dompurify'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const emit = defineEmits(['refreshNotes'])

const props = defineProps({
  topic: String,
  note: String,
  id: String,
  likes: Number,
  dislikes: Number,
  subjectId: String,
  noteFileId: String,
  user: String,
  username: String
})

const editMenu = ref(false)

const newNote = ref(props.note)
const newComment = ref('')
const edit = ref('')
edit.value = false

const safeNote = computed(() => DOMPurify.sanitize(props.note))

async function toggleMenu() {
  editMenu.value = !editMenu.value
}

async function uploadComment() {
  try {
    if (!newComment.value) {
      return
    }
    const res = await fetch(`http://localhost:3000/api/v1/subjects/${props.subjectId}/noteFiles/${props.noteFileId}/noteCommits/${props.id}/comments/`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        comment: newComment.value,
        commentedOnNote: props.id
      })
    })
    emit('refreshNotes')

    if (!res.ok) throw new Error('Failed to update')
    newComment.value = ''
  } catch (err) {

  }
}

async function editNote() {
  // {{baseURL}}/api/v1/subjects/:subjectId/noteFiles/:noteFileId/noteCommits/:noteCommitId
  try {
    if (!newNote.value) {
      return
    }
    if (edit.value) {
      const res = await fetch(`http://localhost:3000/api/v1/subjects/${props.subjectId}/noteFiles/${props.noteFileId}/noteCommits/${props.id}`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          note: newNote.value
        })
      })

      if (!res.ok) throw new Error('Failed to update')
      emit('refreshNotes')
    }
    edit.value = !edit.value
  } catch (err) {

  }
}

async function deleteNote() {
  try {
    const res = await fetch(`http://localhost:3000/api/v1/subjects/${props.subjectId}/noteFiles/${props.noteFileId}/noteCommits/${props.id}`, {
      method: 'DELETE',
      headers: { 'Content-type': 'application/json' },
      credentials: 'include'
    })
    console.log(await res.json())

    if (!res.ok) throw new Error('Failed to Delete')
    emit('refreshNotes')
  } catch (err) {

  }
}

async function likeNoteCommit(state) {
  try {
    const likeBool = state
    const dislikeBool = !state
    const res = await fetch(`http://localhost:3000/api/v1/subjects/${props.subjectId}/noteFiles/${props.noteFileId}/noteCommits/${props.id}/likes`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        like: likeBool,
        dislike: dislikeBool
      })
    })
    if (!res.ok) throw new Error('Failed to like')

    emit('refreshNotes')
  } catch (err) {

  }
}

</script>
