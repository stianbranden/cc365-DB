<template>
  <header class=navigation>
    <div class="brand">
        <img alt="Logo" src="../assets/icon.png">
    </div>
    <nav>
        <router-link to="/">Nordic</router-link>
        <router-link to="/admin">Admin</router-link>
        
        <button title="Toggle dark mode" @click="store.commit('toggleDark')">
            <font-awesome-icon icon="lightbulb" />
        </button>
    </nav>
  </header>
</template>

<script>
import {useStore} from 'vuex'
export default {
    setup(){
        const store = useStore();
        const dark = store.getters.getDark;
        return {store, dark}
    }
}
</script>

<style lang="scss">
    header.navigation {
        background: var(--headercolor);
        display: flex;
        margin: 0;
        padding: 0.5rem;
        align-items: center;
        justify-content: space-between;
        .brand {
            margin: 0 1rem;
            img {
                height: 2rem;
            }
        }
        nav {
            margin: 0 1rem;
            a {
            font-weight: bold;
            color: var(--linkcolor);
            display: inline-block;
            text-decoration: none;
            margin: 0 1rem;
                &:hover {
                    text-decoration: underline;
                }

                &.router-link-exact-active {
                    color: var(--activelinkcolor);
                }
            }
            button {
                cursor: pointer;
                padding: 0.1rem 0.3rem;
                border: 1px solid var(--textcolor);
                border-radius: 0.25rem;
                background-color: var(--buttoncolor);
                color: var(--textcolor);
                &:hover {
                    border-color: var(--activelinkcolor);
                    color: var(--activelinkcolor)
                }
            }
        }


        
    }

</style>