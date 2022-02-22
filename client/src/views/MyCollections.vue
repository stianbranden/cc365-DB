<template>
    <div class="home" :class="{showAlerts: store.state.showAlerts}">
    <Alerts v-if="store.state.showAlerts" /> 
    <CollectionQueueCard v-for="collection in store.state.collections" :key="collection._id" :collectionId="collection._id" />
    <div class="settings" @click="navigate('MyCollectionsSettings', {})">
        <font-awesome-icon icon="cog" />
    </div>
  </div>
</template>

<script setup>
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'
import Alerts from '../components/Alerts'
import CollectionQueueCard from '../components/CollectionQueueCard'

const router = useRouter()
function navigate(name, params){
    router.push({name, params})
    menuOpen.value = false;
}

const store = useStore()

</script>

<style lang="scss" scoped>
.settings {
    position: fixed;
    z-index: 99;
    right: 1rem;
    bottom: 1rem;
    cursor: pointer;
    &:hover {
        color: var(--activelinkcolor);
    }
}
</style>