<template>
  <div class="home" :class="{showAlerts: store.state.showAlerts}">
    <Alerts v-if="store.state.showAlerts" /> 
    <SummaryCard key="dk" title='CCC Denmark' department='dk' @dblclick="navigate('denmark')" />
    <SummaryCard key="fi" title='CCC Finland' department='fi' @dblclick="navigate('finland')" />
    <SummaryCard key="no" title='CCC Norway' department='no' @dblclick="navigate('norway')" />
    <SummaryCard key="se" title='CCC Sweden' department='se' @dblclick="navigate('sweden')" />
    <SummaryCard key="ki" title='CCC Kitchen' department='ki' @dblclick="navigate('kitchen')" />
    <SummaryCard key="thd" title='CCC Helpdesk' department='thd' @dblclick="navigate('helpdesk')" />
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
// @ is an alias to /src
import QueueCard from '../components/QueueCard.vue'
import SummaryCard from '../components/SummaryCard.vue'
import Alerts from '../components/Alerts.vue'
import { useStore } from 'vuex'


export default {
  name: 'Home',
  components: {
    QueueCard,
    SummaryCard,
    Alerts
  },
  setup() {
    const router = useRouter();
    const store = useStore()
    function navigate(dep){
      router.push({name: 'Department', params: {department: dep}})
    }
    return {navigate, store}
  }
}
</script>

<style lang="scss">


</style>
