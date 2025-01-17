require('dotenv').config()
const connectDB = require('./controllers/connectDB.js');

const getGCQueues = require('./controllers/genesys/getQueues.js');
const auth = require('./controllers/genesys/authGC.js');
const getActiveQueues = require('./controllers/genesys/getActiveQueues.js');
const createChannel = require('./controllers/genesys/createChannel.js');
const getQueueObservations = require('./controllers/genesys/getQueueObservations.js');
const getDailyStats = require('./controllers/genesys/getDailyStats.js');
const {parseQueueStatus, parseDailyStats, updateDailyStats, updateOnQueue} = require('./controllers/genesys/utilities.js');
const { createWebSocket, subscribeToQueueStatus, updateDetailQueueStatus } = require('./controllers/genesys/handleWS.js');

const { logErr, logSys } = require('./controllers/logger.js');


async function startGenesys(){
    try {
        await connectDB()
        
        //Creating connection to Genesys Cloud
        const platformClient = await auth()
        logSys('Connected to Genesys Cloud')
        await getGCQueues(platformClient)
        const queues = await getActiveQueues()
        //Initializing data
        const {results} = await getQueueObservations(platformClient, queues)    
        const queueStatus = parseQueueStatus(results, queues)
        let [intervaDailyStats, dailyStats] = parseDailyStats( await getDailyStats(platformClient, queues), queues)
        logSys('Data initialized')
        
        //Creating notification channel connecting to websocket (also sends a ping)
        const channel = await createChannel(platformClient)
        const ws = createWebSocket(channel.connectUri) 
    
    
        ws.on('message', async msg=> {
            const data = JSON.parse(msg.toString())
    
            if ( data?.eventBody?.message === 'pong'){ //When recieving a pong, subscribe to queues
                subscribeToQueueStatus(ws, queues)
            }
    
            else if (data?.topicName?.includes('v2.analytics.queues.') && data?.topicName?.includes('.observations.details')) { //Trigger on detail queue status
                const queueId = data.topicName.split('.')[3]
                updateDetailQueueStatus(queueStatus, queueId, data.eventBody.results)
            }
            
            else if (data?.topicName?.includes('v2.analytics.queues.') && data?.topicName?.includes('.observations')){ //Trigger on regular queue status
                const {queueId, mediaType} = data.eventBody.group
                if (!mediaType){ //If mediaType is not present, it is a user status update
                    data.eventBody.data.forEach(d=>{
                        const onQueueChanges = d.metrics.filter(a=>a.metric==='oOnQueueUsers')
                        updateOnQueue(queueStatus, queueId, onQueueChanges)
                    })
                }
                else { //If mediaType is present, it is a queue status update
                    console.log(data.eventBody.data)
                    data.eventBody.data.forEach(d=>{
                        const {interval, metrics} = d
                        console.log({interval, metrics})
                        const [intervalStart, intervalEnd] = interval.split('/')
                        if (intervalStart !== intervalEnd) { //If start and end intervals are different, its an statistics update
                            updateDailyStats(queues, intervaDailyStats, dailyStats, {queueId, mediaType}, intervalStart, intervalEnd, metrics)
                        }
                    })
                    
                }
            }
        });
        
    } catch (error) {
        logErr(error)
    }
}

startGenesys()

