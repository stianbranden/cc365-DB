require('dotenv').config()

const request = require('request-promise').defaults({jar: true})
const moment = require('moment')

const {usersInUserGroups, timePerQuarterAndProfile} = require('./config')
const { logErr } = require('./logger')
const {WEBHELPUSERGROUPS} = process.env
const ReadyTime = require('../models/ReadyTime')

function createOrUpdateReadyTime(data){
    return new Promise(async (resolve, reject)=>{
        try {
            for (let i = 0; i < data.length; i++){
                const row = data[i]
                const {profile, date, actor} = row
                await ReadyTime.findOneAndDelete({profile, date, actor})
                await ReadyTime.create(row)
            }
            resolve('OK')
        } catch (error) {
            reject(error)
        }
    })
}

function getWebhelpUsers(userGroupId){
    return new Promise(async (resolve, reject)=>{
        try {
            const query = {...usersInUserGroups}
            query.url = query.url.replace('${userGroupId}', userGroupId)
            const users = JSON.parse(await request(query))
            // console.log(users.length);
            resolve(users)        
        } catch (error) {
            logErr(error)
            reject(error)
        }
    })
}

function getProfileTimePerQuarter(userIds){
    return new Promise(async (resolve, reject)=>{
        try {
            const query = {...timePerQuarterAndProfile}
            query.url = query.url.replace('${today}', moment().format('YYYY-MM-DD') + "T00:00:00.000Z")
            query.url = query.url.replace('${tomorrow}', moment().add(1, 'd').format('YYYY-MM-DD') + "T00:00:00.000Z")
            // query.url = query.url.replace('${userIds}', userIds.toString())
            // console.log(query);
            const data = JSON.parse(await request(query))
            // console.log({datalength: data.length})
            const filteredData = data.filter(a=>userIds.indexOf(a.userId)>=0)
            // const set1 = new Set()
            // filteredData.forEach(a=>set1.add(a.userName))
            // console.log(set1);
            // console.log(set1.size);
            resolve(filteredData)
        } catch (error) {
            logErr(error)
            reject(error)
        }
    })
}

function selectFromObj(obj){
    const {profileName, timeCategory, readyDuration} = obj
    return {profileName, timeCategory, readyDuration} 
}


function groupData(data){
    const groupedData = []
    data.forEach(row=>{
        if (row.readyDuration === 0 ) return
        const time = row.timeCategory.split(' ')[1]
        const date = row.timeCategory.split(' ')[0]
        const profileIndex = groupedData.findIndex(e=>e.profile === row.profileName)
        if ( profileIndex >= 0 ){
            const profile = groupedData[profileIndex]
            const timeIndex = profile.time.findIndex(t=>t.time === time && t.date === date)
            if (timeIndex >= 0) profile.time[timeIndex].ready = profile.time[timeIndex].ready + row.readyDuration/1000
            else profile.time.push({dateTime: row.timeCategory, time, date, ready: row.readyDuration/1000})
        }
        else groupedData.push({profile: row.profileName, actor: 'Webhelp', date: moment(date).format('YYYYMMDD'), time: [{dateTime: row.timeCategory,time, date, ready: row.readyDuration/1000}]})
    })
    // groupedData.forEach(row=>row.time = row.time.sort((a,b)=>a.dateTime>b.dateTime))
    return groupedData
}

function getProfileTimeForWebhelp(){
    return new Promise(async (resolve, reject)=>{
        try {
            let userIds = []
            const usergroups = WEBHELPUSERGROUPS.split(',')
            for ( let i = 0; i< usergroups.length; i++){
                const uIds = (await getWebhelpUsers(usergroups[i])).map(a=>a.id)
                userIds = [...userIds, ...uIds]
                // console.log(userIds);
            }
            const dataArr = await traverse(1, userIds)
            // console.log(dataArr[0]);
            const data = []
            dataArr.forEach(a=> data.push(selectFromObj(a)))
            const groupedData = groupData(data)
            await createOrUpdateReadyTime(groupedData)
            resolve(groupedData)
        } catch (error) {
            logErr(error)
            reject(error)
        }
    })
}

function traverse(step=1, userIds) {
    return new Promise(async (resolve, reject)=>{
        try {

            let endData = []
            let start = moment().startOf('day')
            const end = moment()
            while ( start < end ){
                const from = moment(start.format())
                const to = moment(start.format()).add(step, 'hours')

                if ( from.format('YYYYMMDD') === end.format('YYYYMMDD')){
                    // console.log({from: from.format('YYYYMMDD HH:mm'), to: to.format('YYYYMMDD HH:mm'), fromIso: from.toISOString()});
                    const query = {...timePerQuarterAndProfile}
                    query.url = query.url.replace('${today}', from.toISOString())
                    query.url = query.url.replace('${tomorrow}', to.toISOString())
    
                    // console.log(query);
                    const data = await JSON.parse(await request(query))
                    const filteredData = data.filter(a=>userIds.indexOf(a.userId)>=0)
                    // console.log(filteredData.length);
                    endData = endData.concat(filteredData)
                }

                start = to
            }
            resolve(endData)
        } catch (error) {
            console.log(error);
        }
    })
}

// traverse(1).then(endData=>console.log({total: endData.length}))

// getProfileTimeForWebhelp().then(data=>console.log(data))
module.exports = {
    getProfileTimeForWebhelp
}