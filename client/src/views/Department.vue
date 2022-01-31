<template>
  <div class="home" :class="{showAlerts: store.state.showAlerts}" v-if="department !== 'thd'">
      <Alerts v-if="store.state.showAlerts" :department="department" /> 
      <QueueCard title="Phone" channel="PH" :department="department" @dblclick="navigate(departmentName, 'phone')" />
      <QueueCard title="Chat" channel="CH" :department="department" @dblclick="navigate(departmentName, 'chat')" />
      <QueueCard title="Email" channel="EM" :department="department" @dblclick="navigate(departmentName, 'email')"  />
      <QueueCard title="Action" channel="AC" :department="department" @dblclick="navigate(departmentName, 'action')"  />
  </div>
  <div class="home" :class="{showAlerts: store.state.showAlerts}" v-else>
    <Alerts v-if="store.state.showAlerts" :department="department" /> 
    <QueueCard title="DK THD Phone" channel="PH" country="DK" :department="department" @dblclick="navigate(departmentName, 'phone', 'denmark')" />
    <QueueCard title="FI THD Phone" channel="PH" country="FI" :department="department" @dblclick="navigate(departmentName, 'phone', 'finland')" />
    <QueueCard title="NO THD Phone" channel="PH" country="NO" :department="department" @dblclick="navigate(departmentName, 'phone', 'norway')" />
    <QueueCard title="SE THD Phone" channel="PH" country="SE" :department="department" @dblclick="navigate(departmentName, 'phone', 'sweden')" /> 
  </div>
</template>

<script>
// @ is an alias to /src
import QueueCard from '../components/QueueCard.vue'
import Alerts from '../components/Alerts.vue'
import {onBeforeRouteUpdate, useRoute, useRouter} from 'vue-router'
import { computed, ref } from '@vue/reactivity'
import { useStore } from 'vuex'

export default {
  name: 'Home',
  components: {
    QueueCard, Alerts
  },
  setup() {
    const route = useRoute();
    const store = useStore();
    const router = useRouter();
    const departmentName = ref(route.params.department)
    let department = computed(_=> getAbbr(departmentName) )

    onBeforeRouteUpdate((to, from)=>{
      if ( to.params.department !== from.params.department){
        departmentName.value= to.params.department
        department = computed(_=> getAbbr(departmentName) )
      }
    })

    function navigate(department, channel, country){
      if (!country) router.push({name: 'Channel', params: {department, channel, country: 'all'}})
      else router.push({name: 'Channel', params: {department, channel, country}})
    }

    return {department, departmentName, store, navigate}
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
        default:
            break;
    }
    return abbr
}

</script>

<style lang="scss">

</style>