<template>
    <div class="card-body">
        <div class="total">
            <h3>
                {{delDev.summary.total}}
            </h3>
            <h5>Total delivery deviations</h5>
        </div>
        <div class="breached">
            <h3>
                {{delDev.summary.breached}}
            </h3>
            <h5>Breached delivery deviations</h5>
        </div>
        <div class="breaching">
            <h3>
                {{delDev.summary.breachingToday}}
            </h3>
            <h5>Breaching within 24hours</h5>
        </div>
    </div>
</template>


<script setup>
import { computed, ref, watch } from 'vue'
import {useStore} from 'vuex'

const store = useStore()
const props = defineProps({department: String})
const department = props.department
const ping = computed(_=>store.state.lastPing)
const delDev = ref(null)


watch(ping, update)
function update(){
    delDev.value = store.getters.getDeliveryDeviations(department)
}
update()

console.log({department, delDev});

</script>


<style lang="scss" scoped>
.card-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-template-areas: 
        "total total"
        "breached breaching";
    .total {grid-area: total;}
    .breached {grid-area: breached;}
    .breaching {grid-area: breaching;}
    > div {
        display: flex;
        flex-direction:column;
        justify-content: center;
        //align-items: flex-start;
        h3 {
            font-size: 1.5rem;
        }
        h5 {
            font-weight: normal;
            font-size: 0.7rem;
        }
    }
}
</style>