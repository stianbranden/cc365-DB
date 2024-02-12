<script setup>
import SummaryCard from '../components/SummaryCard.vue'
import IntervalDataTable from '../components/IntervalDataTable.vue'

</script>

<template>
    <div class="home">
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
    justify-content: space-between !important;
    padding: 0 !important;
    margin-inline: 2.5vw;  
}
.wfm {
    margin-inline: 2.5vw;
    padding: 1rem;
    display: flex;
    justify-content: center;
    border-radius: 0.5rem;
    box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);
    background-color: var(--cardbgcolor);
}

</style>