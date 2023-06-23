<template>
    <div class="schedule">
        <div class="schedule-header">Todays schedule</div>
        <div class="schedule-body">
            <div
                class="shift-item"
                v-for="(shift, index) in schedule"
                :key="index"
                :style="genStyle(shift)"
                :title="genTooltip(shift)"
            >
                <div class="name">
                    {{shift.name}}<br>{{shift.startTime.substring(11,16)}} - {{shift.endTime.substring(11,16)}}

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import {useStore} from 'vuex'
import { computed, ref, watch } from '@vue/runtime-core';

const store = useStore();
const ping = computed(_=>store.state.lastPing)
const schedule = ref([])

const updateSchedule = _=>{
    schedule.value = store.state.mySchedule.shift
}
updateSchedule()
watch(ping, updateSchedule)

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
function genStyle(shift){
    return `background-color: ${shift.displayColorHex}; flex-basis: ${shift.lengthOfShift / 12}em; color: ${contrastFont(shift.displayColorHex)}` 
}
function genTooltip(shift){
    return `${shift.startTime.substring(11,16)} - ${shift.endTime.substring(11,16)}`
}
</script>

<style lang="scss" scoped>
.schedule {
    min-width: 80%;
    margin: 1rem;
    height: 875px;
    @include tablet {
        height: 200px;
    }
    @include large {
        min-width: 1100px;
    }
    @include tv {
        height: 875px;
        min-width: 10%;
    }


    .schedule-header {
        position: relative;
        background-color: var(--headercolor);
        color: var(--linkcolor);
        padding: 0.5rem;
        height: 30px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        text-transform: uppercase;
        @include tv {
            height: 50px;
        }
    }
    .schedule-body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        //align-items: center;
        padding: 1rem 2rem;
        height: 95%;
        font-size: 1rem;

        @include tablet {
            flex-direction: row;
            font-size: 1.3rem;
        }
        @include tv {
            flex-direction: column;
            font-size: 1rem;
        }
        .shift-item {
            
            display: flex;
            flex-direction: column;
            justify-content: center;
            @include tablet {
                height: 80%;
            }
            @include tv {
                height: unset;
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
    }
}
</style>