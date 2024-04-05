<script setup>
import {useStore} from 'vuex'
import {ref, shallowRef, watch, nextTick} from 'vue'
import Chart from 'chart.js/auto';

const store = useStore()
store.dispatch('getAllActiveBPOFiles')

const skillNames = ref(store.getters.listBPOSkills)
const skillName = ref('')
const bpo = ref({})
const bpoChartEl = ref(null)
const bpoChart = shallowRef()
const selectSkill = ref(true)

const labels= [
//    '06:00','06:15', '06:30', '06:45',
    '07:00','07:15', '07:30', '07:45',
    '08:00','08:15', '08:30', '08:45',
    '09:00','09:15', '09:30', '09:45',
    '10:00','10:15', '10:30', '10:45',
    '11:00','11:15', '11:30', '11:45',
    '12:00','12:15', '12:30', '12:45',
    '13:00','13:15', '13:30', '13:45',
    '14:00','14:15', '14:30', '14:45',
    '15:00','15:15', '15:30', '15:45',
    '16:00','16:15', '16:30', '16:45',
    '17:00','17:15', '17:30', '17:45',
    '18:00','18:15', '18:30', '18:45',
    '19:00','19:15', '19:30', '19:45',
    '20:00','20:15', '20:30', '20:45',
    '21:00','21:15', '21:30', '21:45',
    '22:00','22:15', '22:30', '22:45'
]

function returnDatasets(){
  const data = []
  const scheduleLabels = bpo.value.schedule.map(a=>a.intervalStart)
  for ( let i = 0; i < labels.length; i++){
    let d = bpo.value.schedule[bpo.value.schedule.map(a=>a.intervalStart).indexOf(labels[i])]?.agents || 0
    data.push(d)
  }
  // console.log({scheduleLabels, data});

  const objs = [{
    label: bpo.value.name,
    backgroundColor: "rgba(20,27,77,0.4)",
    borderColor: "#ffffff",
    borderWidth: 1,
    fill:  true,
    data,
    stepped: true,
    pointStyle: false
  }]
  return objs
}

watch(skillName, _=>{
    if (skillName.value){
      selectSkill.value = false
      bpo.value = store.getters.getBPOFiles.filter(a=>a.skill ==skillName.value)[0]
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
                  position: 'right',
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
})

</script>


<template>
  <div class="home">
    <div class="card">
      <div class="card-header">
        <span class="bpo-name" @click="selectSkill=!selectSkill">{{skillName}}</span>
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
      <div v-if="bpo.name">
          <!-- <div>
            {{skillName}} - {{bpo.name}}
          </div> -->
          <div class="canvas-box">
            <canvas ref="bpoChartEl"> </canvas>

          </div>

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
  .card-header .bpo-name {
    cursor: pointer;
  }
}

.canvas-box {
  // min-width: 95vw;
  // max-width: 500px;
  > canvas {
    
  }
}
</style>