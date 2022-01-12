<template>
  <div class="card-body">
      <div class="card-row" v-for="queue in qs" :key="queue.id" >
          <span class="name">{{queue.name}}</span>
          <span class="queue">{{queue.inQueueCurrent}}</span>
          <span class="time">{{queue.timeWait}}</span>
      </div>
  </div>
</template>

<script>
import { toRefs } from '@vue/reactivity'
export default {
    props: {
        queues: Object,
        page: Number
    },
    setup(props){
        const {queues, page} = toRefs(props);
        const qs = computed(_=>queue.pages[page]);
        return {qs}
    }
}
</script>

<style lang="scss" scoped>
.card-body {
    display: flex;
    flex-direction: column;
}
</style>