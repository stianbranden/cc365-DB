import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Nordic',
    component: Home
  },
  {
    path: '/admin',
    name: 'Admin',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Admin.vue')
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: () => import(/* webpackChunkName: "alerts" */ '../views/Alerts.vue')
  },
  {
    path: '/alertsreport',
    name: 'AlertsReport',
    component: () => import(/* webpackChunkName: "alerts" */ '../views/AlertsReport.vue')

  },
  {
    path: '/myPage',
    name: 'MyPage',
    component: () => import(/* webpackChunkName: "alerts" */ '../views/MyPage.vue')
  },
  {
    path: '/quality',
    name: 'QualityAdmin',
    component: () => import(/* webpackChunkName: "alerts" */ '../views/QualityAssurance.vue')
  },
  {
    path: '/quality/contactstatus',
    name: 'ContactGoal Status',
    component: () => import(/* webpackChunkName: "alerts" */ '../views/ContactGoalStatus.vue')
  },
  {
    path: '/quality/contactgoaladmin',
    name: 'ContactGoal Admin',
    beforeEnter: [isQualityAdmin],
    component: () => import(/* webpackChunkName: "alerts" */ '../views/ContactGoalSetting.vue')
  },
  {
    path: '/quality/calibrations',
    name: 'Calibration',
    beforeEnter: [isQualityAdmin],
    component: () => import(/* webpackChunkName: "alerts" */ '../views/CalibrationsFront.vue')
  },
  {
    path: '/quality/calibrations/:session',
    name: 'Calibration Session',
    beforeEnter: [isQualityAdmin],
    component: () => import(/* webpackChunkName: "alerts" */ '../views/CalibrationSession.vue')
  },
  {
    path: '/wfm',
    name: 'WFM',
    component: () => import(/* webpackChunkName: "alerts" */ '../views/WFM.vue')
  },
  {
    path: '/bpo',
    name: 'BPO Operations Center',
    component: () => import(/* webpackChunkName: "alerts" */ '../views/BPO.vue')
  },
  {
    path: '/mycollections',
    name: 'MyCollections',
    component: () => import(/* webpackChunkName: "area" */ '../views/MyCollections.vue')
  },
  {
    path: '/mycollections/settings',
    name: 'MyCollectionsSettings',
    component: () => import(/* webpackChunkName: "area" */ '../views/MyCollectionsSettings.vue')
  },
  {
    path: '/timeaccounts',
    name: 'TimeAccounts',
    beforeEnter:[protectRoute],
    component: () => import(/* webpackChunkName: "area" */ '../views/PersonAccounts.vue')
  },
  {
    path: '/personaccounts',
    name: 'PersonAccounts',
    beforeEnter:[protectRoute],
    component: () => import(/* webpackChunkName: "area" */ '../views/PersonAccounts.vue')
  },
  {
    path: '/chat/:bot/:chat',
    name: 'ChatTranscript',
    component: () => import(/* webpackChunkName: "chat" */ '../views/ChatTranscript.vue')
  },
  {
    path: '/:department',
    name: 'Department',
    component: () => import(/* webpackChunkName: "department" */ '../views/Department.vue')
  },
  {
    path: '/:department/:channel/:country',
    name: 'Channel',
    component: () => import(/* webpackChunkName: "area" */ '../views/Channel.vue')
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.afterEach(to=>{
  let name = to.name;
  const pages = []
  if (name === 'Nordic') pages.push({name, routeName: name, params: {}, link: false})
  else if ( name === 'Department' ) {
    name = to.params.department
    pages.push({name: 'Nordic', routeName: 'Nordic', params: {}, link: true})
    pages.push({name: capitalize(name), routeName: 'Department',
       params: {department: name}, 
       link: false
    })
  }
  else if ( name === 'Channel' ) {
    name = to.params.department
    pages.push({name: 'Nordic', routeName: 'Nordic', params: {}, link: true})
    pages.push({name: capitalize(name), routeName: 'Department', params: {department: name}, link: true})
    if (to.params.department === 'helpdesk'){
      pages.push({name: capitalize(to.params.country), routeName: 'Channel', 
      params: {department: name, country: to.params.country},
      link: false
    })
    }
    else {
      pages.push({name: capitalize(to.params.channel), routeName: 'Channel', 
        params: {department: name, channel: to.params.channel},
        link: false
      })
    }
  }
  else if ( name === 'QualityAdmin' || name === 'ContactGoal Admin' || name === 'Calibration' || name === 'Calibration Session'|| name === 'ContactGoal Status'){
    pages.push({name: 'Quality Admin', routeName: 'QualityAdmin', params: {}, link: true})
    if ( name === 'Calibration' || 
      name === 'ContactGoal Admin' || 
      name === 'ContactGoal Status' ) pages.push({name, routeName: name, params: {}, link: false})
    else if ( name === 'Calibration Session') {
      name = store.getters.getSession(to.params.session).name
      pages.push({name: 'Calibration', routeName: 'Calibration', params: {}, link: true })
      pages.push({name, routeName: name, params: {}, link: false})
      name = "Calibration - '"+name+"'"
    }
    else {
      name = 'Quality Admin'
      pages[0].link = false;
    }
  }
  store.commit('setPageName', name)
  store.commit('setPages', pages)
})

function protectRoute(to, from, next){
  const acceptedRoutes = store.getters.getUserPages
  
  if ( acceptedRoutes.includes(to.name) ) next()
  else next({name: 'Nordic'})
}

function isQualityAdmin(to, from, next){
  if (store.getters.getUserPages.includes('QualityAdmin')) next()
  else next({name: 'Nordic'})
}

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

export default router
