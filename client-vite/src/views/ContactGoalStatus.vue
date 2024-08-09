<script setup>
import {useStore} from 'vuex'
import moment from 'moment'
const store = useStore()

function returnUpdateTime(dt, fixed = false){
    const time = moment(dt)
    const today = moment()
    if ( !fixed && time.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')) return time.format('HH:mm')
    return time.format('YYYY-MM-DD HH:mm')
}

</script>

<template>
    <div class="home">
        <div class="card min-card" v-for="evals in store.state.cgp" :key="evals._id">
            <div class="card-body">
                <div class="wrap">
                    <div class="name">{{evals.evaluator}}</div>
                    <div class="updated" :title="'Updated: ' + returnUpdateTime(evals.updatedAt, true)"><font-awesome-icon icon="clock" /> {{returnUpdateTime(evals.updatedAt)}}</div>

                </div>
                <div class="number">{{evals.backlog}}</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .card-body {
        justify-content: space-between;
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        padding-block-end: 2rem;
        .number {
            font-size: 4rem;
        }
        .wrap {
            display: grid;
            grid-template-columns: auto 50px;
            gap: 50px;
        }
        .updated {
            font-size: 0.6rem;
        }
        .name {
            text-align: left;
        }
    }
        .min-card, .min-card > .card-body {
            width: 200px !important;
            height: 180px !important;
        }
        .min-card {
            margin: 1rem !important;

        }
</style>