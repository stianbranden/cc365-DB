<template>
  <div :class="{showAlerts: store.state.showAlerts}">
      <div class="home"  v-if="store.state.showAlerts" >
        <Alerts :department="department" /> 
      </div>
      <div class="home" v-if="department !== 'thd'">
          <QueueCard title="Phone" channel="PH" :department="department" />
          <QueueCard title="Chat" channel="CH" :department="department" />
          <QueueCard title="Email" channel="EM" :department="department" />
          <QueueCard title="Action" channel="AC" :department="department" />
      </div>
      <div class="home" v-else>
        <QueueCard title="DK THD Phone" channel="PH" country="DK" :department="department" />
        <QueueCard title="FI THD Phone" channel="PH" country="FI" :department="department" />
        <QueueCard title="NO THD Phone" channel="PH" country="NO" :department="department" />
        <QueueCard title="SE THD Phone" channel="PH" country="SE" :department="department" /> 
      </div>
  </div>
</template>

<script>
// @ is an alias to /src
import QueueCard from '../components/QueueCard.vue'
import Alerts from '../components/Alerts.vue'
import {onBeforeRouteUpdate, useRoute} from 'vue-router'
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
    const departmentName = ref(route.params.department)
    let department = computed(_=> getAbbr(departmentName) )

    onBeforeRouteUpdate((to, from)=>{
      if ( to.params.department !== from.params.department){
        departmentName.value= to.params.department
        department = computed(_=> getAbbr(departmentName) )
      }
    })

    return {department, store}
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