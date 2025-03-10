<script setup>
import {useStore} from 'vuex'
import { toRefs, computed, ref, watch } from '@vue/runtime-core';
import Logo from './Logo.vue';
import QueueCardBodyGenesys from './cardbody/QueueCardBodyGenesys.vue'
import SummaryCardStatBodyGenesys from './cardbody/SummaryCardStatBodyGenesys.vue'
import SummaryCardBodyGenesys from './cardbody/SummaryCardBodyGenesys.vue'
import DeliveryDeviationCardBody from './cardbody/DeliveryDeviationCardBody.vue'

const props = defineProps({
    title: String, 
    program: String,
    country: String
})
const store = useStore();
let page = ref('menu')
let startpage = 'menu'
// let channelPages = ref(0);
function statClick(){
    if (page.value == 'stat') page.value = startpage
    else page.value = 'stat'
}
// const {department} = toRefs(props);
// const ping = computed(_=>store.state.lastPing)

// updateData();

// watch(
//     ping, 
//     updateData
// ) 
// function updateData() {
//     // queue.value = store.getters.getSummaryData(department.value);
//     // channelPages.value = countChannelPages(queue)
//     // daily.value = store.getters.getSummaryDaily(department.value)
// }

function getChannels(part = 0){
  const channels = []
  if ( props.country ){
      store.state.genesysQueueStatus.filter(a=>a.program === props.program && a.country === props.country).forEach(q=>{
        if (!channels.includes(q.mediaType)) channels.push(q.mediaType)
      })
  }
  else  {
      store.state.genesysQueueStatus.filter(a=>a.program === props.program).forEach(q=>{
        if (!channels.includes(q.mediaType)) channels.push(q.mediaType)
      })
  }
  if (part === 1 ) return channels.sort(channelSorter).slice(0,Math.ceil(channels.length / 2))
  else if (part === 2 ) return channels.sort(channelSorter).slice(Math.ceil(channels.length / 2))
  else return channels.sort(channelSorter)
}

function channelSorter(a,b){
    const dir = ['voice','callback','message','email']
    return dir.indexOf(a) - dir.indexOf(b)
}


function getIcon(ch){
    if (ch === 'voice') return 'phone-alt'
    if (ch === 'message') return 'comments'
    if (ch === 'email') return 'envelope'
    if (ch === 'callback') return 'phone-volume'
    if (ch === 'dk') return 'dk'
    if (ch === 'fi') return 'fi'
    if (ch === 'no') return 'no'
    if (ch === 'se') return 'se'
    return 'bars'
}

</script>

<template>
    <div class="card summarycard">

        <div class="card-header">

            <span>{{title}}</span>
            <span class="icon" @click="statClick" :class="{active: page=='stat'}">
                <font-awesome-icon icon="chart-bar" />  
            </span>
        </div>
        <transition name="slide-fade" mode="out-in">
            <SummaryCardBodyGenesys :program="props.program" :country="props.country" v-if="page === 'menu'"/>
            <QueueCardBodyGenesys v-else-if="page === 'voice'" :program="props.program" :country="props.country" channel="voice" />
            <QueueCardBodyGenesys v-else-if="page === 'callback'" :program="props.program" :country="props.country" channel="callback" />
            <QueueCardBodyGenesys v-else-if="page === 'message'" :program="props.program" :country="props.country" channel="message" />
            <QueueCardBodyGenesys v-else-if="page === 'email'" :program="props.program" :country="props.country" channel="email" />
            <QueueCardBodyGenesys v-else-if="page === 'dk'" :program="props.program" country="Denmark" channel="voice" />
            <QueueCardBodyGenesys v-else-if="page === 'fi'" :program="props.program" country="Finland" channel="voice" />
            <QueueCardBodyGenesys v-else-if="page === 'no'" :program="props.program" country="Norway" channel="voice" />
            <QueueCardBodyGenesys v-else-if="page === 'se'" :program="props.program" country="Sweden" channel="voice" />
            <SummaryCardStatBodyGenesys v-else-if="page=='stat'" :program="props.program" :country="props.country" /> 
       
        </transition>


        <div class="card-menu" v-if="getChannels().length > 1 && program !== 'Premium Support Technical Helpdesk'">
            <div v-for="ch in getChannels(1)" :key="ch" @click="page=ch" :class="{active: page==ch}" :title="ch">
                <font-awesome-icon :icon="getIcon(ch)" />
            </div>
            <div @click="page='menu'" :class="{active: page=='menu'}">
                <font-awesome-icon icon="th-large" />
            </div>
            <div v-for="ch in getChannels(2)" :key="ch" @click="page=ch" :class="{active: page==ch}" :title="ch">
                <font-awesome-icon :icon="getIcon(ch)" />
            </div>
        </div>
        <div class="card-menu" v-else>
            <div @click="page='dk'" :class="{active: page=='dk'}">
                <Logo department="dk" />   
            </div>
            <div @click="page='fi'" :class="{active: page=='fi'}">
                <Logo department="fi" />   
            </div>
            <div @click="page='menu'" :class="{active: page=='menu'}">
                <font-awesome-icon icon="th-large" />
            </div>
            <div @click="page='no'" :class="{active: page=='no'}">
                <Logo department="no" />   
            </div>
            <div @click="page='se'" :class="{active: page=='se'}">
                <Logo department="se" />   
            </div>
        </div>
    </div>

    
</template>


<style lang="scss">
.card.summarycard {
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
        }
    }
    .card-menu {
        justify-content: space-around;
        div {
            cursor: pointer;
            &:hover, &.active {
                color: var(--cardmenuhovercolor);
                .flag {
                    background-color: var(--cardmenuhovercolor);
                }
            }
            &.flag {
                padding: 0.1rem;
            }
        }
            
    }
    .slide-fade-enter-active {
        transition: all 0.3s ease-out;
    }

    .slide-fade-leave-active {
        transition: all 0.3s ease-in;
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