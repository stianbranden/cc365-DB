<script setup>
import {useRouter} from 'vue-router'
const router = useRouter()

</script>

<template>
  <div class="quality">
    <div class="tile" @click="router.push({name: 'Calibration'})">
      <font-awesome-icon class="icon" icon="medal" />
      <span>Calibration</span>
    </div>
    <div class="tile" @click="router.push({name: 'ContactGoal Status'})">
      <font-awesome-icon icon="chart-simple" class="icon" />
      <span>
        ContactGoal Status
      </span>
    </div>
    <div class="tile" @click="router.push({name: 'ContactGoal Admin'})">
      <font-awesome-icon icon="cog" class="icon" />
      <span>
        ContactGoal Admin
      </span>
    </div>
  </div>
</template>


<style lang="scss" scoped>
div.quality{
  display: flex;
  margin-top: 1rem;
  margin-inline: 2rem;
  > .tile {
    margin: 1rem;
    box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
    background-color: var(--cardbgcolor);
    width: 150px;
    height: 150px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    transition: scale 0.5s;
    &:hover {
      scale: 1.05;
    }
    .icon {
      height: 4rem;
    }
  }
}

</style>
