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
    <div class="accesses">
      <div class="header">Accesses</div>
      <Access 
        class="row"
        v-for="access in store.state.accesses"
        :key="access._id" 
        :access_id="access._id" 
        :access="access"
        @access-update="accessUpdated"
        :trigger="triggerKey"
      />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import { computed, ref, onUpdated, onMounted } from '@vue/runtime-core'
import Access from '../components/Access'
import {useStore} from 'vuex'

export default {
  name: 'Admin',
  components: {
    Access
  },
  setup() {
    const socketAdress = process.env.VUE_APP_SOCKET_ADRESS
    const store = useStore()
    const triggerKey = ref(Date.now())
    const adminData = computed(_=>store.state.adminData)

    const counter = computed(_=>store.state.counter)
    let socket = computed(_=>store.state.socket)  
    const connectionStatus = ref(null)

    const checkConnectionStatus = _=>{
      connectionStatus.value = store.getters.connectionStatus;
    }
    onMounted(_=>{
      store.dispatch('getAccesses')
    })

    function accessUpdated(){
      console.log('Updating...');
      store.dispatch('getAccesses')
      triggerKey.value = Date.now()
    }

    onUpdated(_=>{
      checkConnectionStatus();
    })
    setInterval(() => {
      checkConnectionStatus();
    }, 60000);

    
    return {socketAdress, socket, store, connectionStatus, counter, adminData, accessUpdated, triggerKey}
  }
}
</script>

<style lang="scss" scoped>
div.admin{
  margin-top: 1rem;
  > div {
    margin-top: 1rem;
  }
}
.accesses {
  background-color: var(--cardbgcolor);
  border-radius: 0.5rem;
  //padding: 1rem 2rem;
  margin: auto auto;
  width: 90vw;
  max-width: 500px;
  overflow-x: hidden;
  padding-bottom: 1rem;
  .header {

    background-color: var(--headercolor);
    font-size: 1.5rem;
    padding: 0.5rem 0;
  }

}

</style>
