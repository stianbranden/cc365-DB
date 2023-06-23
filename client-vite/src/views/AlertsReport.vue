<template>
    <div class="alerts">
        <div class="selections">
            <div class="stat">
                Logs in selection: {{alertsToDisplay.length}}
            </div>
            <div>
                <input
                type="checkbox"
                name="showSystemAlerts"
                id="showSystemAlerts"
                v-model="showSystemAlerts"
                @change="filterList"
                >
                <label for="showSystemAlerts">
                    <span v-if="showSystemAlerts">Hide system alerts</span>
                    <span v-else>Show system alerts</span>
                </label>
            </div>
            <div>
                <label for="department">Select department</label>
                <select
                  name="department"
                  id="department"
                  v-model="selectedDepartment"
                  @change="filterList"
                >
                    <option value="all">All</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Finland">Finland</option>
                    <option value="Norway">Norway</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Support">Support</option>
                    <option value="Kitchen">Kitchen</option>
                </select>
            </div>
        </div>
        <div class="search">
            <div>
                <label for="startdate">Date from:</label>
                <input
                  type="date"
                  name="startdate"
                  id="startdate"
                  v-model="startDate"
                >
            </div>
            <div>
                <label for="enddate">Date to:</label>
                <input
                  type="date"
                  name="enddate"
                  id="enddate"
                  v-model="endDate"
                >
            </div>
            <button @click="fetchData">Search</button>
        </div>
        <div class="report" v-if="alertsToDisplay.length > 0">
            <div class="row header">
                <span class="type">type</span>  
                <span class="department">department</span>
                <span class="author">author</span>
                <span class="createdAt">createdAt</span>
                <span class="title">title</span>
                <span class="expanded"></span>
            </div>
            <div
              class="row"
              v-for="alert in alertsToDisplay"
              :key="alert._id"
            >
                <span class="type">{{alert.alerttype}}</span>
                <span class="department">{{alert.department}}</span>
                <span class="author">{{alert.author}}</span>
                <span class="createdAt">{{alert.createdAt.substring(0,10)}}</span>
                <span class="title">{{alert.title}}</span>
                <span
                  class="expanded"
                  @click="alert.expanded = !alert.expanded"
                >
                    <font-awesome-icon icon="angle-down" v-if="!alert.expanded" />
                    <font-awesome-icon icon="angle-up" v-else />
                </span>
                <div class="texts" v-show="alert.expanded">
                    <span
                        v-for="(text, index) in alert.texts"
                        :key="alert._id + index"
                        v-show="(alert.author==='ccc.elkjop.com' && index > 0) || alert.author !== 'ccc.elkjop.com'"         
                    >
                        {{text}}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import {ref, onBeforeMount, computed} from 'vue'
import { DateTime } from "luxon"
const {VITE_API_ROOT} = import.meta.env
const alerts = ref([])
const showSystemAlerts = ref(false)
const alertsToDisplay = ref([])
const selectedDepartment = ref('all')
const startDate = ref(DateTime.now().startOf('month').toISODate())
const endDate = ref(DateTime.now().endOf('month').toISODate())


const filterfunc = a=>{
    if (!showSystemAlerts.value && a.author==='ccc.elkjop.com' ) return false 
    if ( selectedDepartment.value!=='all' && selectedDepartment.value !== a.department ) return false

    return true
}

const fetchData = _=>{
    const departments = selectedDepartment.value === 'all' ? [] : [selectedDepartment.value]
    fetch(VITE_API_ROOT + 'alertsreport', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            departments,
            startDate: startDate.value,
            endDate: endDate.value
        })
    }).then(response=> {
        if (response.ok) return response.json()
        else throw(response.statusText)
    }).then(data=>{
        data.forEach(alert=> {
            alert.texts = [...alert.text.split('<br>')]
            alert.expanded = false
        })
        alerts.value = data
        filterList()
        //console.log(alerts.value[1]);
    }).catch(err=>console.log(err))
}

const filterList = _=> alertsToDisplay.value = alerts.value.filter(filterfunc)

onBeforeMount(fetchData)

</script>

<style lang="scss" scoped>
    .selections, .search {
        margin: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        select, input[type="date"] {
            background-color: var(--buttoncolor);
            color: var(--textcolor);
            text-align: center;
            margin-left: 0.5rem;
            padding: 0.5rem;
            &::-webkit-calendar-picker-indicator {
                color: var(--textcolor);
            }
        }
        input[type="checkbox"] {
            display: none;
            &+ label {
                padding: 0.5rem 1rem;
                border: 0.5px var(--activelinkcolor) solid;
                background-color: var(--buttoncolor);
                //color: black;
                //font-weight: bold;
                border-radius: 0.5rem;
                &:hover {
                    font-weight: bold;
                    border-width: 1px;
                }
                transition: border-color 0.5s ease;
                transition: color 0.5s ease;
                transition: background-color 0.5s ease;
                cursor: pointer;
            }
            &:checked + label {
                background-color: var(--activelinkcolor);
                border-color: var(--buttoncolor);
                color: var(--buttoncolor);
            }
        }
    }


.alerts {
    margin: 2rem;
    padding: 1rem;
    background-color: var(--cardbgcolor);
    display: block;
}
.row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    padding-block: 0.5rem;
    border-bottom: 1px dashed white;
}
.texts {
    grid-column: span 6;
    display: flex;
    flex-direction: column;
}
.header {
    text-transform: uppercase;
}
</style>