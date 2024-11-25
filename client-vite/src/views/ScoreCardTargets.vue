<script setup>
import {useStore} from 'vuex'
import moment from 'moment'
import { ref } from 'vue'

import Target from '../components/Target.vue'

const store = useStore()
store.dispatch('getScorecardTargets')
const date = ref(moment().format('YYYYMMDD'))
const allDates = ref(false)
const businessUnit = ref('all')
const priority = ref('all')
const kpi = ref('all')
const strategicArea = ref('all')

function returnAllBusinessUnits(){
    const bu = store.state.scorecardTargets.map(a=>a.businessUnit)
    return [...new Set(bu)].sort((a,b)=>a>b ? 1 : -1)
}
function returnAllPriorities(){
    const prio = store.state.scorecardTargets.map(a=>a.priority)
    return [...new Set(prio)].sort((a,b)=>a>b ? 1 : -1)
}
function returnAllKpis(){
    const kpi = store.state.scorecardTargets.map(a=>a.kpi)
    return [...new Set(kpi)].sort((a,b)=>a>b ? 1 : -1)
}
function returnAllStrategicAreas(){
    const strategicArea = store.state.scorecardTargets.map(a=>a.strategicArea)
    return [...new Set(strategicArea)].sort((a,b)=>a>b ? 1 : -1)
}

</script>

<template>
    <div class="filters">
        <div class="filter">
            <label for="businessUnit">View department</label>
            <select name="businessUnit" id="businessUnit" v-model="businessUnit">
                <option value="all">All</option>
                <option 
                    v-for="unit in returnAllBusinessUnits()"
                    :value="unit"
                >
                    {{ unit }}
                </option>
            </select>
        </div>

        <div class="filter">
            <label for="strategicArea">View Strategic Area</label>
            <select name="strategicArea" id="strategicArea" v-model="strategicArea">
                <option value="all">All</option>
                <option 
                    v-for="strategicArea in returnAllStrategicAreas()"
                    :value="strategicArea"
                >
                    {{ strategicArea }}
                </option>
            </select>
        </div>
        <div class="filter">
            <label for="kpi">View KPI</label>
            <select name="kpi" id="kpi" v-model="kpi">
                <option value="all">All</option>
                <option 
                    v-for="kpi in returnAllKpis()"
                    :value="kpi"
                >
                    {{ kpi }}
                </option>
            </select>
        </div>
        <div class="filter">
            <label for="priority">View priority</label>
            <select name="priority" id="priority" v-model="priority">
                <option value="all">All</option>
                <option 
                    v-for="prio in returnAllPriorities()"
                    :value="prio"
                >
                    {{ prio }}
                </option>
            </select>
        </div>
        
        <div class="filter">
            <label for="date">Valid for</label>
            <input type="text" name="date" id="date" v-model="date" :disabled="allDates">
        </div>
        <div class="oneline-filter">
            <label for="allDates">See all dates</label>
            <input type="checkbox" name="allDates" id="allDates" v-model="allDates">
        </div>
    </div>
    <div class="table">
        <div class="row header">
            <span></span>
            <span></span>
            <span>Business Unit</span>
            <span>Strategic Area</span>
            <span>KPI</span>
            <span>Prority</span>
            <span>MIN</span>
            <span>MAX</span>
            <span>Type</span>
            <span>Valid from</span>
            <span>Valid to</span>
        </div>
        <div 
            class="row"
            v-for="target in store.state.scorecardTargets
                .filter(a=>allDates || (date >=a.validFrom && date <= a.validTo))
                .filter(a=>businessUnit==='all' || a.businessUnit === businessUnit )
                .filter(a=>priority==='all' || a.priority === priority )
                .filter(a=>kpi==='all' || a.kpi === kpi )
                .filter(a=>strategicArea==='all' || a.strategicArea === strategicArea )
                "
            :key="target._id"
        >
            <span>
                <Target :_id="target._id" action="edit" />
            </span>
            <span><div class="btn" title="Copy target">
                <font-awesome-icon class="icon" icon="copy" />
            </div></span>
            <span>{{ target.businessUnit }}</span>
            <span>{{ target.strategicArea }}</span>
            <span>{{ target.kpi }}</span>
            <span>{{ target.priority }}</span>
            <span>{{ target.min }}</span>
            <span>{{ target.max }}</span>
            <span>{{ target.type }}</span>
            <span>{{ target.validFrom }}</span>
            <span>{{ target.validTo  }}</span>
        </div>
    </div>
</template>


<style lang="scss" scoped>
.filters, .table {
    max-width: 75rem;
    margin-inline: auto;
    margin-block-start: 1rem;
    padding: 1rem;
}
.filters {
    display: flex;
    justify-content: space-between;
    .filter {
        display: flex;
        flex-direction: column;
    }
    select {
        width: 10rem;
    }
    .oneline-filter {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: flex-end;
        label {
            cursor: pointer;
            // margin-inline-end: 0.5rem;
        }
        input {
            margin-inline-start: 1rem;
            cursor: pointer;
            height: 1.1rem;
        }
    }
}
.table {
    height: 85vh;
    overflow-y: auto;
    border: 1px solid white;
    .row {
        display: grid;
        grid-template-columns: 1rem 1rem repeat(9, 1fr);
        border-bottom: 1px dashed grey;
        text-align: center;
        align-items: center;
        .icon {
            font-size: 0.8rem;
        }
    }
    .header {
        text-transform: uppercase;
        padding-block: 0.5rem;
    }
}
</style>