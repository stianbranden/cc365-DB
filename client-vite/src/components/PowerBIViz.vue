<template>
    <iframe 
        :width="props.width" 
        :height="props.height" 
        :src="src" 
        frameborder="1" 
        allowFullScreen="true" 
    />
</template>

<script setup>
import {useStore} from 'vuex'
import {computed, ref, watch} from 'vue'
const props = defineProps({
  width: Number,
  height: Number,
  lightSrc: String,
  darkSrc: String,
})
const store = useStore()
const dark = computed(_=>store.state.dark)

const src = ref(props.lightSrc)

if ( dark.value ) src.value = props.darkSrc
watch(dark, _=> src.value = dark.value ? props.darkSrc : props.lightSrc)

</script>

<style>

</style>