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
        // delete contactReason.level3
        returnJson.push({...meta, sentiment, ...contactReason})
    });
    return returnJson
}

function getTranscriptsFromUpdateDate(date, limit, page, details){
    return new Promise( async (resolve, reject)=>{
        try {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000
            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999); // Set time to 23:59:59.999
            const query = {updatedAt: { $gte: startOfDay, $lt: endOfDay }}
            const countDoc = await Transcript.countDocuments(query)
            const metadata = {
                totalContacts: countDoc,
                limit,
                page,
                totalPages: Math.ceil(countDoc/limit)
            }
            let contacts = []
            if ( page > 0 ){
                const skip = (page-1)*limit
                const select = details ? '' : '-transcript -chat -events.silenceEvents -events.overtalkEvents -mediaEnergy'
                contacts = await Transcript.find(query)
                    .allowDiskUse(true)
                    .select(select)
                    .sort({updatedAt: 'asc'})
                    .limit(limit)
                    .skip(skip)
                    .lean()
            }
            resolve({metadata, contacts})

        } catch (error) {
            reject(error)
        }
    })

}

module.exports = {getTranscriptDataForContact, getBulkTranscriptData, getTranscriptsFromUpdateDate}