<template>
    <div class="home">
        <QueueCard title="Phone" channel="PH" :department="department" />
        <QueueCard title="Chat" channel="CH" :department="department" />
        <QueueCard title="Email" channel="EM" :department="department" />
        <QueueCard title="Action" channel="AC" :department="department" />
    </div>
</template>

<script>
// @ is an alias to /src
import QueueCard from '../components/QueueCard.vue'
import {useRoute} from 'vue-router'
import { computed, ref } from '@vue/reactivity'

export default {
  name: 'Home',
  components: {
    QueueCard
  },
  setup() {
    const departmentName = ref(useRoute().params.department)
    let department = computed(_=> getAbbr(departmentName) )

    return {department}
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
.home {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: baseline;
  padding: 2rem;
  height: 100%;
  overflow: auto;
}
footer{
  font-size: 0.8rem;
  margin-top: 3rem;
}
</style>