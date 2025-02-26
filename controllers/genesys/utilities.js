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
    if ( program.startsWith('General') && queue.includes('First Line')) valids.push('message')
    if ( program.includes('B2B') || program.includes('Kitchen&Interior')) valids.push('email')
    return valids.includes(mediaType)
}

function parseQueueStatus(results, queues){
    const returnData = []
    // console.log(results[0].data);
    
    results.forEach(({group, data})=>{
        const {queueId, mediaType} = group
        if ( mediaType ){
            const q = queues.filter(a=>a._id === queueId)[0]
            const waiting = data.filter(a=>a.metric==='oWaiting')[0]
            const interacting = data.filter(a=>a.metric==='oInteracting')[0]
            let oldest = null
            if ( waiting?.observations && waiting?.observations.length > 0 ) oldest = waiting.observations[0].observationDate
            returnData.push({queueId, program: q.program, queue: q.name, country: q.country, mediaType, waiting: waiting?.stats.count, interacting: interacting.stats.count, oldest, idle: 0, onQueue: 0})
        }
    })
    results.forEach(({group, data})=>{
        const {queueId, mediaType} = group
        if ( !mediaType && data){
            const qs = returnData.filter(a=>a.queueId === queueId)
            qs.forEach(q=>{
                const idle = data.filter(a=>a.metric==='oOnQueueUsers' && a.qualifier === 'IDLE')[0]?.stats.count || 0
                const onQueue = data.filter(a=>a.metric==='oOnQueueUsers').reduce((acc, a)=>{
                    return a.qualifier === 'NOT_RESPONDING' ? acc: acc + a.stats.count
                }, 0)
                q.idle = idle
                q.onQueue = onQueue
            })
        }
    })
    queues.forEach(q=>{
        ['voice', 'callback', 'email', 'message'].forEach(mediaType=>{
            if ( returnData.filter(a=>a.queueId === q._id && a.mediaType === mediaType).length === 0 ){
                returnData.push({queueId: q._id, program: q.program, queue: q.name, country: q.country, mediaType, waiting: 0, interacting: 0, oldest: null, idle: 0, onQueue: 0})
                // log(queueId: q.queueId)
            }

        }) 
    })

    return returnData.filter(isValidMediaType).sort(sortQueues)
}



function parseDailyStats(results, queues, returnData = []){
    results.forEach(({group, data})=>{
        const {queueId, mediaType} = group
        if ( mediaType ){
            data.forEach(({interval, metrics})=>{
                const [intervalStart, intervalEnd] = interval.split('/')
                const q = queues.filter(a=>a._id === queueId)[0]
                const offered = metrics.filter(a=>a.metric==='nOffered')[0]
                const answered = metrics.filter(a=>a.metric==='tAnswered')[0]
                const serviceLevel = metrics.filter(a=>a.metric==='oServiceLevel')[0]
                const abandon = metrics.filter(a=>a.metric==='tAbandon')[0]
                const handle = metrics.filter(a=>a.metric==='tHandle')[0]
                returnData.push({program: q.program, queue: q.name, queueId, country: q.country, 
                     mediaType, intervalStart, intervalEnd, 
                    offered: offered?.stats?.count || 0, answered: answered?.stats?.count || 0, abandon: abandon?.stats?.count || 0, serviceLevel: serviceLevel?.stats?.ratio, 
                    serviceLevelStats: serviceLevel?.stats || {ratio: 0, numerator: 0, denominator: 0, target: 0}, handleTime: handle?.stats?.sum || 0, handled: handle?.stats?.count || 0})
                })
            }
    })
    const intervalDailyStats = returnData.filter(isValidMediaType).sort(sortQueues)
    const dailyStats = summarizeIntervalStats(intervalDailyStats)
    return [intervalDailyStats, dailyStats]
}

function summarizeIntervalStats(intervaDailyStats, returnData = []){
    // const returnData = []
    intervaDailyStats.forEach(({program, queue, queueId, mediaType, country, offered, answered, abandon, serviceLevel, serviceLevelStats, handleTime, handled})=>{
        const found = returnData.filter(a=>a.queueId===queueId && a.mediaType===mediaType)[0]
        if ( found ){
            found.offered += offered
            found.answered += answered
            found.serviceLevelStats.target = serviceLevelStats.target > found.serviceLevelStats.target ? serviceLevelStats.target : found.serviceLevelStats.target 
            found.serviceLevelStats.numerator += serviceLevelStats.numerator
            found.serviceLevelStats.denominator += serviceLevelStats.denominator
            found.serviceLevel = found.serviceLevelStats.denominator > 0 ? found.serviceLevelStats.numerator / found.serviceLevelStats.denominator: 0
            found.serviceLevelStats.ratio = found.serviceLevel
            found.abandon += abandon
            found.handleTime += handleTime
            found.handled += handled
        }
        else {
            returnData.push({program, queue, queueId, mediaType, country, offered, answered, abandon, serviceLevel, serviceLevelStats, handleTime, handled})
        }
    })
    return returnData
}

function updateDailyStats(queues, intervaDailyStats, dailyStats, {queueId, mediaType}, intervalStart, intervalEnd, metrics){
    const q = queues.filter(a=>a._id === queueId)[0]
    const found = intervaDailyStats.filter(a=>a.queueId === queueId && a.mediaType === mediaType && a.intervalStart === intervalStart)[0]
    const offered = metrics.filter(a=>a.metric==='nOffered')[0]?.stats?.count || 0
    const answered = metrics.filter(a=>a.metric==='tAnswered')[0]?.stats?.count || 0
    const serviceLevel = metrics.filter(a=>a.metric==='oServiceLevel')[0]?.stats || {ratio: 0, numerator: 0, denominator: 0, target: 0}
    const abandon = metrics.filter(a=>a.metric==='tAbandon')[0]?.stats?.count || 0
    const handle = metrics.filter(a=>a.metric==='tHandle')[0]
    if ( found ){
        found.offered = offered
        found.answered = answered
        found.serviceLevelStats = serviceLevel
        found.serviceLevel = found.serviceLevelStats.denominator > 0 ? found.serviceLevelStats.numerator / found.serviceLevelStats.denominator: 0
        found.abandon = abandon
        found.handleTime = handle?.stats?.sum || 0
        found.handled = handle?.stats?.count || 0
    }
    else {
        intervaDailyStats.push({program: q.program, queue: q.name, queueId,country: q.country, mediaType, intervalStart, intervalEnd, offered, answered, serviceLevel, 
            serviceLevelStats: serviceLevel?.stats || {ratio: 0, numerator: 0, denominator: 0, target: 0}, abandon, handleTime: handle?.stats?.sum || 0, handled: handle?.stats?.count || 0})
    }
    dailyStats = summarizeIntervalStats(intervaDailyStats)
    // console.log('I am returning data')
    return [intervaDailyStats, dailyStats]
}

function updateOnQueue(queueStatus, queueId, results){
    const qs = queueStatus.filter(a=>a.queueId === queueId)
    const idle = results.filter(a=>a.metric==='oOnQueueUsers' && a.qualifier === 'IDLE')[0]?.stats.count || 0
    const onQueue = results.filter(a=>a.metric==='oOnQueueUsers').reduce((acc, a)=>{
        return a.qualifier === 'NOT_RESPONDING' ? acc: acc + a.stats.count
    }, 0)
    qs.forEach(q=>{
        q.idle = idle
        q.onQueue = onQueue
    })
    // console.table(qs)
}

module.exports = {parseQueueStatus, parseDailyStats, updateDailyStats, updateOnQueue}