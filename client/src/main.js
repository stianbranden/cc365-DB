import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { 
    faLightbulb, 
    faPhoneAlt, 
    faComments, 
    faEnvelope, 
    faFolder,
    faCircleNotch,
    faChartBar,
    faThLarge, 
    faSink, 
    faMicrochip,
    faAngleLeft,
    faAngleRight
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faLightbulb, faPhoneAlt, faComments, faEnvelope, faFolder, faCircleNotch
    , faChartBar, faThLarge, faSink, faMicrochip, faAngleLeft, faAngleRight )

createApp(App).component('font-awesome-icon', FontAwesomeIcon).use(store).use(router).mount('#app')
