<template>
  <div class="home" :class="{showAlerts: store.state.showAlerts}" v-if="department !== 'thd'">
      <Alerts v-if="store.state.showAlerts" :department="department" /> 
      <QueueCard title="Phone" channel="PH" :department="department" @dblclick="navigate(departmentName, 'phone')" />
      <QueueCard title="Chat" channel="CH" :department="department" @dblclick="navigate(departmentName, 'chat')" />
      <QueueCard title="Email" channel="EM" :department="department" @dblclick="navigate(departmentName, 'email')"  />
      <QueueCard title="Action" channel="AC" :department="department" @dblclick="navigate(departmentName, 'action')"  />
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
        {{departmentName.replace(/^\w/, (c) => c.toUpperCase())}} {{viz.name}}
      </EmbedCard> 
  </div>
  <div class="home" :class="{showAlerts: store.state.showAlerts}" v-else>
    <Alerts v-if="store.state.showAlerts" :department="department" /> 
    <QueueCard title="DK THD Phone" channel="PH" country="DK" :department="department" @dblclick="navigate(departmentName, 'phone', 'denmark')" />
    <QueueCard title="FI THD Phone" channel="PH" country="FI" :department="department" @dblclick="navigate(departmentName, 'phone', 'finland')" />
    <QueueCard title="NO THD Phone" channel="PH" country="NO" :department="department" @dblclick="navigate(departmentName, 'phone', 'norway')" />
    <QueueCard title="SE THD Phone" channel="PH" country="SE" :department="department" @dblclick="navigate(departmentName, 'phone', 'sweden')" />
    <CollectionQueueCard v-for="collection in collections" :key="collection._id" :collectionId="collection._id" />
    <EmbedCard
        v-for="viz in vizes"   
        :key="viz._id" 
        :depName="departmentName"
        :lightSrc="viz.lightSrc"
        :darkSrc="viz.darkSrc"
        :height="viz.height"
        :width="viz.width"
        :id="viz._id"
        :filters="vizFilters"
      >
        {{departmentName.replace(/^\w/, (c) => c.toUpperCase())}} {{viz.name}}
      </EmbedCard> 
  </div>
</template>

<script>
import {onBeforeRouteUpdate, useRoute, useRouter} from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
// @ is an alias to /src
import QueueCard from '../components/QueueCard.vue'
import DeliveryDeviationCard from '../components/DeliveryDeviationCard.vue'
import Alerts from '../components/Alerts.vue'
import CollectionQueueCard from '../components/CollectionQueueCard.vue'
import EmbedCard from '../components/EmbedCard.vue'

export default {
  name: 'Home',
  components: {
    QueueCard, Alerts, DeliveryDeviationCard, CollectionQueueCard, EmbedCard
  },
  setup() {
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

    const departmentName = ref(route.params.department)
    let department = computed(_=> getAbbr(departmentName) )

    const vizFilters = ref([setVizFilter()])

    
    onBeforeRouteUpdate((to, from)=>{
      if ( to.params.department !== from.params.department){
        departmentName.value= to.params.department
        department = computed(_=> getAbbr(departmentName) )
        console.log('Running obru');
        vizFilters.value = [setVizFilter()]
      }
    })

    function setVizFilter(){
      let filter = {
        field: 'COUNTRY',
        value: departmentName.value.replace(/^\w/, (c) => c.toUpperCase())
      }
      if (departmentName.value === 'helpdesk' ) {
        filter.field = "GROUPID"
        filter.value = "Technical Helpdesk"
      }
      if ( departmentName.value === 'kitchen' ){
        filter.field = "GROUPID"
        filter.value = "Kitchen&Interior"
      }
      return filter
    }

    function navigate(department, channel, country){
      if (!country) router.push({name: 'Channel', params: {department, channel, country: 'all'}})
      else router.push({name: 'Channel', params: {department, channel, country}})
    }

    return {department, departmentName, store, navigate, collections, route, vizes, vizFilters}
  }
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

</script>

<style lang="scss">

</style>