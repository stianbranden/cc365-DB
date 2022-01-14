<template>
  <div class="admin">
    <h3>Connected to adress: {{socketAdress}}</h3>
    <h5 v-if="socket">Connected: {{connectionStatus}}</h5>
    <h5>Data recieved: {{store.getters.timeFromLastPing}}</h5>
    <h5>Counter: {{counter}}</h5>
    <button @click="store.commit('addCounter')">++</button>
    <div class="admindata" v-if="adminData">
      <span>plattform: {{adminData.osData.plattform}}</span><br>
      <span>CPU Usage: {{adminData.osData.cpuUsage}}%</span><br>
      <span>CPU Free: {{adminData.osData.cpuFree}}%</span><br>
      <span>Mem Free: {{adminData.osData.freeMemPercentage}}%</span><br>
      <span>Updated: {{store.getters.osDataUpdateTime}}</span><br>

    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { computed, ref, onUpdated } from '@vue/runtime-core'

import {useStore} from 'vuex'

export default {
  name: 'Admin',
  components: {
    
  },
  setup() {
    const socketAdress = process.env.VUE_APP_SOCKET_ADRESS
    const store = useStore()
    const adminData = computed(_=>store.state.adminData)

    const counter = computed(_=>store.state.counter)
    let socket = computed(_=>store.state.socket)  
    const connectionStatus = ref(null)

    const checkConnectionStatus = _=>{
      connectionStatus.value = store.getters.connectionStatus;
    }

    onUpdated(_=>{
      checkConnectionStatus();
    })
    setInterval(() => {
      checkConnectionStatus();
    }, 60000);

    
    return {socketAdress, socket, store, connectionStatus, counter, adminData}
  }
}
</script>

<style lang="scss">
.admin div {
  margin-top: 1rem;
}
</style>
