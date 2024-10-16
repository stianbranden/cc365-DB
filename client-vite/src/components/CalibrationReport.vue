<script setup>
import { computed, ref } from 'vue';
import {useStore} from 'vuex'
const store = useStore()

const contacts = computed(_=>store.state.contactsOnCalibration)
const evaluators = computed(_=>{
    const evaluators = []
    contacts.value.forEach(contact=>{
        contact.evaluation.filter(a=>!a.isGauge).forEach(e=>{
            if (evaluators.filter(a=>a.name === e.evaluator).length > 0){
                evaluators.filter(a=>a.name === e.evaluator)[0].accuracies.push(e.accuracy)
            }
            else {
                evaluators.push({
                    name: e.evaluator,
                    initials: getInitials(e.evaluator),
                    accuracies: [e.accuracy]
                })
            }
        })
    })
    return evaluators.sort((a,b)=>a.initials < b.initials ? -1: 1)
})
// console.log(evaluators.value);


const pages = ['contact-report', 'evaluator-report']
const page = ref(pages[0])

function getInitials(name) {
  return name
    .split(' ')                      // Split the name into an array of words
    .map(word => word[0].toUpperCase())  // Get the first letter of each word and convert to uppercase
    .join('');                        // Join the initials together
}

function nextPage(step){
    const index = pages.indexOf(page.value)+step
    if (index < pages.length ) return pages[index]
    return pages[0]
}

function getEvaluatorQuestionScore(evaluator, sec, que){
    let row = 0
    for (let k = 0; k < sec; k++){
        row += contacts.value[0].section[k].question.length
    }
    row += que
    // console.log(evaluator);
    
    return Math.floor(evaluator.accuracies.reduce((sum, curr)=>sum + curr[row], 0) / evaluator.accuracies.length * 100)
}

function getEvaluatorQuestionClass(evaluator, sec, que){
    if (getEvaluatorQuestionScore(evaluator, sec, que) >= 75) return 'hit'
    return 'miss'
}

function getQuestionScore(contact, sec, que){
    let row = 0
    for (let k = 0; k < sec; k++){
        row += contact.section[k].question.length
    }
    row += que
    const evaluators = contact.evaluation.filter(a=>!a.isGauge)
    return Math.floor(evaluators.reduce((sum, curr)=>sum + curr.accuracy[row], 0) / evaluators.length * 100)
}
function getQuestionClass(contact, sec, que){
    if (getQuestionScore(contact, sec, que) >= 75) return 'hit'
    return 'miss'
}

function returnQuestionAverage(sec, que){
    let row = 0
    for (let k = 0; k < sec; k++){
        row += contacts.value[0].section[k].question.length
    }
    row += que
    let den = 0
    let num = 0
    for ( let k = 0; k < contacts.value.length; k++){
        const evaluators = contacts.value[k].evaluation.filter(a=>!a.isGauge)
        num += evaluators.reduce((sum, curr)=>sum + curr.accuracy[row], 0)
        den += evaluators.length
    }
    return Math.floor(num / den * 100)
}
function getAvgClass(sec, que){
    if (returnQuestionAverage(sec, que) >= 75) return 'hit'
    return 'miss'
}

function getDistinctEvaluators(){
    const evaluators = []
    contacts.value.forEach(contact=>{
        contact.evaluation.filter(a=>!a.isGauge).forEach(evaluation=>{
            if (!evaluators.includes(evaluation.evaluator) )
                evaluators.push(evaluation.evaluator)
        })
    })
    return evaluators
}

</script>

