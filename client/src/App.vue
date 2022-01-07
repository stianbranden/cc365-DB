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
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bgcolor);
  color: var(--textcolor);
}
#everything.dark {
  --bgcolor: #{$blackish};
  --headercolor: black;
  --textcolor: #eee;
  --activelinkcolor: #{$secondary-brand-color};
  --linkcolor: #eee;
  --buttoncolor: black;
  --cardbgcolor: #{$color-dark-grey};
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center; 
}
</style>
