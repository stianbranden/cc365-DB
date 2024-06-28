<script setup>
import {useStore} from 'vuex'
import {ref, shallowRef, watch, nextTick, computed, onMounted} from 'vue'
import moment from 'moment'
import Chart from 'chart.js/auto';
// const axios = require('axios')
const {VITE_API_ROOT} = import.meta.env

const store = useStore()
store.dispatch('getAllActiveBPOFiles')

const ping = computed(_=>store.state.lastPing)
const filesInState = computed(_=>store.state.bpoFiles)
const bpoTransferStatus = computed(_=>store.state.bpoFileTransferStatus.status)

const bpo = ref([])
const bpoChartEl = ref(null)
const bpoChart = shallowRef()
const skillNames = ref(store.getters.listBPOSkills)
const skillName = ref(store.state.skillName)
const selectSkill = ref(true)
const fileType = ref(null)
const fileData = ref(null)

const labels = store.state.intervalLabels

const colors = [
  {name: 'elkjop-blue', hex: '#141b4d', rbga: 'rgba(20,27,77,0.4)' },
  {name: 'best', hex: '#006633', rbga: 'rgba(0,102,51,0.4)' },
  {name: 'light-blue', hex: '#003399', rbga: 'rgba(0,51,153,0.4)' },
  {name: 'hotpink', hex: '#C83586', rbga: 'rgba(200,53,134,0.4)' },
  {name: 'purple', hex: '#4F247E', rbga: 'rgba(79,36,126,0.4)' },
  {name: 'yellow', hex: '#f9e300', rbga: 'rgba(249,227,0,0.4)' },
  {name: 'lighter-blue', hex: '#0099cc', rbga: 'rgba(0,153,204,0.4)' }
]


function addFile_(){
  const file = fileData.value.value
  const type = fileType.value
  const data = {
    fileType: type,
    active: true,
    fileData: file,
    separator: '\t'
  }
  store.dispatch('addBPOFiles', data)
  console.log(data);
}

function objFromRow(row){
  let splitter = '\t'
  if ( row.includes(',') ) splitter = ','
  const arr = row.split(splitter)
  // console.log(arr);
  return {
    skillcombination: arr[1],
    startdatetime: arr[2],
    enddatetime: arr[3],
    agents: arr[4]
  }
}

function addFile(){
  return new Promise( async (resolve, reject)=>{
    //source	skillcombination	startdatetime	enddatetime	agents
    const data = []
    const file = fileData.value.value
    const type = fileType.value
    const rows = file.split('\n')
    for ( let i = 0; i < rows.length; i++){
      const obj = objFromRow(rows[i])
      console.log(obj);
      if (obj.skillcombination != 'skillcombination' && obj.skillcombination){
        const index = data.findIndex(d=>d.date === Number(obj.startdatetime.split(' ')[0]) && d.skillcombination === obj.skillcombination)
        if ( index === -1 ){
          data.push({
            type,
            skillcombination: obj.skillcombination,
            date: Number(obj.startdatetime.split(' ')[0]),
            rows: [obj],
            isActive: true
          })
        } 
        else data[index].rows.push(obj)
      }
    }
    const status = {
      length: data.length,
      success: 0,
      notInScope: 0,
      error: 0
    }
    store.state.bpoFileTransferStatus = {status: 1, msg: 0 + ' out of ' + status.length + ' files'}
    for ( let i = 0; i < data.length; i++){
      // if (i===0) console.log(data[i]);
      const transfer = await fetch(VITE_API_ROOT + 'bpo/filev2', {
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        // mode: 'no-cors',
        method: 'POST', 
        body: JSON.stringify(data[i])
      })
      const response = await transfer.json()
      if ( response.code === 201 ) status.notInScope++
      else if (response.code === 200 ) status.success++
      else status.error++
      store.state.bpoFileTransferStatus = {status: 1, msg: i + ' out of ' + status.length + ' files'}
      // console.log(response)
    }
    store.state.bpoFileTransferStatus = {status: 2, msg: 'Transfer completed with ' + status.success + ' completed, ' + status.notInScope + ' ignored and ' + status.error + ' errors'}
    // console.log(data)
    store.dispatch('getAllActiveBPOFiles')
    createChart()
    resolve('ok') //sbasfd
  })  
}

function hasDST(){
  const hasDST = moment().isDST()
  // console.log({hasDST, moment: moment(null).format()})
  return hasDST
}
function timeZone(profile){
  let tz = 1
  if(hasDST()) tz++
  if(profile.includes('(FI)')) tz++
  return tz
}


function returnDatasets(){
  // hasDST()
  // const scheduleLabels = bpo.value[0].schedule.map(a=>a.intervalStart)

  const files = []
  for ( let j = 0; j < bpo.value.length; j++ ){
    const fileData = []
    const file = bpo.value[j]
    for ( let i = 0; i < labels.length; i++){
      let d = file.schedule[file.schedule.map(a=>a.intervalStart).indexOf(labels[i])]?.agents || 0
      fileData.push(d)
    }
    files.push({name: file.name, isActive: file.isActive, fileData})
  }


  const readyTime = store.state.bpoReadyTime.filter(a=>{
    const profiles = store.state.bpoFiletoProfileMap.filter(b=>b.file === bpo.value[0].skill)[0].profiles
    return profiles.indexOf(a.profile) >= 0
  })

    // const fileData = []
  const readyData = []
  for ( let i = 0; i < labels.length; i++){

    let r = 0
    readyTime.forEach(profile=>{
      const newHour = Number(labels[i].split(':')[0]) - timeZone(profile.profile)
      let newLabel = newHour + ':' + labels[i].split(':')[1]
      if (newHour < 10) newLabel = '0' + newLabel
      const index = profile.time.findIndex(a=>a.time === newLabel)
      if (index >= 0) r = r + profile.time[index].ready / 900
    })
    readyData.push(r)
  }
  // console.log({scheduleLabels, data});


  const objs = [
    {
      label: 'ReadyAgents',
      backgroundColor: 'rgba(120, 190, 32, 0.4)',
      fill: true,
      borderColor: 'rgb(120, 190, 32)',
      borderWidth: 1,
      type: 'bar',
      data: readyData
    }
  ]
  files.reverse().forEach((file,i)=>{
    objs.push(
    {
      label: file.name,
      backgroundColor: colors[i].rbga,
      borderColor: "#ffffff",
      borderWidth: 1,
      fill:  true,
      data: file.fileData,
      stepped: true,
      pointStyle: false,
      hidden: !file.isActive
    })

  })

  return objs
}


