const Conversation = require('../../models/genesys/Conversation');
const Queue = require('../../models/genesys/Queue');

function updateConversation(conversationId, acd){
    return new Promise (async (resolve, reject)=>{
        try {
            const {connectTime, endTime, queueId} = acd
            const queue = await Queue.findById(queueId).lean()
            const {name, program} = queue
            const mediaType = acd.calls?.length > 0 ? 'voice' : acd.emails?.length > 0 ? 'email' : acd.chats?.length > 0 ? 'chat' : acd.callback?.length > 0 ? 'callback' : 'N/A'
            const status = endTime ? 'completed' : 'inQueue'
            await Conversation.findByIdAndUpdate(conversationId, {connectTime, endTime, queueId, queueName: name, program, mediaType, status}, {upsert: true})
            resolve('ok')
        } catch (error) {
            reject(error)
        }
    })
}

function dropConversationCollection(){
    return new Promise (async (resolve, reject)=>{
        try {
            await Conversation.collection.drop()
            resolve('ok')
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {updateConversation, dropConversationCollection}