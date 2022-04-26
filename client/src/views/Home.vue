<template>
  <div class="home" :class="{showAlerts: store.state.showAlerts}">
    <Alerts v-if="store.state.showAlerts" /> 
    <SummaryCard key="dk" title='CCC Denmark' department='dk' @dblclick="navigate('denmark')" />
    <SummaryCard key="fi" title='CCC Finland' department='fi' @dblclick="navigate('finland')" />
    <SummaryCard key="no" title='CCC Norway' department='no' @dblclick="navigate('norway')" />
    <SummaryCard key="se" title='CCC Sweden' department='se' @dblclick="navigate('sweden')" />
    <SummaryCard key="ki" title='CCC Kitchen' department='ki' @dblclick="navigate('kitchen')" />
    <SummaryCard key="thd" title='CCC Helpdesk' department='thd' @dblclick="navigate('helpdesk')" />
    <CollectionQueueCard v-for="collection in collections" :key="collection._id" :collectionId="collection._id" />
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
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import {ref, computed, watch} from 'vue'
// @ is an alias to /src
import QueueCard from '../components/QueueCard.vue'
import SummaryCard from '../components/SummaryCard.vue'
import Alerts from '../components/Alerts.vue'
import CollectionQueueCard from '../components/CollectionQueueCard.vue'
import EmbedCard from '../components/EmbedCard.vue'


export default {
  name: 'Home',
  components: {
    QueueCard,
    SummaryCard,
    Alerts,
    CollectionQueueCard,
    EmbedCard
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()

    const vizes = ref(store.state.user?.vizes.filter(a=>a.visibleOnRouters.includes(route.name)))

    const collections = ref(store.getters.getVisibleCollections)
    const ping = computed(_=>store.state.lastPing)

    function navigate(dep){
      router.push({name: 'Department', params: {department: dep}})
    }
    watch(ping, _=> {
      collections.value = store.getters.getVisibleCollections
      vizes.value = store.state.user?.vizes.filter(a=>a.visibleOnRouters.includes(route.name))
    })

    return {navigate, store, collections, vizes}
  }
}
</script>

<style lang="scss">


</style>