function setValues(){
  selectSkill.value = false
  bpo.value = store.getters.getBPOFiles.filter(a=>a.skill ==skillName.value).sort((a, b)=>a.createdAt < b.createdAt)
}
function createChart(){
  nextTick(_=>{
    if (!bpoChart.value){
    // console.log(bpoChartEl);
      bpoChart.value = new Chart(bpoChartEl.value.getContext('2d'), {
        type: 'line',
        data: {
          labels,
          datasets: []
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'chartArea',
              align: 'start'
            }
          }
        }
      })
    }
    bpoChart.value.data.datasets = returnDatasets()
    bpoChart.value.update()
  })
}

watch(ping, _=>{
  if (!skillName.value) return
  if (!bpo.value.length) return
  const newDatasets = returnDatasets()
  if (JSON.stringify(newDatasets) === JSON.stringify(bpoChart.value.data.datasets)) return
  // console.log({time: moment().format(), event: 'Updating chart'})
  bpoChart.value.data.datasets = newDatasets
  bpoChart.value.update()
})

watch(skillName, _=>{
    if (skillName.value){
      store.commit('setSkillName', skillName.value)
      setValues()
      createChart()
    }
})

watch(bpoTransferStatus, (a, b)=>{
  // console.log({a,b});
  if (a===2 && b===1){
    setValues()
    if (!skillName.value) return
    if (!bpo.value.length) return
    const newDatasets = returnDatasets()
    if (JSON.stringify(newDatasets) === JSON.stringify(bpoChart.value.data.datasets)) return
    // console.log('heere');
    // console.log({time: moment().format(), event: 'Updating chart'})
    bpoChart.value.data.datasets = newDatasets
    bpoChart.value.update()
    fileType.value = ''
    fileData.value.value = ''
    setTimeout(_=>store.commit('resetBPOFileStatus'), 5000)
  }
})

watch(filesInState, _=>{
  // console.log('Run deep watch');
  setValues()
  createChart()
}, {deep: true} )


function addDay(){
  store.dispatch('changeBpoDate', 1)
}
function reduceDay(){
  store.dispatch('changeBpoDate', -1)
}

</script>


<template>
  <div class="home">
    <div class="card">
      <div class="card-header">
        <font-awesome-icon icon="angle-left" @click="reduceDay()" />
        <span class="bpo-name" @click="selectSkill=!selectSkill">{{skillName}} - {{store.state.bpoDate.format('Do of MMMM YYYY')}}</span>
        <font-awesome-icon icon="angle-right" @click="addDay()" />
      </div>
      <div class="form" v-show="selectSkill">
        <label for="skill">Select a skill: </label>
        <select id="skill" v-model="skillName">
            <option disabled value="">Please select a skill</option>
            <option v-for="skill in store.getters.listBPOSkills" :value="skill">
                {{skill}}
            </option>
        </select>

      </div>
      <div>
          <!-- <div>
            {{skillName}} - {{bpo.name}}
          </div> -->
          <div class="canvas-box">
            <canvas ref="bpoChartEl"> </canvas>

          </div>

      </div>

    </div>
    <div class="addFile card" v-if="store.state.user.department === 'CCC Workforce Management' || store.state.user.department === 'Customer Center Operational Performance'">
      <div class="card-header">Import BPO file</div>
      <div class="form">
        <div>
          <label for="ftype">File type: </label>
          <select name="ftype" id="ftype" v-model="fileType">
            <option disabled value="" selected>Please select a file type</option>
            <option value="Long term">Long term forecast</option>
            <option value="Next week">Next week</option>
            <option value="08:00">08:00</option>
            <option value="09:00">09:00</option>
            <option value="11:00">11:00</option>
            <option value="14:00">14:00</option>
            <option value="Custom">Custom file</option>
          </select>
          <!-- <input type="text" id="ftype" name="ftype" value="Same Day" ref="fileType"> -->
        <button @click.prevent="addFile()">Submit</button>
        <div class="bpo-status" v-if="store.state.bpoFileTransferStatus.status > 0">{{store.state.bpoFileTransferStatus.msg}}</div>
        </div>
        <!-- <div> -->
          <textarea id="file" name="file" rows="25" cols="100" placeholder="Paste file content" ref="fileData"></textarea>

        <!-- </div> -->
      </div>
    </div>
  </div>

</template>


<style lang='scss' scoped>
.home >.card {
  width: 80vw !important;
  min-height: 500px !important;
  .form {
    padding-block-start: 1rem;
  }
  .card-header {
    *{
      cursor: pointer;
    }
    display: flex;
    justify-content: space-between;
  }
}

.canvas-box {
  // min-width: 95vw;
  // max-width: 500px;
  > canvas {
    
  }
}
.addFile {
  .form {
    // margin-block: 2rem;
    > div {
      margin-bottom: 1rem;
      select {
        height: 2rem;
        margin-right: 1rem;
      }
      // display: block;
    }
  }
}
</style>