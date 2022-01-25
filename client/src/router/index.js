import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Department from '../views/Department.vue'
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
    path: '/:department',
    name: 'Department',
    component: Department
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.afterEach(to=>{
  let name = to.name;
  if ( name === 'Department' ) name = to.params.department
  store.commit('setPageName', name)
})

export default router
