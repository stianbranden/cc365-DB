<template>
  <div class="home">
    <SummaryCard title='CCC Denmark' department='dk' />
    <SummaryCard title='CCC Finland' department='fi' />
    <SummaryCard title='CCC Norway' department='no' />
    <SummaryCard title='CCC Sweden' department='se' />
    <SummaryCard title='CCC Kitchen' department='ki' />
    <SummaryCard title='CCC Helpdesk' department='thd' />
    <!--<QueueCard title='Phone' channel='PH' />
    <QueueCard title='Chat' channel='CH' />
    <QueueCard title='Email' channel='EM' />
    <QueueCard title='Action' channel='AC' />-->

  </div>
</template>

<script>
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
