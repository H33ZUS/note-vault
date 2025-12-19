<template>
    <div :style="{ marginLeft: `${(depth) + 5}vw`}">
      <div class="comment">
        <h4 style="text-align: right">{{username}}</h4>
        <div v-if="edit">
            <label>Comment</label>
            <input type="text" v-model="newContent" class="form-control"/>
        </div>
        <div v-else>
            <h4>{{content}}</h4>
        </div>

        <div class="noteCommitMenu">
        <div class="likeCounter">
        <button class="likebtn" @click="likeComment(true)">
                  👍 </button> {{likes}} <button class="likebtn" @click="likeComment(false)">
                  👎 </button> {{dislikes}}
        </div>
        <button v-if="user === username" class="menu-btn" @click="toggleMenu">⋮</button>
        <div v-if="editMenu" class="menu-dropdown" style="top: 3rem">
          <div>
            <button v-if="user === username" class="btn-message" @click="editComment(id)">
            Edit comment
            </button>
          </div>
          <div>
            <button v-if="user === username" class="btn btn-danger mt-3" @click="deleteComment(id)">
                Delete comment
            </button>
          </div>
        </div>
        </div>
                <div>
                    <label>Comment</label>
                    <input type="text" v-model="newComment" class="inputNoteCommit"/>
                </div>
                <br>
            <button class="btn-message" @click="uploadComment(id)">
                Post comment
            </button>
            </div>
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
</template>

<script setup>
import { ref } from 'vue'
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
    emit('refreshNotes')
  } catch (err) {

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
