<template>
  <div class="quality">
    <div 
      class="segment"
      v-for="segment in store.state.qualitySegments"
      :key="segment._id"
      ><div class="info">
        <span class="name">{{segment.name}}</span>
        <span 
          class="active" 
          v-if="segment.isActive"
          @click="toggleSegment(segment._id)"
          >&check; {{segment.sample}} per week</span>
        <span 
          class="active" 
          v-else
          @click="toggleSegment(segment._id)"
          >&Cross; Deactivated</span>
      </div>
      <div 
        class="form" 
        v-if="segment.isActive"
        >
        <div class="form">Form used:  
          <span 
            @click.ctrl="toggleForm(segment._id, segment.users[0].evalFormId )"
            title="CTRL+Click to change form used"
            > {{getFormName(segment.users[0].evalFormId)}}
          </span>
        </div>
      </div>
      <div
       v-if="segment.isActive"
       class="user"
       v-for="user in segment.users"
       :key="user._id"
       @click.exact="toggleUser(segment._id, user._id)"
       @click.ctrl="bumpUser(segment._id, user._id)"
       title="Click to toggle, CTRL+click to increase"
       >
       <span v-if="user.assignment > 0">
        {{user.assignment}} x assigned to {{user.name}} (in average {{calculateExpectedSample(segment, user)}} per week)
       </span>
       <span v-else class="deactive">
        {{user.assignment}} x assigned to {{user.name}}
       </span>
      </div>
      
      <div class="history">
        <table v-if="segment.showHistory">
          <tr>
            <th>User</th>
            <th>#</th>
            <th>Time</th>
          </tr>
          <tr v-for="log in segment.logs" :key="log._id">
            <td>{{log.user}}</td>
            <td>{{log.contactsPushed}}</td>
            <td>{{formatDate(log.createdAt)}}</td>
          </tr>
        </table>
        <div v-else />
        <div class="showHistory">
          <font-awesome-icon icon="clock" @click="toggleHistory(segment)" title="Show/hide history" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// @ is an alias to /src
import {useStore} from 'vuex'
import { useDateFormat } from '@vueuse/core'
const store = useStore()
store.dispatch('getSegments')

function formatDate(dt){
  // return dt
  return useDateFormat(dt, 'Do of MMMM YYYY @HH:mm').value
}
function toggleHistory(segment){
  segment.showHistory = !segment.showHistory
}

function getFormName(id){
  const {name} = store.state.qualityForms.filter(form=>form.id===id)[0] || 'N/A'
  // console.log(name, id, store.state.qualityForms[0])
  return name
}

function calculateExpectedSample(segment, user){
  const {sample, users} = segment
  let totW = 0
  users.forEach(user=>{
    totW += user.assignment
  })
  return sample * user.assignment / totW
}

function toggleSegment(id){
  // console.log('Toggle segment deactivated')
  // store.dispatch('toggleSegment', id)
}

function toggleUser(segmentId, userId){
  // console.log('Clicked toggle')
  store.dispatch('toggleUser', {segmentId, userId})
}
function bumpUser(segmentId, userId){
  // console.log('Clicked toggle')
  store.dispatch('bumpUser', {segmentId, userId})
}

function toggleForm(segmentId, formId){
  store.dispatch('toggleForm', {segmentId, formId})
}

</script>

<style lang="scss" scoped>
div.quality{
  margin-top: 1rem;
  margin-inline: 2rem;
  > div {
    margin-top: 1rem;
  }
  .segment {
    min-width: 30rem;
    max-width: 800px;
    border-radius: 0.5rem;
    box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
    background-color: var(--cardbgcolor);
    margin: 2rem 1rem;
    padding: 1rem;
    > div {
      margin-block: 1rem;
    }
    .history{
    display: flex;
    justify-content: space-between;
    margin-bottom: 0;
    td, th {
      text-align: left;
      // min-width: 4rem;
      padding-right: 1rem;
      }
    } 
    .showHistory {
      text-align: right;
      cursor: pointer;
    }
  }
  .info {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .name{
    font-size: 2rem;
  }
  .form {
    display: flex;
    > span {
      margin-left: 1rem;
      font-weight: bold;
      cursor: pointer;
    }
  }
  .user {
    display: flex;
    cursor: pointer;
    .deactive {
      text-decoration: line-through;
    }
  }
  .active {
    // cursor: pointer;
  }
  
}

</style>
