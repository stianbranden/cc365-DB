<script setup>

import { watch, computed } from 'vue';
import {useStore} from 'vuex'

const store = useStore()
const ping = computed(_=>store.state.lastPing)

// watch(ping, _=>{
//     console.log(store.getters.getIntervalDataByDepartment);
// })

const intervals = [
//    '06:00','06:15', '06:30', '06:45',
    '07:00','07:15', '07:30', '07:45',
    '08:00','08:15', '08:30', '08:45',
    '09:00','09:15', '09:30', '09:45',
    '10:00','10:15', '10:30', '10:45',
    '11:00','11:15', '11:30', '11:45',
    '12:00','12:15', '12:30', '12:45',
    '13:00','13:15', '13:30', '13:45',
    '14:00','14:15', '14:30', '14:45',
    '15:00','15:15', '15:30', '15:45',
    '16:00','16:15', '16:30', '16:45',
    '17:00','17:15', '17:30', '17:45',
    '18:00','18:15', '18:30', '18:45',
    '19:00','19:15', '19:30', '19:45',
    '20:00','20:15', '20:30', '20:45',
    '21:00','21:15', '21:30', '21:45',
    '22:00','22:15', '22:30', '22:45'
]

const departments = [
    {
        key: 'dk',
        name: 'GS DK', 
        target: 50
    },
    {
        key: 'fi',
        name: 'GS FI' , 
        target: 50
    },
    {
        key: 'no',
        name: 'GS NO' , 
        target: 50
    },
    {
        key: 'se',
        name: 'GS SE' , 
        target: 50
    },
    {
        key: 'ki',
        name: 'PS K&I' , 
        target: 50
    },
    {
        key: 'thd',
        name: 'PS THD' , 
        target: 70
    },
]

function getChannelName(abbr, form){
    if (form === 'short') return abbr
    if (abbr === 'PH') return 'Phone'
    if (abbr === 'CH') return 'Chat'
    if (abbr === 'CB') return 'Callback'
    return 'N/A'
}

function calculateServiceLevel(department, channel, interval, re = 'number' ){
    // console.log({department, channel, interval, re});
    const {key, target} = department
    const data = store.getters.getIntervalDataByDepartment[department.key][channel][interval]
    if (data){
        const {countOfAnsweredOnTimeContacts, countOfCompletedContacts} = data
        const serviceLevel = Math.floor(countOfAnsweredOnTimeContacts/countOfCompletedContacts*100)

        if (re === 'number' && countOfCompletedContacts) return Math.floor(serviceLevel) + '%'
        if (re === 'color' && countOfCompletedContacts ) {
            // console.log({target, serviceLevel, data});
            if (serviceLevel > target+20) return 'blue'
            if (serviceLevel >= target) return 'green'
            if (serviceLevel >= target-10) return 'yellow'
            if (serviceLevel >= 0) return 'red'
        }
    }
    if (re === 'color' ) return 'none'
    return ' '
}

</script>

<template>
    <table class="stats">
        <tr class="header">
            <th></th>
            <th></th>
            <th class="target">Target</th>
            <th class="interval" v-for="interval in intervals">
                <span class="hour">
                    {{interval.split(':')[0]}}
                </span>
                <span class="minutes">
                    <br>:{{interval.split(':')[1]}}
                </span>
            </th>
        </tr>
        <template v-for="department in departments" :key="department.key">
            <tr class="program" v-for="channel in Object.keys(store.getters.getIntervalDataByDepartment[department.key] ||[])">
                <th class="program-name">{{department.name}}</th>
                <th class="channel-name"><span class="long">{{getChannelName(channel, 'long')}}</span><span class="short">{{getChannelName(channel, 'short')}}</span></th>
                <td class="target">{{department.target}}%</td>
                <td class="data" v-for="interval in intervals" :key="department.key + channel + interval" :class="calculateServiceLevel(department, channel, interval, 'color')" :title="calculateServiceLevel(department, channel, interval, 'number')">
                    <span>{{calculateServiceLevel(department, channel, interval, 'number')}}</span>
                </td>
            </tr>
        </template>
    </table>
</template>

<style lang="scss" scoped>
.stats {
    border-collapse: collapse;
    width: 100%;
    th, td {
        padding-inline: 0.1rem;
        @include jumbo {
            padding-inline: 0.15rem;
        }
        width: 1.4rem;
    }
}
.header {
    span.minutes {
        font-size: 0.6rem;
    }
    > * {
        text-align: center;
    }
    .interval span.hour {
        display: none;
    }
    .interval:nth-of-type(4n) span.hour{
        display: inline;
    }
    .interval:nth-of-type(4n+3){
        border-right: 1px solid var(--textcolor);
    }
    .interval:last-of-type{
        border-right: none;
    }
    .target {
        border-inline: 1px solid var(--textcolor);
        width: 5rem;
        font-size: 0.6rem;
        vertical-align: bottom;
        padding-bottom: 0.15rem;
        @include jumbo {
            font-size: 1rem;
        }

    }
    border-bottom: 1px solid var(--textcolor);
}

.program {
    // display: table;
    height: 2rem;
    .program-name, .channel-name {
        text-align: right;
        width: 5rem;
        font-size: 0.6rem;
        > .long {
            display: none;
        }
        @include jumbo {
            font-size: 1rem;
            > .short {
                display: none;
            }
            > .long {display: initial;}
        }
    }
    .channel-name {
        border-right: 1px solid var(--textcolor);
        width: 6rem;
        // padding-right: 0.2rem;
        text-align: center;
        @include jumbo {
            text-align: right;
            padding-right: 0.5rem;
        }
    }
    .target {
        border-right: 1px solid var(--textcolor);
        font-size: 0.8rem;
        @include jumbo {
            font-size: 1rem;
        }
    }
    .data {
        font-size: 0.4rem;
        &:nth-of-type(4n+1) {
            border-right: 1px solid var(--textcolor);
        }
        &:last-of-type{
            border-right: none;
        }
        > span {
            display: none;
            @include jumbo {
                display: initial;
            }
        }
    }
    .blue {
        background-color: #{lighten($color-light-blue, 5%)};
        color: #eee;
    }
    .green {
        background-color: #{lighten($color-good, 5%)};
        color: black;
    }
    .yellow {
        background-color: #{lighten($color-yellow, 5%)};
        color: black;
    }
    .red {
        background-color: #{lighten($color-bad, 5%)};
        color: #eee;
    }
}
</style>