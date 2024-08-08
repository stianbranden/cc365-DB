<template>
    <div :class="{expanded}">
        <span class="name" @click="expand(false)">
            <font-awesome-icon icon="angle-down" v-if="!expanded" /> 
            <font-awesome-icon icon="angle-up" v-else /> 
            {{name}} </span>
        <span class="pages"><font-awesome-icon :icon="['r', 'file']" /> {{numPages}}</span>
        <span class="alerts"><font-awesome-icon icon="exclamation-triangle" /> {{numAlerts}}</span>
        <span class="alerts"><font-awesome-icon icon="users" /> {{numUsers}}</span>
        <span class="options">
            <font-awesome-icon
              class="edit"
              :icon="['far', 'edit']"
              @click="expand(true)"
            />
            <font-awesome-icon
              :icon="['far', 'trash-alt']"
              @click="openDelete"
            />
        </span>
        <div class="more" v-if="expanded && !editable">
            <h5>Applies to</h5>
            <div v-for="(value, name) in access.rule" :key="name" >
                <span class="key">{{name}}</span>
                <span class="value">{{value}}</span>
            </div>
            <template v-if="access.alerts.length > 0">
                <h5>Show alerts for</h5>
                <div>
                    <span class="value" v-for="alert in access.alerts" :key="alert">{{alert}}</span>

                </div>

            </template>
            <template v-if="access.pages.length > 0">
                <h5>Additional pages</h5>
                <div v-for="page in access.pages" :key="page._id">
                    <div v-for="(value, name) in removeId(page)" :key="name">
                        <span class="key">{{name}}</span>
                        <span class="value">{{value}}</span>
                    </div>
                </div>
            </template>

        </div>
        <Vue3JsonEditor 
            class="more"
            v-else-if="editable"
            v-model="prepped"
            :show-btns="true"
            @json-save="changeAccess"
            :mode="'code'"
        />
        <div
          class="more"
          v-else-if="del"
        >
            <span>Delete access?</span>
            <button @click="openDelete">Cancel</button>
            <button @click="deleteAccess">Delete</button>
        </div>
    </div>
</template>

<script setup>
import {onMounted, ref, computed, watch, onUpdated} from 'vue'
import { Vue3JsonEditor } from 'vue3-json-editor'

const props = defineProps({access_id: String})
const access_id = props.access_id
const emit = defineEmits(['access-update'])
const access = ref()


const prepAccess = _=>{
    const obj = {...access.value}
    delete obj._id
    obj.grant.forEach(g=>delete g._id)
    obj.pages.forEach(p=>{
        delete p._id
        p.params.forEach(pa=>delete pa._id)
    })
    
    return obj
}
const prepped = computed(prepAccess)

const numUsers = ref(0)
const numPages = ref(0)
const numAlerts = ref(0)
const name = ref(null)
const expanded = ref(false)
const editable = ref(false)
const del = ref(false)


function openDelete(){
    if (!del.value){
        expanded.value=false
        editable.value=false
    }
    del.value = !del.value
}


onMounted(_=>{
    getAccess()
})

async function deleteAccess(){
    const response = await fetch(`${process.env.VUE_APP_API_ROOT}access/${access_id}`, {
        method: 'DELETE', 
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if (response.ok) emit('access-update')
    else console.log(response);
}

async function getAccess(){
    access.value = await fetch(`${process.env.VUE_APP_API_ROOT}access/${access_id}`).then(response=>response.json())
    name.value = access.value.name
    numPages.value = access.value.pages.length
    numAlerts.value = access.value.alerts.length
    updateUserCount()
}

function changeAccess(data){
    fetch(`${process.env.VUE_APP_API_ROOT}access/${access_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response=>{
        console.log(response)
        getAccess()
    })
    .catch(err=>console.error(err))
}

function expand(edit){
   // console.log('Expanding', edit, expanded.value, editable.value);

    if (expanded.value && !edit){
        editable.value = false
        expanded.value = false
    }
    else if(expanded.value && edit){
        editable.value = true
    }
    else {
        editable.value = edit
        expanded.value = true
    }
}

function updateUserCount(){
    fetch(`${process.env.VUE_APP_API_ROOT}access/${access_id}/users`)
        .then(response=>response.json())
        .then(users => numUsers.value = users.length)
}

function removeId(obj){
    const newObject = {}
    Object.keys(obj).forEach(key=>{
        if (key !== '_id') newObject[key] = obj[key]
    })
    return newObject
}


</script>


<style lang="scss" scoped>
  .row {
      border-top: 1px dashed black;
    padding: 0.5rem 1rem;
    display: grid;
    grid-template-columns: 4fr 1fr 1fr 1fr 1fr;
    transition: height 0.5s ease-in;
    &.expanded {
        grid-template-rows: 1fr auto;
    }
    .name {
        cursor: pointer;
        text-align: left;
        > *:hover {
            color: var(--activelinkcolor);
        }
    }
    .options{
        display: flex;
        justify-content: flex-end;
        align-items: center;
        > * {
            margin: 0 0.2rem;
        }
    }
    .more {
        grid-column: 1 / -1;
        padding: 1rem;
        > span, > button {
            margin-inline: 0.5rem;
        }
        h5 {
            margin-bottom: 0.5rem;
            margin-top: 1rem;
        }
        > div {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            > div {
                flex-basis: 100%;
                display: flex;
                justify-content: center;
            }
            
        }
        span.key, span.value {
            margin: 0 1rem;
            flex-basis: 25%;
        }
        span.key {
            text-align: left;
        }
        span.value {
            text-align: right;
        }
    }
  }
</style>

<style lang="scss">
.jsoneditor-vue {
    div.jsoneditor-contextmenu ul li button.jsoneditor-selected, div.jsoneditor-contextmenu ul li button.jsoneditor-selected:hover, div.jsoneditor-contextmenu ul li button.jsoneditor-selected:focus {
        background-color: var(--headercolor)
    }

    min-height: 200px;
    .jsoneditor {
        border-color: var(--activelinkcolor);

    }

    .jsoneditor-menu {
        background-color: var(--activelinkcolor);
    }
}
.jsoneditor-btns button {
    background-color: var(--activelinkcolor);
    &[disabled] {
        background-color: $color-bad;
    }
    
}

</style>