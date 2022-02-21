<template>
  <div class="card-body">
        <div class="card-row header">
            <span class="name">Name</span>
            <span class="queue">Queue</span>
            <span class="oldest">Idle/Ready</span>
            <span class="time">Oldest</span>
        </div>
        <div class="card-row" v-for="queue in pages[page]" :key="queue.id" >
            <span class="name" :title="queue.name">{{shortName(queue.name)}}</span>
            <span class="queue">{{queue.inQueueCurrent}}</span>
            <span class="oldest">{{queue.agentsFree}}/{{queue.agentsServing - queue.agentsNotReady}}</span>
            <span class="time">{{queue.timeWait}}</span>
        </div>
  </div>
</template>

<script>

export default {
    props: {
        page: Number,
        pages: Object
    }, setup (){
        const shortName = name =>{
            let short = name
            if (name.startsWith('@')) short = name.slice(2)
            if (name.startsWith('Action')) short = name.slice(7)

            if (short.startsWith('Kitchen')) short = short.slice(8)
            return short
        }
        return {shortName}
    }
}
</script>

<style lang="scss" scoped>
.card-body {
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