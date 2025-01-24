<script setup>
import {useStore} from 'vuex'

const props = defineProps({
    program: String,
    country: String
})
const store = useStore();

function getQueue(channel, country){
    let arr = store.state.genesysQueueStatus.filter(a=>a.program === props.program)

    if (channel) arr = arr.filter(a=>a.mediaType === channel)
    if (country) arr = arr.filter(a=>a.country===country)
    const queue =  arr.reduce((acc, cur)=>{
            acc += cur.waiting
            return acc
        }, 0)
    return queue
}

function getChannels(part = 0){
  const channels = []
  let arr = store.state.genesysQueueStatus.filter(a=>a.program === props.program)
  if ( props.country ) arr = arr.filter(a=>a.country===props.country)
  arr.forEach(q=>{
    if (!channels.includes(q.mediaType)) channels.push(q.mediaType)
  })
  if (part === 1 ) return channels.sort(channelSorter).slice(0,Math.ceil(channels.length / 2))
  else if (part === 2 ) return channels.sort(channelSorter).slice(Math.ceil(channels.length / 2))
  else return channels.sort(channelSorter)
}

function channelSorter(a,b){
    const dir = ['voice','callback','chat','email']
    return dir.indexOf(a) - dir.indexOf(b)
}

function spanDouble(channel){
    const channels = getChannels()
    if (channels.length%2 === 1 && channels[channels.length-1] === channel) return true
    return false
}

</script>

<template>
    <div class="card-body" v-if="program !== 'Premium Support Technical Helpdesk'">
        <div v-for="channel in getChannels()" :key="channel" :class="{'span-double': spanDouble(channel)}">
            <span 
                class="large-ban"
                :class="{'reduce-size': getQueue(channel)>999}"
            >{{getQueue(channel)}}</span>
            <span class="small-ban">{{channel}}</span>
        </div>
    </div>
    <div class="card-body" v-else>
        <div v-for="country in ['Denmark', 'Finland', 'Norway', 'Sweden']" :key="country">
            <span 
                class="large-ban"
                :class="{'reduce-size': getQueue(null, country.toLowerCase())>999}"
            >{{getQueue(null, country.toLowerCase())}}</span>
            <span class="small-ban">{{country}}</span>
        </div>
    </div>
</template>




<style lang="scss" scoped>
.card-body {
        overflow: hidden;
        position: relative;
        padding: 0.5rem;
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        .span-double {
            grid-column: 1 / 3;
        }
        .large-ban, .small-ban {
            display: block;
        }
        .large-ban {
        font-size: 2rem;
            &.reduce-size {
                font-size: 2rem;
            }
        }
        .small-ban {
            font-size: 0.6rem;
        }
        .label {
            text-transform: uppercase;
            font-size: 0.6rem;
        }
    }
</style>