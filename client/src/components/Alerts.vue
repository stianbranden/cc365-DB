<template>
    <div class="card alerts-card">
        <div class="card-header">
            <span>
                Alerts (No: {{numAlerts}})
            </span>
        </div>
        <transition name="fade-left" mode="out-in">
            <AlertForm :alert="state.alertId" v-if="state.showForm" @close="toggleAlertEditor" />
            <transition-group tag="div" class="card-body" name="slow" mode="out-in" v-else>
                <div
                    v-for="alert in store.state.alerts" :key="alert._id"
                    class="alert"
                    :class="{open: isOpen(alert._id), active: !alert.closed, recent: isRecent(alert.unix)}"
                    @click="toggleOpen(alert._id)"
                    v-show="showAlert(alert)"
                >
                    <div class="icon" :class="{editable: alert.editable}">
                        <font-awesome-icon class="base" :icon="alert.fontawesomeicon" />
                        <font-awesome-icon 
                            class="edit" 
                            :icon="['far', 'edit']" 
                            @click="toggleAlertEditor(alert._id)"
                        />

                    </div>
                    <div class="time">{{displayDt(alert.createdAt)}}</div>

                    <div class="title" v-if="!isOpen(alert._id)" :title="alert.title" >{{alert.title}}</div>
                    <div class="text" v-if="isOpen(alert._id)">
                        <p v-for="(text, index) in alert.texts" :key="index">{{text}}</p>                
                    </div>
                    <div class="department" v-if="isOpen(alert._id)">{{alert.department}}</div>
                </div>
                
            </transition-group>
        </transition>
        <!--<div class="card-body">
        </div>-->
        <div class="card-menu">
            <div class="notification">
                <div class="noci" @click="store.commit('toggleNotifications')" :class="{active: store.state.showNotifications}">
                    <font-awesome-icon v-if="store.state.showNotifications"  :icon="['far', 'bell']" />
                    <font-awesome-icon v-else :icon="['far', 'bell-slash']" />
                </div>
            </div>
            <div class="filters">
                <div class="icon-label">
                    <font-awesome-icon icon="filter" />
                </div>
                <div 
                    class="noci" 
                    :class="{active: state.showUsers}" 
                    @click="state.showUsers = !state.showUsers"
                    title="Toggle agent alerts filter"
                >
                    <font-awesome-icon icon="users" />
                </div>
                <div 
                    class="noci"
                    :class="{active: state.showWarnings}" 
                    @click="state.showWarnings = !state.showWarnings"
                    title="Toggle warnings filter"
                >
                    <font-awesome-icon icon="exclamation-triangle" />
                </div>

            </div>
            <div class="sorts">
                <div class="icon-label">
                    <font-awesome-icon icon="sort" />
                </div>
                <select @change="updateSort">
                    <option v-for="s in store.state.sortsArr" :value="s.value" :key="s.value">{{s.name}}</option>
                </select>
            </div>
            <div class="add-alert">
                <div class="noci" @click="toggleAlertEditor('new')">
                    <font-awesome-icon icon="plus-circle" />
                </div>
            </div>
            
        </div>
        
    </div>
</template>

<script setup>
import { useStore } from "vuex"
import { DateTime } from "luxon"
import { reactive, toRefs, computed, ref } from "@vue/reactivity"
import { onMounted, watch } from "vue"
import AlertForm from './AlertForm';

const state = reactive({opened: [], showUsers: true, showWarnings: true, showForm: false, alertId: 'new'})
const store = useStore()
const props = defineProps({department: String})
const {department} = toRefs(props);
state.department = department;
const lastUnix = ref(Date.now())
const now = ref(Date.now())
const isRecent = updatedUnix => now.value - updatedUnix <= 300000

const numAlerts = computed(_=>store.state.alerts.filter(showAlert).length)

onMounted(_=> watch(numAlerts, setUnixAndNotify ))


const updateSort = e => {
    console.log(e.target.value);
    store.commit('orderAlerts', e.target.value);
}

setInterval(_=>now.value = Date.now(), 10000)


