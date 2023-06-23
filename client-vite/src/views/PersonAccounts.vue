<template>

  <form @submit.prevent>
    <div>
      <label for="businessunit">BusinessUnit</label>
      <select
        name="businessunit"
        id="businessunit"
        v-model="selected.businessUnit"
        @change="regenerateFilters"
      >
        <option v-for="bu in filters.businessUnits" :key="bu" :value="bu">{{bu}}</option>
      </select>
    </div>
    <div>
      <label for="department">Department</label>
      <select
        name="department"
        id="department"
        v-model="selected.department"
        @change="regenerateFilters"
      >
        <option v-for="dep in filters.departments" :key="dep" :value="dep">{{dep}}</option>
      </select>
    </div>
    <div>
      <label for="team">Team</label>
      <select
        name="team"
        id="team"
        v-model="selected.team"
        @change="regenerateFilters"
      >
        <option v-for="team in filters.teams" :key="team" :value="team">{{team}}</option>
      </select>
    </div>
    <div>
      <label for="agent">Agent</label>
      <select
        name="agent"
        id="agent"
        v-model="selected.agent"
        @change="regenerateFilters"
      >
        <option v-for="agent in filters.agents" :key="agent" :value="agent">{{agent}}</option>
      </select>
    </div>
    <div>
      <label for="absence">Absence</label>
      <select
        name="absence"
        id="absence"
        v-model="selected.absence"
        @change="regenerateFilters"
      >
        <option v-for="absence in filters.absences" :key="absence" :value="absence">{{absence}}</option>
      </select>
    </div>
    <button @click="reset" ><font-awesome-icon icon="undo-alt" /></button>
  </form>

  <div class="table">
    <div class="row header">
      <span class="text">EmpNumber</span>
      <span class="text">agent</span>
      <span class="text">absence</span>
      <span class="text">date</span>
      <span class="text">trackedBy</span>
      <span class="text">balanceIn</span>
      <span class="text">balanceOut</span>
      <span class="text">remaining</span>
      <span class="text">extra</span>
      <span class="text">used</span>
      <span class="text">accrued</span>
    </div>
    <div
      class="row"
      v-for="pa in view"
      :key="pa._id"
    >
      <span class="text">{{pa.employmentNumber}}</span>
      <span class="text">{{pa.agent}}</span>
      <span class="text">{{pa.absence}}</span>
      <span class="text">{{pa.startDate}}</span>
      <span class="text">{{pa.trackedBy}}</span>
      <span class="number">{{pa.balanceIn}}</span>
      <span class="number">{{pa.balanceOut}}</span>
      <span class="number">{{pa.remaining}}</span>
      <span class="number">{{pa.extra}}</span>
      <span class="number">{{pa.used}}</span>
      <span class="number">{{pa.accrued}}</span>

    </div>
  </div>
</template>

<script setup>
import {ref, reactive} from 'vue'
const {VITE_API_ROOT} = import.meta.env

const filters = reactive({
  businessUnits: ['all'],
  departments: ['all'],
  teams: ['all'],
  agents: ['all'],
  absences: ['all']
})

const selected = reactive({
  businessUnit: 'all',
  department: 'all',
  team: 'all',
  agent: 'all',
  absence: 'all',
})


function reset(){
  Object.keys(selected).forEach(s=>selected[s] = 'all')
  regenerateFilters()
}

const personaccounts = ref([])
const view = ref([])
fetch(VITE_API_ROOT + 'personaccounts')
  .then(response=>{
    // console.log(response);
    return response.json()
  })
  .then(data=>{
    //console.log(data);
    personaccounts.value = data
    regenerateFilters()
  })

function regenerateFilters(){
  let pas = [...personaccounts.value].sort((a,b)=>{
    let sort = 0
    if (a.agent === b.agent) sort = a.absence > b.absence ? 1 : -1
    else sort = a.agent > b.agent ? 1 : -1
    return sort
  })
  const set = []
  Object.keys(selected).forEach(key=>{
    if (selected[key] === 'all' ) set.push(key+'s')
    else {
      if (key === 'businessUnit') pas = pas.filter(a=>a.businessUnitName === selected[key])
      else if (key === 'department') pas = pas.filter(a=>a.departmentName === selected[key])
      else if (key === 'team') pas = pas.filter(a=>a.teamName === selected[key])
      else pas = pas.filter(a=>a[key] === selected[key])
    }
  })


  let localFilters = {
    businessUnits: [],
    departments: [],
    teams: [],
    agents: [],
    absences: []
  }
  pas.forEach(p=>{
    if (!localFilters.businessUnits.includes(p.businessUnitName)) localFilters.businessUnits.push(p.businessUnitName)
    if (!localFilters.departments.includes(p.departmentName)) localFilters.departments.push(p.departmentName)
    if (!localFilters.teams.includes(p.teamName)) localFilters.teams.push(p.teamName)
    if (!localFilters.agents.includes(p.agent)) localFilters.agents.push(p.agent)
    if (!localFilters.absences.includes(p.absence)) localFilters.absences.push(p.absence)

    if (p.trackedBy === 'Minute'){
      p.balanceIn = toHours(p.balanceIn)
      p.balanceOut = toHours(p.balanceOut)
      p.remaining = toHours(p.remaining)
      p.extra = toHours(p.extra)
      p.used = toHours(p.used)
      p.accrued = toHours(p.accrued)
      p.trackedBy = 'Hour'
      // console.log(p.balanceIn);
    }
  })
  
  Object.keys(localFilters).forEach(key=>{
    localFilters[key]= localFilters[key].sort((a,b)=> a > b ? 1 : -1 )
    localFilters[key].unshift('all')
  })

  Object.keys(filters).forEach(key=>{
    if (set.includes(key)) filters[key] = localFilters[key]
  })
  view.value = pas
}

function toHours(minutes) {
  let hours = Math.floor(minutes/60) + ':'
  let min = minutes % 60
  if ( min < 10 ) hours += '0'
  hours += min
  return hours
}

</script>

<style lang="scss" scoped>
form {
  background-color: var(--cardbgcolor);
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  flex-grow: 1;
  margin-inline: 1rem;
  margin-block-start: 1rem;
  justify-content: space-around;
  align-items: flex-end;

  button {
    height: 2rem;
  }

  > div {
    display: flex;
    flex-direction: column;
    margin-block: 0.5rem;
    > label {
      margin-block-end: 0.2rem;
    }
    > select {
      width: 225px;
      text-align: center;
    }
  }
}
.table {
  background-color: var(--cardbgcolor);
  margin-inline: 1rem;
  padding: 1rem;
  //border: 1px dashed var(--textcolor);

  .row {
    display: grid;
    grid-template-columns: repeat(5, 1.5fr) repeat(6, 1fr);
    border-block-end: 1px dashed var(--textcolor);
    padding-block: 0.1rem;
    > .text {
      text-align: left;
      padding-inline-start: 0.3rem;
    }
  }
  .header {
    text-transform: uppercase;
    font-size: 0.8rem;
  }
}
</style>