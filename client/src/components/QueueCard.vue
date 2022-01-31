<template>
    <div class="card queuecard" v-if="queue.queues.length">
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
            <queue-card-body :queue="queue" :department="department" :channel="channel" v-if="queue.queues.length && page==-1" />
            <queue-card-stat-body :daily="daily" :channel="channel" :department="department" v-else-if="page == -2" />
            <queue-card-page-body :pages="queue.pages" :page="page" v-else-if="page>=0" />
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

<script>
import {useStore} from 'vuex'
import { toRefs, computed, ref, watch } from '@vue/runtime-core';
import QueueCardBody from './cardbody/QueueCardBody.vue'
import QueueCardStatBody from './cardbody/QueueCardStatBody.vue'
import QueueCardPageBody from './cardbody/QueueCardPageBody.vue'
export default {
    components: {QueueCardBody, QueueCardPageBody, QueueCardStatBody},
    props: {
        title: String, 
        channel: String,
        department: String,
        country: String,
        area: String
    },
    setup(props) {
        const {channel, department, country, area} = toRefs(props);
        //console.log({channel: channel.value, department: department.value, country: country.value, area: area.value});
        let icon = 'phone-alt';
        switch (channel.value) {
            case 'CH':
                icon = 'comments'
                break;
            case 'EM':
                icon = 'envelope'
                break;
            case 'AC':
                icon = 'folder'
                break
            default:
                break;
        }
        const page = ref(-1)
        function newPage(i) {
            if (page.value+i === queue.value.pages.length) page.value = -1;
            else if ( page.value+i == -2) page.value = queue.value.pages.length-1
            else page.value += i
        }
        function statClick(){
            if (page.value === -2) page.value = -1
            else page.value = -2
        }

        const store = useStore();
        const ping = computed(_=>store.state.lastPing)
        const queue = ref(store.getters.getQueueData
            (channel.value, department.value, country.value, area.value))
        const daily = ref(store.getters.getDailyData
            (channel.value, department.value, country.value, area.value))

        watch(
            ping, 
            updateData
        )

        watch(
            [channel, department, country, area],
            updateData
        )

        function updateData(){
            queue.value = store.getters.getQueueData
                    (channel.value, department.value, country.value, area.value);
            daily.value = store.getters.getDailyData
                (channel.value, department.value, country.value, area.value)
        }


        return {store, queue, icon, page, newPage, daily, statClick}

    }

}
</script>

<style lang='scss'>
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