<template>
    <div class="card card-big calibration-report">
        <div class="card-header">
            <span>
                <font-awesome-icon icon="angle-left" class="btn" @click="page=nextPage(-1)"/>
            </span>
            <span v-if="page==='contact-report'">
                {{ contacts[0].calibration }} - Questions on contacts
            </span>
            <span v-if="page==='evaluator-report'">
                {{ contacts[0].calibration }} - Questions on evaluators
            </span>
            <span>
                <font-awesome-icon icon="angle-right" class="btn"  @click="page=nextPage(1)"/>
            </span>
        </div>
        <div class="card-body">
            <div 
                class="calibration" 
                :style="'grid-template-columns: 200px 250px repeat(' + contacts.length  + ', minmax(50px, 1fr)) minmax(50px, 1fr)' "
                v-if="page==='contact-report'"
            >
                <span class="header">Section</span>
                <span class="header">Question</span>
                <!-- <span class="header">Critical</span> -->
                <!-- <span class="header">Weight</span> -->
                <span class="header" v-for="(contact,i) in contacts" :key="contact._id" :title="contact._id">
                    #{{ i+1 }}
                </span>
                <span class="header">AVG</span>
                <template v-for="(section, i) in contacts[0].section">
                    <template v-for="(question, j) in section.question">
                        <span>{{ section.name }}</span>
                        <span>{{ question.name }}</span>
                        <!-- <span>{{ question.weight }}</span> -->
                        <span v-for="(contact) in contacts" :class="getQuestionClass(contact, i, j)">
                            {{ getQuestionScore(contact, i, j) }}%
                        </span>
                        <span :class="getAvgClass(i,j)">{{returnQuestionAverage(i,j)}}%</span>
                    </template>
                </template>
                <span></span><span>NO Evaluators</span>
                <span v-for="contact in contacts">
                    {{ contact.evaluation.filter(a=>!a.isGauge).length }}
                </span>
                <span>
                    {{ getDistinctEvaluators().length }}
                </span>
            </div>
            <div 
                class="calibration" 
                :style="'grid-template-columns: 200px 250px repeat(' + evaluators.length  + ', minmax(50px, 1fr)) minmax(50px, 1fr)' "
                v-else-if="page==='evaluator-report'"
            >
                <span class="header">Section</span>
                <span class="header">Question</span>
                <!-- <span class="header">Critical</span> -->
                <!-- <span class="header">Weight</span> -->
                <span class="header" v-for="(evaluator,i) in evaluators" :key="evaluator.name" :title="evaluator.name">
                    {{ evaluator.initials }}
                </span>
                <span class="header">AVG</span>
                <template v-for="(section, i) in contacts[0].section">
                    <template v-for="(question, j) in section.question">
                        <span>{{ section.name }}</span>
                        <span>{{ question.name }}</span>
                        <!-- <span>{{ question.weight }}</span> -->
                        <span v-for="(evaluator) in evaluators" :class="getEvaluatorQuestionClass(evaluator, i, j)">
                           {{ getEvaluatorQuestionScore(evaluator, i, j)}}%
                        </span>
                        <span :class="getAvgClass(i,j)">{{returnQuestionAverage(i,j)}}%</span>
                    </template>
                </template>
                <span></span><span>NO contacts</span>
                <span v-for="evaluator in evaluators">
                    {{ evaluator.accuracies.length }}
                </span>
                <span>{{ contacts.length }}</span>
            </div>

        </div>
    </div>
</template>

<style lang="scss" scoped>
.card-big {
    width: calc(4 * var(--cardwidth));
    align-self: flex-start;
    .card-body {
        min-height: calc(2 * var(--cardbodyheight) + 4rem);
        height: fit-content;

    }
}
.btn {
    cursor: pointer;
    &:hover {
        color: var(--iconhovercolor)
    }
}
.card-header{
    display: flex;
    justify-content: space-between;
}
.card-body {
    .top {
        padding-inline: 1rem;
        padding-block: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .buttons > * {
        margin-right: 0.5rem ;
    }
    hr {
        margin-inline: auto;
        width: 95%;
        margin-block: 0.5rem;
    }
    .comment, .aidata {
        border: 1px solid var(--textcolor);
        background-color: var(--cellcolor);
        margin-inline: 1rem;
        margin-block: 1rem;
        min-height: 5rem;
        padding: 0.5rem;
        position: relative;
        > svg {
            position: absolute;
            right: 0.1rem;
            bottom: 0.2rem;
        }
        .comment-header, .ai-header {
            position: absolute;
            left: 0.5rem;
            top: 0.1rem;
            font-weight: bold;
        }
        .comment-text{
            font-style: italic;
        }
        .header {
            font-weight: bold;
            // margin-block: 0.5rem;
        }
        .footer, .summary, .header, .phrase-hits {
            margin-block: 0.5rem;
        }
        .form {
            margin-block-start: 1rem;
        }
        .phrase-hits{
            > span:first-child {
                font-weight: bold;
            }
            > span:last-child {
               font-style: italic;
           }
        }
    }
    .calibration {
        display: grid;
        margin-inline: 1rem;
        margin-block: 1rem;
        overflow-x: auto;
        > span {
            border: 1px solid var(--textcolor);
            background-color: var(--cellcolor);
            padding: 0.1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 50px;
            position: relative;
            &.actionable {
                cursor: pointer;
            }
            &.expanded {
                align-items: flex-start;
                padding-block-start: 1rem;  
            }
            &.divider {
                min-height: 10px;
                border: none;
            }
            &:has(ul) {
                justify-content: flex-start;
                // align-items: flex-start;
            }
            > ul {
                list-style: none;
                align-self: start;
                padding: 0.2rem;
                text-align: left;
                overflow-x: hidden;
                > li {
                    align-content: start;
                }
            }
            > svg.critical {
                position: absolute;
                top: 0.1rem;
                left: 0.1rem;
                scale: 60%;
            }
        }
        .header {
            background-color: var(--headercolor);
            color: var(--linkcolor);
            padding-block-end: 0.5rem;
            align-items: flex-end;
            font-size: 1.1rem;
            font-weight: 700;
        }
        .hit {
            background-color: #{$color-good}55;
        }
        .miss {
            background-color: #{$color-bad}55;
        }
        .gauge {
            background-color: #{$color-lighter-blue}55;
        }
    }
}
</style>