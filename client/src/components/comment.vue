<template>
  <div class="comment-thread" :style="{ marginLeft: depth > 0 ? '1.5rem' : '0' }">
    <div class="comment">
      <div class="comment-header">
        <span class="username-badge">{{ username }}</span>
      </div>

      <div class="comment-body">
        <input v-if="edit" type="text" v-model="newContent" class="notecommit-input"/>
        <p v-else style="text-align: left; font-weight: normal;">{{ content }}</p>
      </div>

      <div class="notecommit-menu">
        <div class="like-counter" style="font-size: 1rem;">
          <button class="like-btn" @click="likeComment(true)">👍</button> 
          <span class="count-text">{{ likes }}</span>
          <button class="like-btn" @click="likeComment(false)">👎</button>
          <span class="count-text">{{ dislikes }}</span>
        </div>

        <button class="reply-btn" @click="showReply = !showReply">
          {{ showReply ? 'Cancel' : 'Reply' }}
        </button>

        <button v-if="user === username" class="menu-btn" @click="toggleMenu">⋮</button>
        <div v-if="editMenu" class="menu-dropdown">
          <button @click="editComment">{{ edit ? 'Save' : 'Edit' }} Comment</button>
          <button class="delete-opt" @click="deleteComment">Delete Comment</button>
        </div>
      </div>

      <div v-if="showReply" class="comment-create quick-reply" style="margin-top: 10px;">
        <input 
          type="text" 
          v-model="newComment" 
          placeholder="Write a reply..." 
          class="notecommit-input"
          @keyup.enter="uploadComment" 
        />
        <button class="btn-message mt-1" @click="uploadComment">Post</button>
      </div>
    </div>

    <div v-if="comments && comments.length">
      <div v-for="comment in comments" :key="comment._id">
        <comment
          :content="comment.comment"
          :username="comment.createdBy.username"
          :likes="comment.likes"
          :dislikes="comment.dislikes"
          :depth="Number(depth) + 1"
          :comments="comment.replies"
          :id="comment._id"
          :noteCommitId="noteCommitId"
          :subjectId="subjectId"
          :noteFileId="noteFileId"
          @refreshNotes="emit('refreshNotes')"
          :user="user"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showReply = ref(false)
const newComment = ref('')
const edit = ref('')
edit.value = false

const emit = defineEmits(['refreshNotes'])

const props = defineProps({
  content: String,
  username: String,
  likes: Number,
  dislikes: Number,
  depth: Number,
  comments: Array,
  id: String,
  noteCommitId: String,
  subjectId: String,
  noteFileId: String,
  user: String
})

const editMenu = ref(false)
const newContent = ref(props.content)

async function toggleMenu() {
  editMenu.value = !editMenu.value
}

async function editComment() {
  try {
    if (edit.value) {
      if (!newContent.value) {
        newContent.value = ' '
      }
      const res = await fetch(`http://localhost:3000/api/v1/subjects/${props.subjectId}/noteFiles/${props.noteFileId}/noteCommits/${props.id}/comments/${props.id}`, {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          comment: newContent.value
        })
      })
      emit('refreshNotes')
      if (!res.ok) throw new Error('Failed to edit comment')
    }
    edit.value = !edit.value
  } catch (err) {

  }
}
async function uploadComment() {
  if (!newComment.value.trim()) return;
  try {
    const res = await fetch(`http://localhost:3000/api/v1/subjects/${props.subjectId}/noteFiles/${props.noteFileId}/noteCommits/${props.noteCommitId}/comments/`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        comment: newComment.value,
        commentedOnComment: props.id
      })
    })

    if (!res.ok) throw new Error('Failed to update')

    newComment.value = ''
    showReply.value = false
    emit('refreshNotes')
  } catch (err) {
    console.error("Upload error:", err)
  }
}
async function deleteComment(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/v1/subjects/${props.subjectId}/noteFiles/${props.noteFileId}/noteCommits/${props.noteCommitId}/comments/${props.id}`, {
      method: 'DELETE',
      headers: { 'Content-type': 'application/json' },
      credentials: 'include'
    })
    console.log(await res.json())

    if (!res.ok) throw new Error('Failed to delete')
    emit('refreshNotes')
  } catch (err) {

  }
}

async function likeComment(state) {
  try {
    const likeBool = state
    const dislikeBool = !state
    const res = await fetch(`http://localhost:3000/api/v1/subjects/${props.subjectId}/noteFiles/${props.noteFileId}/noteCommits/${props.id}/comments/${props.id}/likes`, {
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
