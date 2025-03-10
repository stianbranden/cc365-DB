import { createStore } from 'vuex'
import io from 'socket.io-client'
import moment from 'moment'
console.log({env: import.meta.env})
const {VITE_SOCKET_ADRESS, VITE_API_ROOT, VITE_PBI_MYPAGE_L_SRC, VITE_PBI_MYPAGE_D_SRC} = import.meta.env
const {localStorage} = window;

import {version} from '../../package.json'

export default createStore({
  state: {
    newFeatures: 0,
    colors: [
      {name: 'elkjop-green', hex: '#78be20', rgba: 'rgba(120, 190, 32, 0.4)', rgb: 'rgb(120, 190, 32)' },
      {name: 'elkjop-blue', hex: '#141b4d', rgba: 'rgba(20,27,77,0.4)', rgb: 'rgb(20,27,77)' },
      {name: 'best', hex: '#006633', rgba: 'rgba(0,102,51,0.4)' },
      {name: 'light-blue', hex: '#003399', rgba: 'rgba(0,51,153,0.4)' },
      {name: 'hotpink', hex: '#C83586', rgba: 'rgba(200,53,134,0.4)' },
      {name: 'purple', hex: '#4F247E', rgba: 'rgba(79,36,126,0.4)' },
      {name: 'yellow', hex: '#f9e300', rgba: 'rgba(249,227,0,0.4)' },
      {name: 'lighter-blue', hex: '#0099cc', rgba: 'rgba(0,153,204,0.4)' }
    ],
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
    qualityForms: [],
    myPagePowerBISrc: {
      lightSrc: VITE_PBI_MYPAGE_L_SRC,
      darkSrc: VITE_PBI_MYPAGE_D_SRC
    },
    intervalData: [],
    skillName: 'GS-FI Phone',
    bpoDate: moment(),
    bpoFiles: [],
    bpoReadyTime: [],
    bpoFiletoProfileMap: [
      {file: 'GS-DK Phone', profiles: ['Phone (DK)']},
      {file: 'GS-DK Chat', profiles: ['Chat (DK)']},
      {file: 'GS-DK Email', profiles: ['Email (DK)']},
      {file: 'GS-FI Phone', profiles: ['Phone (FI)']},
      {file: 'GS-FI Chat', profiles: ['Chat (FI)']},
      {file: 'GS-FI Email', profiles: ['Email (FI)']},
      {file: 'GS-NO Phone', profiles: ['Phone (NO)']},
      {file: 'GS-NO Chat', profiles: ['Chat (NO)']},
      {file: 'GS-NO Email', profiles: ['Email (NO)']},
      {file: 'GS-SE Phone', profiles: ['Phone (SE)']},
      {file: 'GS-SE Chat', profiles: ['Chat (SE)']},
      {file: 'GS-SE Email', profiles: ['Email (SE)']}

    ],
    intervalLabels: [
      //    '06:00','06:15', '06:30', '06:45',
          '07:00', '07:30', 
          '08:00','08:30',
          '09:00','09:30',
          '10:00','10:30',
          '11:00','11:30',
          '12:00','12:30',
          '13:00','13:30',
          '14:00','14:30',
          '15:00','15:30',
          '16:00','16:30',
          '17:00','17:30',
          '18:00','18:30',
          '19:00','19:30',
          '20:00','20:30',
          '21:00','21:30',
          '22:00','22:30',    ],
    bpoFileTransferStatus: {status: 0, msg: 'N/A'},
    calibrations: [],
    saveCalibrationError: {
      hasError: false,
      message: null,
      placement: null
    },
    contactsWithoutSession: [],
    contactCalibration: {},
    contactsOnCalibration: [],
    cgp: [], //ContactGoalProgress
    aiContactReasonData: [], //GPT Contact Reasons
    evaluations: [], //Evaluators or agents
    scorecardTargets: [],
    genesysQueueStatus: [],
    genesysIntervalsStats: [],
    genesysDailyStats: [],
    sourceSystem: 'Genesys'
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
      state.socket.on('intervalData', data=>{
        state.intervalData = data
        state.lastPing = moment().toISOString()
      })
      state.socket.on('bpoReadyTime', data=>{
        // console.log(data);
        if ( data[0]?.date === state.bpoDate.format('YYYYMMDD')){
          state.bpoReadyTime = data
          state.lastPing = moment().toISOString()
        }
      })
      state.socket.on('cgp', data=>{
        state.cgp = data
      })
      state.socket.on('aiContactReasonData', data=>{
        state.aiContactReasonData = data
      })
      state.socket.on('genesys-status', data=> state.genesysQueueStatus = data)
      state.socket.on('genesys-statistics', ({intervaDailyStats, dailyStats})=> {
        state.genesysIntervalsStats = intervaDailyStats
        state.genesysDailyStats = dailyStats
        console.log(dailyStats);
        
      })
      


      //Socket state mngmnt
      state.socket.on('disconnect', _=>{
        state.socketConnected = false;
      })
      state.socket.on('connect', _=>{
        state.socketConnected = true;
      })

      state.socket.on('bpo-file-status', data=>{
        // console.log(data);
        if (data.msg === 'ok') {
          state.bpoFiles = data.files
          state.bpoFileTransferStatus = {status: 2, msg: 'Transfer completed'}
        }
        else if (data.msg === 'fail') {
          state.bpoFileTransferStatus = {status: 3, msg: 'Transfer failed'}
          console.log(data.error)
        }
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
    setNewFeatures(state, newValue){
      state.newFeatures = newValue
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
    },
    setSkillName(state, newName){
      state.skillName = newName
      localStorage.setItem('skillName', newName)
    },
    resetBPOFileStatus(state){
      state.bpoFileTransferStatus= {status: 0, msg: 'N/A'}
    }
  },
  actions: {
    async getScorecardTargets({state}){
      try {
        const response = await fetch(VITE_API_ROOT + 'target', {
          method: 'GET'
        }) 
        if (response.status === 200 ){
          const targets = await response.json()
          state.scorecardTargets = targets
          console.log(targets);
          
          return 'OK'
        }
        else {
          throw new Error((await response.json()).message)
        }
      } catch (error) {
        console.error(error.message)
        return error.message
      }
    },
    async deleteTarget({dispatch}, id){
      try {
        const response = await fetch(VITE_API_ROOT + 'deleteTarget/' + id, {
          method: 'POST'
        }) 
        if (response.status === 200 ){
          await dispatch('getScorecardTargets')
          return 'OK'
        }
        else {
          throw new Error((await response.json()).message)
        }
      } catch (error) {
        console.error(error.message)
        return error.message
      }
    },
    async addTarget({dispatch}, data){
      try {
        const response = await fetch(VITE_API_ROOT + 'target', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }) 
        if (response.status === 200 ){
          await dispatch('getScorecardTargets')
          return 'OK'
        }
        else {
          throw new Error((await response.json()).message)
        }
      } catch (error) {
        console.error(error.message)
        return error.message
      }
    },
    async editTarget({dispatch}, id, data){
      try {
        const response = await fetch(VITE_API_ROOT + 'updateTarget/' + id, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }) 
        if (response.status === 200 ){
          await dispatch('getScorecardTargets')
          return 'OK'
        }
        else {
          throw new Error((await response.json()).message)
        }
      } catch (error) {
        console.error(error.message)
        return error.message
      }
    },
    async updateEvaluations({state}, {evaluatorMode, id}){
      // const id = state.user._id === 'stianbra@elkjop.no' ? 'fridaly@elkjop.no' : state.user._id
      const mode = evaluatorMode ? 'evaluator': 'agent'
      console.log({mode, id});
      
      const url = VITE_API_ROOT + `evaluations?id=${id}&mode=${mode}`
      console.log('updateEvaluations');
      try {
        
        const response = await fetch(url, {
          method: 'GET'
        })
        if (response.status === 200 ){
          const evaluations = await response.json()
          // state.contactCalibration = contact
          state.evaluations = evaluations.sort((a,b)=>{
            if (a.evalStateId === 2 && b.evalStateId != 2) return -1
            else if (a.evalStateId != 2 && b.evalStateId === 2) return 1
            else if (a.evalStateId === 0 && b.evalStateId > 0) return -1
            else if (a.evalStateId >0 && b.evalStateId === 0) return 1
            else {
              return a._id > b._id ? -1 : 1
            }

          })
          console.log(evaluations);
          
          return 'OK'
        }
        else {
          const e = (await response.json()).message
          console.error(e)
        }
      } catch (error) {
        console.error(error.message)
        return error.message
      }
    },
    getAIData({state}, contactId){
      return new Promise( async (resolve, reject)=>{
        try {
          const response = await fetch(VITE_API_ROOT + 'aidata/' + contactId, {
            method: 'GET'
          })
          if (response.status === 200 ){
            const contact = await response.json()
            // state.contactCalibration = contact
            resolve(contact)
          }
          else {
            const e = (await response.json()).message
            console.error(e)
            reject(e)
          }
        } catch (error) {
          console.error(error);
          reject(error)
        }
      })
    },
    saveContactComment({state}, {contactId, comment}){
      return new Promise( async (resolve, reject)=>{
        try {
          const response = await fetch(VITE_API_ROOT + 'calibration/contact/comment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({contactId, comment})
          })
          if (response.status === 200 ){
            const contact = await response.json()
            state.contactCalibration = contact
            resolve('ok')
          }
          else {
            const e = (await response.json()).message
            console.error(e)
          }
        } catch (error) {
          console.error(error);
          reject(error)
        }
      })
    },
    saveSessionComment({state}, {sessionId, comment}){
      return new Promise (async (resolve, reject)=>{
        try {
          const response = await fetch(VITE_API_ROOT + 'calibration/comment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({sessionId, comment})
          })
          if (response.status === 200 ){
            const sessions = await response.json()
            // console.log(sessions)
            state.calibrations = sessions
            resolve('ok')
          }
          else {
            const e = (await response.json()).message
            reject(error)
            console.error(e)
          }
        } catch (error) {
          console.error(error)
          reject(error)
        }

      })
    },
    async getContactsOnSession({state}, sessionId){
      try {
        const response = await fetch(VITE_API_ROOT + 'calibration/'+ sessionId + '/contacts', {
          method: 'GET'
        })
        if (response.status === 200 ){
          const contacts = await response.json()
          state.contactsOnCalibration = contacts;
          
        }
        else {
          const e = (await response.json()).message
          console.error(e)
        }
      } catch (error) {
        console.error(error);
        
      }
    },
    async refreshContactCalibration({state}, contactId){
      try {
        const response = await fetch(VITE_API_ROOT + 'calibration/contact/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({contactId})
        })
        if (response.status === 200 ){
          const contact = await response.json()
          contact.evaluation = contact.evaluation.sort((a,b)=>{
            if (a.isGauge) return -1
            if (b.isGauge) return 1
            if (a.evaluator > b.evaluator) return 1
            return -1
          })
          state.contactCalibration = contact
        }
        else {
          const e = (await response.json()).message
          console.error(e)
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getContactCalibration({state}, contactId){
      try {
        const response = await fetch(VITE_API_ROOT + 'calibration/contact/' + contactId)
        if (response.status === 200){
          const contact = await response.json()
          contact.evaluation = contact.evaluation.sort((a,b)=>{
            if (a.isGauge) return -1
            if (b.isGauge) return 1
            if (a.evaluator > b.evaluator) return 1
            return -1
          })
          state.contactCalibration = contact
        }
        else {
          const e = (await response.json()).message
          console.error(e)
        }
      } catch (error) {
        console.error(error)
      }
    },
    async getContactsWithoutSession({state}){
      try {
        const response = await fetch(VITE_API_ROOT + 'calibration/contacts')
        if ( response.status === 200 ){
          const contacts = await response.json()
          console.log(contacts);
          
          state.contactsWithoutSession = contacts
        }
        else {
          const e = (await response.json()).message
          console.error(e)
          state.saveCalibrationError = {
            hasError: true,
            message: e,
            placement: 'session'
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async assignContactToSession({state, dispatch}, {contactId, sessionId}){
      try {
        const response = await fetch(VITE_API_ROOT + 'calibration/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({sessionId, contactId})
        })
        if (response.status === 200 ){
          const session = await response.json()
          state.contactsWithoutSession = state.contactsWithoutSession.filter(a=>a._id !== contactId)
          state.calibrations = state.calibrations.filter(a=>a._id !== sessionId)
          state.calibrations.push(session)
          dispatch('getContactsOnSession', sessionId)
        }
        else {
          console.log(response)
          const e = (await response.json()).message
          console.error(e)
          state.saveCalibrationError = {
            hasError: true,
            message: e,
            placement: 'session'
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async removeContactFromSession({state, dispatch}, {contactId, sessionId}){
      try {
        const response = await fetch(VITE_API_ROOT + 'calibration/deleteContact/' + contactId +'/' + sessionId, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (response.status < 400 ){
          const session = await response.json()
          // console.log(session);
          // state.contactsWithoutSession.push(contactId)
          dispatch('getContactsWithoutSession')
          state.calibrations = state.calibrations.filter(a=>a._id !== sessionId)
          state.calibrations.push(session)
          dispatch('getContactsOnSession', sessionId)
        }
        else {
          console.log(response)
          const e = (await response.json()).message
          console.error(e)
          state.saveCalibrationError = {
            hasError: true,
            message: e,
            placement: 'session'
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    getCalibrations({state}){
      fetch(VITE_API_ROOT + 'calibration')
      .then(response=>response.json())
      .then(data=>{
        // console.log(data);
        state.calibrations = data
      }).catch(error=>{
        console.error(error.message)
      })
    },
    async createCalibration({state}, data){
      // console.log(data);
      try {
        const response = await fetch(VITE_API_ROOT + 'calibration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        if (response.status === 200 ){
          const data = await response.json()
          state.calibrations.unshift(data)
        }
        else {
          console.log(response)
          const e = (await response.json()).message
          console.error(e)
          state.saveCalibrationError = {
            hasError: true,
            message: e,
            placement: 'save'
          }
        }
      } catch (error) {
        console.error(error)
      }
    },
    async deleteCalibration({state, dispatch}, id){
      try {
        const response = await fetch(VITE_API_ROOT + 'calibration/delete/' + id, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
        })
        if ( response.status < 400 ){
          state.calibrations = state.calibrations.filter(a=> a._id !== id)
          dispatch('getContactsWithoutSession')
        }
        else {
          // console.log(await response.json())
          const e = (await response.json()).message
          console.error(e)
          state.saveCalibrationError = {
            hasError: true,
            message: e,
            placement: 'list'
          }
        }
      } catch (error) {
        console.error(error)
      }
    },
    changeBpoDate({state, dispatch}, days){
      state.bpoDate.add(days, 'days')
      dispatch('getReadyTimeForDay')
    },
    addBPOFiles({state}, data){
      state.bpoFileTransferStatus = {status: 1, msg: 'Transfer in progress'}
      state.socket.emit('bpo-file', data)
    },
    getAllActiveBPOFiles({state}){
      const date = state.bpoDate.format('YYYYMMDD')
      // console.log('Getting BPO files');
      fetch(VITE_API_ROOT + 'bpo/all/' + date + '/all')
      .then(response=>response.json())
      .then(files=>state.bpoFiles = files)
    },
    getReadyTimeForDay({state, dispatch}){
      const date = state.bpoDate.format('YYYYMMDD')
      // console.log('Getting ready time data');
      fetch(VITE_API_ROOT + 'bpo/ready/' + date)
      .then(response=>response.json())
      .then(files=>{
        state.bpoReadyTime = files
        dispatch('getAllActiveBPOFiles')
      })
    }
    ,
    getSegments({state}){
      // console.log('running getsegments');
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
      .finally(_=>dispatch('getSegments'))
    },
    toggleUser({dispatch}, {segmentId, userId}){
      fetch(VITE_API_ROOT + 'quality/toggleUser/' + segmentId + '/' + userId, {method: 'POST'})
      .then(response=>response.json())
      //  .then(data=>console.log(data))
      .finally(_=>dispatch('getSegments'))
    },
    bumpUser({dispatch}, {segmentId, userId}){
      fetch(VITE_API_ROOT + 'quality/bumpUser/' + segmentId + '/' + userId, {method: 'POST'})
      .then(response=>response.json())
      // .then(data=>console.log(data))
      .finally(_=>dispatch('getSegments'))
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
      .finally(_=>dispatch('getSegments'))
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

      let skillName = localStorage.getItem('skillName') == null ? '' : localStorage.getItem('skillName')
      commit('setSkillName', skillName)

      const newFeatures = localStorage.getItem('newFeatures') == null ? 0 : localStorage.getItem('newFeatures')
      commit('setNewFeatures', newFeatures)
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
    getSession: (state)=>(sessionId)=>{
      return state.calibrations.filter(a=>a._id === sessionId)[0]
    },
    listBPOSkills(state){
      const skills = []
      state.bpoFiles.forEach(file=>{
        if( !skills.includes(file.skill) ) skills.push(file.skill)
      })
      return skills
    },
    getBPOFiles(state){
      return state.bpoFiles
    },
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
    getBotSelections: state => state.hotbots, 
    getIntervalDataByDepartment: state =>{
      return returnDepartmentIntervalData(state.intervalData)
    },
    isQualityAdmin: state => {
      let routes = []
      if (state.user && state.user.pages){
        state.user.pages.forEach(p=>routes.push(p.routerName))
      }
      return routes.includes('QualityAdmin')
    } 
  }
})

function returnDepartmentIntervalData(intervalData){
  const returnData = {}
  // console.log(intervalData);
  for (let i = 0; i < intervalData.length; i++){
    const row = intervalData[i]
    if (row.department === 'bo' || row.department ==='N/A') continue
    if (returnData[row.department]){
      const dep = returnData[row.department]
      if (dep[row.channel]){
        const cha = dep[row.channel]
        if (cha[row.interval]){
          const int = cha[row.interval]
          //Add data
          int.countOfAbandonedContacts +=  row.countOfAbandonedContacts
          int.countOfAnsweredOnTimeContacts +=  row.countOfAnsweredOnTimeContacts
          int.countOfArrivedContacts +=  row.countOfArrivedContacts
          int.countOfCompletedContacts +=  row.countOfCompletedContacts
          int.countOfHandledContacts +=  row.countOfHandledContacts

        }
        else { //Create interval
          cha[row.interval] = {
            date: row.date,
            countOfAbandonedContacts: row.countOfAbandonedContacts,
            countOfAnsweredOnTimeContacts: row.countOfAnsweredOnTimeContacts,
            countOfArrivedContacts: row.countOfArrivedContacts,
            countOfCompletedContacts: row.countOfCompletedContacts,
            countOfHandledContacts: row.countOfHandledContacts
          }
        }
      }
      else { //Create channel and interval
        dep[row.channel]= {}
        dep[row.channel][row.interval]= {
          date: row.date,
          countOfAbandonedContacts: row.countOfAbandonedContacts,
          countOfAnsweredOnTimeContacts: row.countOfAnsweredOnTimeContacts,
          countOfArrivedContacts: row.countOfArrivedContacts,
          countOfCompletedContacts: row.countOfCompletedContacts,
          countOfHandledContacts: row.countOfHandledContacts

        }
      }
    }
    else { //Create everything (department, channel, interval)
      returnData[row.department] = {}
      returnData[row.department][row.channel] = {}
      returnData[row.department][row.channel][row.interval] = {
        date: row.date,
        countOfAbandonedContacts: row.countOfAbandonedContacts,
        countOfAnsweredOnTimeContacts: row.countOfAnsweredOnTimeContacts,
        countOfArrivedContacts: row.countOfArrivedContacts,
        countOfCompletedContacts: row.countOfCompletedContacts,
        countOfHandledContacts: row.countOfHandledContacts
      }
    }
  }
  // console.log({returnData});
  return returnData
  /*
channel:"PH"
countOfAbandonedContacts:0
countOfAnsweredOnTimeContacts:0
countOfArrivedContacts:2
countOfCompletedContacts:2
countOfHandledContacts:2
date:"2024-02-09"
department:"fi"
interval:"08:00"

  */
}

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


