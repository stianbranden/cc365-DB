const {raiQuery} = require('./config')
const moment = require('moment');

const request = require('request-promise').defaults({jar: true})

function adaptObject(obj){
    const {channel, queueId, queueName,
    countOfHandledContacts, countOfCompletedContacts, 
    countOfAbandonedContacts,
    countOfAnsweredOnTimeContacts, handlingDuration, 
    waitingDurationForHandled, countOfArrivedContacts,
    afterworkDuration
     } = obj;
     return {
        channel, 
        queueId, 
        queueName,
        countOfHandledContacts,
        countOfCompletedContacts, 
        countOfAbandonedContacts,
        countOfAnsweredOnTimeContacts, 
        handlingDuration, 
        afterworkDuration,
        waitingDurationForHandled,
        countOfArrivedContacts
    };
}

async function raiContactStatsToday(){
    try{
        let rai = JSON.parse(JSON.stringify(raiQuery));
        rai.url = rai.url.replace('${today}', moment().startOf('day').toISOString())
        //console.log(rai);
        let resp = JSON.parse(await request(rai));
        let processed = []
        resp.forEach(obj=>{
            processed.push(adaptObject(obj));
        });
        return processed;
    }
    catch(e){
        console.log(e);
    }
     
}

async function doit(){
     let res = await raiContactStatsToday();
     console.log(res);
}
//doit();
module.exports = {
    raiContactStatsToday
}