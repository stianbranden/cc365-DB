<template>
    <form @submit.prevent="submit">
        <div class="form-header" v-if="_id === 'new'">
            {{header}}
        </div>
        <div>
            <label for="name">Name</label>
            <input type="text" name="name" id="name" v-model="name">
        </div>
        <div>
            <label for="visible">Visible on all pages</label>
            <input type="checkbox" name="visible" id="visible" v-model="visibleOnAll">

        </div>
        <div>
            <label for="department">Select department</label>
            <select name="department" id="department" v-model="department" @change="updateQueues">
                <option value="all">All</option>
                <option v-for="d in queueSelections.department" :value="d" :key="d">{{d}}</option>
            </select>
        </div>
        <div>
            <label for="country">Select country</label>
            <select name="country" id="country" v-model="country" @change="updateQueues">
                <option value="all">All</option>
                <option v-for="c in queueSelections.country" :value="c" :key="c">{{c}}</option>
            </select>
        </div>
        <div>
            <label for="area">Select area</label>
            <select name="area" id="area" v-model="area" @change="updateQueues">
                <option value="all">All</option>
                <option v-for="a in queueSelections.area" :value="a" :key="a">{{a}}</option>
            </select>
        </div>
        <div>
            <label for="channel">Select channel</label>
            <select name="channel" id="channel" v-model="channel" @change="updateQueues">
                <option value="all">All</option>
                <option v-for="c in queueSelections.channel" :value="c" :key="c">{{c}}</option>
            </select>
        </div>
            <span>Queues selected: {{selectedQueues.length}}</span>
        <div class="queues">
            <p
                v-for="q in queues" 
                :key="q.id"
                :class="{active: selectedQueues.includes(q.id)}"
                @click="toggleQueue(q.id)"
            >
                {{q.name}}
            </p>
        </div>
        <div class="quick">
            <span @click="addQueues">
                Select queues
            </span>
            <span @click="selectedQueues=[]">
                Empty selection
            </span>
        </div>
        <div>
            <label for="channelType">Select channel type</label>
            <select name="channel-type" id="channel-type" v-model="selectedChannel">
                <option value="EM">Backlog</option>
                <option value="PH">LiveChannel</option>
            </select>
        </div>
        <div class="button">
            <button @click="emit('close')">Cancel</button>
            <button type="submit">{{header}}</button>
        </div>
    </form>
</template>


<script setup>
import {useStore} from 'vuex'
import {onMounted, watch, ref, computed, toRefs, defineEmits} from 'vue'

const props = defineProps({_id: String, collection: Object})
const emit = defineEmits(['close'])
const {_id, collection} = toRefs(props)
const store = useStore()
const queueSelections = ref(store.getters.getQueueSelections)
const ping = computed(_=>store.state.lastPing)

const department = ref('all')
const country = ref('all')
const area = ref('all')
const channel = ref('all')
const queues = ref([])

const header = ref('Create collection')
const selectedQueues = ref([])
const visibleOnAll = ref(false)
const selectedChannel = ref('EM')
const name = ref(store.state.user?.name + ' - Collection ' + Number(store.state.collections.length + 1))

if ( _id.value !== 'new' ){
    selectedQueues.value = [...collection.value.queues]
    visibleOnAll.value = collection.value.visibleOnAll
    name.value = collection.value.name
    header.value = 'Update collection'
    selectedChannel.value = collection.value.channel
}



updateQueues()

function addQueues(){
    queues.value.forEach(q=>{
        if (!selectedQueues.value.includes(q.id)) selectedQueues.value.push(q.id)
    })
}

function toggleQueue(id){
    if ( selectedQueues.value.includes(id) ) {
        const index = selectedQueues.value.indexOf(id)
        selectedQueues.value.splice(index, 1)
    }
    else selectedQueues.value.push(id)
    //console.log(selectedQueues.value);
}

watch(ping, updateQueueSelections)

function updateQueueSelections(){
    queueSelections.value = store.getters.getQueueSelections
    updateQueues()
    //console.log(queues.value);
}

function updateQueues(){
    queues.value = store.getters.getQueuesFromQueueSelection(department.value, country.value, area.value, channel.value)
    //console.log(queues.value);
}

function submit(){
    const data = {
        name: name.value,
        _id: _id.value,
        visibleOnAll: visibleOnAll.value,
        queues: [...selectedQueues.value],
        channel: selectedChannel.value
    }
    store.dispatch('addOrUpdateCollection', data)
    emit('close')
}


</script>


<style lang="scss" scoped>
    form {
        color: var(--textcolor);
        .form-header {
            text-align: center;
            display: block;
            background-color: var(--headercolor);
            margin-block: 0;
            padding-block: 1rem;
            
        }
        .button {
            display: flex;
            justify-content: center;
            button {
                padding: 0.5rem;
                margin-inline: 0.5rem;
            }
        }
        margin-block: 1rem;
        border-radius: 0.5rem;
        background-color: var(--cardbgcolor);
        //padding: 1rem;
        display: flex;
        flex-direction: column;
        width: 90vw;
        max-width: 400px;
        margin-inline: auto;
        > div {
            margin-block: 1rem;
            padding-inline: 1rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            input, select {
                padding-block: 0.2rem;
                text-align: center;
            }
        }
        .queues {
            max-height: 200px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            p {
                cursor: pointer;
            }
            .active {
                background-color: var(--headercolor);
                color: var(--linkcolor);
            }
        }
        .quick {
            span {
                text-decoration: underline;
            }
        }
    }
</style>