<template>
    <div class="home">
        <Alerts />
    </div>
</template>

<script>
import Alerts from '../components/Alerts.vue'

export default {
    components: {Alerts},
    setup(){
        
    }
}
</script>

<style lang="scss">
.alerts {
    display: flex;
    justify-content: space-between;
}
</style>