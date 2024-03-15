<script setup>
import SummaryCard from '../components/SummaryCard.vue'
import IntervalDataTable from '../components/IntervalDataTable.vue'
// import Alerts from '../components/Alerts.vue'
// import { useStore } from 'vuex'

// const store = useStore()

</script>

<template>
    <!-- <div class="home" :class="{showAlerts: store.state.showAlerts}"> -->
    <div class="home">
        <!-- <Alerts v-if="store.state.showAlerts" />  -->
        <SummaryCard key="dk" title='CCC Denmark' department='dk' @dblclick="navigate('denmark')" />
        <SummaryCard key="fi" title='CCC Finland' department='fi' @dblclick="navigate('finland')" />
        <SummaryCard key="no" title='CCC Norway' department='no' @dblclick="navigate('norway')" />
        <SummaryCard key="se" title='CCC Sweden' department='se' @dblclick="navigate('sweden')" />
        <SummaryCard key="ki" title='CCC Kitchen' department='ki' @dblclick="navigate('kitchen')" />
        <SummaryCard key="thd" title='CCC Helpdesk' department='thd' @dblclick="navigate('helpdesk')" />
    </div>
    <div class="wfm">
        <IntervalDataTable />
    </div>
</template>


<style lang="scss" scoped>
.home {
    display: flex;
    justify-content: space-evenly !important;
    @include medium {
        flex-wrap: nowrap !important;

    }
    // padding: 0 !important;
    // margin-inline: 2.5vw;  
    > * {
        // scale: 80%;
    }
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