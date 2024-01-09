const Segment = require('../../models/Calabrio/C1Segment')
// const { logErr } = require('../logger')

function getSegments(){
    return new Promise(async (resolve, reject)=>{
        try {
            const segment = await Segment.find().lean()
            resolve(segment)
        } catch (error) {
            reject(error)
        }
    })
}
function getSegment(name){
    return new Promise(async (resolve, reject)=>{
        try {
            const segment = await Segment.findOne({name}).lean()
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