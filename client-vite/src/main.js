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
    faAngleUp,
    faTruck,
    faUserCog,
    faCalendar,
    faUndoAlt,
    faUser,
    faCodeBranch,
    faSync,
    faStar,
    faShield,
    faGaugeSimpleHigh,
    faCircleMinus,
    faPenToSquare,
    faCircleCheck,
    faTrash, 
    faArrowUpRightFromSquare,
    faCircleXmark,
    faMedal,
    faChartSimple,
    faCircleHalfStroke,
    faCircle,  

} from '@fortawesome/free-solid-svg-icons'

import {
    faTimesCircle, faBell, faBellSlash, faEdit, faFile, faTrashAlt, faCircle as farCircle, faCircleCheck as farCircleCheck, faCircleXmark as farCircleXmark, faCircleQuestion
} from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faLightbulb, faPhoneAlt, faComments, faEnvelope, faFolder, faCircleNotch,
    faChartBar, faThLarge, faSink, faMicrochip, faAngleLeft, faAngleRight, faBars,
    faSignOutAlt, faSignInAlt, faThermometerHalf, faClock, faExclamationCircle, faTimesCircle, 
    faUsers,faPlusCircle, faBell, faBellSlash, faExclamationTriangle, faSort, faFilter,
    faClipboard, faEdit, faCog, faFile, faTrashAlt, faAngleDown, faAngleUp, faTruck, faUserCog,
    faCalendar, faUndoAlt, faUser, faCodeBranch, faSync, faStar, faShield, faGaugeSimpleHigh, faCircleMinus, 
    faPenToSquare, faCircleCheck, faTrash, faArrowUpRightFromSquare, faCircleXmark, faMedal, faChartSimple,
    faCircleHalfStroke,faCircle, farCircle, farCircleCheck, farCircleXmark, faCircleQuestion)

createApp(App)
    .component('font-awesome-icon', FontAwesomeIcon)
    .use(store)
    .use(router)
    .use(VueResizeObserver)
    .mount('#app')
