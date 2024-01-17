<template>
  <div class="schedule-container" ref="container">
    <div class="activity" v-for="shift in schedule" :key="shift._id" :style="genStyle(shift)">
        <div class="name" :title="genTooltip(shift)">
            {{shift.name}}<br>{{shift.startTime.substring(11,16)}} - {{shift.endTime.substring(11,16)}}
        </div>
    </div>
  </div>
</template>

<script setup>
import {useStore} from 'vuex'
import { useElementSize } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

const store = useStore()
const container = ref(null)
const { width, height } = useElementSize(container)

const ping = computed(_=>store.state.lastPing)
const schedule = ref(store.state.mySchedule.shift)
setHexWitOpacity()
const totalShiftLength = ref(schedule.value.reduce((a, c)=>a+c.lengthOfShift, 0) || 0)


function setHexWitOpacity(){
    const now = new Date()
    if (Array.isArray(schedule.value)){
        schedule.value.forEach(sh=>{
            const current = {
                now: now,
                start: new Date(sh.startTime),
                end: new Date(sh.endTime),
                gts: now >= new Date(sh.startTime),
                lte: now <= new Date(sh.endTime),
                act: sh.name,
                color: sh.displayColorHex
            };
            if (current.gts && current.lte ) sh.opacity = 1
            else sh.opacity = 0.5
        })
    }
}



const updateSchedule = _=>{
    schedule.value = store.state.mySchedule.shift
    setHexWitOpacity()
    totalShiftLength.value = schedule.value.reduce((a, c)=>a+c.lengthOfShift, 0 || 0)
}


// updateSchedule()
watch(ping, updateSchedule)

function genStyle(shift){
    const padding = 0
    const w = (width.value - padding * 16) * shift.lengthOfShift / totalShiftLength.value
    return `background-color: ${shift.displayColorHex}; opacity: ${shift.opacity || 1}; overflow: hidden; z-index: ${Math.floor(shift.opacity)}; border-width: ${Math.floor(shift.opacity)}px;border-style: solid ;width: ${w}px; color: ${contrastFont(shift.displayColorHex)}` 
}
function genTooltip(shift){
    return `${shift.name}: ${shift.startTime.substring(11,16)} - ${shift.endTime.substring(11,16)}`
}

function contrastFont(bgcolor){
    let color, r, g, b, hsp;
    color = +("0x" + bgcolor.slice(1).replace(bgcolor.length < 5 && /./g, '$&$&'));
    r = color >> 16;
    g = color >> 8 & 255;
    b = color & 255;
    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );
    if (hsp>127.5) return '#000' 
    else return '#fff'
}
</script>

<style lang="scss">
.schedule-container {
    padding-inline: 1rem;
    display: flex;
    justify-content: space-around;
}
.activity {
    display: flex;
    flex-direction: column;
    justify-content: center;
    &:hover {
        font-weight: bold;
        opacity: 1 !important;
    }
    .name {
        font-size: 0.8rem;
        @include tablet {
            font-size: 0.6rem;
        }
        @include small {
            font-size: 0.8rem;
            
        }
    }
}
</style>