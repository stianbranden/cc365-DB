<template>
  <div class="card">
    <div class="card-header">
        <span>{{title}}</span>
        <font-awesome-icon :icon="icon" />
    </div>
    <div class="card-body" v-if="queue.queues.length">
        <span class="large-ban" :class="{'reduce-size': queue.summary.inQueue>999}">
            {{queue.summary.inQueue}}
        </span>
        <div class="bottom">
            <span class="small-ban">{{queue.summary.timeWait}}</span>
            <span class="label">max wait</span>
        </div>
    </div>
    <div class="card-body" v-else>
        <span>Loading...</span>
    </div>
    </div>
</template>

<script>
import {useStore} from 'vuex'
import { toRefs, computed, ref, watch } from '@vue/runtime-core';
export default {
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

        const store = useStore();
        const ping = computed(_=>store.state.lastPing)
        const queue = ref(store.getters.getQueueData
            (channel.value, department.value, country.value, area.value))

        watch(
            ping, 
            _=>{
                queue.value = store.getters.getQueueData
                    (channel.value, department.value, country.value, area.value);
            }
        ) 


        return {store, queue, icon}

    }

}
</script>

<style lang='scss'>
.card {
    border-radius: 0.5rem;
    box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
    background-color: var(--cardbgcolor);
    width: 200px;
    margin: 2rem;
    .card-body {
        min-height: 160px;
        position: relative;
        padding: 0.5rem;
        display: grid;
        grid-template-rows: 3fr 1fr;
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
    }
    .card-header {
        border-radius: 0.5rem 0.5rem 0 0;
        position: relative;
        background-color: var(--headercolor);
        color: white;
        padding: 0.5rem;
        svg {
        position: absolute;
        right: 0.5rem;
        }
    }
}
</style>