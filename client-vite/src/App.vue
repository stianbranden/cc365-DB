<template>
  <div id="everything" class="vue" :class="{dark: store.getters.getDark}">
    <Navigation />
    <Warnings />
    <router-view/>  
    <HotBot />
    <button hidden v-shortkey.once="['ctrl', 'alt', 's']" @shortkey="store.state.sourceSystem = 'Sinch'">Switch to Genesys</button>
  </div>
</template>


<script>
import {useStore} from 'vuex'
import { onBeforeMount, ref } from '@vue/runtime-core';
import Navigation from './components/Navigation.vue'
import Warnings from './components/Warnings.vue'
import HotBot from './components/HotBot.vue'


export default {
  components: {
    Navigation, Warnings, HotBot
  },
  setup() {
    const store = useStore();
    const warningsOpen = ref(true)
    onBeforeMount(_=>{
      store.commit('ioConnect')
      store.dispatch('getAdminData');
      store.dispatch('getReleaseNotes')
      store.dispatch('getUser')
      store.dispatch('getAlerts');
      store.dispatch('getSettingsFromLocal')
      store.dispatch('getCollections')
    })
   
    return {store, warningsOpen}
  },
}
</script>


<style lang="scss">

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.btn {
    cursor: pointer;
    &:hover {
        color: var(--iconhovercolor)
    }
}

.vue {
  --bgcolor: lightgrey;
  --headercolor: #{$brand-color};
  --textcolor: black;
  --activelinkcolor: #{$secondary-brand-color};
  --linkcolor: white;
  --buttoncolor: white;
  --cardbgcolor: white;
  --cellcolor: #{darken(white, 10%)};
  --cardmenucolor: #{$secondary-brand-color};
  --cardmenuhovercolor: #{$brand-color};
  --iconcolor : #bbb;
  --iconhovercolor: #aaa;
  --cardwidth: 275px;
  --cardbodyheight: 225px;
  @include small {
    // --cardwidth: 200px;
    --cardbodyheight: 175px;
  }
  @include tv {
    // --cardwidth: 350px;
    --cardbodyheight: 275px;
  }
  --navhover: #{lighten($brand-color, 10%)};
  --alertbordercolor: lightgrey;
  --activealertbgcolor: #{lighten($color-bad, 30%)};
  --recentalertcolor: #{lighten($color-yellow, 40%)};
  --alertcheckboxcolor: #{$brand-color};

  &.dark {
    --bgcolor: #{$blackish};
    --headercolor: black;
    --navhover: #{lighten(black, 10%)};
    --textcolor: #eee;
    --activelinkcolor: #{$secondary-brand-color};
    --linkcolor: #eee;
    --buttoncolor: black;
    --cardbgcolor: #{$color-dark-grey};
    --cellcolor: #{lighten($color-dark-grey, 10%)};
    --cardmenucolor: black;
    --cardmenuhovercolor: #{$secondary-brand-color};
    --activealertbgcolor: #{darken($color-bad, 30%)};
    --iconcolor : #aaa;
    --iconhovercolor: #bbb;
    --recentalertcolor: #{darken($color-yellow, 40%)};
    --alertcheckboxcolor: #{$blackish};
    //--alertbordercolor: #{$color-dark-grey};
  }

  width: 100vw;
  min-height: 100vh;
  padding-bottom: 2rem;
  overflow: hidden;
  background-color: var(--bgcolor);
  color: var(--textcolor);
}


.home {
  // margin-top: 1rem;
  margin-inline: 2rem;
  button {
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: var(--buttoncolor);
    border: 1px solid var(--textcolor);
    color: var(--textcolor);
    &.active {
      background-color: var(--textcolor);
      border: 1px solid var(--buttoncolor);
      color: var(--buttoncolor);
    }
    cursor: pointer;
  }
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: baseline;
  padding: 0 1rem 2rem 1rem;
  height: 100%;
  overflow: auto;
  margin-bottom: 2rem;
  &.showAlerts {
    @include small {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
      grid-template-areas: 
        "alerts one"
        "alerts two"
        "three four"
        "five six" 
        "seven eight"
      ;
    }
    @include medium {
      overflow-x: hidden;
      padding: 0 2rem 2rem 2rem;
      grid-template-columns: auto 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr 1fr;
      grid-template-areas: 
        "alerts one two"
        "alerts three four"
        "five six seven" 
        "eight nine ten"
      ;
    }
    @include tv {
      grid-template-columns: auto 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
      grid-template-areas: 
        "alerts one two three"
        "alerts four five six"
        "seven eight nine ten"
      ;
    }
    @include jumbo {
      grid-template-columns: auto 1fr 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr ;
      grid-template-areas: 
        "alerts one two three four"
        "alerts five six seven eight"
      ;
    }
  }
  .card {
    width: var(--cardwidth);
    height: fit-content;
    border-radius: 0.5rem;
    box-shadow: 10px 10px 5px 0px rgba(0,0,0,0.75);
    background-color: var(--cardbgcolor);
    margin: 2rem 1rem;
    justify-self: center;
    align-self: center;

    @include jumbo {
      //transform: scale(1.05);
    }

    &.alerts-card{
      width: 90vw;
      grid-area: alerts;
      min-width: calc(1.3 * var(--cardwidth));
      max-width: calc(2 * var(--cardwidth));
      @include small {
        max-width: calc(1.5 * var(--cardwidth));
        width: unset;
      }
      @include medium {
        min-width: calc(1.2 * var(--cardwidth));
        max-width: calc(2 * var(--cardwidth));
      }
      @include tv {
        min-width: calc(1.65 * var(--cardwidth));
        max-width: calc(2.5 * var(--cardwidth));
      }
      .card-body {
        min-height: calc(2 * var(--cardbodyheight) + 4rem + 2rem + 2rem);//calc(2.55 * var(--cardbodyheight)) !important;
        overflow-y: auto;
      }
    }

    .card-body, .card-spinner {
      height: var(--cardbodyheight);
    }
    .card-header {
      border-radius: 0.5rem 0.5rem 0 0;
        position: relative;
        background-color: var(--headercolor);
        color: white;
        padding: 0.5rem;
        height: 2rem;
        z-index: 2;
    }
    .card-menu{
      background-color: var(--cardmenucolor);
        height: 2rem;
        border-radius: 0 0 0.5rem 0.5rem;
        position: relative;
        display: flex;
        padding: 0 1rem;
        align-items: center;
        color: white;
        z-index: 2;
    }
  }
}
footer{
  font-size: 0.8rem;
  margin-top: 3rem;
}



#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center; 
}


</style>
