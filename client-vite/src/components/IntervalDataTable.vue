<script setup>

// import { watch, computed } from 'vue';
import {useStore} from 'vuex'

const store = useStore()
// const ping = computed(_=>store.state.lastPing)

// watch(ping, _=>{
//     console.log(store.getters.getIntervalDataByDepartment);
// })

const intervals = store.state.intervalLabels

const allowedChannels = ['voice', 'message', 'callback']

function getPrograms(){
  const programs = []
  store.state.genesysIntervalsStats.filter(a=> !a.program.includes('Inside Sales')).forEach(q=>{
    if (!programs.includes(q.program)) programs.push(q.program)
  })
  return programs.sort((a,b)=>a<b?-1:1)
}

function getChannels(program){
    const channels = []
    store.state.genesysIntervalsStats.filter(a=> a.program === program && allowedChannels.includes(a.mediaType)).forEach(q=>{
        if (!channels.includes(q.mediaType)) channels.push(q.mediaType)
    })
    return channels.sort((a,b)=>a<b?-1:1)
}
function getChannelCount(program){
    return getChannels(program).length
}

function abbrTitle(title){
  if (title === 'General Service Denmark') return 'GS DK'
  if (title === 'General Service Finland') return 'GS FI'
  if (title === 'General Service Norway') return 'GS NO'
  if (title === 'General Service Sweden') return 'GS SE'
  if (title === 'Premium Support Kitchen&Interior') return 'PS K&I'
  if (title === 'Premium Support Technical Helpdesk') return 'PS THD'
  if (title === 'Premium Support B2B') return 'PS B2B'
  else return title
}

// const departments = [
//     {
//         key: 'dk',
//         name: 'GS DK', 
//         target: 50
//     },
//     {
//         key: 'fi',
//         name: 'GS FI' , 
//         target: 50
//     },
//     {
//         key: 'no',
//         name: 'GS NO' , 
//         target: 50
//     },
//     {
//         key: 'se',
//         name: 'GS SE' , 
//         target: 50
//     },
//     {
//         key: 'ki',
//         name: 'PS K&I' , 
//         target: 50
//     },
//     {
//         key: 'thd',
//         name: 'PS THD' , 
//         target: 70
//     },
//     {
//         key: 'b2b',
//         name: 'PS B2B' , 
//         target: 50
//     },
// ]

// function getChannelName(abbr, form){
//     if (form === 'short') return abbr
//     if (abbr === 'PH') return 'Phone'
//     if (abbr === 'CH') return 'Chat'
//     if (abbr === 'CB') return 'Callback'
//     return 'N/A'
// }

function getTarget(program){
    if (program === 'Premium Support Technical Helpdesk') return 70
    return 50
}

function getIntervalFromDateTime(intervalStart){
    const time = intervalStart.split('T')[1].split(':')
    const hour = time[0]
    const minute = time[1]
    return `${hour}:${minute}`
}
function calculateServiceLevel(program, channel, interval, ret = 'number'){
    const data = store.state.genesysIntervalsStats.filter(a=>a.program === program && a.mediaType === channel && getIntervalFromDateTime(a.intervalStart) === interval)
    if (data){
        const countOfAnsweredOnTimeContacts = data.reduce((acc, cur)=>acc+cur.serviceLevelStats.numerator, 0)
        const countOfCompletedContacts = data.reduce((acc, cur)=>acc+cur.serviceLevelStats.denominator, 0)
        
        // const {countOfAnsweredOnTimeContacts, countOfCompletedContacts} = data
        const serviceLevel = Math.floor(countOfAnsweredOnTimeContacts/countOfCompletedContacts*100)

        const target = getTarget(program)

        if (ret === 'number' && countOfCompletedContacts) return Math.floor(serviceLevel) + '%'
        if (ret === 'color' && countOfCompletedContacts ) {
            if (serviceLevel > target + 20) return 'blue'
            if (serviceLevel >= target) return 'green'
            if (serviceLevel >= target-10) return 'yellow'
            if (serviceLevel >= 0) return 'red'
        }
    }
    if (ret === 'color' ) return 'none'
    return ' '
}

function getBacklog(program, kpi = 'onTime'){
    const extract = {
        num: 0,
        den: 0,
        off: 0,
        answ: 0
    }
    const data = store.state.genesysDailyStats.filter(a=>a.program === program && a.mediaType === 'email')
    data.forEach(a=>{
        extract.num += a.serviceLevelStats.numerator
        extract.den += a.serviceLevelStats.denominator
        extract.off += a.offered
        extract.answ += a.handled
    })
    const onTime = extract.off > 0? Math.floor(extract.num/extract.den*100) : 0
    const tp = extract.answ - extract.off
    if (kpi === 'display') return data.length ? true: false
    if (kpi === 'tp') return Math.abs(tp)
    if (kpi === 'tp-icon') return tp >= 0? 'arrow-down': 'arrow-up'
    if (kpi === 'tp-style') return tp >= 0? 'green': 'red'
    if (kpi === 'ontime-style') return onTime >= 95? 'green': onTime >= 75? 'yellow': 'red'
    else return onTime + '%'

}

// function calculateServiceLevel(department, channel, interval, re = 'number' ){
//     // console.log({department, channel, interval, re});
//     const {key, target} = department
//     const data = store.getters.getIntervalDataByDepartment[department.key][channel][interval]
//     if (data){
//         const {countOfAnsweredOnTimeContacts, countOfCompletedContacts} = data
//         const serviceLevel = Math.floor(countOfAnsweredOnTimeContacts/countOfCompletedContacts*100)

