<template>
    <div class="card summarycard">
        <div class="card-header">

            <span>{{title}}</span>
            <span class="icon" @click="statClick" :class="{active: page=='stat'}">
                <font-awesome-icon icon="chart-bar" />  
            </span>
        </div>
        <transition name="slide-fade" mode="out-in">
            <summary-card-body v-if="page=='menu'" :department="department" />
            <QueueCardBody v-else-if="page=='phone'" :department="department" channel="PH" :queue="queue.data.ph" />
            <QueueCardBody v-else-if="page=='chat'" :department="department" channel="CH" :queue="queue.data.ch" />
            <QueueCardBody v-else-if="page=='email'" :department="department" channel="EM" :queue="queue.data.em" />
            <QueueCardBody v-else-if="page=='action'" :department="department" channel="AC" :queue="queue.data.ac" />
            <QueueCardBody v-else-if="page=='dk'" :department="department" channel="PH" :queue="queue.data.dk" />
            <QueueCardBody v-else-if="page=='fi'" :department="department" channel="PH" :queue="queue.data.fi" />
            <QueueCardBody v-else-if="page=='no'" :department="department" channel="PH" :queue="queue.data.no" />
            <QueueCardBody v-else-if="page=='se'" :department="department" channel="PH" :queue="queue.data.se" />
            
            <SummaryCardStatBody v-else-if="page=='stat'" :department="department" />
        </transition>


        <div class="card-menu" v-if="department !== 'thd'">
            <div @click="page='phone'" :class="{active: page=='phone'}" v-if="queue.data.ph.queues.length > 0">
                <font-awesome-icon icon='phone-alt'/>
            </div>
            <div @click="page='chat'" :class="{active: page=='chat'}" v-if="queue.data.ch.queues.length > 0">
                <font-awesome-icon icon='comments'/>
            </div>
            <div @click="page='menu'" :class="{active: page=='menu'}" v-if="channelPages != 1">
                <font-awesome-icon icon="th-large" />
            </div>
            <div @click="page='email'" :class="{active: page=='email'}"  v-if="queue.data.em.queues.length > 0">
                <font-awesome-icon icon='envelope' />
            </div>
            <div @click="page='action'" :class="{active: page=='action'}"  v-if="queue.data.ac.queues.length > 0">
                <font-awesome-icon icon='folder'/>
            </div>
        </div>
        <div class="card-menu" v-else>
            <div @click="page='dk'" :class="{active: page=='dk'}" v-if="queue.data.dk.queues.length > 0">
                <Logo department="dk" />
            </div>
            <div @click="page='fi'" :class="{active: page=='fi'}" v-if="queue.data.fi.queues.length > 0">
                <Logo department="fi" />
            </div>
            <div @click="page='menu'" :class="{active: page=='menu'}" v-if="channelPages != 1">
                <font-awesome-icon icon="th-large" />
            </div>  
            <div @click="page='no'" :class="{active: page=='no'}" v-if="queue.data.no.queues.length > 0">
                <Logo department="no" />
            </div>
            <div @click="page='se'" :class="{active: page=='se'}" v-if="queue.data.se.queues.length > 0">
                <Logo department="se" />
            </div>
        </div>
    </div>
</template>

<script>
import {useStore} from 'vuex'
import { toRefs, computed, ref, watch } from '@vue/runtime-core';
import Logo from './Logo';
import QueueCardBody from './cardbody/QueueCardBody'
import SummaryCardStatBody from './cardbody/SummaryCardStatBody'
import SummaryCardBody from './cardbody/SummaryCardBody'
export default {
    components: {Logo, QueueCardBody, SummaryCardStatBody, SummaryCardBody},
    props: {
        title: String, 
        channel: String,
        department: String,
        country: String,
        area: String
    },
    setup(props){
        const store = useStore();
        let page = ref('menu')
        let startpage = 'menu'
        let channelPages = ref(0);
        function statClick(){
            if (page.value == 'stat') page.value = startpage
            else page.value = 'stat'
        }
        const {department} = toRefs(props);
        const ping = computed(_=>store.state.lastPing)
        const queue = ref(null)
        const daily = ref(null)
        updateData();
       
        watch(
            ping, 
            updateData
        ) 
        function updateData() {
            queue.value = store.getters.getSummaryData(department.value);
            channelPages.value = countChannelPages(queue)
            daily.value = store.getters.getSummaryDaily(department.value)
        }

        function countChannelPages(queue){
            let i = 0;
            let l = null
            Object.keys(queue.value.data).forEach(ch=>{
                //console.log(ch);
                if (queue.value.data[ch].queues.length > 0) {
                    i++
                    l = ch;
                }
            })
            if ( i === 1 ){
                if ( l === 'ph') startpage = 'phone'
                if ( l === 'ch') startpage = 'chat'
                if ( l === 'em') startpage = 'email'
                if ( l === 'ac') startpage = 'action'
                if ( page.value === 'menu' ) page.value = startpage
            }
            return i;
        }
        return {store, queue, page, statClick, daily, channelPages}
    }
}
</script>

<style lang="scss">
.card.summarycard {
    height: fit-content;
    border-radius: 0.5rem;
    box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
    background-color: var(--cardbgcolor);
    width: 250px;
    margin: 2rem;
    .card-header {
        border-radius: 0.5rem 0.5rem 0 0;
        position: relative;
        background-color: var(--headercolor);
        color: white;
        padding: 0.5rem;
        height: 2rem;
        z-index: 2;
        .icon {
            &:hover, &.active {
                color: $secondary-brand-color;
            }
            cursor: pointer;
            position: absolute;
            right: 0.65rem;
            //top: 0.65rem;
        }
        .flag {
            position: absolute;
            left: 0.65rem;
        }
    }
    .card-menu {
        background-color: var(--cardmenucolor);
        height: 2rem;
        border-radius: 0 0 0.5rem 0.5rem;
        position: relative;
        display: flex;
        justify-content: space-around;
        align-items: center;
        color: white;
        z-index: 2;
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