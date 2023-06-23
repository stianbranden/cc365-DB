<template>
    <div class="card-body">
        <span class="large-ban" v-if="channel == 'PH' || channel == 'CH'" title="Service level within 60sec">
            {{daily.summary.sla}}%
        </span>
        <span class="large-ban" v-if="channel == 'EM' || channel == 'AC'" title="Average speed of answer">
            {{daily.summary.timeAsa}}
        </span>
        <div class="bottom">
            <div>
                <span class="small-ban">{{daily.summary.offered}}</span>
                <span class="label">Offered</span>
            </div>
            <div>
                <span class="small-ban">{{daily.summary.answered}}</span>
                <span class="label">Answered</span>
            </div>
            <div>
                <span class="small-ban">{{daily.summary.timeAht}}</span>
                <span class="label">AHT</span>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        title: String, 
        channel: String,
        department: String,
        country: String,
        area: String,
        daily: Object
    },
    setup() {


    }
}
</script>

<style lang="scss" scoped>
.card .card-body {
    position: relative;
    padding: 0.5rem;
    display: grid;
    grid-template-rows: 3fr 1fr;
    grid-template-columns: 1fr;
    align-items: center;
    .bottom {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }
    .large-ban, .small-ban {
        display: block;
    }
    .large-ban {
        font-size: 6rem;
        &.reduce-size {
            font-size: 4rem;
        }
    }
    .label {
        text-transform: uppercase;
        font-size: 0.6rem;
    }

}
</style>