//         if (re === 'number' && countOfCompletedContacts) return Math.floor(serviceLevel) + '%'
//         if (re === 'color' && countOfCompletedContacts ) {
//             // console.log({target, serviceLevel, data});
//             if (serviceLevel > target+20) return 'blue'
//             if (serviceLevel >= target) return 'green'
//             if (serviceLevel >= target-10) return 'yellow'
//             if (serviceLevel >= 0) return 'red'
//         }
//     }
//     if (re === 'color' ) return 'none'
//     return ' '
// }

</script>

<template>
    <table class="stats">
        <tr class="header">
            <th></th>
            <th class="backlog">Backlog</th>
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
        <template v-for="(program, pindex) in getPrograms()" :key="program">
            <tr 
                v-for="(channel, index) in getChannels(program)" 
                :key="program + channel" 
                class="program"
                :class="pindex > 0 && index === 0? 'border': ''"
            >
                <th 
                    class="program-name"
                    :class="index === 0 && getChannelCount(program) > 1 ? 'movedown': ''"
                >
                    <span>
                        {{index ===0 ? abbrTitle(program): ''}}
                    </span>
                </th>
                <!-- <th class="program-name">{{program}}</th> -->
                <td 
                    class="backlog" 
                    :class="index === 0 && getChannelCount(program) > 1 ? 'movedown': ''"
                    v-if="index === 0 && getBacklog(program, 'display')"
                >
                    <span 
                        class="ontime" 
                        :class="getBacklog(program, 'ontime-style')"
                        title="OnTime Backlog"
                    >
                        {{ getBacklog(program, 'onTime') }}</span>
                    <span 
                        class="tp"
                        :class="getBacklog(program, 'tp-style')" 
                        title="Backlog Throughput"
                    >
                        {{ getBacklog(program, 'tp') }}
                        <font-awesome-icon :icon="['fas', getBacklog(program, 'tp-icon')]" />
                    </span>
                </td>
                <td class="backlog" v-else></td>
                <th class="channel-name"><span class="long">{{channel =='message'? 'chat': channel}}</span><span class="short">{{channel}}</span></th>
                <td class="target">{{getTarget(program)}}%</td>
                <td 
                    class="data" 
                    v-for="interval in intervals" 
                    :key="program + channel + interval"
                    :class="calculateServiceLevel(program, channel, interval, 'color')"
                    :title="calculateServiceLevel(program, channel, interval, 'number')"
                >
                    <span>{{ calculateServiceLevel(program, channel, interval, 'number') }}</span>
                </td>

            </tr>
        </template>
    
        <!-- <template v-for="department in departments" :key="department.key">
            <tr class="program" v-for="channel in Object.keys(store.getters.getIntervalDataByDepartment[department.key] ||[])">
                <th class="program-name">{{department.name}}</th>
                <th class="channel-name"><span class="long">{{getChannelName(channel, 'long')}}</span><span class="short">{{getChannelName(channel, 'short')}}</span></th>
                <td class="target">{{department.target}}%</td>
                <td class="data" v-for="interval in intervals" :key="department.key + channel + interval" :class="calculateServiceLevel(department, channel, interval, 'color')" :title="calculateServiceLevel(department, channel, interval, 'number')">
                    <span>{{calculateServiceLevel(department, channel, interval, 'number')}}</span>
                </td>
            </tr>
        </template> -->
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
    .interval:nth-of-type(2n-1) span.hour{
        display: inline;
    }
    .interval:nth-of-type(2n+2){
        border-right: 1px solid var(--textcolor);
    }
    .interval:last-of-type{
        border-right: none;
    }
    .target, .backlog {
        border-inline: 1px solid var(--textcolor);
        width: 2.5rem;
        font-size: 0.6rem;
        vertical-align: bottom;
        padding-bottom: 0.15rem;
        @include jumbo {
            font-size: 1rem;
        }

    }
    .backlog {
        border-left: 0;
    }
    border-bottom: 1px solid var(--textcolor);
}

.program {
    .movedown {
            position: relative;
            span {
                position: relative;;
                top: 1rem;
            }
        }
    // display: table;
    &.border {
        border-top: 1px dashed var(--textcolor);
    }
    height: 2rem;
    .program-name, .channel-name {
        width: 2.5rem;
        font-size: 0.6rem;
        // text-wrap: nowrap;
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
        text-align: right;
        border-right: 1px solid var(--textcolor);
        width: 3rem;
        // padding-right: 0.2rem;
        text-align: center;
        @include jumbo {
            text-align: right;
            padding-right: 0.5rem;
        }
    }
    .target, .backlog {
        border-right: 1px solid var(--textcolor);
        font-size: 0.8rem;
        @include jumbo {
            font-size: 1rem;
        }
        span.ontime {
            margin-inline-end: 0.5rem;
        }
    }
    .data {
        font-size: 0.4rem;
        &:nth-of-type(2n) {
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
    .data.blue {
        background-color: #{lighten($color-light-blue, 5%)};
        color: #eee;
    }
    .backlog .blue {
        color: #{lighten($color-light-blue, 5%)};
    }
    .data.green {
        background-color: #{lighten($color-good, 5%)};
        color: black;
    }
    .backlog .green {
        color: #{lighten($color-good, 5%)};
    }
    .data.yellow {
        background-color: #{lighten($color-yellow, 5%)};
        color: black;
    }
    .backlog .yellow {
        color: #{lighten($color-yellow, 5%)};
    }
    .data.red {
        background-color: #{lighten($color-bad, 5%)};
        color: #eee;
    }
    .backlog .red {
       
        color: #{lighten($color-bad, 5%)};
    }
}
</style>