<template>
  <div id="everything" :class="{dark: store.getters.getDark}">
    <Navigation />
    <router-view/>
  </div>
</template>


<script>
import {useStore} from 'vuex'
import { onBeforeMount} from '@vue/runtime-core';
import Navigation from './components/Navigation.vue'
//const {VUE_APP_SOCKET_ADRESS} = process.env

export default {
  components: {
    Navigation
  },
  setup() {
    const store = useStore();
    onBeforeMount(_=>{
      store.commit('ioConnect')
      //console.log(store.state);
      store.dispatch('getAdminData');
      store.dispatch('getUser')
      store.dispatch('getDarkFromLocal')
    })
    /*onMounted(_=>{
      socket = io(VUE_APP_SOCKET_ADRESS, {
        reconnection: false
      });
      console.log(socket);
    })*/
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
  --cardwidth: 300px;
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
      height: 225px !important;
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
  --cardmenucolor: black; //#{$brand-color};
  --cardmenuhovercolor: #{$secondary-brand-color};
}

#app {
 // font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center; 
}
</style>
