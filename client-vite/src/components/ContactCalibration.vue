<script setup>
import { ref, watch, onMounted } from "vue"
import {useStore} from 'vuex'

const props = defineProps({
  contacts: Array,
//   abbreviateNames: Boolean
})

const i = ref(0)
const store = useStore()

const expandedComments = ref(false)
const abbreviateNames = ref(true)
const editComment = ref(false)
const comment = ref('')
const aidata = ref({hasSummary: false})

onMounted(_=>{
    store.dispatch('getContactCalibration', props.contacts[i.value])
    store.dispatch('getAIData',props.contacts[i.value] )
    .then(contact=>{
        aidata.value = contact
        // console.log(contact);
        
        })
})

watch(i, ()=>{
    // console.log('i has cahnged', props.contacts, i.value);
    store.dispatch('getContactCalibration', props.contacts[i.value])
    store.dispatch('getAIData',props.contacts[i.value] )
    .then(contact=>aidata.value = contact)

})

function findI(sectionI, questionI){
    let index = 0;
    let i = 0;
    store.state.contactCalibration.section.forEach((s, si)=>{
        s.question.forEach((q, qi)=>{
            if (sectionI === si && questionI === qi) i = index
            index++
        })
    })
    return i
}

function refreshData(contactId){
    console.log('Running refresh');
    store.dispatch('refreshContactCalibration', contactId)
}

function returnComment(comment){
    const maxLen = 50
    if (comment.length < maxLen) return comment
    return comment.slice(0, maxLen-3) + '...'
}

function returnEvaluationScore( evaluator, critical = false){
    let totalWeight = 0
    const criticals = []
    store.state.contactCalibration.section.forEach(sec=>{
        sec.question.forEach(qu=>{
            if (critical && qu.kpi ) totalWeight+= qu.weight
            else if (!critical) totalWeight+= qu.weight
            criticals.push(qu.kpi)
        })
    })
      
    const totalScore = evaluator.scores.reduce((a,b, index)=>{
        if (critical && criticals[index]) return a+b
        else if ( critical ) return a + 0
        else return a+b
    }, 0)
    return Math.trunc(totalScore/totalWeight * 100) + '%'
}

