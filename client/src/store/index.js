import { createStore } from 'vuex'
import io from 'socket.io-client'
import moment from 'moment'
const {VUE_APP_SOCKET_ADRESS, VUE_APP_API_ROOT} = process.env

export default createStore({
  state: {
    socket: null,
    socketConnected: false,
    counter: 0,
    adminData: null,
    queueData: [],
    lastPing: null,
    dark: true,
    user: null
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
      //console.log(state.socket);
    },
    addCounter(state){
      state.counter++;
    },
    toggleDark(state){
      state.dark = !state.dark;
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
    }
  },
  modules: {
  },
  getters: {
    connectionStatus(state){
      return state.socket.connected
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
      let arr = [...state.queueData];

      if ( channel ) arr = arr.filter(q=>q.channel === channel)
      if ( department ) arr = arr.filter(q=>q.department === department)
      if ( country ) arr = arr.filter(q=>q.country === country)
      if ( area ) arr = arr.filter(q=>q.area === area)

      const object= {
        queues: arr,
        summary: {
          inQueue: 0,
          maxWait: 0
        }
      }
      arr.forEach(q=>{
        object.summary.inQueue += q.inQueueCurrent;
        if ( q.waitingDurationCurrentMax > object.summary.maxWait) object.summary.maxWait = q.waitingDurationCurrentMax;
      })
      //console.log(object);
      object.summary.timeWait = msToTime(object.summary.maxWait)
      return object;
    }
  }
})

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
        flat.push(queue);
      })
    })
  })
  return flat;
}

