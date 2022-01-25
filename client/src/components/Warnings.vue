<template>
    <transition name="slide-down">
            <div 
                v-if="open && numWarnings" 
                class="warnings"
            >
                <div @click="store.commit('toggleWarnings')">
                    <font-awesome-icon :icon="['far', 'times-circle']" />
                </div>
                <transition-group mode="in-out" tag="ul" :class="{animate: numWarnings > 1 && scroll }" name="ltr" appear>
                    <li v-if="active==='one'">
                        <div class="icon">
                            <font-awesome-icon :icon="one.fontawesomeicon" />
                        </div>
                        <span>
                            {{one.title}}
                        </span>
                    </li>
                    <li v-else-if="active==='two'">
                        <div class="icon">
                            <font-awesome-icon :icon="two.fontawesomeicon" />
                        </div>
                        <span>
                            {{two.title}}
                        </span>
                    </li>
                </transition-group>
            </div>
    </transition>
</template>

<script>
import { computed, ref } from '@vue/reactivity';
import { watch } from '@vue/runtime-core';
import { useStore } from 'vuex';
export default {
   
    setup() {
        const store = useStore()
        const lastUpdate = computed(_=>store.state.latestAlertUpdate)
        const pageName = computed(_=>store.state.pageName)
        const open = computed(_=>store.state.showWarnings)
        const alerts = ref([])
        const numWarnings = ref(0)
        const active = ref('one')
        const selected = ref(0)
        const one = ref(null)
        const two = ref(null)
        const scroll = ref(true);
        updateWarnings();
        

        let loop = null
        if ( numWarnings.value > 1) setLoop()

        watch(numWarnings, (value, old)=>{
            if ( value > 1 && old <= 1 ) setLoop();
            else if ( value <= 1 && old >1) clearInterval(loop)
        })

        watch([lastUpdate, pageName], updateWarnings)
        
        function stopAnimation(){
            scroll.value = false;
            clearInterval(loop)
        }
        function startAnimation(){
            scroll.value = true;
            setLoop();
        }

        function updateWarnings(){
            alerts.value = store.getters.getOpenAlerts(pageName.value)
            numWarnings.value = alerts.value.length
            if (numWarnings.value && !one.value){
                one.value = alerts.value[0]
                two.value = alerts.value[0]
            }

        }

        function setLoop(){
            loop = setInterval(toNext, 10000)
            //console.log({loop});
        }
        function toNext(){
            console.log({loop});
            let next = selected.value + 1;
            if (next === numWarnings.value) next = 0;
            selected.value = next;

            if (active.value === 'one' ) {
                active.value = 'two'
                one.value = alerts.value[next]
            }
            else {
                active.value = 'one'
                two.value = alerts.value[next]
            }
        }

        return {active, one, two, numWarnings, open, scroll, startAnimation, stopAnimation, store}
    }
}
</script>

<style lang="scss" scoped>
.warnings {
    transform-origin: top;
    position: relative;

    >div {
        position: absolute;
        right: 1.5rem;
        top: 0.5rem;
        cursor: pointer;
        color: $color-bad;
    }

    > ul {
        list-style: none;
        background-color: var(--activealertbgcolor);
        //position: relative;
        //right: 0%;
        //transform: translateX(-50%);
        //top: 3.2rem;
        //z-index: 10;
        max-height: 50px;
        width: 100%;
        display: flex;
        //overflow-y: scroll;
        margin: 0 auto;
        li {
            color: white;
            padding: 0.5rem 0;
            flex-basis: 100vw;
            display: flex;
            justify-content: center;
            //grid-template-columns: 1fr 4fr;
            > span {
                
                padding: 0 0.5rem;
                &.title {
                    text-align: right;
                }
                &.text {
                    text-align: left;
                    > span {
                        padding: 0.5rem 0;
                        display: block;
                    }
                    .bold {
                        font-weight: 900;
                        text-align: center;
                    }
                }
            }
            > div {
                padding: 0 0.5rem;
                border-right: 1px solid var(--bgcolor);
                min-width: 40px;
                &.icon {
                    margin: auto 0;
                }
            }
            /*&.opened {
                grid-template-rows: 1fr auto;
                grid-template-areas: 
                    "icon title"
                    "text text"
                ;
            }*/
    
        }
    }
}
.animate{
    .ltr-enter-from {
        transform: translateX(-100vw);
    }
    .ltr-enter-to, .ltr-leave-from, .ltr-leave-to  {
        transform: translateX(100vw);
    }
    .ltr-enter-active, .ltr-leave-active {
        transition: transform 10s linear;
    }
    
}
.slide-down-enter-active, .slide-down-leave-active {
    transition: transform 0.5s ease-in-out; 
}

.slide-down-enter-from , .slide-down-leave-to{
    transform: scaleY(0)
}
.appear-enter-active, .slide-down-leave-active {
    transition: all 0.5s ease-in-out; 
}

.appear-enter-from , .slide-down-leave-to{
    opacity: 0;
}
</style>