function returnAccuracy(evaluator, critical = false, cls=false){
    const gauge = store.state.contactCalibration.evaluation.filter(a=>a.isGauge)[0]
    if (!gauge) return ''
    if ( evaluator.evaluator === gauge.evaluator) return ''
    const criticals = []
    const weights = []
    store.state.contactCalibration.section.forEach(sec=>{
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
    if (cls) {
        if (critical && totalScore === totalWeight) return 'hit'
        if (!critical && totalScore/totalWeight >= 0.8) return 'hit'
        else return 'miss'
    }
    return Math.trunc(totalScore/totalWeight * 100) + '%'
}

function returnColMins(){
    if (abbreviateNames.value) return '50px'
    return '200px'
}

function editCommentClick(){
    comment.value = store.state.contactCalibration.comment
    editComment.value = true
}
function saveComment(){
    store.dispatch('saveContactComment', {contactId: props.contacts[i.value], comment: comment.value})
        .then(_=>{
            editComment.value = false
        })
}

function getPhraseHits(transcript){
    const hits = []
    transcript.forEach(t=>{
        if ( t.hits.length ) hits.push(...t.hits)
    })
    return new Set(hits)
}

</script>

<template>
    <div class="card card-big">
        <div class="card-header">
            <div><font-awesome-icon icon="angle-left" v-if="i>0" @click="i--" /></div>
            <div>Contact #{{i+1}} ({{contacts[i]}})</div>
            <div><font-awesome-icon icon="angle-right" v-if="i+1<contacts.length" @click="i++" /></div>
        </div>
        <div class="card-body">
            <div class="top">
                <div class="buttons">
                    <a :href="'https://eu.calabriocloud.com/#/recordings/' + contacts[i] + '/ccr'" target="_blank"><button>Go to Call</button></a>
                    <button @click="refreshData(contacts[i])">Refresh data</button>
                    <button @click="abbreviateNames = !abbreviateNames" :class="abbreviateNames ? 'active' : ''">Abbreviate names</button>
                </div>
                <div class="segment">  
                    Segment: {{store.state.contactCalibration.segment}}
                </div>
            </div>
            <hr>
            <div class="placeholder" v-if="store.state.contactCalibration.evaluation?.length === 0">
                Waiting for evaluations
            </div>
            <div 
                v-else 
                class="calibration" 
                :style="'grid-template-columns: 200px 250px 100px repeat(' + store.state.contactCalibration.evaluation?.length  + ', minmax(' + returnColMins() + ', 1fr))' "
            >
                <span class="header">Section</span>
                <span class="header">Question</span>
                <!-- <span class="header">Critical</span> -->
                <span class="header">Weight</span>
                <span class="header" v-for="evaluation in store.state.contactCalibration.evaluation" :key="evaluation.evaluator" :title="evaluation.isGauge ? evaluation.evaluator + ' (Gauge)': evaluation.evaluator">
                    {{!abbreviateNames ? evaluation.evaluator : evaluation.evaluator.split(' ').map(a=>a.charAt(0)).join('')}} 
                    <!-- &nbsp; -->
                    <!-- <font-awesome-icon 
                        v-if="evaluation.isGauge"
                        icon="gauge-simple-high" 
                    /> -->
                </span>

                <template v-for="(section, sectionI) in store.state.contactCalibration.section" :key="section.name">
                    <template v-for="(question, questionI) in section.question">
                        <span >{{section.name}}</span>
                        <span ><font-awesome-icon class="critical" icon="star" v-if="question.kpi" title="Critical question" />{{question.name}}</span>
                        <!-- <span >{{question.kpi ? 'Y': 'N'}}</span> -->
                        <span >{{question.weight}}</span>
                        <span  
                            v-for="evaluation in store.state.contactCalibration.evaluation" 
                            :key="evaluation.evaluator" 
                            :class="evaluation.isGauge ? 'gauge' : evaluation.accuracy[findI(sectionI, questionI)] === 1 ? 'hit ' : 'miss '"
                        >
                            {{evaluation.scores[findI(sectionI, questionI)]}}
                        </span>
                    </template>
                </template>

                <span 
                    class="actionable" 
                    :class="expandedComments ? 'expanded' : ''"
                    @click="expandedComments=!expandedComments" 
                    :title="expandedComments ? 'Collapse comments' : 'Expand comments'" 
                >
                    QA Notes&nbsp; <span v-if="expandedComments"><font-awesome-icon icon="angle-up" /></span><span v-else><font-awesome-icon icon="angle-down" /></span> 
                </span>
                <span></span>
                <!-- <span></span> -->
                <span></span>
                <span v-for="evaluation in store.state.contactCalibration.evaluation" :key="evaluation.evaluator" :class="evaluation.isGauge ? 'gauge':''">
                    <ul v-if="expandedComments">
                        <li v-for="(comment, index) in evaluation.comments" :title="comment"> {{returnComment(comment)}} </li>
                    </ul>
                    <template v-else>
                        <span style="font-style: italic;" v-for="(comment, index) in evaluation.comments" :title="comment"> {{index+1}}&nbsp;</span> 
                    </template>
                </span>

                <span class="divider"></span>
                <span class="divider"></span>
                <!-- <span class="divider"></span> -->
                <span class="divider"></span>
                <span class="divider" v-for="evaluation in store.state.contactCalibration.evaluation" :key="evaluation.evaluator"></span>

                <span>Evaluation Score</span>
                <span></span>
                <!-- <span></span> -->
                <span></span>
                <span  
                    v-for="evaluation in store.state.contactCalibration.evaluation" 
                    :key="evaluation.evaluator"
                    :class="evaluation.isGauge ? 'gauge' :''"
                >
                    {{returnEvaluationScore(evaluation, false)}}
                </span>


                <span>Critical Score</span>
                <span></span>
                <!-- <span></span> -->
                <span></span>
                <span  v-for="evaluation in store.state.contactCalibration.evaluation" :key="evaluation.evaluator" :class="evaluation.isGauge ? 'gauge' :''" >
                    {{returnEvaluationScore(evaluation, true)}}
                </span>

                <span>Accuracy</span>
                <span></span>
                <!-- <span></span> -->
                <span></span>
                <span  v-for="evaluation in store.state.contactCalibration.evaluation" :key="evaluation.evaluator" :class="evaluation.isGauge ? 'gauge' : returnAccuracy(evaluation, false, true)" >
                    <font-awesome-icon 
                        v-if="evaluation.isGauge"
                        icon="gauge-simple-high" 
                        title="Gauge"
                    />
                    {{returnAccuracy(evaluation, false)}}
                </span>

                <span>Critical Accuracy</span>
                <span></span>
                <!-- <span></span> -->
                <span></span>
                <span  v-for="evaluation in store.state.contactCalibration.evaluation" :key="evaluation.evaluator" :class="evaluation.isGauge ? 'gauge' : returnAccuracy(evaluation, true, true)" >
                    <font-awesome-icon 
                        v-if="evaluation.isGauge"
                        icon="gauge-simple-high" 
                        title="Gauge"
                    />
                    {{returnAccuracy(evaluation, true)}}
                </span>

            </div>
            <div class="comment">
                <span class="comment-header">Comment</span>
                <font-awesome-icon class="btn" icon="pen-to-square" v-if="!editComment" @click="editCommentClick()" title="Edit comment" />
                <font-awesome-icon class="btn" icon="circle-check" v-else @click="saveComment()" title="Save comment" />
                <span class="comment-text" v-if="!editComment">
                    {{store.state.contactCalibration.comment}}
                </span>
                <div class="form" v-else>
                    <textarea name="comment" id="" cols="125" rows="3" v-model="comment"></textarea>
                </div>
            </div>
            <div class="aidata" v-if="aidata.hasSummary">
                <div class="ai-header">AI Data</div>
                <div class="header">{{aidata.contactReason.level1}} - {{aidata.contactReason.level2}} (Confidence: {{aidata.contactReason.confidence}})</div>
                <div class="footer">Customer sentiment: {{aidata.sentiment}}</div>
                <div class="summary">{{aidata.summary}}</div>
                <div class="phrase-hits">
                    <span>Phrase hits: </span>
                    <span>
                        {{Array.from(getPhraseHits(aidata.transcript)).join(', ')}}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#everything .home .card.card-big {
    width: calc(4 * var(--cardwidth));
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