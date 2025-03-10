<script setup>
import {useStore} from 'vuex'
import { toRefs, computed, ref, watch } from '@vue/runtime-core';
import QueueCardBodyGenesys from './cardbody/QueueCardBodyGenesys.vue'
import QueueCardStatBodyGenesys from './cardbody/QueueCardStatBodyGenesys.vue'
import QueueCardPageBodyGenesys from './cardbody/QueueCardPageBodyGenesys.vue'

const store = useStore();
const props = defineProps( {
        title: String, 
        channel: String,
        department: String,
        country: String,
        area: String,
        program: String
    })
const {channel, department, country, area} = toRefs(props);
//console.log({channel: channel.value, department: department.value, country: country.value, area: area.value});
let icon = 'phone-alt';
switch (channel.value) {
    case 'chat':
        icon = 'comments'
        break;
    case 'email':
        icon = 'envelope'
        break;
    case 'callback':
        icon = 'phone-volume'
        break
    default:
        break;
}
const page = ref(-1)
const pageSize = 5
function newPage(i) {
    const newPage = page.value + i
    if ( newPage * pageSize > queues.value.length ) page.value = -1
    else if (newPage <= -2 ) page.value = -1
    // else if (newPage === -1 ) page.value = -2
    else page.value = newPage


    // if (page.value+i === queue.value.pages.length) page.value = -1;
    // else if ( page.value+i == -2) page.value = queue.value.pages.length-1
    // else page.value += i
}
function statClick(){
    if (page.value === -2) page.value = -1
    else page.value = -2
}

const queues = computed(_=>{
    let qs = store.state.genesysQueueStatus.filter(a=>a.program === props.program)
    if (props.channel) qs = qs.filter(a=> a.mediaType === props.channel)
    if( props.country) qs = qs.filter(a=>a.country === props.country)
        
    return qs.map(a=>a.queue).sort((a,b)=>a.localeCompare(b))
})

// const ping = computed(_=>store.state.lastPing)
// const queue = ref(store.getters.getQueueData
//     (channel.value, department.value, country.value, area.value))
// const daily = ref(store.getters.getDailyData
//     (channel.value, department.value, country.value, area.value))

// watch(
//     ping, 
//     updateData
// )

// watch(
//     [channel, department, country, area],
//     updateData
// )

// function updateData(){
//     queue.value = store.getters.getQueueData
//             (channel.value, department.value, country.value, area.value);
//     daily.value = store.getters.getDailyData
//         (channel.value, department.value, country.value, area.value)
// }

//New Genesys stuff

function getQueues(){
    const start = page.value * pageSize;
    const end = start + pageSize;
    return queues.value.slice(start, end);
}

</script>

<template>
<div class="card queuecard">
    <div class="card-header">
        <div class="flag">        
            <font-awesome-icon :icon="icon" />
        </div>
        <span class="title">{{title}}</span>
        <span class="icon" @click="statClick" :class="{active: page==-2}">
            <font-awesome-icon icon="chart-bar" />  
        </span>
    </div>
    <transition name="slide-fade" mode="out-in">
        <QueueCardBodyGenesys :program="program" :channel :country v-if="page==-1" />
        <QueueCardStatBodyGenesys :program="program" :channel :country v-else-if="page == -2" />
        <QueueCardPageBodyGenesys :queues="getQueues()" :channel :country v-else-if="page>=0" />
        <div class="card-spinner" v-else>
            <span>Loading...</span>
        </div>
    </transition>
    <div class="card-menu">
        <div @click="newPage(-1)"><font-awesome-icon icon="angle-left" /></div>
        <div @click="newPage(1)"><font-awesome-icon icon="angle-right" /></div>
    </div>
</div>

</template>



<style lang='scss' scoped>
.card.queuecard {

    .card-spinner {
        min-height: 185px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .card-header {
        .icon {
            &:hover, &.active {
                color: $secondary-brand-color;
            }
            cursor: pointer;
            position: absolute;
            right: 0.65rem;
        }
        .flag {
            position: absolute;
            left: 0.65rem;
            color: var(--iconcolor);
        }
        .title {
            text-transform: capitalize;
        }
    }
    .card-menu {
        justify-content: space-between;

        div {
            cursor: pointer;
            &:hover, &.active {
                color: var(--cardmenuhovercolor);
            }
        }
            
    }
    .slide-fade-enter-active {
        transition: all 0.3s ease-out;
    }

    .slide-fade-leave-active {
        transition: all 0.3s ease-in; //cubic-bezier(1, 0.5, 0.8, 1);
    }

    .slide-fade-enter-from{
        transform: translateY(30%);
        opacity: 0;
    }
    .slide-fade-leave-to  {
        transform: translateY(-30%);
        opacity: 0;
    }
}
</style>