import { createStore } from 'vuex'
import io from 'socket.io-client'
import moment from 'moment'
console.log({env: import.meta.env})
const {VITE_SOCKET_ADRESS, VITE_API_ROOT} = import.meta.env
const {localStorage} = window;

import {version} from '../../package.json'

export default createStore({
  state: {
    version: version,
    releaseNotes: [],
    socket: null,
    socketConnected: false,
    counter: 0,
    adminData: null,
    queueData: [],
    dailyStats: [],
    alerts: [],
    latestAlertUpdate: null,
    lastPing: null,
    dark: true,
    user: null,
    queuesPerPage: 5,
    showWarnings: true,
    pageName: '',
    showAlerts: false,
    alertOrder: 'created',
    sortsArr: [
      {name: 'Created Desc', value: 'created'},
      {name: 'Created Asc', value: 'created-asc'},
      {name: 'Updated Desc', value: 'updated'},
      {name: 'Updated Asc', value: 'updated-asc'},
      {name: 'Department A-Z', value: 'department'},
      {name: 'Departmemt Z-A', value: 'department-desc'}
    ],
    areas: [
      {abbr: 'AS', name: 'After Sales'},
      {abbr: 'BO', name: 'Back Office'},
      {abbr: 'BU', name: 'B2B'},
      {abbr: 'BUHOT', name: 'B2B Hotline'},
      {abbr: 'CAS', name: 'Cashier'},
      {abbr: 'HDF', name: 'Helpdesk Free'},
      {abbr: 'HDP', name: 'Helpdesk Paid'},
      {abbr: 'HOT', name: 'Hotline'},
      {abbr: 'INT', name: 'Internal'},
      {abbr: 'KI', name: 'Kitchen'},
      {abbr: 'KIHOT', name: 'Kitchen Hotline'},
      {abbr: 'PAY', name: 'Payment'},
      {abbr: 'PS', name: 'Pre Sales'},
      {abbr: 'STA', name: 'Status'}
    ],
    pages: [],
    showNotifications: false,
    notifications: [],
    showModal: false, 
    accesses: [],
    delDev: [],
    collections: [],
    mySchedule: {},
    agent: {},
    hotbots: [
      {name: 'None', key: null},
      {name: 'Danish', key: "d067a39f-c160-4824-8f7a-0863e9f9ef67"},
      {name: 'Norwegian - Lørenskog', key: "72a50932-2f24-4454-8d78-95f714e95d8c"},
      {name: 'Norwegian - Copenhagen', key: "49359f26-44ed-4703-b301-b169a224955c"},
      {name: 'Swedish', key: "c8f2f820-e41d-470b-9b69-a003ec24d2c1"}
    ],
    selectedBot: 'None',
    qualitySegments: [],
    qualityForms: []
  },
  mutations: {
    ioConnect(state){
      state.socket = io(VITE_SOCKET_ADRESS);
      state.socket.on('submit-room', _=>{
        console.log('Server asked for room');
        state.socket.emit('connect-to', 'vue');
        state.lastPing = moment().toISOString()
      })
      state.socket.on('connect-ok', ({id, room})=>{
        console.log(`${id} connected to ${room}`);
        state.lastPing = moment().toISOString()
      })
      state.socket.on('admin-data', data=>{
        state.adminData = data
        //state.lastPing = moment().toISOString()
      })
      state.socket.on('updateQueues', data=>{
        state.queueData = flattenQueueData(data);
        //console.log(state.queueData);
        state.lastPing = moment().format()
      })
      state.socket.on('updateStats', data=>{
        state.dailyStats = flattenQueueData(data)
        //console.log(state.dailyStats);
      })
      state.socket.on('new-alert', data => {
        const alerts = filterUnaccesibleAlerts(preProcessAlerts(data.alerts, state.latestAlertUpdate, state.alerts), state.user)
        state.latestAlertUpdate = alerts.length > 0 ? alerts[0].unix : null
        state.alerts = alerts
        orderAlerts(state)
        //console.log('socket', state.alerts, state.alerts.length, state.latestAlertUpdate);
      })
      state.socket.on('delDev', data =>{
        state.delDev = data
        //console.log(state.delDev);
      })
      state.socket.on('updatedSchedule', data =>{
        state.mySchedule = data
        state.lastPing = moment().toISOString()
        //console.log({event:'New Schedule', data});
      })


      //Socket state mngmnt
      state.socket.on('disconnect', _=>{
        state.socketConnected = false;
      })
      state.socket.on('connect', _=>{
        state.socketConnected = true;
      })
      //console.log(state.socket);
    },
    addCounter(state){
      state.counter++;
    },
    toggleDark(state){
      const newValue = !state.dark;
      state.dark = newValue;
      localStorage.setItem('dark', newValue)
    }, 
    setDark(state, value){
      state.dark = value;
    },
    setPageName(state, value) {
      state.pageName = value;
    },
    setPages(state, value){
      state.pages = value;
    },
    toggleWarnings(state){
      state.showWarnings = !state.showWarnings
    },
    orderAlerts(state, orderBy){
      if ( orderBy ) state.alertOrder = orderBy
      orderAlerts(state);
    },
    toggleAlerts(state){
      state.showAlerts = !state.showAlerts
      localStorage.setItem('alerts', state.showAlerts)
    },
    setAlerts(state, newValue){
      state.showAlerts = newValue
    },
    setNotifications(state, newValue){
      if ( newValue ){
        notifyPermission().then(res => state.showNotifications = res);
      }
      else state.showNotifications = false
    },
    toggleNotifications(state){
      const newValue = !state.showNotifications
      if ( newValue ){
        notifyPermission().then(res =>{ 
          state.showNotifications = res
          localStorage.setItem('notifications', state.showNotifications)
        });
        
      }
      else {
        state.showNotifications = false;
        localStorage.setItem('notifications', false)
      }      
    },
    notify(state, data){
      //console.log(data.key, state.showNotifications ,!state.notifications.includes(data.key));
      if (state.showAlerts && state.showNotifications && !state.notifications.includes(data.key)){
        
        state.notifications.push(data.key);
        new Notification(data.title, {
          icon: '/images/icon.png', 
          badge: '/images/icon.png', 
          body: data.text.replace('<br>', '\n')
        });
      }
    },
    toggleModal(state){
      state.showModal = !state.showModal
    },
    setSelectedBot(state, localBot){
      state.selectedBot = localBot
      localStorage.setItem('hotbot', localBot)
    }
  },
  actions: {
    getSegments({state}){
      fetch(VITE_API_ROOT + 'quality/segments')
      .then(response=>response.json())
      .then(data=>state.qualitySegments = data)
      .finally(_=>{
        fetch(VITE_API_ROOT + 'quality/forms')
        .then(data=>data.json())
        .then(data=>state.qualityForms = data)
      })
    },
    toggleSegment({dispatch}, id){
      fetch(VITE_API_ROOT + 'quality/toggleSegment/' + id, {method: 'POST'})
      .then(response=>response.json())
      // .then(data=>console.log(data))
      .finally(dispatch('getSegments'))
    },
    toggleUser({dispatch}, {segmentId, userId}){
      fetch(VITE_API_ROOT + 'quality/toggleUser/' + segmentId + '/' + userId, {method: 'POST'})
      .then(response=>response.json())
      // .then(data=>console.log(data))
      .finally(dispatch('getSegments'))
    },
    bumpUser({dispatch}, {segmentId, userId}){
      fetch(VITE_API_ROOT + 'quality/bumpUser/' + segmentId + '/' + userId, {method: 'POST'})
      .then(response=>response.json())
      // .then(data=>console.log(data))
      .finally(dispatch('getSegments'))
    },
    toggleForm({state, dispatch}, {segmentId, formId}){
      const forms = [...state.qualityForms].filter(a=>a.status === 1)
      let newFormId = -1
      for (let i = 0; i < forms.length; i++){
        if (forms[i].id === formId && (i+1) < forms.length) newFormId = forms[i+1].id 
      }
      if (newFormId < 0 ) newFormId = forms[0].id

      fetch(VITE_API_ROOT + 'quality/toggleForm/' + segmentId + '/' + newFormId, {method: 'POST'})
      .then(response=>response.json())
      // .then(data=>console.log(data))
      .finally(dispatch('getSegments'))
    },
    getAdminData({state}){
      fetch(VITE_API_ROOT + 'admin')
        .then(response=>response.json())
        .then(data=>state.adminData = data)
    } ,
    getReleaseNotes({state}){
      fetch(VITE_API_ROOT + 'releasenotes')
        .then(response=>response.json())
        .then(data=>state.releaseNotes = data)
    },
    getUser({state}){
      fetch(VITE_API_ROOT + 'user')
        .then(response=>response.json())
        .then(user=> {
          state.user = user
          let agentId = user.agentId
          if (agentId){
            fetch(VITE_API_ROOT + 'user/schedule/' + agentId)
              .then(response=>response.json())
              .then(schedule=>{
                state.mySchedule = schedule
                state.agent = schedule.agent
                if (state.socket) state.socket.emit('connect-to', agentId);
              })
          }
          //console.log(user);
        })
    },
    getAlerts({state}){
      fetch(VITE_API_ROOT + 'alerts')
        .then(response=>response.json())
        .then(data=>{
          const alerts = preProcessAlerts(data, state.latestAlertUpdate, state.alerts)
          state.latestAlertUpdate = alerts.length > 0 ? alerts[0].unix : null
          state.alerts = alerts
          orderAlerts(state)
          //console.log('init', state.alerts, state.alerts.length, state.latestAlertUpdate);
        })
    }
    ,
    getSettingsFromLocal({commit}){
      let localDark = localStorage.getItem('dark') == 'false' || !Boolean(localStorage.getItem('dark')) ? false : true;
      commit('setDark', localDark)

      let localAlerts = localStorage.getItem('alerts') == 'false' || !Boolean(localStorage.getItem('alerts')) ? false : true;
      commit('setAlerts', localAlerts)

      let localNotifications = localStorage.getItem('notifications') == 'false' || !Boolean(localStorage.getItem('notifications')) ? false : true;
      commit('setNotifications', localNotifications)

      let localBot = localStorage.getItem('hotbot') == null ? 'None' : localStorage.getItem('hotbot')
      commit('setSelectedBot', localBot)
    },
    createAlert: ({dispatch}, data) =>{
      return new Promise(async (resolve, reject)=>{
        //console.log(data);
        const response = await fetch(VITE_API_ROOT + 'alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        if (response.status > 299){
          let text = `Could not create alert - ${response.statusText} - ${(await response.json()).msg}`
          reject(text)
        }
        else {
          dispatch('getAlerts')
          resolve('OK')
        }

      })
    }, 
    updateAlert: ({dispatch}, {alertId, data})=>{
      return new Promise(async (resolve, reject)=>{
        const response = await fetch(`${VITE_API_ROOT}alerts/${alertId}`,{
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        if (response.status > 299){
          let text = `Could not update alert - ${response.statusText} - ${(await response.json()).msg}`
          reject(text)
        }
        else {
          dispatch('getAlerts')
          resolve('OK)')
        }
      })
    },
    getAccesses: ({state})=>{
      fetch(VITE_API_ROOT + 'access').then(response=>response.json())
      .then(accesses=>state.accesses = accesses)
    },
    newAccess: ({state})=>{
      fetch(VITE_API_ROOT + 'access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response=>response.json())
        .then(newAccess=>state.accesses.push(newAccess));
    },

    getCollections: ({state})=>{
      fetch(VITE_API_ROOT + 'collections')
        .then(res =>res.json())
        .then(collections=>state.collections = collections)
    },
    addOrUpdateCollection({state, dispatch}, {name, _id, visibleOnAll, queues}){
      if ( _id === 'new' ){
        fetch(VITE_API_ROOT + 'collections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({name, visibleOnAll, queues})
        })
          .then(response=>response.json())
          .then(collection=>state.collections.push(collection))
      }
      else {
        fetch(VITE_API_ROOT + 'collections/' + _id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({name, visibleOnAll, queues})
        })
          .then(_=>dispatch('getCollections'))
      }
    },
    removeCollection({dispatch}, id){
      fetch(VITE_API_ROOT + 'collections/' + id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(_=>dispatch('getCollections'))
    }
  },
  modules: {
  },
  getters: {
    getUser(state){
      if (state.user) return state.user
      return {}
    },
    getUserPages(state){
      if (state.user && state.user.pages){
        const acceptedRoutes = []
        state.user.pages.forEach(p=>acceptedRoutes.push(p.routerName))
        return acceptedRoutes
      } 
      else return []
    },
    connectionStatus(state){
      return state.socketConnected
    },
    timeFromLastPing(state){
      if (!state.lastPing) return 'no ping recieved'
      return moment(state.lastPing).fromNow() + ' (' + moment(state.lastPing).calendar(null, {
        sameDay: '[today] HH:mm:ss',
        nextDay: '[tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[testerday] HH:mm',
        lastWeek: '[last] dddd',
        sameElse: 'DD/MM/YYYY'
    }) + ')'
    },
    socket(state){
      return state.socket
    },
    osDataUpdateTime(state){
      //return moment(state.adminData.osData.time).format('yyyy-MM-DD HH:mm')
      return moment(state.adminData.osData.time).fromNow() + ' (' + moment(state.adminData.osData.time).calendar(null, {
        sameDay: '[today] HH:mm',
        nextDay: '[tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[testerday] HH:mm',
        lastWeek: '[last] dddd',
        sameElse: 'DD/MM/YYYY'
      }) + ')'
    },
    getDark(state){
      return state.dark
    },
    getQueueData: (state) => (channel, department, country, area)=>{
      const data = computeQueues(state, channel, department, country, area)
      return data;
    },
    hasQueueData: (state) => (channel, department, country, area)=>{
      return hasQueues(state, channel, department, country, area)
    },
    getDailyData: (state) => (channel, department, country, area)=>{
      const data = computeDaily(state, channel, department, country, area )
      return data
    },
    getSummaryData: (state) => (department) =>{

      const object = {
        queues: [],
        pages: [],
        summary: {
          inQueue: 0,
          maxWait: 0,
          ready: {
            min: 1000,
            max: 0
          },
          idle:{
            min: 1000,
            max: 0
          }
        }
      }
      const result = {
        department,
        data: {
          ph: {...object},
          ch: {...object},
          em: {...object},
          ac: {...object}
        }
      };
      if (department === 'thd'){
        result.data = {
          dk: {...object},
          fi: {...object},
          no: {...object},
          se: {...object},
        }
        Object.keys(result.data).forEach(country=>{
          const data = computeQueues(state, 'PH', department, country.toUpperCase())
          if ( data.queues.length > 0) result.data[country] = data;
        })
      }
      else {
        ['PH', 'CH', 'EM', 'AC'].forEach(channel=>{
          //console.log(channel, department);
          const data = computeQueues(state, channel, department)
          if (data.queues.length > 0){
            result.data[channel.toLowerCase()] = data;
          }
        })
      }
      return result;
    },
    getSummaryDaily: (state) => (department)=>{

      const data = {
        ph: null,
        ch: null,
        em: null,
        ac: null
      }
      Object.keys(data).forEach(channel=>{
        data[channel] = computeDaily(state, channel.toUpperCase(), department)
      })
      //data.department = department
      return data;
    },
    getThdSummary: state =>{
      const data = {
        dk: null,
        fi: null,
        no: null,
        se: null
      }
      Object.keys(data).forEach(country =>{
        data[country] = computeDaily(state, 'PH', 'thd', country.toUpperCase())
      })
      //data.department = 'thd'
      return data;
    },
    getOpenAlerts: state => department =>{
      //console.log(department);
      let arr = [...state.alerts];
      arr = arr.filter(a=>a.closed === false && a.personrelated === false)
      if (department && department.toLowerCase() !== 'nordic') arr = arr.filter(a=>a.department.toLowerCase() === department)
      return arr;
      //return arr.slice(0,5)
    },
    getDeliveryDeviations: state => department =>{
      let arr = [...state.delDev]
      if ( department === 'ki' ) arr = arr.filter(a=>a.epoq && a.countryCode !== 'FI')
      else if ( department === 'fi' ) arr = arr.filter(a=>a.countryCode === 'FI')
      else arr = arr.filter(a=>!a.epoq && a.countryCode === department.toUpperCase())
      const summary = {
        total: 0,
        open: 0,
        breached: 0,
        breachingToday: 0
      }
      arr.forEach(a=>{
        summary.total ++
        summary[a.slaStatus] ++
      })
      return {summary, deliveryDeviations: arr}
    },
    getQueueSelections: state =>{
      const department= []
      const country = []
      const area = []
      const channel = []
      //console.log(state.queueData);
      state.queueData.forEach(q=>{
        if ( !department.includes(q.department) ) department.push(q.department)
        if ( !country.includes(q.country) ) country.push(q.country)
        if ( !area.includes(q.area) ) area.push(q.area)
        if ( !channel.includes(q.channel) ) channel.push(q.channel)
      })
      department.sort((a,b)=> a > b ? 1: -1)
      country.sort((a,b)=> a > b ? 1: -1)
      area.sort((a,b)=> a > b ? 1: -1)
      channel.sort((a,b)=> a > b ? 1: -1)
      return {department, country, area, channel}
    },
    getQueuesFromQueueSelection: state => (department, country, area, channel)=>{
      let arr = [...state.queueData]
      if ( department && department !== 'all') arr = arr.filter(a=>a.department === department)
      if ( country && country !== 'all') arr = arr.filter(a=>a.country === country)
      if ( area && area !== 'all') arr = arr.filter(a=>a.area === area)
      if ( channel && channel !== 'all') arr = arr.filter(a=>a.channel === channel)

      return arr;
    },
    getVisibleCollections: state =>{
      return [...state.collections].filter(a=>a.visibleOnAll)
    },
    getCollection: state => id =>{
      let arr = [...state.collections].filter(a=> a._id === id)
      if (arr.length > 0) return arr[0]
      else return null
    },
    getCollectionQueueData: state => queues =>{
      const data = computeCollectionQueues(state, queues)
      return data;
    },
    getCollectionDailyData: state => queues =>{
      const data = computeCollectionDaily(state, queues)
      //console.log({data, queues});
      return data
    },
    getSelectedBot: state => {
      const selectedBot = state.hotbots.filter(a=>a.name === state.selectedBot)[0]
      return selectedBot
    },
    getBotSelections: state => state.hotbots

  }
})

function computeCollectionQueues(state, queues){
  let arr = [...state.queueData].filter(a=>queues.includes(a.id))
  const object= {
    queues: arr,
    pages: [],
    summary: {
      inQueue: 0,
      maxWait: 0,
      ready: {
        min: 1000,
        max: 0
      },
      idle:{
        min: 1000,
        max: 0
      }
    }
  }
  if (arr.length > 0){
    let page = []
    arr.forEach((q, index)=>{
      const idle = q.agentsFree
      const ready = q.agentsServing - q.agentsNotReady
      object.summary.inQueue += q.inQueueCurrent;
      if ( q.waitingDurationCurrentMax > object.summary.maxWait) object.summary.maxWait = q.waitingDurationCurrentMax;
      if ( idle > object.summary.idle.max ) object.summary.idle.max = idle
      if ( idle < object.summary.idle.min ) object.summary.idle.min = idle
      if ( ready < object.summary.ready.min ) object.summary.ready.min = ready
      if ( ready > object.summary.ready.max ) object.summary.ready.max = ready

      page.push(q);
      if ( index % state.queuesPerPage == state.queuesPerPage - 1) {
        object.pages.push(page)
        page = []
      }
    })
    if ( page.length > 0) object.pages.push(page)
  }

  object.summary.timeWait = msToTime(object.summary.maxWait)
  return object;
}

function computeCollectionDaily(state, queues){
  //console.log(state.dailyStats);
  let arr = [...state.dailyStats].filter(a=> queues.includes(a.queueId))
  const summary = {
    inSla: 0,
    answered: 0,
    offered: 0,
    speedOfAnswer: 0,
    handling: 0
  }
  if (arr.length > 0){
    arr.forEach(q=>{
     summary.inSla += q.countOfAnsweredOnTimeContacts;
     summary.answered += q.countOfHandledContacts;
     summary.offered += q.countOfArrivedContacts;
     summary.speedOfAnswer += q.waitingDurationForHandled;
     summary.handling += q.handlingDuration;
    })
  }
  if (summary.answered > 0){
    summary.sla = Math.round(summary.inSla/summary.offered*100)
    summary.asa = Math.round(summary.speedOfAnswer/summary.answered)
    summary.aht = Math.round(summary.handling/summary.answered)
  }
  else {
    summary.sla = 0
    summary.asa = 0
    summary.aht = 0
  }
  summary.timeAsa = msToTime(summary.asa)
  summary.timeAht = msToTime(summary.aht)
  return {queues: arr, summary}
}

function computeDaily(state, channel, department, country, area ){
  let arr = [...state.dailyStats];

  if ( channel ) arr = arr.filter(q=>q.channel === channel)
  if ( department ) arr = arr.filter(q=>q.department === department)
  if ( country ) arr = arr.filter(q=>q.country === country)
  if ( area ) arr = arr.filter(q=>q.area === area)

  const summary = {
    inSla: 0,
    answered: 0,
    offered: 0,
    speedOfAnswer: 0,
    handling: 0
  }
  if (arr.length > 0){
    arr.forEach(q=>{
     summary.inSla += q.countOfAnsweredOnTimeContacts;
     summary.answered += q.countOfHandledContacts;
     summary.offered += q.countOfArrivedContacts;
     summary.speedOfAnswer += q.waitingDurationForHandled;
     summary.handling += q.handlingDuration;
    })
  }
  if (summary.answered > 0){
    summary.sla = Math.round(summary.inSla/summary.offered*100)
    summary.asa = Math.round(summary.speedOfAnswer/summary.answered)
    summary.aht = Math.round(summary.handling/summary.answered)
  }
  else {
    summary.sla = 0
    summary.asa = 0
    summary.aht = 0
  }
  summary.timeAsa = msToTime(summary.asa)
  summary.timeAht = msToTime(summary.aht)
  return {queues: arr, summary}
}

function hasQueues(state, channel, department, country, area ){
  let arr = [...state.queueData];
  if ( channel ) arr = arr.filter(q=>q.channel === channel)
  if ( department ) arr = arr.filter(q=>q.department === department)
  if ( country ) arr = arr.filter(q=>q.country === country)
  if ( area ) arr = arr.filter(q=>q.area === area)
  return arr.length > 0
}

function computeQueues(state, channel, department, country, area ){
  let arr = [...state.queueData].sort((a,b)=>{
    if ((a.area === 'AS' || a.area === 'PS') && (b.area !== 'AS' || b.area !== 'PS') ) return -1
    if (a.area > b.area) return 1
    if (a.area === b.area && a.name > b.name) return 1
    return -1;
  });
  if ( channel ) arr = arr.filter(q=>q.channel === channel)
  if ( department ) arr = arr.filter(q=>q.department === department)
  if ( country ) arr = arr.filter(q=>q.country === country)
  if ( area ) arr = arr.filter(q=>q.area === area)

  const object= {
    queues: arr,
    pages: [],
    summary: {
      inQueue: 0,
      maxWait: 0,
      ready: {
        min: 1000,
        max: 0
      },
      idle:{
        min: 1000,
        max: 0
      }
    }
  }
  if (arr.length > 0){
    let page = []
    arr.forEach((q, index)=>{
      const idle = q.agentsFree
      const ready = q.agentsServing - q.agentsNotReady
      object.summary.inQueue += q.inQueueCurrent;
      if ( q.waitingDurationCurrentMax > object.summary.maxWait) object.summary.maxWait = q.waitingDurationCurrentMax;
      if ( idle > object.summary.idle.max ) object.summary.idle.max = idle
      if ( idle < object.summary.idle.min ) object.summary.idle.min = idle
      if ( ready < object.summary.ready.min ) object.summary.ready.min = ready
      if ( ready > object.summary.ready.max ) object.summary.ready.max = ready

      page.push(q);
      if ( index % state.queuesPerPage == state.queuesPerPage - 1) {
        object.pages.push(page)
        page = []
      }
    })
    if ( page.length > 0) object.pages.push(page)
  }

  object.summary.timeWait = msToTime(object.summary.maxWait)
  return object;
}

function msToTime(ms){
  let s = Math.round(ms/1000);
  if ( s < 100 ){
      return s+'s';
  } 
  else if ( s < 600 ){
      let m = Math.floor(s/60);
      s = s - (m * 60);
      if ( s < 10 ){
          return m + ':0' + s;
      }
      else {
          return m + ':' + s;
      }
  }
  else if ( s < 3600 ){
      return Math.round(s/60) + 'm'
  }
  else if ( s < 259200 ) {
      return Math.round(s/3600) + 'h'
  } else {
      return Math.round(s/86400) + 'd'
  }
}

function orderAlerts(state){
  if ( state.alertOrder === 'department' ) 
    state.alerts = state.alerts.sort((a,b)=>a.department > b.department ? 1 : a.department === b.department ? 0 : -1 )
  if ( state.alertOrder === 'department-desc' ) 
    state.alerts = state.alerts.sort((a,b)=>a.department > b.department ? -1 : a.department === b.department ? 0 : 1 )
  else if (state.alertOrder === 'updated' )
    state.alerts = state.alerts.sort((a,b) => a.unix > b.unix ? -1 : 1)
  else if (state.alertOrder === 'updated-asc' )
    state.alerts = state.alerts.sort((a,b) => a.unix > b.unix ? 1 : -1)
  else if (state.alertOrder === 'created' )
    state.alerts = state.alerts.sort((a,b) => a.createdUnix > b.createdUnix ? -1 : 1)
  else if (state.alertOrder === 'created-asc' )
    state.alerts = state.alerts.sort((a,b) => a.createdUnix > b.createdUnix ? 1 : -1)
}

function filterUnaccesibleAlerts(alerts, user){
  let arr = [...alerts]
  arr = arr.filter(a => a.personrelated === false || ( user.alerts && user.alerts.includes(a.department) ) );
  return arr
}

function preProcessAlerts(alerts, latestAlertUpdate, oldAlerts){
  alerts.forEach(alert => {
    const {icon} = alert
    //thermometer-half
    let fai = ''
    switch (icon) {
      case '<ion-icon name="thermometer-sharp"></ion-icon>':
        fai = "thermometer-half"
        break;
      case '<ion-icon name="alarm-sharp"></ion-icon>':
        fai = "clock"
        break;
      case '<ion-icon name="chatbox-ellipses-sharp"></ion-icon>':
        fai = "comments"
        break;
      case '<ion-icon name="clipboard-outline"></ion-icon>':
        fai = "clipboard"
        break;
    
      default:
        break;
    }
    alert.fontawesomeicon = fai;
    alert.opened = false;
    const texts = [...alert.text.split('<br>')]
    alert.texts = texts
    alert.unix = Date.parse(alert.updatedAt)
    alert.createdUnix = Date.parse(alert.createdAt)
  });

  if ( latestAlertUpdate ){
    let arr = [...oldAlerts]
    alerts = alerts.filter( a => a.unix > latestAlertUpdate)
    const ids = []
    alerts.forEach(alert=>ids.push(alert._id))
    arr = arr.filter(a=>!ids.includes(a._id))
    arr = [...arr, ...alerts]
    arr = arr.sort((a,b) => a.unix > b.unix ? -1 : 1)
    return arr;
  }
  else return alerts.sort((a,b) => a.unix > b.unix ? -1 : 1);
}


function flattenQueueData(queueData){
  const flat = []
  Object.keys(queueData).forEach(department=>{
    const data = queueData[department];
    data.forEach(g=>{
      g.data.forEach(queue=>{
        queue.department = department;
        queue.channel = queue.group.split('-')[2]
        queue.area = queue.group.split('-')[1]
        queue.country = queue.group.split('-')[0]
        queue.timeWait = msToTime(queue.waitingDurationCurrentMax)
        flat.push(queue);
      })
    })
  })
  return flat;
}

function notifyPermission(){
  return new Promise((resolve, reject)=>{
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      resolve(false)
    }
    
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      resolve(true)
    }
    
      // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          resolve(true)
        }
        else resolve(false)
      });
    }
    else resolve(false)
    
      // At last, if the user has denied notifications, and you
      // want to be respectful there is no need to bother them any more.


  })
}


