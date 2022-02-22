<template>
    <div class="card queue-card" title="User defined queue card">
        <div class="card-header">
            <div class="flag">
                <font-awesome-icon icon="user-cog" />
            </div>
            <span class="title">{{collection.name}}</span>
            <span class="icon" @click="statClick" :class="{active: page==-2}">
                <font-awesome-icon icon="chart-bar" />  
            </span>
        </div>
        <transition name="slide-fade" mode="out-in">
            <queue-card-body :queue="queue" v-if="page==-1" />
            <queue-card-stat-body :daily="daily" :channel="collection.channel" v-else-if="page==-2" />
            <queue-card-page-body :pages="queue.pages" :page="page" v-else-if="page>=0" />
        </transition>
        <div class="card-menu">
            <div @click="newPage(-1)"><font-awesome-icon icon="angle-left" /></div>
            <div @click="newPage(1)"><font-awesome-icon icon="angle-right" /></div>
        </div>
    </div>
</template>

<script setup>
import {computed, ref, watch} from 'vue'
import {useStore} from 'vuex'
import QueueCardBody from './cardbody/QueueCardBody'
import QueueCardStatBody from './cardbody/QueueCardStatBody'
import QueueCardPageBody from './cardbody/QueueCardPageBody'

const store = useStore()
const props = defineProps({collectionId: String})
const collection = store.getters.getCollection(props.collectionId)
const ping = computed(_=>store.state.lastPing)
const queue = ref(store.getters.getCollectionQueueData(collection.queues))
const daily = ref(store.getters.getCollectionDailyData(collection.queues))

const page = ref(-1)

watch(ping, updateQueues)

function updateQueues(){
    queue.value = store.getters.getCollectionQueueData(collection.queues)
    daily.value = store.getters.getCollectionDailyData(collection.queues)
}

function newPage(i) {
    if (page.value+i === queue.value.pages.length) page.value = -1;
    else if ( page.value+i == -2) page.value = queue.value.pages.length-1
    else page.value += i
}

function statClick(){
    if ( page.value === -1) page.value = -2
    else page.value = -1
}


</script>

<style lang="scss" scoped>
.card {
    border: 1px solid var(--activelinkcolor);
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
</style>