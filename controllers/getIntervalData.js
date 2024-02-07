// require('dotenv').config()
// const connectDB = require('./connectDB.js')

const request = require('request-promise').defaults({jar: true})
const moment = require('moment')
const {intervalQuery} = require('./config.js')
const {logTab} = require('./logger.js')
const Config = require('../models/Config.js')

// const baseData = {
//     queue: 'N/A',
//     queueId: 'N/A',
//     interval: '00:00',
//     offered: 0,
//     abandoned: 0,
//     handledInSla: 0
// }

function getIntervalData(){
    return new Promise(async (resolve, reject)=>{
        try {
            // await connectDB()
            const queueMap = (await Config.findOne({name: 'queueMap'}).lean()).data.queues
            intervalQuery.url = intervalQuery.url.replace('${today}', moment().startOf('day').toISOString())
            const data = JSON.parse(await request(intervalQuery))
            const intervalData = []
            for ( let i = 0; i < data.length; i++){
                const {queueName, queueId, timeCategory, countOfAnsweredOnTimeContacts, countOfArrivedContacts, countOfCompletedContacts, countOfHandledContacts, countOfAbandonedContacts} = data[i]
                const object = {
                    queueName, queueId, 
                    date: timeCategory.split(" ")[0],
                    interval: timeCategory.split(" ")[1],
                    mapping: queueMap[queueId],
                    countOfAnsweredOnTimeContacts, countOfArrivedContacts, countOfCompletedContacts, countOfHandledContacts, countOfAbandonedContacts
                }
                if (object.mapping) intervalData.push(object)
            }
            resolve(intervalData)
        } catch (error) {
            reject(error)
        }
    });
}

module.exports = getIntervalData

// getIntervalData().then(data=>logTab(data))