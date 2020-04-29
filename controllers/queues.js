require('dotenv').config();
const {USER, PASS, BASE64} = process.env;
const {authQuery, queueStatusQuery, agentQuery, queueQuery, queueStatusQueryLive, useProxy, proxy} = require('./config')


const request = require('request-promise').defaults({jar: true})
const moment = require('moment');
const encode = require('nodejs-base64-encode');


const queueMap = {
    updated: moment().subtract(1,'d'),
    map: {

    }
}

const data = {

}


async function getQueues(authenticated, runCount){
    runCount++;
    if ( runCount === 6 ) runCount = 0;
    try {
        let a = moment();
        if (!authenticated){ //If not authenticated, then authenticate
            //let buff = new Buffer(`${USER}:${PASS}`);
            //let base64data = buff.toString('base64');
            let base64data = encode.encode(`${USER}:${PASS}`, 'base64');
            authQuery.body = 'Authorization=Basic ' + BASE64;
            console.log(authQuery.body);
            
            let resp = JSON.parse(await request(authQuery));
            authenticated = true;
        }
        if ( moment().date() != queueMap.updated.date() ){
            queueMap.map = {};
            let queues = JSON.parse(await request(queueQuery));
            queueMap.updated = moment();
            console.log(`Queues found: ${queues.length}`);

            queues.forEach(q=>{
                if (typeof queueMap.map[q.description] === 'undefined' && q.description != null && q.description.length < 15 ){
                    queueMap.map[q.description] = [q.id]
                }
                else if (q.description != null && q.description.length < 15) {
                    queueMap.map[q.description].push(q.id)
                }
            });
            
            console.log(`QueueMap length: ${Object.keys(queueMap).length}`);
            
        }
        let queueStatus;
        if ( runCount === 1 ){
            queueStatus = JSON.parse(await request(queueStatusQuery));
            data.queueStatus = queueStatus;
            
        }
        else {
            queueStatus = JSON.parse(await request(queueStatusQueryLive));
            queueStatus.forEach(qs=>{
                data.queueStatus.forEach((dqs, i)=>{
                    if ( qs.id === dqs.id ){
                        data.queueStatus.splice(i,1,qs);
                    }
                });
            });
        }
        console.log(`QueueStatus found: ${queueStatus.length}` );

        let agentStatus = JSON.parse(await request(agentQuery));
        console.log(`Agents found: ${agentStatus.length}`);
        
        console.log(`Runtime: ${moment().diff(a)}`);
        
        return {runCount, data, queueMap};
    } catch (err) {
        authenticated = false;
        /*setTimeout(()=>{
            run(authenticated, 0)
        }, 60000); //When fuck-up try again in 60sec without authentication...
        */
        console.log(err)
    }
    
}
//run(false, 0)

module.exports = {
    getQueues
};