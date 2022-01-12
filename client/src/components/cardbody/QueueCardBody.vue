<template>
    <div class="card-body">
        <span class="large-ban" :class="{'reduce-size': queue.summary.inQueue>999}">
            {{queue.summary.inQueue}}
        </span>
        <div class="bottom">
            <span class="small-ban">{{queue.summary.timeWait}}</span>
            <span class="label">max wait</span>
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
        queue: Object
    },
    setup() {
  

    }
}
</script>

<style lang="scss" scoped>
.card .card-body {
    min-height: 185px;
    position: relative;
    padding: 0.5rem;
    display: grid;
    grid-template-rows: 3fr 1fr;
    grid-template-columns: 1fr;
    align-items: center;
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