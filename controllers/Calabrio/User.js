const User = require('../../models/calabrio/User')

function getUsers(){
    return new Promise(async (resolve, reject)=>{
        try {
            const users = await User.find().lean()
            resolve(users)
        } catch (error) {
            reject(error)
        }
    })
}
function getUser(agentId){
    return new Promise(async (resolve, reject)=>{
        try {
            const user = await User.findOne({agentId}).lean()
            resolve(user)
        } catch (error) {
            reject(error)
        }
    })
}

function createUser(data){
    return new Promise(async (resolve, reject)=>{
        try {
            if (await getUser(data.agentId)) reject('AgentId must be unique')
            const user = await new User(data).save()
            resolve(user)
        } catch (error) {
            reject(error)
        }
    })
}
function updateUser(data){
    return new Promise(async (resolve, reject)=>{
        try {
            const {agentId} = data
            const user = await User.findOneAndUpdate({agentId}, data, {new: true})
            if (!user) reject('AgentId ' + agentId + ' not found, cannot update')
            resolve(user)
        } catch (error) {
            reject(error)
        }
    })
}
function deleteUser(agentId){
    return new Promise(async (resolve, reject)=>{
        try {
            // const {agentId} = data
            const user = await User.findOneAndDelete({agentId})
            if (!user) reject('AgentId ' + agentId + ' not found, cannot delete')
            resolve(user)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
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