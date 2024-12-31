require('dotenv').config()


const WebSocket = require('ws')
const moment = require('moment')
const platformClient = require('purecloud-platform-client-v2');
const getQueues = require('./controllers/genesys/getQueues.js');
const auth = require('./controllers/genesys/authGC.js');
const getActiveQueues = require('./controllers/genesys/getActiveQueues.js');
const createChannel = require('./controllers/genesys/createChannel.js');
const getQueueObservations = require('./controllers/genesys/getQueueObservations.js');
// const getChannels = require('./controllers/genesys/getChannels.js');


function sortQueues(a,b){
    if ( a.program > b.program ) return 1
    if ( a.program < b.program ) return -1
    if ( a.queue > b.queue ) return 1
    if ( a.queue < b.queue ) return -1
    if ( a.mediaType > b.mediaType ) return 1
    return -1
}

function isValidMediaType({program, queue, mediaType}){
    const valids = program.startsWith('Premium Support') ? ['voice', 'callback'] : ['voice', 'callback', 'email']    
    if ( program.startsWith('General') && queue.includes('First Line')) valids.push('chat')
    if ( program.includes('B2B') || program.includes('Kitchen&Interior')) valids.push('email')
    return valids.includes(mediaType)
}

function parseQueueStatus(results, queues){
    const returnData = []
    results.forEach(({group, data})=>{
        const {queueId, mediaType} = group
        if ( mediaType ){
            const q = queues.filter(a=>a._id === queueId)[0]
            const waiting = data.filter(a=>a.metric==='oWaiting')[0]
            const interacting = data.filter(a=>a.metric==='oInteracting')[0]
            returnData.push({program: q.program, queue: q.name, mediaType, waiting: waiting.stats.count, interacting: interacting.stats.count})
        }
    })
    return returnData.filter(isValidMediaType).sort(sortQueues)
}

async function run(){
    require('./controllers/connectDB.js')()
    await auth(platformClient)
    // const client = platformClient.ApiClient.instance
    await getQueues(platformClient)
    const queues = await getActiveQueues()
    // console.log(queues.length)
    const {results} = await getQueueObservations(platformClient, queues)
    const queueStatus = parseQueueStatus(results, queues)
    console.table(queueStatus)
    
    
    const channel = await createChannel(platformClient)
    // console.log(channel);

    const ws = new WebSocket(channel.connectUri);
    ws.on('error', console.error);
    ws.on('open', function open() {
        ws.send(JSON.stringify({message: 'ping'}));
    });
    ws.on('message', msg=> {
        const data = JSON.parse(msg.toString())
        console.log(data)
        if ( data?.eventBody?.message === 'pong'){
            ws.send(JSON.stringify({
                "message": "subscribe",
                "topics": queues.map(a=>"v2.analytics.queues." + a._id + ".observations"),
                "correlationId": "Subscribing to queues@" + moment().format('YYYY-MM-DD hh:mm')
              }))
        }
        else if (data?.topicName?.includes('v2.analytics.queues.') && data?.topicName?.includes('.observations')) {
            //Get queueId and mediaType from group
            //Alter queueStatus object 
            console.log(JSON.stringify(data.eventBody.data))
            
        }

    });
    

}
//"id": "v2.analytics.queues.{id}.observations"
run()


/*
queue observation data

Call disconnected from queue - No contacts in queue
NUM1: [{"interval":"2024-12-30T09:46:54.839Z/2024-12-30T09:46:54.839Z","metrics":[{"metric":"oAlerting","stats":{"count":0}},{"metric":"oWaiting","stats":{"count":0}}]}]
NUM2: [{"interval":"2024-12-30T09:30:00.000Z/2024-12-30T10:00:00.000Z","metrics":[{"metric":"tAlert","stats":{"count":1,"sum":8277,"min":8277,"max":8277}},{"metric":"tAbandon","stats":{"count":2,"sum":86168,"min":11781,"max":74387}},{"metric":"nOffered","stats":{"count":2}},{"metric":"tConnected","stats":{"count":2,"sum":93173,"min":17669,"max":75504}},{"metric":"tAcd","stats":{"count":2,"sum":86168,"min":11781,"max":74387}},{"metric":"tNotResponding","stats":{"count":1,"sum":8277,"min":8277,"max":8277}},{"metric":"oServiceLevel","stats":{"ratio":0,"numerator":0,"denominator":2,"target":0.5}},{"metric":"tWait","stats":{"count":2,"sum":86168,"min":11781,"max":74387}}]}]

Need to see what data is posted when there are contacts in queue (longest waiting?)

*/