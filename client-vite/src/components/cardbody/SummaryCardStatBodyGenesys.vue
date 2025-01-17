<script setup>
import {useStore} from 'vuex'
import Logo from '../Logo.vue'

const props = defineProps( {
    title: String, 
    channel: String,
    department: String,
    country: String,
    area: String,
    program: String
})
const store = useStore();

function getChannels(part = 0){
  const channels = []
  store.state.genesysQueueStatus.filter(a=>a.program === props.program).forEach(q=>{
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

function getIcon(key){
    let icon = null
    switch (key) {
        case 'voice':
            icon = 'phone-alt'
            break;
        case 'chat':
            icon = 'comments'
            break;
        case 'email':
            icon = 'envelope'
            break;
        case 'callback':
            icon = 'phone-volume'
            break;
    
        default:
            break;
    }
    return icon
}

function getResult(kpi, channel, country){
    const data = channel ? store.state.genesysDailyStats.filter(a=>a.program === props.program && a.mediaType === channel) : []
    if (kpi === 'sl') {
        const num = data.reduce((acc, cur)=>{
            return acc + cur.serviceLevelStats.numerator
        }, 0)
        const den = data.reduce((acc, cur)=>{
            return acc + cur.serviceLevelStats.denominator
        }, 0)
        return den === 0? '-' : Math.round(num/den*100) + '%'
    }
    else if (kpi === 'offered') return data.reduce((acc, cur)=>acc+cur.offered, 0)
    else if (kpi === 'answered') return data.reduce((acc, cur)=>acc+cur.answered, 0)
}




</script>

<template>
    <div class="card-body stats">
        <div class="stat-row" v-for="channel in getChannels()" :key="channel">
            <span v-if="getIcon(channel)">
                <font-awesome-icon :icon="getIcon(channel)" />
            </span>
            <span>
                <span class="label">{{ channel ==='email' ? 'OnTime' : 'SL' }}</span>
                <span class="result bigger">{{ getResult('sl', channel) }}</span>
            </span>
            <span>
                <span class="label">Offered</span>
                <span class="result bigger">{{ getResult('offered', channel) }}</span>
            </span>
            <span>
                <span class="label">Answered</span>
                <span class="result bigger">{{ getResult('answered', channel) }}</span>
            </span>

        </div>
        <!-- <div class="stat-row" v-for="key in keys" :key="key">
            <span v-if="getIcon(key)">
                <font-awesome-icon :icon="getIcon(key)" />
            </span>
            <Logo :department="key" v-else />
             <span v-if="key === 'em' || key === 'ac'">
                <span class="label">ASA</span>
                <span class="result bigger">{{daily[key].summary.timeAsa}}</span>
            </span>
             <span v-else>
                <span class="label">SLA</span>
                <span class="result bigger">{{daily[key].summary.sla}}%</span>
            </span>
            <span>
                <span class="label">Offered</span>
                <span class="result">{{daily[key].summary.offered}}</span>
            </span>
            <span>
                <span class="label">Answered</span>
                <span class="result">{{daily[key].summary.answered}}</span>
            </span>
        </div> -->
        
    </div>
</template>



<style lang="scss" scoped>
.card.summarycard {
    .card-body {
        &.stats {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            .stat-row {
                display: flex;
                flex-direction: row;
                width: 100%;
                justify-content: space-between;
                align-items: center;
                > span {
                    display: flex;
                    flex-direction: column;
                    .bigger {
                        font-size: 1.2rem;
                    }
                }
            }
        }
        overflow: hidden;
        position: relative;
        padding: 0.5rem;
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr 1fr;
        align-items: center;
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
}
</style>