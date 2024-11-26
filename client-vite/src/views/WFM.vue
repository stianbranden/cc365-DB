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
        <SummaryCard key="dk" title='GS Denmark' department='dk' @dblclick="navigate('denmark')" />
        <SummaryCard key="fi" title='GS Finland' department='fi' @dblclick="navigate('finland')" />
        <SummaryCard key="no" title='GS Norway' department='no' @dblclick="navigate('norway')" />
        <SummaryCard key="se" title='GS Sweden' department='se' @dblclick="navigate('sweden')" />
        <SummaryCard key="ki" title='PS Kitchen&Interior' department='ki' @dblclick="navigate('kitchen')" />
        <SummaryCard key="thd" title='PS Techincal Helpdesk' department='thd' @dblclick="navigate('helpdesk')" />
        <!-- <SummaryCard key="b2b" title='PS B2B' department='b2b' @dblclick="navigate('b2b')" /> -->
    </div>
    <div class="wfm">
        <IntervalDataTable />
    </div>
</template>


<style lang="scss" scoped>
.home, .wfm {
    @include medium {
        flex-wrap: nowrap !important;
        scale: 0.9;
        margin-bottom: 0 !important;
    }
    @include tv {
        scale: 1;
        margin-bottom: 2rem !important;
    }
}
.home {
    display: flex;
    justify-content: space-evenly !important;
    @include medium {
        flex-wrap: nowrap !important;
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