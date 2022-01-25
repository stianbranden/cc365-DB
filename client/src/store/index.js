import { createStore } from 'vuex'
import io from 'socket.io-client'
import moment from 'moment'
const {VUE_APP_SOCKET_ADRESS, VUE_APP_API_ROOT} = process.env
const {localStorage} = window;

export default createStore({
  state: {
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
    showNotifications: false,
    notifications: []
  },
  mutations: {
    ioConnect(state){
      state.socket = io(VUE_APP_SOCKET_ADRESS);
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
    }
  },
  actions: {
    getAdminData({state}){
      fetch(VUE_APP_API_ROOT + 'admin')
        .then(response=>response.json())
        .then(data=>state.adminData = data);
    } ,
    getUser({state}){
      fetch(VUE_APP_API_ROOT + 'user')
        .then(response=>response.json())
        .then(user=> state.user = user)
    },
    getAlerts({state}){
      fetch(VUE_APP_API_ROOT + 'alerts')
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
    }
  },
  modules: {
  },
  getters: {
    getUser(state){
      if (state.user) return state.user
      return {}
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
          maxWait: 0
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
    }

  }
})

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

function computeQueues(state, channel, department, country, area ){
  let arr = [...state.queueData];
  if ( channel ) arr = arr.filter(q=>q.channel === channel)
  if ( department ) arr = arr.filter(q=>q.department === department)
  if ( country ) arr = arr.filter(q=>q.country === country)
  if ( area ) arr = arr.filter(q=>q.area === area)

  const object= {
    queues: arr,
    pages: [],
    summary: {
      inQueue: 0,
      maxWait: 0
    }
  }
  if (arr.length > 0){
    let page = []
    arr.forEach((q, index)=>{
      object.summary.inQueue += q.inQueueCurrent;
      if ( q.waitingDurationCurrentMax > object.summary.maxWait) object.summary.maxWait = q.waitingDurationCurrentMax;
      //if ( index % state.queuesPerPage == 0 ) page = [];
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


