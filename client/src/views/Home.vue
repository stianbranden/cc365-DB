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
import QueueCard from '../components/QueueCard.vue'

export default {
  name: 'Home',
  components: {
    QueueCard
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
  padding: 2rem;
}
footer{
  font-size: 0.8rem;
  margin-top: 3rem;
}
</style>
