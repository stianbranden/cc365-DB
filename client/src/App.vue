<template>
  <div id="everything" :class="{dark: store.getters.getDark}">
    <Navigation />
    <router-view/>
  </div>
</template>


<script>
import {useStore} from 'vuex'
import { onBeforeMount } from '@vue/runtime-core';
import Navigation from './components/Navigation.vue'

export default {
  components: {
    Navigation
  },
  setup() {
    const store = useStore();
    onBeforeMount(_=>{
      store.commit('ioConnect')
      store.dispatch('getAdminData');
      store.dispatch('getUser')
      store.dispatch('getDarkFromLocal')
    })
   
    return {store}
  },
}
</script>


<style lang="scss">
body {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
#everything {
  --bgcolor: lightgrey;
  --headercolor: #{$brand-color};
  --textcolor: black;
  --activelinkcolor: #{$secondary-brand-color};
  --linkcolor: white;
  --buttoncolor: white;
  --cardbgcolor: white;
  --cardmenucolor: #{$secondary-brand-color};
  --cardmenuhovercolor: #{$brand-color};
  --iconcolor : #aaa;
  --cardwidth: 275px;
  --cardbodyheight: 225px;
  --navhover: #{lighten($brand-color, 10%)};
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bgcolor);
  color: var(--textcolor);

  .card {
    width: var(--cardwidth) !important;
    min-width: var(--cardwidth) !important;
    .card-body, .card-spinner {
      height: var(--cardbodyheight) !important;
    }
  }
}
#everything.dark {
  --bgcolor: #{$blackish};
  --headercolor: black;
  --navhover: #{lighten(black, 10%)};
  --textcolor: #eee;
  --activelinkcolor: #{$secondary-brand-color};
  --linkcolor: #eee;
  --buttoncolor: black;
  --cardbgcolor: #{$color-dark-grey};
  --cardmenucolor: black;
  --cardmenuhovercolor: #{$secondary-brand-color};
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center; 
}
</style>
