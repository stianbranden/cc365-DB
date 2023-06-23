<template>
    <div class="queue-box">
        <div class="queue-header">
            QUEUES
        </div>
        <div class="channels">
            <div
                class="queue"
                v-for="(q, key, index) in queue"
                :key="key"
            >
                <h1>{{q.summary.inQueue}}</h1>
                <h5>{{getChannelName(key).toUpperCase()}}</h5>
            </div>
        </div>
    </div>
</template>

<script setup>
import {useStore} from 'vuex';
import {ref, computed, watch} from 'vue'
const queue = ref(null)

const store = useStore()
const ping = computed(_=>store.state.lastPing)

function updateData() {
    if (store.state.agent.departmentName) queue.value = store.getters.getSummaryData(getDepartment(store.state.agent.departmentName)).data;
}
function getChannelName(abv){
    const channels = {
        ac: 'Action',
        ph: 'Phone',
        ch: 'Chat',
        em: 'Email'
    }
    return channels[abv]
}

function getDepartment(department) {
    const dep = {
        norway: 'no',
        denmark: 'dk',
        finland: 'fi',
        sweden: 'se'
    }
    return dep[department.toLowerCase()]
}

watch(ping, updateData)
</script>

<style lang="scss" scoped>

// @include tablet {
//     min-width: 80%;
//     height: 200px;
// }
// @include small {
//     min-width: 80%;
// }
// @include large {
//     min-width: 1100px;
// }
// @include tv {
//     height: 875px;
//     min-width: 16%;
// }

.queue-box {
    height: 875px;
    min-width: 80%;
    @include tablet {
        height: 200px;
    }
    @include large {
        min-width: 1100px;
    }
    @include tv {
        height: 875px;
        min-width: 10%;
    }
    .queue-header {
        position: relative;
        background-color: var(--headercolor);
        color: var(--linkcolor);
        padding: 0.5rem;
        height: 30px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        @include tv {
            height: 50px;
        }
    }
    .channels {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        height: 80%;
        @include tablet {
            flex-direction: row;
        }
        @include tv {
            flex-direction: column;
            height: 95%;
        }

        .queue {
            margin-inline: auto;
            border: 1px var(--textcolor) solid;
            width: 120px;
            height: 120px;
            border-radius: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            
            h1 {
                font-size: 3rem;
            }
        }
    }
}
</style>