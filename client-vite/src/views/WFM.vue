<script setup>
import SummaryCardGenesys from '../components/SummaryCardGenesys.vue'
import IntervalDataTable from '../components/IntervalDataTable.vue'
import { useStore } from 'vuex'
// import Alerts from '../components/Alerts.vue'
// import { useStore } from 'vuex'

const store = useStore()

function getPrograms(){
  const programs = []
  store.state.genesysQueueStatus.filter(a=> !a.program.includes('Inside Sales')).forEach(q=>{
    if (!programs.includes(q.program)) programs.push(q.program)
  })
  return programs.sort((a,b)=>a<b?-1:1)
}
function abbrTitle(title){
  if (title === 'General Service Denmark') return 'GS DK'
  if (title === 'General Service Finland') return 'GS FI'
  if (title === 'General Service Norway') return 'GS NO'
  if (title === 'General Service Sweden') return 'GS SE'
  if (title === 'Premium Support Kitchen&Interior') return 'PS K&I'
  if (title === 'Premium Support Technical Helpdesk') return 'PS THD'
  if (title === 'Premium Support B2B') return 'PS B2B'
  else return title
}


</script>

<template>
    <!-- <div class="home" :class="{showAlerts: store.state.showAlerts}"> -->
    <div class="home">
        <SummaryCardGenesys v-for="program in getPrograms()" :title='abbrTitle(program)' :program='program' v-if="store.state.sourceSystem === 'Genesys'" @dblclick="navigate(program)" />
        <!-- <Alerts v-if="store.state.showAlerts" />  -->
        <!-- <SummaryCardGenesys key="dk" title='GS Denmark' department='dk' @dblclick="navigate('denmark')" />
        <SummaryCardGenesys key="fi" title='GS Finland' department='fi' @dblclick="navigate('finland')" />
        <SummaryCardGenesys key="no" title='GS Norway' department='no' @dblclick="navigate('norway')" />
        <SummaryCardGenesys key="se" title='GS Sweden' department='se' @dblclick="navigate('sweden')" />
        <SummaryCardGenesys key="ki" title='PS Kitchen&Interior' department='ki' @dblclick="navigate('kitchen')" />
        <SummaryCardGenesys key="thd" title='PS Techincal Helpdesk' department='thd' @dblclick="navigate('helpdesk')" /> -->
        <!-- <SummaryCard key="b2b" title='PS B2B' department='b2b' @dblclick="navigate('b2b')" /> -->
    </div>
    <div class="wfm">
        <IntervalDataTable />
    </div>
</template>


<style lang="scss" scoped>
.home, .wfm {
    // margin-inline: 2rem !important;
    @include medium {
        // margin: 1rem 0;
        // flex-wrap: nowrap !important;
        // scale: 0.9;
        margin-bottom: 0 !important;
    }
    @include tv {
        scale: 1;
        margin-bottom: 2rem !important;
    }
}
.home {
    overflow: hidden;
    gap: 1rem;
    display: flex;
    justify-content: space-between !important;
    @include medium {
        padding: 0;
        flex-wrap: nowrap !important;
        .card {
            margin: 1.5rem 0;
            padding: 0;
        }
    }
    // padding: 0 !important;
    // margin-inline: 2.5vw;  
}
.wfm {
    margin-inline: 2rem;
    padding: 1rem;
    display: flex;
    justify-content: center;
    border-radius: 0.5rem;
    box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
    background-color: var(--cardbgcolor);
    table {
        // scale: 0.7;
    }
}

</style>