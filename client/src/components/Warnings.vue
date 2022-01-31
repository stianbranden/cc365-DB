<template>
    <transition name="slide-down">
        <!--  -->
            <div 
                class="warnings"
                v-resize="onResize"
                ref="wline"
                v-show="open && numWarnings"
            >
                <div 
                    class="close" 
                    @click="store.commit('toggleWarnings')"
                >
                    <font-awesome-icon :icon="['far', 'times-circle']" />
                </div>
                <div 
                >
                    <div 
                    class="ticker"
                    id="ticker"
                    @mouseleave="controlAnimation('start')"
                    @mouseover="controlAnimation('pause')"
                    >
                        <div 
                        :key="alert._id" 
                        v-for="alert in alerts" 
                        class="ticker-item"
                        >
                            <div class="icon">
                                <font-awesome-icon :icon="alert.fontawesomeicon" />
                            </div>
                            <span>
                                {{alert.title}}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
    </transition>
</template>

<script>
import { computed, reactive } from '@vue/reactivity';
import { watch } from '@vue/runtime-core';
import { useStore } from 'vuex';
import { animate } from "motion"
import { onMounted, ref } from 'vue';


export default {
    setup() {
        const store = useStore()
        const lastUpdate = computed(_=>store.state.latestAlertUpdate)
        const pageName = computed(_=>store.state.pageName)
        const open = computed(_=>store.state.showWarnings)
        const alerts = ref([])
        const numWarnings = ref(0)
        const duration = ref(20)
        let animation;
        const wline = ref(null)



        const motionAnimation =  reactive({
            x: ['-100vw', '100vw'],
            //opacity: [0, 1]
        });
        const motionDuration = reactive({
            duration: duration.value,
            delay: 1,
            repeat: Infinity,
            easing: 'linear'
        })
        //console.log(Motion);
        
        
        watch([lastUpdate, pageName], _=>{
            updateWarnings()
            
        })

        function updateWarnings(){
            alerts.value = store.getters.getOpenAlerts(pageName.value)
            numWarnings.value = alerts.value.length
            initiateAnimation()
        }
        onMounted(_=>{
            updateWarnings();
            //initiateAnimation()
        })

        function controlAnimation(action){
            //console.log(action, animation);
            if (!animation){
                initiateAnimation()
            }
            if (action === 'start' && numWarnings.value > 1) animation.play()
            else if (action === 'pause'  && numWarnings.value > 1) animation.pause()
            else if ( action === 'stop') animation.cancel()
        }

        function initiateAnimation(){
            const width = wline.value.clientWidth
            const contWidth = numWarnings.value * 300
            const newWidth = width > contWidth ? width : contWidth
            if (newWidth !== motionAnimation.x[1]){
                //console.log({newWidth});
                motionAnimation.x[0] = -newWidth
                motionAnimation.x[1] = newWidth
                motionDuration.duration = newWidth / 50
                //console.log(motionDuration);
                animation = animate("#ticker", 
                motionAnimation, 
                motionDuration)
            }

            if ( numWarnings.value <= 1 ) animation.cancel()
        }
        function onResize(){
           initiateAnimation()  
        }

        return {numWarnings, wline, open, alerts, store, onResize, controlAnimation}
    }
}
</script>

<style lang="scss" scoped>
.warnings {
    transform-origin: top;
    position: relative;
    background-color: var(--activealertbgcolor);
    max-height: 50px;

    > div.close {
        position: absolute;
        right: 1.5rem;
        top: 0.5rem;
        cursor: pointer;
        color: $color-bad;
        z-index: 10;
    }

        div.ticker {
        list-style: none;
        //position: relative;
        //right: 0%;
        //transform: translateX(-50%);
        //top: 3.2rem;
        //z-index: 10;
        //width: 100%;
        display: flex;
        //overflow-y: scroll;
        margin: 0 auto;
        .ticker-item {
            color: white;
            padding: 0.5rem 0;
            flex-basis: 100vw;
            min-width: 300px;
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
        transition: transform 15s linear;
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