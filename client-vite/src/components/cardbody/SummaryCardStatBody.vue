<template>
    <div class="card-body stats">
        <div class="stat-row" v-for="key in keys" :key="key">
            <span v-if="getIcon(key)">
                <font-awesome-icon :icon="getIcon(key)" />
            </span>
            <Logo :department="key" v-else />
             <span v-if="key === 'em' || key === 'ac'">
                <span class="label">ASA</span>
                <span class="result bigger">{{daily[key].summary.timeAsa}}</span>
            </span>
             <span v-else>
                <span class="label">SLA</span>
                <span class="result bigger">{{daily[key].summary.sla}}%</span>
            </span>
            <span>
                <span class="label">Offered</span>
                <span class="result">{{daily[key].summary.offered}}</span>
            </span>
            <span>
                <span class="label">Answered</span>
                <span class="result">{{daily[key].summary.answered}}</span>
            </span>
        </div>
        
    </div>
</template>

<script>
import {useStore} from 'vuex'
import { toRefs, computed, ref, watch } from '@vue/runtime-core';
import Logo from '../Logo.vue'
export default {
    components: {Logo},
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
        const daily = ref(null)
        let keys = []
        setDailyData()
    
        function getIcon(key){
            let icon = null
            switch (key) {
                case 'ph':
                    icon = 'phone-alt'
                    break;
                case 'ch':
                    icon = 'comments'
                    break;
                case 'em':
                    icon = 'envelope'
                    break;
                case 'ac':
                    icon = 'folder'
                    break;
            
                default:
                    break;
            }
            return icon
        }


        watch(
            ping, 
            setDailyData
        )

        function setDailyData(){
            if ( department.value === 'thd' ) daily.value = store.getters.getThdSummary;
            else daily.value = store.getters.getSummaryDaily(department.value)
            keys = []
            Object.keys(daily.value).forEach(key=>{
                if (daily.value[key].queues.length > 0 ) keys.push(key)
            });
            
        }
        return {daily, getIcon, keys}
    }
}
</script>

<style lang="scss" scoped>
.card.summarycard {
    .card-body {
        &.stats {
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            .stat-row {
                display: flex;
                flex-direction: row;
                width: 100%;
                justify-content: space-between;
                align-items: center;
                > span {
                    display: flex;
                    flex-direction: column;
                    .bigger {
                        font-size: 1.2rem;
                    }
                }
            }
        }
        overflow: hidden;
        position: relative;
        padding: 0.5rem;
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr 1fr;
        align-items: center;
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
}
</style>