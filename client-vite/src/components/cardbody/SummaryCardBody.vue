<template>
    <div class="card-body" v-if="department !== 'thd'"> 
        <div v-if="queue.data.ph.queues.length" :class="{'span-double': queue.data.ch.queues.length == 0}">
            <span 
                class="large-ban"
                :class="{'reduce-size': queue.data.ph.summary.inQueue>999}"
            >{{queue.data.ph.summary.inQueue}}</span>
            <span class="small-ban">Phone</span>
        </div>
        <div v-if="queue.data.ch.queues.length" :class="{'span-double': queue.data.ph.queues.length == 0}">
            <span 
                class="large-ban"
                :class="{'reduce-size': queue.data.ch.summary.inQueue>999}"
            >{{queue.data.ch.summary.inQueue}}</span>
            <span class="small-ban">Chat</span>
        </div>
        <div v-if="queue.data.em.queues.length" :class="{'span-double': queue.data.ac.queues.length == 0}">
            <span 
                class="large-ban"
                :class="{'reduce-size': queue.data.em.summary.inQueue>999}"
            >{{queue.data.em.summary.inQueue}}</span>
            <span class="small-ban">Email</span>
        </div>
        <div v-if="queue.data.ac.queues.length" :class="{'span-double': queue.data.em.queues.length == 0}">
            <span 
                class="large-ban"
                :class="{'reduce-size': queue.data.ac.summary.inQueue>999}"
            >{{queue.data.ac.summary.inQueue}}</span>
            <span class="small-ban">Action</span>
        </div>
    </div>
    <div class="card-body" v-else>
        <div v-for="key in Object.keys(queue.data)" :key="key">
            <span class="large-ban" :class="{'reduce-size': queue.data[key].summary.inQueue>999}" >
                {{queue.data[key].summary.inQueue}}
            </span>
            <span class="small-ban">{{getCountryName(key)}}</span>
        </div>
    </div>
</template>

<script>
import {useStore} from 'vuex'
import { toRefs, computed, ref, watch } from '@vue/runtime-core'

export default {
    components: {},
    props: {
        title: String, 
        channel: String,
        department: String,
        country: String,
        area: String
    },
    setup(props){
        const store = useStore();
        const {department} = toRefs(props);
        const ping = computed(_=>store.state.lastPing)
        const queue = ref(store.getters.getSummaryData(department.value));
       
        watch(
            ping, 
            _=>{
                queue.value = store.getters.getSummaryData(department.value);
            }
        ) 

        function getCountryName(key){
            switch (key) {
                case 'dk':
                    return 'Denmark'
                case 'fi':
                    return 'Finland'
                case 'no':
                    return 'Norway'
                case 'se': 
                    return 'Sweden' 
                default:
                    return key
            }
        }
       
        return {store, queue, getCountryName}
    }
}
</script>


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