function setUnixAndNotify(){
    let notify = lastUnix.value > 0
    //console.log(notify, lastUnix.value);
    const arr = [...store.state.alerts]
        //.filter(showAlert)
        .filter(a=>a.unix > lastUnix.value)
        .sort((a,b) => a.unix > b.unix ? -1 : 1);

    if ( arr.length > 0) {
        //console.log('Array length', arr.length);
        lastUnix.value = arr[0].unix
    }
    
    if (notify){
        //console.log('array length',arr.length);
        arr.filter(showAlert).forEach(alert=>{
            //console.log('In loop');
            store.commit('notify', {
                key: alert._id,
                ...alert
            })
        })
    }
}

function toggleAlertEditor(id = 'new'){
    state.alertId = id
    state.showForm = !state.showForm
}


const toggleOpen = id =>{
    //console.log('toggle', store.state.alerts.filter(a=>a._id === id))
    if (state.opened.includes(id) ) state.opened = state.opened.filter(a => a != id)
    else state.opened.push(id)
}

const isOpen = id => state.opened.includes(id)
const displayDt = date => DateTime.fromISO(date).toFormat('dd.MM HH:mm')

const showAlert = alert => {
    let show = true;
    //console.log(state);
    if (alert.personrelated && !state.showUsers) show = false
    if (!alert.personrelated && !state.showWarnings) show = false
    if (state.department){
        if (state.department === 'thd' && !(alert.department === 'Helpdesk' || alert.department === 'Support' ) ) show = false 
        if (state.department === 'no' && !(alert.department === 'Norway' || alert.department === 'Loyalty' ) ) show = false 
        if (state.department === 'dk' && alert.department !== 'Denmark' ) show = false 
        if (state.department === 'fi' && alert.department !== 'Finland' ) show = false 
        if (state.department === 'se' && alert.department !== 'Sweden' ) show = false 
        if (state.department === 'ki' && alert.department !== 'Kitchen' ) show = false 

    }
    //console.log(state.department, alert.department, show);
    return show
}

</script>

<style lang="scss" scoped>
.alerts-card {
    overflow-x: clip;
    .fade-left-enter-from {
        transform: translateX(100%);
    }
    .fade-left-leave-to {
        transform: translateX(-100%);
    }
    .fade-left-enter-active, .fade-left-leave-active  {
        transition: all 0.5s ease-in;
    }
    .card-body {
        .alert {
            padding: 0 1rem;
            display: grid;
            grid-template-columns: 2rem 3fr 6rem;
            grid-template-areas: "icon title time";
            border-bottom: 1px dashed var(--alertbordercolor) ;
            min-height: 2.5rem;
            align-items: center;
            cursor: pointer;
            transition: 0.5s all ease;
            transform-origin: top;

            &.recent {
                background-color: var(--recentalertcolor);
            }
            &.active {
                background-color: var(--activealertbgcolor);
            }
            &.open {
                height: auto;
                min-height: 2.5rem;
                grid-template-columns: 2rem 1fr 6rem;
                grid-template-rows: 2rem auto;
                grid-template-areas: 
                    "icon department time"
                    "icon text text";
            }
            .title {
                text-align: left;
                margin-left: 1rem;
                grid-area: title;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .icon {
                grid-area: icon;
                .edit {
                    display: none;
                }
                &.editable:hover {
                    .base{
                        display: none
                    }
                    .edit {
                        display: inline-block;
                    }
                }
            }
            .time {
                grid-area: time;
                text-align: right;
            }
            .text {
                grid-area: text;
                text-align: left;
                margin-left: 1rem;
                margin-bottom: 0.5rem;
            }
            .department {
                grid-area: department;
                text-align: left;
                margin-left: 1rem;
            }
        }
        .slow-move {
            transition: 0.3s all ease;
        }
        .slow-enter-from, .slow-leave-to {
            opacity: 0;
            transform: scaleY(0);
        }
        .slow-enter-active, .slow-leave-active {
            transition: 0.5s all ease;
        }
    }
    .card-menu {
        justify-content: space-around;
        > div {
            display: flex;
            justify-content: center;
            align-items: center;
            > div {
                margin: 00.51rem;
            }
       
            &:hover .label {
                color: white;
            }

            select {
                color: var(--textcolor);
                background-color: var(--cardmenucolor);
            }
            .icon-label {
                color: var(--iconcolor);
                font-size: 0.7rem;
            }

        }
        .noci {
            cursor: pointer;
            //margin: auto 0;
            &:hover, &.active {
                color: var(--cardmenuhovercolor);
            }
        }
    }
}
</style>