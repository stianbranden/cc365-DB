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
    lastPing: null,
    dark: true,
    user: null,
    queuesPerPage: 5
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
        state.lastPing = moment().toISOString()
      })
      state.socket.on('updateQueues', data=>{
        state.queueData = flattenQueueData(data);
        state.lastPing = moment().format()
      })
      state.socket.on('updateStats', data=>{
        state.dailyStats = flattenQueueData(data)
        //console.log(state.dailyStats);
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
    getDarkFromLocal({commit}){
      let localDark = localStorage.getItem('dark') == 'false' || !Boolean(localStorage.getItem('dark')) ? false : true;
      commit('setDark', localDark)
    }
  },
  modules: {
  },
  getters: {
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
      ['PH', 'CH', 'EM', 'AC'].forEach(channel=>{
        //console.log(channel, department);
        const data = computeQueues(state, channel, department)
        if (data.queues.length > 0){
          result.data[channel.toLowerCase()] = data;
        }
      })
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
      data.department = department
      return data;
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
      if ( index % state.queuesPerPage == 0 ) page = [];
      page.push(q);
      if ( index % state.queuesPerPage == state.queuesPerPage - 1) object.pages.push(page)
    })
    object.pages.push(page)
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

