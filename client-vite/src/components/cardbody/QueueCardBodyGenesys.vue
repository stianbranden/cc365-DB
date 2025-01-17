<script setup>
import {useStore} from 'vuex'
import moment from 'moment'
import { ref } from 'vue';

const props = defineProps({
    title: String,
    program: String,
    channel: String,
    department: String,
    country: String,
    area: String,
})
const store = useStore();
// const oldest = ref(null)
const longestWaiting = ref('-')
function updateLongestWaiting(){
    const now = moment().format()
    const oldest = getValue('longestWaiting', now)
    if ( oldest === now ) longestWaiting.value =  '0s'
    else longestWaiting.value =  sToTime(moment(now).diff(moment(oldest), 'seconds'))
}
updateLongestWaiting()
setInterval(updateLongestWaiting, 1000)

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

function getValue(value, def=0){
    let  arr = []
    if (props.channel) arr = store.state.genesysQueueStatus.filter(a=>a.program === props.program && a.mediaType === props.channel)
    else arr = store.state.genesysQueueStatus.filter(a=>a.program === props.program && a.country === props.country)
    const data =  arr.reduce((acc, cur)=>{
        if ( value === 'waiting') acc += cur.waiting
        if ( value === 'idleMin') acc = cur.idle < acc ? cur.idle : acc
        if ( value === 'idleMax') acc = cur.idle > acc ? cur.idle : acc
        if ( value === 'readyMin') acc = cur.onQueue < acc ? cur.onQueue : acc
        if ( value === 'readyMax') acc = cur.onQueue > acc ? cur.onQueue : acc
        if ( value === 'longestWaiting') acc = cur.oldest && cur.oldest < acc ? cur.oldest : acc
        return acc
    }, def)
    return data
}
</script>

<template>
    <div class="card-body">
        <span class="large-ban" :class="{'reduce-size': getValue('waiting')>999}">
            {{getValue('waiting')}}
        </span>
        <div class="bottom">
            <div class="idle">
                <span class="small-ban">{{getValue('idleMin', 1000)}}/{{getValue('idleMax')}}</span>
                <span class="label">Idle agents</span>
            </div>
            <div class="ready">
                <span class="small-ban">{{getValue('readyMin', 1000)}}/{{getValue('readyMax')}}</span>
                <span class="label">ready agents</span>
            </div>
            <div class="wait">
                <span class="small-ban">{{longestWaiting}}</span>
                <span class="label">max wait</span>
            </div>
        </div>
    </div>
</template>



<style lang="scss" scoped>
.card .card-body {
    position: relative;
    padding: 0.5rem;
    display: grid;
    grid-template-rows: 3fr 1fr;
    grid-template-columns: 1fr;
    align-items: center;
    .large-ban, .small-ban {
    display: block;
    }
    .large-ban {
    font-size: 6rem;
        &.reduce-size {
            font-size: 4rem;
        }
    }
    .label {
        text-transform: uppercase;
        font-size: 0.6rem;
    }
    .bottom {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
}
</style>