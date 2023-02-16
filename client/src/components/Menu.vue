<template>
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
                <li @click="navigateExternal('/old')">
                    <div>
                        <font-awesome-icon icon="folder" />
                    </div>
                    <span>Old UI</span>
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
                <li title="Toggle dark mode" @click="store.commit('toggleDark'); emit('closeMenu')">
                    <div>
                        <font-awesome-icon icon="lightbulb" />
                    </div>
                    <span>{{store.getters.getDark ? 'Light mode': 'Dark mode' }}</span>
                </li>
                <li title="Toggle alerts" @click="store.commit('toggleAlerts'); emit('closeMenu')">
                    <div>
                        <font-awesome-icon icon="exclamation-triangle" />
                    </div>
                    <span>{{store.state.showAlerts ? 'Hide alerts': 'Show Alerts' }}</span>
                </li>
                <li v-if="user._id" :title="'Signed in as ' + user._id" @click="navigateExternal('/auth/logout')">
                    <div>
                        <font-awesome-icon icon="sign-out-alt" />
                    </div>
                    <span>Log out</span>
                </li>
                <li v-else @click="navigateExternal('/auth/azure/login')">
                    <div>
                        <font-awesome-icon icon="sign-in-alt" />
                    </div>
                    <span>Log in</span>
                </li>
                <li class="info" title="Version number">
                    <div>
                        <font-awesome-icon icon="code-branch" />
                    </div>
                    <span>v{{store.state.version}}</span>
                </li>
                <ReleaseNotes />
                <li class="break info"></li>
                <!-- Added pages access -->
                <li
                    @click="navigateDynamic(page)"
                    v-for="page in store.state.user.pages"
                    :key="page._id"
                >
                    <div>
                        <font-awesome-icon :icon="page.icon" />
                    </div>
                    <span>{{page.name}}</span>
                </li>
            </ul>
        </transition>
</template>

<script>
import { computed, ref } from '@vue/reactivity'
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'
import Logo from './Logo'
import ReleaseNotes from './ReleaseNotes'
import { watch } from '@vue/runtime-core'
export default {
    emits: ["closeMenu"],
    components: {Logo, ReleaseNotes},
    props: {
        menuOpen: Boolean
    },
    setup(props, {emit}) {
        const store = useStore()
        const user = ref(store.getters.getUser)
        const router = useRouter()
        const ping = computed(_=>store.state.lastPing)

        watch(ping, _=>user.value = store.getters.getUser);

        function navigate(name, params){
            router.push({name, params})
            emit("closeMenu")
        }
        function navigateExternal(path){
            emit("closeMenu")
            window.location.href = path
        }

        function navigateDynamic({routerName, params}){
            router.push({name: routerName, params})
            emit("closeMenu")
        }

        return {store, user, navigate, navigateExternal, navigateDynamic, emit}
    }

}
</script>

<style lang="scss">
ul.nav-drop {
    list-style: none;
    background-color: var(--headercolor);
    position: absolute;
    right: 0;
    top: 3.2rem;
    z-index: 11;
    width: calc(1rem + var(--cardwidth)/1.5);
    transform-origin: top;
    overflow: hidden;
    padding-right: 1rem;
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
            writing-mode: vertical-lr;
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
.slide-down-enter-active, .slide-down-leave-active {
    transition: transform 0.5s ease-in-out; 
}

.slide-down-enter-from , .slide-down-leave-to{
    transform: scaleY(0)
}
</style>