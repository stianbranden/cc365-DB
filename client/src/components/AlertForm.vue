<template>
    <div class="card-body alert-form">
        <div class="form-header">{{header}}</div>
        <div class="form-subtext">
            {{subtext}}
        </div>
        <form @submit.prevent="submit">
            <div class="section type">
                <label for="type">Select type</label>
                <select name="type" v-model="type" id="type">
                    <option v-for="t in types" :value="t" :key="t">{{t}}</option>
                </select>
            </div>
            <div class="section status">
                <label for="status">Select status</label>
                <select name="status" v-model="status" id="status">
                    <option v-for="s in statuses" :value="s" :key="s">{{s}}</option>
                </select>
            </div>
            <div class="departments">
                <div class="sub-header">
                    Select departments
                </div>
                <div
                    
                    v-for="d in departments"
                    :key="d"
                >
                    <input 
                        type="checkbox" 
                        :value="d" 
                        :id="d" 
                        v-model="departmentsSelected"
                        :disabled="alertId !== 'new'"
                    >
                    <label :for="d">{{d}}</label>
                </div>

            </div>

            <textarea v-model="text" cols="30" rows="4" placeholder="Enter description"></textarea>
            <div class="buttons">
                <button class="cancel" type="cancel" @click.prevent="emit('close')">Cancel</button>
                <button class="submit">Submit</button>
                <button class="close" v-if="alertId !== 'new'">Close alert</button>
            </div>
        </form>
        <div class="errors" v-if="errors.length">
            <p class="error" v-for="(err, index) in errors" :key="index">
                {{err.text}}
            </p>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from "vue";
import { useStore } from "vuex";

const emit = defineEmits(['close'])
const props = defineProps({alert: String})
const alertId = ref(props.alert)

const store = useStore();

const header = ref('Create log')
const subtext = ref(`Logs should only contain information related to events and decisions made.
            Do not enter information related to employees or customers`)

const types = ['System Outage', 'Power Outage', 'Force Majeure event', 'Intraday log']
const type = ref('Intraday log')

const statuses = ['Closed', 'Pending', 'Open']
const status = ref('Closed')

const departments = ['Denmark', 'Finland', 'Norway', 'Sweden', 'Kitchen', 'Helpdesk']
const departmentsSelected = ref([])

const text = ref(null)

if ( alertId.value !== 'new' ) getAlertData(alertId.value)


const errors = ref([])


function getAlertData(alertId){
    const alert = store.state.alerts.filter(a=>a._id === alertId )[0]
    header.value = `Update ${alert.alerttype}`
    type.value = alert.alerttype
    status.value = alert.status
    departmentsSelected.value = [alert.department]

}


const submit = e =>{
    wipeErrors();
    const data = {
        alerttype: type.value,
        status: status.value,
        departments: [...departmentsSelected.value],
        text: text.value
    }
    const errors = []
    if ( !data.departments.length ) errors.push({text: 'No departments selected', el: e.target.querySelector('.departments')})
    if ( !data.text ) errors.push({text: 'No description entered', el: e.target.querySelector('textarea')});

    //console.log(data, e);
    if (errors.length) onError(errors)
    else if (alertId.value === 'new' ) onSuccess(data, e)
    else onUpdate(alertId.value, data, e)

}

function onSuccess(data, e){
    store.dispatch('createAlert', data)
        .then(_=>{
            e.target.reset();
            emit('close')
        })
        .catch(msg=>onError([{text:msg, el: null}]))
}

function onUpdate(alertId, data, e){
    data.department = data.departments[0]
    delete data.departments
    store.dispatch('updateAlert', {alertId, data})
        .then(_=>{
            e.target.reset()
            emit('close')
        })
        .catch(msg=>onError([{text: msg, el: null}]))
}

function onError(err){
    errors.value = [...err]
    err.forEach(({text, el})=>{
        //errors.value.push(text)
        if (el) {
            el.classList.add('error')
            el.setAttribute('title', text)
        }
    })
}

function wipeErrors(){
    errors.value.forEach(({el})=>{
        if (el) {
            el.classList.remove('error')
            el.setAttribute('title', '')
        }
    })
    errors.value = []
}


</script>


<style lang="scss" scoped>
.alert-form {
    > * {
        margin: 0 10%;
    }
    .form-header {
        font-size: 2rem;
        margin-top: 0.5rem;
    }
    .form-subtext {
        font-style: italic;
        font-size: 0.8rem;
    }
    .errors {
        margin-top: 0.5rem;
        background: $color-bad;
        padding: 0.5rem;
    }
    form {
        .error {
            border: 2px dashed $color-bad;
        }
        margin-top: 1rem;
    // padding-top: 1rem;
        display: flex;
        flex-direction: column;
        .section {
            display: flex;
            justify-content: space-between;
            > select {
                margin-bottom: 0.5rem;
                text-align: center;
                background: var(--alertcheckboxcolor);
                color: white;
                height: 1.5rem;
                flex-basis: 55%;
            }
        }
        > textarea {
            margin-top: 1rem;
            padding: 0.1rem;
            //margin-bottom: 1rem;
        }
        .departments {
            //margin-top: 1rem;
            padding: 0.5rem;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            grid-gap: 0.5rem;
            .sub-header {
                flex-basis: 100%;
            }
            input {
                display: none;
            }
            label {
                width: 6rem;
                display: inline-block;
                box-sizing: border-box;
                border: 1px solid black;
                background: var(--alertcheckboxcolor);
                color: white;
                padding: 0.5rem;
                border-radius: 0.2rem;
                cursor: pointer;
                &:hover {
                    font-weight: bold;
                    
                }
            }
            :disabled + label {
                cursor: not-allowed;
                &:hover {
                    font-weight: normal;
                }
            }
            :checked + label {
                background: white;
                color: black;
                font-weight: bold;
                &:hover {
                    font-weight: bold;
                }
            }
        }
        .buttons {
            display: flex;
            justify-content: center;
            button {
                padding: 0.5rem;
                border-radius: 0.2rem;
                flex-basis: 6rem;
                margin: 0.5rem;
                border: none;
                &:hover {
                    font-weight: bold;
                }
                &.cancel {
                    background-color: $color-grey;
                    color: white;
                }
                &.submit {
                    background-color: $color-good;
                }
            }
        }

    }
}
    
</style>