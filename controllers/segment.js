const Segment = require('../models/C1segment')
const ContactGoalPushHistory = require('../models/ContactGoalPushHistory')

async function returnLogs(segmentName){
    const logs = await ContactGoalPushHistory.find({segmentName}).sort({createdAt: 'desc'}).lean()
    return logs
}

function getSegments(){
    return new Promise(async (resolve, reject)=>{
        try {
            const segments = await Segment.find().lean()
            for (let i = 0; i < segments.length; i++){
                const {name} = segments[i]
                segments[i].logs = await returnLogs(name)
            }
            resolve(segments)
        } catch (error) {
            reject(error)
        }
    })
}
function getSegment(name){
    return new Promise(async (resolve, reject)=>{
        try {
            const segment = await Segment.findOne({name}).lean()
            segment.logs = await returnLogs(name)
            resolve(segment)
        } catch (error) {
            reject(error)
        }
    })
}
function getSegmentbyId(id){
    return new Promise(async (resolve, reject)=>{
        try {
            const segment = await Segment.findById(id).lean()
            segment.logs = await returnLogs(name)
            resolve(segment)
        } catch (error) {
            reject(error)
        }
    })
}

function createSegment(data){
    return new Promise(async (resolve, reject)=>{
        try {
            if (await getUser(data.name)) reject('Segment name must be unique')
            const segment = await new Segment(data).save()
            resolve(segment)
        } catch (error) {
            reject(error)
        }
    })
}
function updateSegment(id, data){
    return new Promise(async (resolve, reject)=>{
        try {
            const segment = await Segment.findByIdAndUpdate(id, data, {new: true})
            if (!segment) reject('Segment "' + id + '" not found, cannot update')
            resolve(segment)
        } catch (error) {
            reject(error)
        }
    })
}
function deleteSegment(name){
    return new Promise(async (resolve, reject)=>{
        try {
            // const {agentId} = data
            const segment = await Segment.findOneAndDelete({name})
            if (!segment) reject('Segment "' + name + '" not found, cannot delete')
            resolve(segment)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getSegments,
    getSegment,
    getSegmentbyId,
    createSegment,
    updateSegment,
    deleteSegment
}

// //Testing
// async function test(){
//     require('dotenv').config()
//     const connect = require('../connectDB')
//     try {
//         await connect()
//         await deleteUser(2)
//         // await updateUser({
//         //     "agentId": 3,
//         //     "goalId": 18,
//         //     "name": "Stian Branden",
//         //     "assignment": 0,
//         //     "contacts": [],
//         //     "numContacts": 0,
//         //     "instruction": "Follow these instructions",
//         //     "evalFormId": 18
//         //   }).then(user=>console.log(user))
//         //   getUser(3).then(user=>console.log(user))
//         // getUsers().then(users=>console.log(users))
        
//     } catch (error) {
//         logErr(error)
//     }

// }
// test()