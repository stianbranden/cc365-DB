<script setup>
import {onBeforeRouteUpdate, useRoute, useRouter} from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
// @ is an alias to /src
import QueueCard from '../components/QueueCard.vue'
import QueueCardGenesys from '../components/QueueCardGenesys.vue'
import DeliveryDeviationCard from '../components/DeliveryDeviationCard.vue'
import Alerts from '../components/Alerts.vue'
import CollectionQueueCard from '../components/CollectionQueueCard.vue'
import EmbedCard from '../components/EmbedCard.vue'
import SummaryCardGenesys from '../components/SummaryCardGenesys.vue'

const route = useRoute();
const store = useStore();
const router = useRouter();
const ping = computed(_=>store.state.lastPing)
const collections = ref(store.getters.getVisibleCollections)
const delDev = ref(store.state.delDev.length > 0)
const vizes = ref(store.state.user?.vizes?.filter(a=>a.visibleOnRouters.includes(route.name)))

watch(ping, _=>{
  collections.value = store.getters.getVisibleCollections
  delDev.value = store.state.delDev.length > 0
  vizes.value = store.state.user?.vizes?.filter(a=>a.visibleOnRouters.includes(route.name))
})

const program = ref(route.params.department)
const country = computed(_=>{
  if ( program.value.startsWith('General Service')){
    return program.value.split(' ')[2]
  }
  else return null
})
let department = computed(_=> getAbbr(program) )
// console.log({program: program.value, department: department.value});


const vizFilters = ref([setVizFilter()])


onBeforeRouteUpdate((to, from)=>{
  if ( to.params.department !== from.params.department){
    program.value= to.params.department
    department = computed(_=> getAbbr(program) )
    console.log('Running obru');
    vizFilters.value = [setVizFilter()]
  }
})

function setVizFilter(){
  let filter = {
    field: 'COUNTRY',
    value: program.value.replace(/^\w/, (c) => c.toUpperCase())
  }
  if (program.value === 'helpdesk' ) {
    filter.field = "GROUPID"
    filter.value = "Technical Helpdesk"
  }
  if ( program.value === 'kitchen' ){
    filter.field = "GROUPID"
    filter.value = "Kitchen&Interior"
  }
  return filter
}

function navigate(department, channel, country){
  if (!country) router.push({name: 'Channel', params: {department, channel, country: 'all'}})
  else router.push({name: 'Channel', params: {department, channel, country}})
}


function getAbbr(name){
    let abbr = 'na'

    switch (name.value) {
        case 'denmark':
            abbr = 'dk'
            break;
        case 'finland':
            abbr = 'fi'
            break;
        case 'norway':
            abbr = 'no'
            break;
        case 'sweden':
            abbr = 'se'
            break;
        case 'kitchen':
            abbr = 'ki'
            break;
        case 'helpdesk':
            abbr = 'thd'
            break;
        case 'b2b':
            abbr = 'b2b'
            break;
        default:
            break;
    }
    return abbr
}

//New Genesys stuff
function getChannels(part = 0){
  const channels = []
  store.state.genesysQueueStatus.filter(a=>a.program === program.value).forEach(q=>{
    if (!channels.includes(q.mediaType)) channels.push(q.mediaType)
  })
  if (part === 1 ) return channels.sort(channelSorter).slice(0,Math.ceil(channels.length / 2))
  else if (part === 2 ) return channels.sort(channelSorter).slice(Math.ceil(channels.length / 2))
  else return channels.sort(channelSorter)
}

function channelSorter(a,b){
    const dir = ['voice','callback','chat','email']
    return dir.indexOf(a) - dir.indexOf(b)
}


</script>

<template>
  <Alerts v-if="store.state.showAlerts" :department="department" /> 
  <template v-if="store.state.sourceSystem==='Genesys'">
    <div class="home" :class="{showAlerts: store.state.showAlerts}" >
      <QueueCardGenesys v-for="channel in getChannels()" :title="channel" :channel="channel" :program="program" />
      <SummaryCardGenesys v-if="program.startsWith('General Service')" :title="'PS B2B ' + country" program="Premium Support B2B" :country="country" />
    </div>
  </template>
  <template v-else>
    <div class="home" :class="{showAlerts: store.state.showAlerts}" v-if="department !== 'thd'">
        <QueueCard title="Phone" channel="PH" :department="department" @dblclick="navigate(program, 'phone')" />
        <QueueCard title="Chat" channel="CH" :department="department" @dblclick="navigate(program, 'chat')" />
        <QueueCard title="Email" channel="EM" :department="department" @dblclick="navigate(program, 'email')"  />
        <QueueCard title="Action" channel="AC" :department="department" @dblclick="navigate(program, 'action')"  />
        <DeliveryDeviationCard :department="department" >Delivery Deviations</DeliveryDeviationCard>
        <CollectionQueueCard v-for="collection in collections" :key="collection._id" :collectionId="collection._id" />
        <EmbedCard
          v-for="viz in vizes"   
          :key="viz._id" 
          :lightSrc="viz.lightSrc"
          :darkSrc="viz.darkSrc"
          :height="viz.height"
          :width="viz.width"
          :id="viz._id"
          :filters="vizFilters"
        >
          {{program.replace(/^\w/, (c) => c.toUpperCase())}} {{viz.name}}
        </EmbedCard> 
    </div>
    <div class="home" :class="{showAlerts: store.state.showAlerts}" v-else>
      <QueueCard title="DK THD Phone" channel="PH" country="DK" :department="department" @dblclick="navigate(program, 'phone', 'denmark')" />
      <QueueCard title="FI THD Phone" channel="PH" country="FI" :department="department" @dblclick="navigate(program, 'phone', 'finland')" />
      <QueueCard title="NO THD Phone" channel="PH" country="NO" :department="department" @dblclick="navigate(program, 'phone', 'norway')" />
      <QueueCard title="SE THD Phone" channel="PH" country="SE" :department="department" @dblclick="navigate(program, 'phone', 'sweden')" />
      <CollectionQueueCard v-for="collection in collections" :key="collection._id" :collectionId="collection._id" />
      <EmbedCard
          v-for="viz in vizes"   
          :key="viz._id" 
          :depName="program"
          :lightSrc="viz.lightSrc"
          :darkSrc="viz.darkSrc"
          :height="viz.height"
          :width="viz.width"
          :id="viz._id"
          :filters="vizFilters"
        >
          {{program.replace(/^\w/, (c) => c.toUpperCase())}} {{viz.name}}
        </EmbedCard> 
    </div>
  </template>
</template>



<style lang="scss">

</style>