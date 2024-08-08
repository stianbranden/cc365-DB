<script setup>
import ContactCalibration from '../components/ContactCalibration.vue'

import { watchDeep } from '@vueuse/core'
import { ref } from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useStore} from 'vuex'

const route = useRoute()
const store = useStore()
const sessionId = route.params.session
store.dispatch('getContactsOnSession', sessionId)

// const session = store.getters.getSession(sessionId)
// const openAssignedContacts = ref(true)
// const openUnAssignedContacts = ref(true)
const abbreviateNames = ref(true)
const editComment = ref(false)
const comment = ref('')


function addContact(contactId){
    store.state.saveCalibrationError.hasError = false
    store.dispatch('assignContactToSession', {contactId, sessionId})
}
function removeContact(contactId){
    store.state.saveCalibrationError.hasError = false
    store.dispatch('removeContactFromSession', {contactId, sessionId})
}

function returnPassAccuracy(contact, evaluator, critical = false){
    const gauge = contact.evaluation.filter(a=>a.isGauge)[0]
    if (!gauge) return 0
    if ( evaluator.evaluator === gauge.evaluator) return 0
    const criticals = []
    const weights = []
    contact.section.forEach(sec=>{
        sec.question.forEach(qu=>{
            criticals.push(qu.kpi)
            weights.push(qu.weight)
        })
    })
    let totalScore = 0
    let totalWeight = 0
    evaluator.scores.forEach((score, index)=>{
        if ( critical && criticals[index] && score === gauge.scores[index]) totalScore+=weights[index]
        else if (!critical && score === gauge.scores[index]) totalScore+=weights[index]

        if (critical && criticals[index]) totalWeight+=weights[index]
        else if ( !critical) totalWeight+=weights[index]
    })
    
    if (critical && totalScore === totalWeight) return 1
    if (!critical && totalScore/totalWeight >= 0.8) return 1
    else return -1
}

function getPassRate(critical = false){
    let passes = 0
    let evaluators = 0
    store.state.contactsOnCalibration.forEach(contact=>{
        contact.evaluation.forEach(evaluator=>{
            const res = returnPassAccuracy(contact, evaluator, critical)
            if ( res === 1 ) passes ++
            if ( res != 0 ) evaluators ++
        })
    })

    if ( evaluators === 0) return 'NA'
    return Math.trunc(passes/evaluators*100) + '% '
}

function saveComment(){
    store.dispatch('saveSessionComment', {sessionId, comment: comment.value})
        .then(_=>{
            editComment.value = false
        })
}
function editCommentClick(){
    comment.value = store.getters.getSession(sessionId).comment
    editComment.value = true
    
}

</script>

<template>
<div class="home">
    <div class="calibration-session-data" :class="store.getters.getSession(sessionId).contacts == 0 ?'no-contacts' : ''">
        <div class="card">
            <div class="card-header">
                {{store.getters.getSession(sessionId).name}}    
            </div>
            <div class="card-body">
                <div>
                    Gauge: {{store.getters.getSession(sessionId).gauge}}
                </div>
                <div>
                    NO Contacts: {{store.getters.getSession(sessionId).contacts.length}}
                </div>
                <div>
                    Passrate: {{getPassRate(false)}}
                </div>
                <div>
                    Critical Passrate: {{getPassRate(true)}}
                </div>
                
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <span></span>
                <span>
                    Session Comment
                </span>
                <span>
                    <font-awesome-icon class="btn" icon="pen-to-square" v-if="!editComment" @click="editCommentClick()" title="Edit comment" />
                    <font-awesome-icon class="btn" icon="circle-check" v-else @click="saveComment()" title="Save comment" />
                </span>
            </div>
            <div class="card-body">
                <div class="saved-comment" v-if="!editComment">
                    {{store.getters.getSession(sessionId).comment}}
                </div>
                <div class="form" v-else>
                    <textarea name="comment" id="" cols="25" rows="10" v-model="comment"></textarea>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header">Add/Remove Contacts</div>
            <div class="card-body">
                <div class="contact-list">
                    <div v-for="contact in store.getters.getSession(sessionId).contacts" :key="contact">
                        <div class="text">
                            {{contact}}
                        </div>
                        <!-- <button @click="removeContact(contact)">Remove</button> -->
                        <font-awesome-icon class="btn" icon="circle-minus" @click="removeContact(contact)" title="Remove contact from session" />
                    </div>
                    <div v-for="contact in store.state.contactsWithoutSession" :key="contact._id">
                        <div class="text" :title="contact.segment">
                            {{contact._id}} 
                            <!-- ({{contact.segment}}) -->
                        </div>
                        <font-awesome-icon class="btn" icon="circle-plus" @click="addContact(contact._id)" title="Add contact to session" />
                        <!-- <button @click="addContact(contact._id)">Add</button> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    <ContactCalibration v-if="store.getters.getSession(sessionId).contacts.length > 0" :contacts="store.getters.getSession(sessionId).contacts" :abbreviateNames="abbreviateNames"/>
</div>
</template>

<style lang="scss" scoped>
.calibration-session-data {
    @include medium {
        display: flex;
    }
    @include tv {
        display: block;
    }
    &.no-contacts{
        @include tv {
            display: flex;
        }
    }
}
.btn {
    cursor: pointer;
    &:hover {
        color: var(--iconhovercolor)
    }
}
.card-header {
    display: flex;
    justify-content: center;
    
}
.card-header:has( span:nth-child(3):last-child){
    justify-content: space-between;
}
.card-body
{
    .saved-comment {
        font-style: italic;
    }
    padding-block: 0.5rem;
    > div {
        margin-block-end: 0.5rem;
    }
    .text {
        // font-size: 0.8rem;
    }
    button {
        font-size: 0.8rem;
    }
    .contact-list {
        overflow-y: auto;
        > div {
            padding-inline: 5rem;
            display: grid;
            grid-template-columns: 80px 1rem;
            > * {
                justify-self: center;
                align-self: center;
                padding: 0.2rem 0;
            }
        }
    }
    
    .contacts-no-session > div {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }
    .contacts-in-session > div {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }

}
</style>