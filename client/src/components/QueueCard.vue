<template>
  <div class="card queuecard">
    <div class="card-header">
        <div class="icon">        
            <font-awesome-icon :icon="icon" />
        </div>
        <span>{{title}}</span>
    </div>
    <transition name="slide-fade" mode="out-in">
        <queue-card-body :queue="queue" :department="department" :channel="channel" v-if="queue.queues.length && page==-1" />
        <queue-card-page-body :queue="queue" page=0 v-else-if="page==0" />
        <div class="card-spinner" v-else>
            <span>Loading...</span>
        </div> 
    </transition>
    <div class="card-menu">
        <div><font-awesome-icon icon="angle-left" /></div>
        <div><font-awesome-icon icon="angle-right" /></div>
    </div>
    </div>
</template>

<script>
import {useStore} from 'vuex'
import { toRefs, computed, ref, watch } from '@vue/runtime-core';
import QueueCardBody from './cardbody/QueueCardBody.vue'
import QueueCardPageBody from './cardbody/QueueCardPageBody.vue'
export default {
    components: {QueueCardBody, QueueCardPageBody},
    props: {
        title: String, 
        channel: String,
        department: String,
        country: String,
        area: String
    },
    setup(props) {
        const {channel, department, country, area} = toRefs(props);
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

        const store = useStore();
        const ping = computed(_=>store.state.lastPing)
        const queue = ref(store.getters.getQueueData
            (channel.value, department.value, country.value, area.value))
        //console.log(queue.value.pages);

        watch(
            ping, 
            _=>{
                queue.value = store.getters.getQueueData
                    (channel.value, department.value, country.value, area.value);
            }
        ) 


        return {store, queue, icon, page}

    }

}
</script>

<style lang='scss'>
.card.queuecard {
    border-radius: 0.5rem;
    box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
    background-color: var(--cardbgcolor);
    width: 200px;
    margin: 2rem;
    .card-spinner {
        min-height: 185px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .card-header {
        border-radius: 0.5rem 0.5rem 0 0;
        position: relative;
        background-color: var(--headercolor);
        color: white;
        padding: 0.5rem;
        .icon {
            position: absolute;
            left: 0.65rem;
            color: var(--iconcolor);
        }
    }
    .card-menu {
        background-color: var(--cardmenucolor);
        height: 2rem;
        border-radius: 0 0 0.5rem 0.5rem;
        position: relative;
        display: flex;
        justify-content: space-between;
        padding: 0 1rem;
        align-items: center;
        color: white;
        z-index: 2;
        div {
            cursor: pointer;
            &:hover, &.active {
                color: var(--cardmenuhovercolor);
            }
        }
            
    }
}
</style>