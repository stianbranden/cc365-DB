<template>
    <div class="queue-box" :style="getStyle()">
        <div
            class="queue"
            v-for="(q, key, index) in queue"
            :key="key"
        >
            <h1>{{q.summary.inQueue}}</h1>
            <h5>{{getChannelName(key).toUpperCase()}}</h5>
        </div>
    </div>
</template>

<script setup>
import {useStore} from 'vuex';
import {ref, computed, watch} from 'vue'
const props = defineProps({
    height: Number
})

const queue = ref(null)

const store = useStore()
const ping = computed(_=>store.state.lastPing)

function updateData() {
    if (store.state.agent.program != 'n/a') queue.value = store.getters.getSummaryData(getDepartmentFromProgram(store.state.agent.program)).data;
}

function getStyle(){
    return "height: " + props.height + "px;"
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

function getDepartmentFromProgram(program){
    const dep = {
        "[GS NO]": 'no',
        "[GS DK]": 'dk',
        "[GS FI]": 'fi',
        "[GS SE]": 'se',
        "[PS THD]": 'thd',
        "[PS K&I]": 'ki'
    }
    return dep[program]
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
updateData()
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
    height: 175px;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    @include medium {
        height: auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        // height: 875px;
        // min-width: 80%;
    }

    .queue {
        margin-inline: auto;
        border: 1px var(--textcolor) solid;
        width: 100px;
        height: 100px;
        @include small {
            width: 150px;
            height: 150px;
        }
        @include large {
            width: 175px;
            height: 175px;
        }
        @include tv {
            width: 250px;
            height: 250px;
        }
        border-radius: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        
        h1 {
            font-size: 2.5rem;
            @include large {
                font-size: 3.5rem;
            }
        }
    }
}
</style>