<template>
    <div>
        <div v-if="edit">
            <h1>{{topic}}</h1>
            <label>Note</label>
            <input type="text" v-model="newNote" class="form-control"/>
        </div>
        <div v-else>
            <h1>{{topic}}</h1>
            <h3>{{note}}</h3>
        </div>
        <!--Edit and delete note-->
        <div>
            <button v-if="user === username" class="btn btn-primary mt-3" @click="editNote">
            Edit Note
            </button>
            <button v-if="user === username" class="btn btn-danger mt-3" @click="deleteNote">
            Delete Note
            </button>
        </div>
        <!--Create comment on note-->
        <div>
            <label>Comment</label>
            <input type="text" v-model="newComment" class="form-control"/>
        </div>
        <button class="btn btn-primary mt-3" @click="uploadComment">
            Post comment
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['refreshNotes'])

const props = defineProps({
  topic: String,
  note: String,
  id: String,
  subjectId: String,
  noteFileId: String,
  user: String,
  username: String
})

const newNote = ref(props.note)
const newComment = ref('')
const edit = ref('')
edit.value = false

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
    console.log(await res.json())

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

</script>
