<template>
    <div class="flag">
        <svg style="height: 1rem; width: 1rem;" v-if="department=='dk'" xmlns="http://www.w3.org/2000/svg" id="flag-icons-dk" viewBox="0 0 640 480">
            <path fill="#c8102e" d="M0 0h640.1v480H0z"/>
            <path fill="#fff" d="M205.7 0h68.6v480h-68.6z"/>
            <path fill="#fff" d="M0 205.7h640.1v68.6H0z"/>
        </svg>
        <svg style="height: 1rem; width: 1rem;" v-else-if="department=='fi'" xmlns="http://www.w3.org/2000/svg" id="flag-icons-fi" viewBox="0 0 640 480">
            <path fill="#fff" d="M0 0h640v480H0z"/>
            <path fill="#003580" d="M0 174.5h640v131H0z"/>
            <path fill="#003580" d="M175.5 0h130.9v480h-131z"/>
        </svg>
        <svg style="height: 1rem; width: 1rem;" v-else-if="department=='no'" xmlns="http://www.w3.org/2000/svg" id="flag-icons-no" viewBox="0 0 640 480">
            <path fill="#ed2939" d="M0 0h640v480H0z"/>
            <path fill="#fff" d="M180 0h120v480H180z"/>
            <path fill="#fff" d="M0 180h640v120H0z"/>
            <path fill="#002664" d="M210 0h60v480h-60z"/>
            <path fill="#002664" d="M0 210h640v60H0z"/>
        </svg>
        <svg style="height: 1rem; width: 1rem;" v-else-if="department=='se'" xmlns="http://www.w3.org/2000/svg" id="flag-icons-se" viewBox="0 0 640 480">
            <path fill="#066aa7" d="M0 0h640v480H0z"/>
            <path fill="#fecc00" d="M0 192h640v96H0z"/>
            <path fill="#fecc00" d="M176 0h96v480h-96z"/>
        </svg>
        <font-awesome-icon icon="sink" v-else-if="department=='ki'" />
        <font-awesome-icon icon="microchip" v-else-if="department=='thd'" />

    </div>
</template>

<script>
export default {
    props: {
        department: String
    }
}
</script>

<style>

</style>