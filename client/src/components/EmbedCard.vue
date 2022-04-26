<template>
  <div class="card viz-card">
      <div class="card-header">
          <slot />
      </div>
      <div class="card-body">
        <tableau-viz
            toolbar='hidden'
            device="desktop"
            :id="id"       
            :src="src"
            :height="height"
            :width="width"
        >
            <viz-filter
                v-for="(filter, index) in filters"
                :key="id + '-' + index"
                :field="filter.field"
                :value="filter.value"
                ref="filterElem"
            /> 
        </tableau-viz>
      </div>
  </div>
</template>

<script setup>
import {useStore} from 'vuex'
import {ref, watch, computed, toRefs, onMounted, watchEffect} from 'vue'

const props = defineProps({
    id: String,
    lightSrc: String,
    darkSrc: String,
    height: String,
    width: String,
    filters: [Object]
})

const store = useStore()
const dark = computed(_=>store.state.dark)
const src = ref(props.lightSrc)
const {filters} = toRefs(props)

const filterElem = ref([])

if ( dark.value ) src.value = props.darkSrc

watch(dark, _=> src.value = dark.value ? props.darkSrc : props.lightSrc)
watch(filters, _=> {
    setTimeout(_=>{
        const viz = document.getElementById(props.id)
        document.getElementById(props.id).updateRendering()
    }, 500)
})


</script>

<style lang="scss" scoped>
#everything .home .card.viz-card .card-body {
    height: 257px;
    position: relative;
    border-radius: 0 0 0.5rem 0.5rem;
    overflow: hidden;

    /*> * {
      position: absolute;
      left: -13px;
    }*/
}
</style>