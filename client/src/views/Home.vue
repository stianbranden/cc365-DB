<template>
  <div class="home">
    <QueueCard title='Phone' channel='PH' />
    <QueueCard title='Chat' channel='CH' />
    <QueueCard title='Email' channel='EM' />
    <QueueCard title='Action' channel='AC' />
  </div>
</template>

<script>
// @ is an alias to /src
import { watch, computed, ref } from '@vue/runtime-core'
import QueueCard from '../components/QueueCard.vue'
import {useStore} from 'vuex'

export default {
  name: 'Home',
  components: {
    QueueCard
  },
  setup() {
    const store = useStore();
    const ping = computed(_=>store.state.lastPing)
    let phoneObj = ref(store.getters.getQueueData('PH'));
    //console.log(phoneObj.value);
    watch(
      ping, 
      _=>{
        phoneObj.value = store.getters.getQueueData('PH');
    })


    return {store, phoneObj}

  }
    //dfd
}
</script>

<style lang="scss">
.home {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
footer{
  font-size: 0.8rem;
  margin-top: 3rem;
}
</style>
