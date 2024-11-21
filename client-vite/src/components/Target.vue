<script setup>
import { ref } from 'vue';
import { defineProps } from 'vue';
import {useStore} from 'vuex'

const store = useStore()

const props = defineProps({
  _id: String,
  action: {
    type: String,
    required: true
  }
})

const businessUnit = ref(null), strategicArea= ref(null), kpi= ref(null), priority= ref(null), min= ref(null), max= ref(null), type= ref(null), validFrom= ref(null), validTo = ref(null)
const open = ref(false)

if ( props.action === 'edit' || props.action === 'copy'){
    const tg = store.state.scorecardTargets.filter(a=>a._id === props._id)[0]
    businessUnit.value = tg.businessUnit
    strategicArea.value = tg.strategicArea
    kpi.value = tg.kpi
    priority.value = tg.priority
    min.value = tg.min
    max.value = tg.max
    type.value = tg.type
    validFrom.value = tg.validFrom
    validTo.value = tg.validTo
}

const types = [
    {value: 'hib', name: 'Higher is better'},
    {value: 'lib', name: 'Lower is better'},
    {value: 'htt', name: 'Higher than threshold'},
    {value: 'ltt', name: 'Lower than threshold'},
]

</script>

<template>
    <div class="btn" :title="props.action==='edit' ? 'Edit target': 'Duplicate Target'" @click="open = !open">
        <font-awesome-icon class="icon" icon="edit" />
    </div>
    <Teleport v-if="open" to="#modal"> 
        <div class="modal-drop vue" @click="open = !open" >
            <div class="modal-container" @click.stop>
                <div class="modal-container-header">
                    <span v-if="props.action==='new'">New target</span>
                    <span v-else-if="props.action==='edit'">Edit target</span>
                    <span v-else>Duplicate target</span>
                </div>
                <div class="form">
                    <div class="field">
                        <label for="businessUnit">Business Unit</label>
                        <input type="text" name="businessUnit" id="businessUnit" v-model="businessUnit">
                    </div>
                    <div class="field">
                        <label for="strategicArea">Strategic area</label>
                        <input type="text" name="strategicArea" id="strategicArea" v-model="strategicArea">
                    </div>
                  <div class="field">
                      <label for="kpi">KPI</label>
                      <input type="text" name="kpi" id="kpi" v-model="kpi">
                  </div>
                  <div class="field">
                      <label for="priority">Priority</label>
                      <input type="text" name="priority" id="priority" v-model="priority">
                  </div>
                  <div class="field">
                      <label for="type">Target type</label>
                      <select name="type" id="type" v-model="type">
                        <option v-for="t in types" :value="t.value">{{ t.name }}</option>
                      </select>
                  </div>
                  <div class="field">
                      <label for="validFrom">Valid from (YYYYMMDD)</label>
                      <input type="text" name="validFrom" id="validFrom" v-model="validFrom">
                  </div>
                  <div class="field">
                      <label for="validTo">Valid to (YYYYMMDD)</label>
                      <input type="text" name="validTo" id="validTo" v-model="validTo">
                  </div>
                  <div class="field">
                      <label for="min">Minimum</label>
                      <input type="text" name="min" id="min" v-model="min">
                  </div>
                  <div class="field">
                      <label for="max">Maximum</label>
                      <input type="text" name="max" id="max" v-model="max">
                  </div>
                </div>
                <div class="buttons">
                    <button v-if="props.action==='edit'" class="edit">Save</button>
                    <button v-if="props.action==='edit'" class="delete">Delete</button>
                    <button v-if="props.action==='new' || props.action==='duplicate'">Create</button>
                </div>
            </div>
        </div>
    </Teleport>



</template>

<style lang="scss" scoped>
.modal-drop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 998;
    // opacity: 50%;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0,0,0,0.5);
    .modal-container {
        background-color: rgba(255,255,255,0.9);
        z-index: 999;
        width: 65vw;
        min-width: 400px;
        max-width: 900px;
        height: 50vh;
        position: relative;
        display: flex;
        // justify-content: center;
        align-items: center;
        flex-direction: column;
        border-radius: 1rem;
        .modal-container-header {
            color: #{$brand-color};
            font-size: 2rem;
            font-weight: bold;
            margin-block: 2rem;
        }
        .field {
            display: grid;
            grid-template-columns:  200px 200px;
            height: 2rem;
            padding-block: 0.5rem;
            input {
                padding: 0.1rem;
            }
        }
    }
}
.buttons {
    margin-block-start: 1rem;
    display: inline-flex;
    button {
        margin-inline: 1rem;
        width: 5rem;
        padding-block: 0.3rem;
        cursor: pointer;
        border-width: 1px;
        &:hover {
            font-weight: bold;
        }
        &.delete {
            background-color: var(--activealertbgcolor);
        }
        &.edit {
            background-color: var(--activelinkcolor);
        }
    }
}
</style>