<script setup>
import {ref, shallowRef, watch, nextTick, computed} from 'vue'
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import moment from 'moment'
import {useStore} from 'vuex'

const store = useStore()
const crChartEl = ref(null)
const crChart = shallowRef()

const topN = ref(9)
const chosenLevel1 = ref(null)
const language = ref('all')


const data = computed(_=>store.state.aiContactReasonData)
// const ping = computed(_=>store.state.lastPing)

function createChart(){
    // console.log('Running');
  nextTick(_=>{
    //boom
    if (!crChart.value){
    // console.log(bpoChartEl);
      crChart.value = new Chart(crChartEl.value.getContext('2d'), {
        type: 'bar',
        data: returnData(data.value),
        plugins: [ChartDataLabels],
        options: {
            onClick: function(e,a,c) {
                const level1 = c.data.labels[a[0].index]
                if (!chosenLevel1.value && level1 != 'Others') chosenLevel1.value = level1
            },
            
            // label: 'Heello',
            responsive: true,
            indexAxis: "y",
            elements: {
                bar: {
                    borderWidth: 1,
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        footer: function(a){
                            // console.log(a);
                            
                            if (!chosenLevel1.value && a[0].label != 'Others') return 'Click to drill down'
                            
                        }
                    }
                },
                legend: {
                    position: 'hidden',
                    align: 'start'
                },
                datalabels: {
                    color: 'lightgrey',
                    display: function(context) {
                        return context.dataset.data[context.dataIndex] > 0;
                    },
                    font: {
                        weight: 'normal',
                        size: '10px'
                    },
                    formatter: function(value, context){
                        const num = context.chart.data.datasets[0].data[context.dataIndex] 
                        const label = context.chart.data.labels[context.dataIndex]
                        
                        return returnLabel(num, label)
                        // return data.value.length
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value, index, values) {
                            const max = 10
                            const label = this.getLabelForValue(value)
                            return ''
                            if (label.length > 10) return label.substring(0,max) + '...'
                            return label 
                        }
                    }
                },
                x: {
                    display: false
                }
            }

        }
      })
    }
    else crChart.value.data = returnData(data.value)
    // crChart.value.data = returnData()
    crChart.value.update()
  })
}

function updateChart(){
    crChart.value.data = returnData(data.value)
    crChart.value.update()
}

function returnLabel(num, label){
    // console.log(num);
    return label  + ' ' + num + ' - ' + Math.round(num / data.value.length *100) + '%'
    
}

function returnData(data_){
    
    const data = data_.filter(a=>a.language === language.value || language.value === 'all')
    const labels = data.reduce(function (acc, curr) {
        const l = chosenLevel1.value ? curr.level2 : curr.level1
        if (!acc.includes(l)) acc.push(l);
        return acc;
    }, []);
    
    const returnData = []
    labels.forEach(l=>{
        let num = data.filter(a=>a.level1 === l).length
        if (chosenLevel1.value) num = data.filter(a=>a.level1 === chosenLevel1.value).filter(a=>a.level2 === l).length
        if ( num > 0) returnData.push({l,num})
    })
    returnData.sort((a,b)=>a.num > b.num ? -1: 1)
        // console.log(returnData);
    
    const other = {l: 'Others', num: 0}

    const labels2 = []
    const dataOutput = []
    returnData.forEach((a, index)=>{
        // console.log({index, topN});
        if (index < topN.value) dataOutput.push(a)
        else other.num+= a.num
    })
    if (other.num > 0 ) dataOutput.push(other)

    const datasets = [{
        label: 'Today',
        backgroundColor: function(ctx){
            // console.log({dataOutput, ctx});
            if ( dataOutput[ctx.dataIndex]?.l === 'Others' ) return store.state.colors[1].rgba
            return store.state.colors[0].rgba
        },
        borderColor: function(ctx){
            if ( dataOutput[ctx.dataIndex]?.l === 'Others' ) return store.state.colors[1].rgb
            return store.state.colors[0].rgb
        },
        data: [],
        datalabels: {
            align: 'end',
            anchor: 'start'
        }
    }]
    dataOutput.sort((a,b)=>a.num > b.num ? -1: 1)
    datasets[0].data = []
    dataOutput.forEach(a=>{
        datasets[0].data.push(a.num)
        labels2.push(a.l)
    })
    // dataOutput.reduce((acc, curr)=>{
    //     acc.push(curr.num)
    // },[])

    return {
        labels: labels2, 
        datasets
    }
}

watch(data, _=>{
    if ( data.value.length > 0)    createChart()
    
}
, { immediate: true}
)

watch([chosenLevel1, topN, language], _=>{
    updateChart()
})
// watch(topN, _=>{
//     updateChart()
// })

</script>

<template>
<div class="card">
    <div class="card-header">
        <span></span>
        <span>
            AI Contact Reasons {{chosenLevel1 ? ' - ' + chosenLevel1 : ''}}
        </span>
        <span>
            <font-awesome-icon v-if="chosenLevel1" class="btn" icon="angle-up" @click="chosenLevel1 = null" />
        </span>
        </div>
    <div class="card-body">
        <!-- <div class="canvas-box"> -->
            <canvas ref="crChartEl" style="height: 225px; width: 545px;"> </canvas>

            <!-- </div> -->
        </div>
    <div class="card-menu">
        <span>
            <label for="topN">Filter language: </label>
            <select v-model="language" id="topN">
                <option value="all">All</option>
                <option v-for="i in ['Danish', 'Finnish', 'Norwegian', 'Swedish']" :value="i">{{i}}</option>
            </select>
        </span>
        <span></span>
        <span>
            <label for="topN">Show top: </label>
            <select v-model="topN" id="topN">
                <option v-for="i in [3, 4, 5,6,7,8,9,10]" :value="i">{{i}}</option>
                <option value="100">All</option>
            </select>
        </span>
    </div>
</div>    
</template>

<style lang="scss" scoped>
.card {
    .card-header, .card-menu {
        display: flex;
        justify-content: space-between;
    }
  width: 550px !important;
  .card-body {
    display: flex;
    justify-content: center;
  }
  canvas {
    height: 100%;
  }
}
</style>