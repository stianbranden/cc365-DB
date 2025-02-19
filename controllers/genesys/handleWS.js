const WebSocket = require('ws')
const moment = require('moment')
const getActiveQueues = require('./getActiveQueues')

function createWebSocket(uri){
    const ws = new WebSocket(uri)
    ws.on('error', console.error);
    ws.on('open', _=> ws.send(JSON.stringify({message: 'ping'})))
    return ws
}

function subscribeToQueueStatus(ws, queues){
    ws.send(JSON.stringify({
            "message": "subscribe",
            "topics": [...queues.map(a=>"v2.analytics.queues." + a._id + ".observations.details"), ...queues.map(a=>"v2.analytics.queues." + a._id + ".observations")],
            "correlationId": "Subscribing to queues@" + moment().format('YYYY-MM-DD hh:mm')
        })
    )
}

function updateDetailQueueStatus(queueStatus, queueId, results){
    results.forEach(async ({group, data})=>{
        const {mediaType} = group
        const q = queueStatus.filter(a=>a.queueId === queueId && a.mediaType === mediaType)[0]
        if ( q ){
            const {metric, stats, observations} = data;
            if (metric === 'oWaiting'){
                const {count} = stats
                let oldest = null
                if ( observations && observations.length > 0 ) oldest = observations[0].observationDate
                // console.log({queueId, mediaType, metric, count, oldest});
                q.waiting = count
                q.oldest = oldest
                
            }
            else if ( metric === 'oInteracting'){
                const {count} = stats
                q.interacting = count
            }
        }
        else {
            const qs = await getActiveQueues()
            const {metric, stats, observations} = data;
            const q = qs.filter(a=>a._id === queueId)[0]
            let waiting = 0
            let interacting = 0
            let oldest = null
            if (metric === 'oWaiting'){
                const {count} = stats
                // let oldest = null
                if ( observations && observations.length > 0 ) oldest = observations[0].observationDate
                // console.log({queueId, mediaType, metric, count, oldest});
                 waiting = count
                
            }
            else if ( metric === 'oInteracting'){
                const {count} = stats
                interacting = count
            }
            if ( !q ) console.log({group, data, queueId})
            else 
                queueStatus.push({queueId, program: q.program, queue: q.name, country: q.country, mediaType, waiting, interacting, oldest, idle: 0, onQueue: 0})
        }
    })
    
}

module.exports = {createWebSocket, updateDetailQueueStatus, subscribeToQueueStatus}