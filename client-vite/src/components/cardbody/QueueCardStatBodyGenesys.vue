<script setup>

import {useStore} from 'vuex'
const store = useStore();

const props = defineProps({
    title: String, 
    channel: String,
    department: String,
    country: String,
    area: String,
    daily: Object,
    program: String
})

function getResult(kpi){
    const data = props.channel ? store.state.genesysDailyStats.filter(a=>a.program === props.program && a.mediaType === props.channel) : []
    if (kpi === 'sl') {
        const num = data.reduce((acc, cur)=>{
            return acc + cur.serviceLevelStats.numerator
        }, 0)
        const den = data.reduce((acc, cur)=>{
            return acc + cur.serviceLevelStats.denominator
        }, 0)
        return den === 0? '-' : Math.round(num/den*100) + '%'
    }
    else if (kpi === 'offered') return data.reduce((acc, cur)=>acc+cur.offered, 0)
    else if (kpi === 'answered') return data.reduce((acc, cur)=>acc+cur.answered, 0)
    else if (kpi === 'aht') {
        const num = data.reduce((acc, cur)=>{
            return acc + cur.handleTime / 1000
        }, 0)
        const den = data.reduce((acc, cur)=>{
            return acc + cur.handled
        }, 0)
        return den === 0? '-' : Math.round(num/den) + 's'
    }
}
 
</script>

<template>
    <div class="card-body">
        <span class="large-ban" :title="channel === 'email' ? 'OnTime' : 'Service level'">
            {{ getResult('sl') }}
        </span>
        <div class="bottom">
            <div>
                <span class="small-ban">{{ getResult('offered') }}</span>
                <span class="label">Offered</span>
            </div>
            <div>
                <span class="small-ban">{{ getResult('answered') }}</span>
                <span class="label">Answered</span>
            </div>
            <div>
                <span class="small-ban">{{ getResult('aht') }}</span>
                <span class="label">AHT</span>
            </div>
        </div>
    </div>
</template>



<style lang="scss" scoped>
.card .card-body {
    position: relative;
    padding: 0.5rem;
    display: grid;
    grid-template-rows: 3fr 1fr;
    grid-template-columns: 1fr;
    align-items: center;
    .bottom {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }
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
</style>