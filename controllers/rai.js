const {raiQuery} = require('./config')
const moment = require('moment');

const request = require('request-promise').defaults({jar: true})
const fs = require('fs');
const { resolve } = require('path');

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

function mergeIntoArray(obj, array){
    const ids = array.map(_=>_.queueId);
    const index = ids.indexOf(obj.queueId);
    if ( index >= 0 ){
        const oldObj = array[index];
        Object.keys(oldObj).forEach(key=>{
            if (['channel', 'queueId', 'queueName'].indexOf(key) < 0 ){
                oldObj[key] = oldObj[key] + obj[key];
            }
        })
    }
    else {
        array.push(obj)
    }
    return array;
}

async function raiContactStatsToday(){
    try{
        let rai = {...raiQuery};//JSON.parse(JSON.stringify(raiQuery));
        rai.url = rai.url.replace('${today}', moment().startOf('day').toISOString())
        //console.log(rai);
        //console.log(rai);
        let resp = JSON.parse(await request(rai));
        //fs.writeFileSync('./tmp/rai.json', JSON.stringify(resp), 'utf8');
        let processed = []
        resp.forEach(obj=>{
            processed = mergeIntoArray(adaptObject(obj), processed);
        });
        return processed;
    }
    catch(e){
        console.log(e);
        resolve([]) //Resolving empty array when there is an error
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