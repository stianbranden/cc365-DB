import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueResizeObserver from "vue-resize-observer";

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
    faAngleRight,
    faBars,
    faSignOutAlt,
    faSignInAlt,
    faThermometerHalf,
    faClock,
    faExclamationCircle,
    faUsers, 
    faPlusCircle,
    faExclamationTriangle,
    faSort, 
    faFilter, 
    faClipboard, 
    faCog,
    faAngleDown,
    faAngleUp
} from '@fortawesome/free-solid-svg-icons'

import {
    faTimesCircle, faBell, faBellSlash, faEdit, faFile, faTrashAlt
} from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faLightbulb, faPhoneAlt, faComments, faEnvelope, faFolder, faCircleNotch,
    faChartBar, faThLarge, faSink, faMicrochip, faAngleLeft, faAngleRight, faBars,
    faSignOutAlt, faSignInAlt, faThermometerHalf, faClock, faExclamationCircle, faTimesCircle, 
    faUsers,faPlusCircle, faBell, faBellSlash, faExclamationTriangle, faSort, faFilter,
    faClipboard, faEdit, faCog, faFile, faTrashAlt, faAngleDown, faAngleUp )

createApp(App)
    .component('font-awesome-icon', FontAwesomeIcon)
    .use(store)
    .use(router)
    .use(VueResizeObserver)
    .mount('#app')
