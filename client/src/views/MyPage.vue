<template>
    <div class="myPage">
        <EmbedCard
            lightSrc="https://analytics.elkjop.com/t/CCC/views/AgentDB/Agentlight"
            darkSrc="https://analytics.elkjop.com/t/CCC/views/AgentDB/Agent"
            height="850"
            width="1100"
            id="agent_dashboard"
            class="desktop"
        > 
            <div class="refresh-button">
                <button @click="updateData"><font-awesome-icon icon='sync'/></button>
            </div>
        </EmbedCard>
        <EmbedCard
            lightSrc="https://analytics.elkjop.com/t/CCC/views/AgentDB/Mobile"
            darkSrc="https://analytics.elkjop.com/t/CCC/views/AgentDB/Mobile"
            height="850"
            width="420"
            id="agent_mobile_dashboard"
            class="mobile"
        />
        <QueueBox />
        <MySchedule />
    </div>
</template>

<script setup>
import EmbedCard from '../components/EmbedCard.vue'
import MySchedule from '../components/MySchedule.vue'
import QueueBox from '../components/QueueBox.vue'

function updateData(){
    document.getElementById("agent_dashboard").refreshDataAsync()
}

</script>

<style lang="scss" scoped>
.myPage {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    & > * {
        //border: 1px solid #eee;
        border-radius: 0.5rem;
        box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
        background-color: var(--cardbgcolor);
        margin-block: 2rem 0rem;
        overflow: hidden;
    }
    .desktop {
        display: none;
        @include small {
            display: block;
        }
    }
    .mobile {
        @include small {
            display: none;
        }
    }
    
}

</style>

<style lang="scss">
.myPage .card-header{
    position: relative;
    .refresh-button {
        position: absolute;
        right: 0;
        z-index: 2;
        margin: 0.5rem;
    }

}
</style>