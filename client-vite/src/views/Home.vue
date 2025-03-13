<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import {ref, computed, watch} from 'vue'
// @ is an alias to /src
import QueueCard from '../components/QueueCard.vue'
import SummaryCard from '../components/SummaryCard.vue'
import SummaryCardGenesys from '../components/SummaryCardGenesys.vue'
import Alerts from '../components/Alerts.vue'
import CollectionQueueCard from '../components/CollectionQueueCard.vue'
import EmbedCard from '../components/EmbedCard.vue'
import ContactReasons from '../components/ContactReasons.vue'


const router = useRouter()
const route = useRoute()
const store = useStore()



const vizes = ref(store.state.user?.vizes?.filter(a=>a.visibleOnRouters.includes(route.name)))

const collections = ref(store.getters.getVisibleCollections)
const ping = computed(_=>store.state.lastPing)

function getPrograms(){
  const programs = []
  store.state.genesysQueueStatus.forEach(q=>{
    if (!programs.includes(q.program) && !q.program.includes('Inside Sales')) programs.push(q.program)
  })
  return programs.sort((a,b)=>a<b?-1:1)
}

function navigate(dep){
  // if (store.state.sourceSystem === 'Genesys') router.push({name: 'Program', params: {program: dep}})
  router.push({name: 'Department', params: {department: dep}})
}
watch(ping, _=> {
  collections.value = store.getters.getVisibleCollections
  vizes.value = store.state.user?.vizes?.filter(a=>a.visibleOnRouters.includes(route.name))
})

function abbrTitle(title){
  if (title === 'General Service Denmark') return 'GS Denmark'
  if (title === 'General Service Finland') return 'GS Finland'
  if (title === 'General Service Norway') return 'GS Norway'
  if (title === 'General Service Sweden') return 'GS Sweden'
  if (title === 'Premium Support Kitchen&Interior') return 'PS Kitchen&Interior'
  if (title === 'Premium Support Technical Helpdesk') return 'PS Technical Helpdesk'
  if (title === 'Premium Support B2B') return 'PS B2B'
  else return title
}

</script>

<template>
  <div class="home" :class="{showAlerts: store.state.showAlerts}">
    <Alerts v-if="store.state.showAlerts" /> 

    <SummaryCardGenesys v-for="program in getPrograms()" :title='abbrTitle(program)' :program='program' v-if="store.state.sourceSystem === 'Genesys'" @dblclick="navigate(program)" />
    <template v-else>

      <SummaryCard key="dk" title='GS Denmark' department='dk' @dblclick="navigate('denmark')" />
      <SummaryCard key="fi" title='GS Finland' department='fi' @dblclick="navigate('finland')" />
      <SummaryCard key="no" title='GS Norway' department='no' @dblclick="navigate('norway')" />
      <SummaryCard key="se" title='GS Sweden' department='se' @dblclick="navigate('sweden')" />
      <SummaryCard key="ki" title='PS Kitchen&Interior' department='ki' @dblclick="navigate('kitchen')" />
      <SummaryCard key="thd" title='PS Technical Helpdesk' department='thd' @dblclick="navigate('helpdesk')" />
      <!-- <SummaryCard key="b2b" title='PS B2B' department='b2b' @dblclick="navigate('b2b')" /> -->
  
       <CollectionQueueCard v-for="collection in collections" :key="collection._id" :collectionId="collection._id" /> 

    </template>




    <EmbedCard
      v-for="viz in vizes"   
      :key="viz._id" 
      :lightSrc="viz.lightSrc"
      :darkSrc="viz.darkSrc"
      :height="viz.height"
      :width="viz.width"
      :id="viz._id"
    >
      Nordic {{viz.name}}
    </EmbedCard>
    <ContactReasons v-if="store.state.aiContactReasonData.length" class="col-span-2" />
    

  </div>
</template>


<style lang="scss">
.col-span-2 {
  grid-column: span 2 / span 2;
}

</style>
