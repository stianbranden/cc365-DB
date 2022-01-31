<template>
    <div class="home" :class="{showAlerts: store.state.showAlerts}" >
        <Alerts v-if="store.state.showAlerts" :department="department" /> 
        <QueueCard
            v-for="area in store.state.areas"
            :key="area.abbr"
            :title="area.name + ' - ' + channelName"
            :channel="channel"
            :department="department"
            :area="area.abbr"
            :country="country"
        />
    </div>

</template>


<script setup>
//imports
import Alerts from '../components/Alerts.vue'
import QueueCard from '../components/QueueCard.vue'
import { computed, ref } from 'vue';
import { useRoute} from 'vue-router'
import { useStore } from 'vuex';


//setup
const route = useRoute();
const store = useStore();
const departmentName = ref(route.params.department)
const channelName = ref(route.params.channel)
const countryName = ref(route.params.country)
const department = computed(_=>depAbbr(departmentName.value));
const channel = computed(_=>channelAbbr())
const country = countryName === 'all' ? null : computed(_=>depAbbr(countryName.value, true))
//console.log(departmentName.value, channelName.value);

//functions
function depAbbr(depname, getCountry = false){
    let abbr = null
    switch (depname) {
        case 'denmark':
            abbr = 'dk'
            break;
        case 'finland':
            abbr = 'fi'
            break;
        case 'norway':
            abbr = 'no'
            break;
        case 'sweden':
            abbr = 'se'
            break;
        case 'kitchen':
            abbr = 'ki'
            break;
        case 'helpdesk':
            abbr = 'thd'
            break;
    
        default:
            break;
    }
    if (abbr && getCountry) return abbr.toUpperCase()
    else return abbr
}

function channelAbbr(){
    let abbr = 'na'
    switch(channelName.value){
        case 'phone':
            abbr = 'PH'
            break;
        case 'email':
            abbr = 'EM'
            break;
        case 'chat':
            abbr = 'CH'
            break;
        case 'action':
            abbr = 'AC'
            break;
        
    }
    return abbr;
}

</script>


<style lang="scss">

</style>