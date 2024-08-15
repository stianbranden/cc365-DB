const Transcript = require('../models/Transcript')
const moment = require('moment')
const { logErr, logStd } = require('./logger')

function getTranscriptDataForContact(contactId){
    return new Promise (async (resolve, reject)=>{
        try {
            const contact = await Transcript.findOne({"meta.recordingId": contactId}).lean()
            resolve(contact)
        } catch (error) {
            reject(error)
        }
    })
}

function getBulkTranscriptData(dates, query = {}){
    return new Promise (async (resolve, reject)=>{
        try {
            // logStd('Hello from controller')
            const date = {}
            if (!dates || dates === 'today') date.$eq = moment().format('YYYY-MM-DD')
            query.date = date
            // logStd(query)
            const contacts = flattenTranscriptJson(await Transcript.find(query, {meta: 1, sentiment: 1, contactReason: 1}).lean())
            resolve(contacts)
        } catch (error) {
            // logErr(error)
            reject(error)

        }
    })
}

function flattenTranscriptJson(array){
    const returnJson = []
    array.forEach(e => {
        const {meta, sentiment, contactReason} = e
        delete contactReason['level3']
        returnJson.push({...meta, sentiment, ...contactReason})
    });
    return returnJson
}

module.exports = {getTranscriptDataForContact, getBulkTranscriptData}