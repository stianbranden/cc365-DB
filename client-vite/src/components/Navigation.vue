<template>
    <header class=navigation>
        <div class="left">
            <div class="brand" @click="navigate('Nordic', {})">
                <img alt="Logo" src="../assets/icon.png">
                <span title="Sinch" v-if="store.state.sourceSystem ==='Sinch'">S</span>
            </div>
            <h3 class="pagename">{{store.state.pageName}}</h3>
        </div>
        <nav>
            <div v-if="store.getters.getOpenAlerts().length" @click="store.commit('toggleWarnings')"  class="warning" :title="store.getters.getOpenAlerts(store.state.pageName).length + ' open alerts'">
                <font-awesome-icon icon="exclamation-circle" />
            </div>
            <!-- v-if="store.getters.getOpenAlerts().length" -->
            <div class="pages">
                <span
                    v-for="page in store.state.pages"
                    :key="page.name"
                    @click="navigate(page.routeName, page.params)"
                    :class="{link: page.link}"
                >{{page.name}}</span>
            </div>
            
            <button @click="menuOpen = !menuOpen" :class="{active: menuOpen, red: !store.getters.connectionStatus}" :title="[store.getters.connectionStatus ? 'Click to open menu': 'Not connected to server']" >
                <font-awesome-icon icon="bars" />
            </button>
            <Menu :menuOpen="menuOpen" @close-menu="menuOpen = false" />
        </nav>
    </header>
</template>

<script>
import { ref } from '@vue/reactivity';
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'
import Logo from './Logo.vue'
import Menu from './Menu.vue'
export default {
    components: {Logo, Menu},
    setup(){
        const store = useStore();
        const menuOpen = ref(false)
        const router = useRouter()
        function navigate(name, params){
            router.push({name, params})
            menuOpen.value = false;
        }
        return {store, menuOpen, navigate}
    }
}
</script>

<style lang="scss">
header.navigation {
    background: var(--headercolor);
    position: relative;
    display: flex;
    margin: 0;
    padding: 0.5rem;
    align-items: center;
    justify-content: space-between;
    .left {
        display: flex;
        //align-items: flex-end;
    }
    .pages {
        margin-right: 0.5rem;
        align-self: flex-end;
        font-size: 0.7rem;
        text-transform: lowercase;
        color: var(--linkcolor);
        span:not(:first-child)::before{
            content: ' \\ '
        }
        .link {
            cursor: pointer;
            &:hover {
                text-decoration: underline;
                color: var(--activelinkcolor);
            }
        }
    }
    .brand {
        cursor: pointer;
        margin: 0 1rem;
        img {
            height: 2rem;
        }
        span {
            font-size: 0.5rem;
        }
    }
    h3.pagename {
        margin-right: 1rem;
        color: var(--linkcolor);
        text-transform: capitalize;
        align-self: center;
    }
    nav {
        margin: 0 1rem;
        display: flex;
        a {
        font-weight: bold;
        color: var(--linkcolor);
        display: inline-block;
        text-decoration: none;
        margin: 0 0.5rem;
            &:hover {
                text-decoration: underline;
            }
            &.router-link-exact-active {
                color: var(--activelinkcolor);
            }
        }
        button {
            cursor: pointer;
            padding: 0.1rem 0.3rem;
            border: 1px solid var(--textcolor);
            border-radius: 0.25rem;
            background-color: var(--buttoncolor);
            color: var(--textcolor);
            &.red {
                border-color: $color-bad;
            }
            &:hover, &.active {
                &.red {
                    border-color: $color-bad;
                }
                border-color: var(--activelinkcolor);
                color: var(--activelinkcolor)
            }
        }
        .connection-status{
            color: $color-bad;
            //margin: 0 0.5rem;
            &.green {
                color: $secondary-brand-color;
        }
        
        }
        
        .warning {
            margin: auto 0.5rem;
            color: $color-bad;
            cursor: pointer;
        }
    }

    
 
}

</style>