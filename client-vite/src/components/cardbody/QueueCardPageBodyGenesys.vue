<script setup>

import {useStore} from 'vuex'
import moment from 'moment'
import { ref } from 'vue';


const store = useStore();

const props = defineProps({
    queues: Array,
    channel: String,
    country: String
})
const shortName = name =>{
    let short = name
    if (name.startsWith('@')) short = name.slice(2)
    if (name.startsWith('Action')) short = name.slice(7)

    if (short.startsWith('Kitchen')) short = short.slice(8)
    return short
}


const longestWaiting = ref(['0s', '0s', '0s', '0s', '0s'])
setInterval(_=>{
    for (let i = 0; i < props.queues.length; i++) {
        const now = moment().format()
        const oldest = getValue(props.queues[i], 'longestWaiting', now, i)
        if ( oldest === now ) longestWaiting.value[i] =  '0s'
        else longestWaiting.value[i] =  sToTime(moment(now).diff(moment(oldest), 'seconds'))
    }
}, 1000)

function sToTime(s){
  if ( s < 100 ) return s+'s'
  else if ( s < 600 ){
      let m = Math.floor(s/60);
      s = s - (m * 60);
      if ( s < 10 ) return m + ':0' + s;
      else return m + ':' + s;
  }
  else if ( s < 3600 ) return Math.round(s/60) + 'm'
  else if ( s < 259200 ) return Math.round(s/3600) + 'h'
  return Math.round(s/86400) + 'd'
}

function getValue(queue, value, def=0){
    const arr =  store.state.genesysQueueStatus.filter(a=>a.queue === queue && a.mediaType === props.channel)
    const data =  arr.reduce((acc, cur)=>{
        if ( value === 'waiting') acc += cur.waiting
        if ( value === 'idleMin') acc = cur.idle < acc ? cur.idle : acc
        if ( value === 'idleMax') acc = cur.idle > acc ? cur.idle : acc
        if ( value === 'idle') acc = cur.idle > acc ? cur.idle : acc
        if ( value === 'readyMin') acc = cur.onQueue < acc ? cur.onQueue : acc
        if ( value === 'readyMax') acc = cur.onQueue > acc ? cur.onQueue : acc
        if ( value === 'ready') acc = cur.onQueue > acc ? cur.onQueue : acc
        if ( value === 'longestWaiting') acc = cur.oldest && cur.oldest < acc ? cur.oldest : acc
        return acc
    }, def)
    return data
}   

</script>

<template>
  <div class="card-body">
        <div class="card-row header">
            <span class="name">Name</span>
            <span class="queue">Queue</span>
            <span class="oldest">Idle/Ready</span>
            <span class="time">Oldest</span>
        </div>
        <div class="card-row" v-for="(queue, index) in queues" :key="queue" >
            <span class="name" :title="queue">{{ queue }}</span>
            <span class="queue">{{getValue(queue, 'waiting')}}</span>
            <span class="queue">{{getValue(queue, 'idle')}}/{{getValue(queue, 'ready')}}</span>
            <span class="time">{{longestWaiting[index]}}</span>

            <!-- <span class="name" :title="queue.name">{{shortName(queue.name)}}</span>
            <span class="oldest">{{queue.agentsFree}}/{{queue.agentsServing - queue.agentsNotReady}}</span>
            -->
        </div>
  </div>
</template>



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