<template>
  <header class=navigation>
    <div class="brand">
        <img alt="Logo" src="../assets/icon.png">
    </div>
    <nav>
        <h3>{{store.state.pageName}}</h3>
<!--        <router-link to="/">Nordic</router-link> -->
        <button @click="menuOpen = !menuOpen" :class="{active: menuOpen}">
            <font-awesome-icon icon="bars" />
        </button>
        <transition name="slide-down"> 
            <ul class="nav-drop" v-if="menuOpen">
                <li @click="navigate('Nordic',{})">
                    <span></span>
                    <span>Nordic</span>
                </li>
                <li @click="navigate('Department',{department: 'denmark'})">
                    <logo department="dk" />
                    <span>Denmark</span>
                </li>
                <li @click="navigate('Department',{department: 'finland'})">
                    <logo department="fi" />
                    <span>Finland</span>
                </li>
                <li @click="navigate('Department',{department: 'norway'})">
                    <logo department="no" />
                    <span>Norway</span>
                </li>
                <li @click="navigate('Department',{department: 'sweden'})">
                    <logo department="se" />
                    <span>Sweden</span>
                </li>
                <li @click="navigate('Department',{department: 'kitchen'})">
                    <logo department="ki" />
                    <span>Kitchen</span>
                </li>
                <li @click="navigate('Department',{department: 'helpdesk'})">
                    <logo department="thd" />
                    <span>Helpdesk</span>
                </li>
                <li class="break info"></li>
                <li class="info" :title="[store.getters.connectionStatus ? 'Connected to server': 'Not connected to server']">
                    <div 
                        class="connection-status" 
                        :class="{green: store.getters.connectionStatus}"
                    >
                        <font-awesome-icon icon="circle-notch" />
                    </div>
                    <span>{{store.getters.connectionStatus ? 'Connected': 'Disconnected'}}</span>
                </li>
                <li title="Toggle dark mode" @click="store.commit('toggleDark')">
                    <div>
                        <font-awesome-icon icon="lightbulb" />
                    </div>
                    <span>{{store.getters.getDark ? 'Light mode': 'Dark mode' }}</span>
                </li>
            </ul>
        </transition>
    </nav>
  </header>
</template>

<script>
import { ref } from '@vue/reactivity';
import {useStore} from 'vuex'
import { useRouter } from 'vue-router';
import Logo from './Logo'
export default {
    components: {Logo},
    setup(){
        const store = useStore();
        const dark = ref(store.getters.getDark);
        const socketStatus = store.getters.socketStatus
        const menuOpen = ref(false)
        const router = useRouter()

        function navigate(name, params){
            router.push({name, params})
            menuOpen.value = false;
        }
        

        return {store, dark, socketStatus, menuOpen, navigate}
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
    .brand {
        margin: 0 1rem;
        img {
            height: 2rem;
        }
    }
    nav {
        margin: 0 1rem;
        display: flex;
        h3 {
            margin-right: 1rem;
            color: var(--linkcolor);
            text-transform: capitalize;
        }
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
            &:hover, &.active {
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
        ul.nav-drop {
            list-style: none;
            background-color: var(--headercolor);
            position: absolute;
            right: 0;
            top: 3.2rem;
            z-index: 10;
            width: calc(var(--cardwidth)/1.7);
            transform-origin: top;
            overflow: hidden;
            li {
                color: white;
                padding: 0.5rem 0;
                display: grid;
                grid-template-columns: 1fr 4fr;
                > span {
                    text-align: right;
                    padding: 0 0.5rem;
                }
                > div {
                    padding: 0 0.5rem;
                    border-right: 1px solid var(--bgcolor);
                    min-width: 40px;
                }
                &:not(.info) {

                    cursor: pointer;
                    
                    &:hover {
                        background-color: var(--navhover)
                    }
                }
                &.break {
                    border-bottom: 1px solid var(--bgcolor);
                }

            }
        }
    }

    .slide-down-enter-active, .slide-down-leave-active {
        transition: transform 0.5s ease-in-out; //cubic-bezier(1, 0.5, 0.8, 1);
        //transition: opacity 0.3s ease-in-out 0.3s;
    }

    .slide-down-enter-from , .slide-down-leave-to{
        transform: scaleY(0)
        //opacity: 0;
    }
 
}

</style>