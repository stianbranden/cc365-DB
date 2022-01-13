<template>
  <div class="card-body">
        <div class="card-row header">
            <span class="name">Name</span>
            <span class="queue">Queue</span>
            <span class="oldest">Idle/Ready</span>
            <span class="time">Oldest</span>
        </div>
        <div class="card-row" v-for="queue in pages[page]" :key="queue.id" >
            <span class="name" :title="queue.name">{{queue.name}}</span>
            <span class="queue">{{queue.inQueueCurrent}}</span>
            <span class="oldest">{{queue.agentsFree}}/{{queue.agentsServing - queue.agentsNotReady}}</span>
            <span class="time">{{queue.timeWait}}</span>
        </div>
  </div>
</template>

<script>
import { toRefs } from '@vue/runtime-core'

export default {
    props: {
        page: Number,
        pages: Object
    }, setup (props){
        //let {pages} = toRefs(props)
        //console.log(pages.value[0][0]);
    }
}
</script>

<style lang="scss" scoped>
.card-body {
    height: 185px;
    padding: 0 0.5rem;
    
    display: grid;
    grid-template-rows: 1fr repeat(5, 2fr);
    
    
    .card-row {
        &.header{
            font-size: 0.7rem;
        }
        display: grid;
        grid-template-columns: 3fr repeat(3, 1fr);
        width: 100%;
        margin: auto 0;
        span {
            display: block;
        }
        .name {
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis
        }
    }
}
</style>