<template>
  <div class="home">
    <SummaryCard title='CCC Denmark' department='dk' @dblclick="navigate('denmark')" />
    <SummaryCard title='CCC Finland' department='fi' @dblclick="navigate('finland')" />
    <SummaryCard title='CCC Norway' department='no' @dblclick="navigate('norway')" />
    <SummaryCard title='CCC Sweden' department='se' @dblclick="navigate('sweden')" />
    <SummaryCard title='CCC Kitchen' department='ki' @dblclick="navigate('kitchen')" />
    <SummaryCard title='CCC Helpdesk' department='thd' @dblclick="navigate('helpdesk')" />

  </div>
</template>

<script>
import { useRouter } from 'vue-router'
// @ is an alias to /src
import QueueCard from '../components/QueueCard.vue'
import SummaryCard from '../components/SummaryCard.vue'


export default {
  name: 'Home',
  components: {
    QueueCard,
    SummaryCard
  },
  setup() {
    const router = useRouter();
    function navigate(dep){
      router.push({name: 'Department', params: {department: dep}})
    }
    return {navigate}
  }
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
