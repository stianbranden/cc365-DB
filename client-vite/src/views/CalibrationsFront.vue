<script setup>
import { ref } from 'vue'
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'

const store = useStore()
store.dispatch('getCalibrations')
store.dispatch('getContactsWithoutSession')

const router = useRouter()

const newName = ref('')

function createCalibration(){
    store.state.saveCalibrationError.hasError = false
    // console.log('Creating model ' + newName.value);
    store.dispatch('createCalibration', {
        name: newName.value,
        gauge: store.state.user.name
    })
}


function deleteCalibration(id){
    console.log('deleting ' + id);
    store.state.saveCalibrationError.hasError = false
    store.dispatch('deleteCalibration', id)
}

</script>


<template>
<div class="home">
    
    <div class="card">
        <div class="card-header">Calibration sessions</div>
        <div class="card-body">
            <div class="calibration-wrapper" v-for="calibration in store.state.calibrations" :key="calibration._id">
                <div class="calibrations">
                    <div class="name">{{calibration.openDelete ? 'Delete session?' : calibration.name}}</div>
                    <div class="buttons" v-if="calibration.openDelete">
                        <button @click="deleteCalibration(calibration._id)" class="red"><font-awesome-icon icon="circle-check" /></button>
                        <button @click="calibration.openDelete = false"><font-awesome-icon icon="circle-xmark" /></button>
                    </div>
                    <div class="buttons" v-else>
                        <button @click="router.push({name: 'Calibration Session', params: {session: calibration._id, sessionName: calibration.name}})"><font-awesome-icon icon="arrow-up-right-from-square" /></button>
                        <button @click="calibration.openDelete = true" class="red"><font-awesome-icon icon="trash" /></button> 
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer error" v-if="store.state.saveCalibrationError.hasError && store.state.saveCalibrationError.placement === 'list'">{{store.state.saveCalibrationError.message}}</div>
    </div>
    <div class="addCalibration card">
        <div class="card-header">Create calibration session</div>
        <div class="card-body create-calibration">
            <div>
                <p>Name your calibration session:</p>
                <input v-model="newName" placeholder="Give me a unique name" />
            </div>
            <button @click="createCalibration" :disabled="newName.length <= 3">Create session</button>
        </div>
        <div class="card-footer error" v-if="store.state.saveCalibrationError.hasError && store.state.saveCalibrationError.placement === 'save'">{{store.state.saveCalibrationError.message}}</div>
    </div>
</div>
</template>


<style lang="scss" scoped>
.error {
    background: red
}
.card-body {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-block-start: 1rem;
    &.create-calibration {
        justify-content: space-between;
        & > button{
            margin-block: 1rem;
            margin-inline: 1rem;
        }
    }
    input {
        margin-block-start: 0.5rem;
        width: 235px;
        height: 1.4rem;
    }
}

.calibrations {
    display: grid;
    align-items: center;
    justify-items: right;
    margin: 0.2rem 0.5rem;
    grid-template-columns: 1fr 0.6fr;
    
    > *:first-child {
        justify-self: left;
    }
    button {
        margin-inline: 0.1rem;
        &.red:hover {
            background: var(--activealertbgcolor) !important;
        }
    }
    // margin-block: 0.2rem;
}

</style>