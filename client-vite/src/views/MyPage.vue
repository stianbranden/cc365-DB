<template>
    <div class="mypagewrapper">
        <div class="myPage">
            <MySchedule2 class="schedule" />
            <PowerBIViz 
                :width= "getPBIWidth()"
                :height= "getPBIHeight()"
                lightSrc="https://app.powerbi.com/reportEmbed?reportId=64264877-874d-4dde-bc79-4a5a3846e503&appId=3852c8b7-7545-4131-a1f7-68cc875610d2&autoAuth=true&ctid=661f8f5f-1e7d-4d4d-a886-1d2661c4ddf8&navContentPaneEnabled=false&filterPaneEnabled=false&pageName=ReportSection"
                darkSrc ="https://app.powerbi.com/reportEmbed?reportId=64264877-874d-4dde-bc79-4a5a3846e503&appId=3852c8b7-7545-4131-a1f7-68cc875610d2&autoAuth=true&ctid=661f8f5f-1e7d-4d4d-a886-1d2661c4ddf8&navContentPaneEnabled=false&filterPaneEnabled=false&pageName=ReportSection0ec235f1079f2f9d5a84"
                class="stats"
            />
            <QueueBox class="queues" :height="getQueueBoxHeight()" />
        </div>
    </div>
</template>

<script setup>
//&navContentPaneEnabled=false&filterPaneEnabled=false
//<iframe title="Scorecard" width="1140" height="541.25" src="https://app.powerbi.com/reportEmbed?reportId=64264877-874d-4dde-bc79-4a5a3846e503&appId=3852c8b7-7545-4131-a1f7-68cc875610d2&autoAuth=true&ctid=661f8f5f-1e7d-4d4d-a886-1d2661c4ddf8" frameborder="0" allowFullScreen="true"></iframe>
//<iframe title="Scorecard" width="1140" height="541.25" src="https://app.powerbi.com/reportEmbed?reportId=64264877-874d-4dde-bc79-4a5a3846e503&appId=3852c8b7-7545-4131-a1f7-68cc875610d2&autoAuth=true&ctid=661f8f5f-1e7d-4d4d-a886-1d2661c4ddf8" frameborder="0" allowFullScreen="true"></iframe>
// import EmbedCard from '../components/EmbedCard.vue'
import MySchedule2 from '../components/MySchedule2.vue'
import QueueBox from '../components/QueueBox.vue'
import PowerBIViz from '../components/PowerBIViz.vue'
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()

function getPBIWidth(){
    let padding = 4*16
    const gap = 10*width.value/100
    let w = ( width.value-padding-gap ) * 2/3
    if (width.value >= 1450) w = w * 3/2 * 3/5
    // console.log(w);
    if (width.value < 1024) return (width.value-padding) 
    else return w
}
function getQueueWidth(){
    return getPBIWidth()/2
}
function getPBIHeight(){
    return getPBIWidth() / 1.25
}
function getQueueBoxHeight(){
    if (width.value < 1024 ) return 175
    else return getPBIHeight()
}


// function updateData(){
//     document.getElementById("agent_dashboard").refreshDataAsync()
// }

</script>

<style lang="scss" scoped>
.mypagewrapper {
    width: 100%;
    padding-inline: 2rem;
    @include medium {
        padding-inline: 5vw;
    }
}
.myPage {

    display: block;
    
    @include medium {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-template-rows: 90px 1fr;
        grid-template-areas: 
            "schedule schedule"
            "stats queues";
        
    }
    @include tv {
        grid-template-columns: 3fr 2fr;
    }
    & > * {
        //border: 1px solid #eee;
        border-radius: 0.5rem;
        box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
        background-color: var(--cardbgcolor);
        margin-block: 2rem 0rem;
        overflow: hidden;
        border: none;
    }
    .schedule {
        grid-area: schedule;
        width: 100%;
    }
    .stats {
        grid-area: stats;
    }
    .queues {
        grid-area: queues;
    }
}

// .mypagewrapper {
//     width: 100%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     padding-inline: 10%;
// }
// .myPage {
//     display: flex;
//     flex-wrap: wrap;
//     justify-content: space-evenly;
//     & > * {
//         //border: 1px solid #eee;
//         border-radius: 0.5rem;
//         box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
//         background-color: var(--cardbgcolor);
//         margin-block: 2rem 0rem;
//         overflow: hidden;
//     }
//     .desktop {
//         display: none;
//         @include small {
//             display: block;
//         }
//     }
//     .mobile {
//         @include small {
//             display: none;
//         }
//     }
//     @include tv {
//         display: grid;
//         grid-template-columns: 1fr 1fr 1fr;
//         grid-template-rows: 1fr 1fr 1fr 1fr;
//         grid-template-areas: 
//             "schedule schedule schedule"
//             "stats stats queues"
//             "stats stats queues"
//             "stats stats queues";
//     }
//     .schedule {
//         grid-area: schedule;
//         width: 100%;
//     }
//     .stats {
//         grid-area: stats;
//     }
//     .queues {
//         grid-area: queues;
//     }
// }

</style>
