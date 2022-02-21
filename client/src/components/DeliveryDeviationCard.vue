<template>
    <div class="card">
        <div class="card-header">
            <div class="flag">        
                <font-awesome-icon icon="truck" />
            </div>
            <slot />
        </div>
        <DeliveryDeviationCardBody :department="department" />
        <div class="card-menu">

        </div>
    </div>
</template>

<script setup>
import {useStore} from 'vuex'
import DeliveryDeviationCardBody from './cardbody/DeliveryDeviationCardBody'

const props = defineProps({department: String})
const department = props.department


</script>

<style lang="scss" scoped>
.card {
    .card-header {
        .icon {
            &:hover, &.active {
                color: $secondary-brand-color;
            }
            cursor: pointer;
            position: absolute;
            right: 0.65rem;
        }
        .flag {
            position: absolute;
            left: 0.65rem;
            color: var(--iconcolor);
        }
        .title {
            text-transform: capitalize;
        }
    }
}
</style>