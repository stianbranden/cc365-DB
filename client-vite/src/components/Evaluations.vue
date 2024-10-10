<script setup>
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import moment from 'moment'
const store = useStore()

const selectedUser = ref(store.state.user._id)


const status = ref(0)
const msg = ref(null)
const refreshing = ref(false)

function refresh(){
    console.log('Refresh');
    refreshing.value = true
    const id = selectedUser.value
    setTimeout(_=>{
        store.dispatch('updateEvaluations', {evaluatorMode: true, id})
            .then(result => {
                if (result === 'OK'){
                    status.value = 1
                    msg.value = null
                }
                else {
                    status.value = 2
                    msg.value = result
                }
            })
            .finally(_=>{
                refreshing.value = false
            })

    }, 1000)
    
}

watch(selectedUser, _=>{
    refresh()
})

function stateToStatus(stateId){
    switch (stateId){
        case 0: 
            return 'Assigned'
        case 1: 
            return 'Completed'
        case 2:
            return 'In progress'
        case 4: 
            return 'Cannot score'
        default: 
            return 'N/A'
    }
}
function returnPassOrFail(evaluation){
    const score = evaluation.evaluation?.totalScore
    if ( evaluation.evalStateId !== 1) return 'na'
    else {
        const {bandRanges} = evaluation.evalForm
        if ( bandRanges.filter(a=>a.begin <= score && a.end >= score )[0].band===1)
            return 'fail'
        else return 'pass'
    }
}

function openRecording(id){
    window.open(`https://eu.calabriocloud.com/#/recordings/${id}/ccr`, '_blank')
}

refresh()

</script>

<template>
    <div class="evaluations">
        <div class="tile">
            <div class="title">
                {{selectedUser !== store.state.user._id ? selectedUser: 'My evaluations'}} <br> ({{ store.state.evaluations.filter(a=> a.evalStateId === 0 || a.evalStateId === 2).length }} actionable)
            </div>
            <div class="evaluator-selector" v-if="store.getters.isQualityAdmin">
                <select name="evaluator" id="evaluator" v-model="selectedUser">
                    <option v-if="!store.state.cgp.some(a=>a.username===store.state.user._id)" :value="store.state.user._id">{{ store.state.user.name }}</option>
                    <option v-for="evaluator in store.state.cgp" :value="evaluator.username">{{evaluator.evaluator}}</option>
                </select>
            </div>
            <div class="refresh" v-if="refreshing">
                <font-awesome-icon icon="circle-notch" class="circle" />
            </div>
            <div @click="refresh()" class="clickToRefresh" v-else title="Refresh list">
                <font-awesome-icon icon="circle-notch" class="circle" />
            </div>
            <div class="evaluation-list">
                <div class="evaluation" v-for="evaluation in store.state.evaluations">
                    <span :title="stateToStatus(evaluation.evalStateId)">
                        <font-awesome-icon v-if="evaluation.evalStateId===0" :icon="['far', 'circle']" class="circle" />
                        <font-awesome-icon v-else-if="evaluation.evalStateId===2":icon="['fas', 'circle-half-stroke']" class="circle" />
                        <font-awesome-icon v-else :icon="['fas', 'circle']" class="circle" />
                    </span>
                    <span title="Open in Calabrio" class="link" @click="openRecording(evaluation._id)" >{{ evaluation._id }}</span>
                    <span>{{ evaluation.agent.displayId }}</span>
                    <span v-if="evaluation.evalStateId === 0"></span>
                    <span v-else title="Date evaluated">{{ moment(evaluation.evaluation.evaluated).format('DD.MM.YY') }}</span>
                    <!-- <span>{{ stateToStatus(eval6uation.evalStateId) }}</span> -->
                    <span :class="returnPassOrFail(evaluation)">
                        <font-awesome-icon v-if="returnPassOrFail(evaluation)==='pass'" :icon="['far', 'circle-check']"/>
                        <font-awesome-icon v-else-if="returnPassOrFail(evaluation)==='fail'" :icon="['far', 'circle-xmark']"/>
                        <font-awesome-icon v-else :icon="['far', 'circle-question']"/>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
div.evaluations{
  display: flex;
    // padding-top: 1rem;
  margin-inline: 2rem;
  .evaluation-list {
      overflow-y: auto;
      height: 88%;
    }
    .evaluator-selector {
        position: absolute;
        top: 1rem;
        // left: 0.5rem;
    }
    .refresh, .clickToRefresh {
        position: absolute;
        right: 1rem;
        top: 1rem;
    }
    .refresh {
        animation: spin 2s linear infinite;
    }
    .clickToRefresh {
        cursor: pointer;
    }
    .evaluation {
        display: grid;
        grid-template-columns: 0.1fr 0.6fr 1.8fr 1fr 0.2fr;
        justify-items: baseline;
        border-block-end: 1px dashed var(--textcolor);
        margin-block: 0.2rem;
        span {
            padding-inline: 0.5rem;
        }
        .pass {
            color: var(--activelinkcolor);
        }
        .fail {
            color: $color-bad;
        }
        :nth-last-child(2), :last-child {
            justify-self: flex-end;
            // padding
        }
        .link {
            cursor: pointer;
            &:hover {
                text-decoration: underline;
            }
        }
    }

    > .tile {
    position: relative;
    margin: 1rem;
    box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
    background-color: var(--cardbgcolor);
    width: calc(600px + 6rem);
    height: 600px;
    padding: 1rem;
    // padding-block-start: 1.7rem;
    // display: flex;
    // flex-direction: column;
    // justify-content: space-between;
    .title {
        font-size: 1.2rem;
    }
    > div {

        margin-block-end: 1rem;
    }
    // cursor: pointer;
    transition: scale 0.5s;
    // &:hover {
    //   scale: 1.05;
    // }
    // .icon {
    //   height: 4rem;
    // }
  }
}
</style>