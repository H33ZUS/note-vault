<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <div class="notecommit">
    <div class="note-content-wrapper">
      <h1 class="text-left" style="text-align: left; color: #ef7b45;">{{ topic }}</h1>
      <div v-if="edit">
        <quill-editor v-model:content="newNote" content-type="html" :options="{ theme: 'snow' }" />
      </div>
      <div v-else class="note-display">
        <div v-html="safeNote"></div>
      </div>
    </div>

    <div class="notecommit-menu">
      <div class="like-counter">
        <button class="like-btn" @click="likeNoteCommit(true)">👍</button>
        <span class="count-text">{{ likes }}</span> 
        
        <button class="like-btn" @click="likeNoteCommit(false)">👎</button> 
        <span class="count-text">{{ dislikes }}</span>
      </div>

      <button class="reply-btn" @click="showReply = !showReply">
        {{ showReply ? 'Cancel' : 'Reply' }}
      </button>

      <!--Edit and delete note-->
      <div class="menu-wrapper">
        <button v-if="user === username" class="menu-btn" @click="toggleMenu">⋮</button>
        <div v-if="editMenu" class="menu-dropdown">
          <button @click="editNote">{{ edit ? 'Save' : 'Edit' }} Note</button>
          <button class="delete-opt" @click="deleteNote">Delete Note</button>
        </div>
      </div>
    </div>

    <!--Create comment on note-->
    <div v-if="showReply" class="comment-create quick-reply">
      <input type="text" v-model="newComment" placeholder="Write a comment..." class="notecommit-input"/>
      <button class="btn-message mt-1" @click="uploadComment">Post</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DOMPurify from 'dompurify'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const emit = defineEmits(['refreshNotes'])
const showReply = ref(false)

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
