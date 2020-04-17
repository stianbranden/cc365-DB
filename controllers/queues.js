require('dotenv').config();
const {USER, PASS} = process.env;
const {authQuery, queueStatusQuery, agentQuery, queueQuery, queueStatusQueryLive} = require('./config')


const request = require('request-promise').defaults({jar: true})
const moment = require('moment');

const queueMap = {
    updated: moment().subtract(1,'d'),
    map: {

    }
}

const data = {

}


async function run(authenticated, runCount){
    runCount++;
    if ( runCount === 6 ) runCount = 0;
    try {
        let a = moment();
        if (!authenticated){ //If not authenticated, then authenticate
            let buff = new Buffer(`${USER}:${PASS}`);
            let base64data = buff.toString('base64');
            authQuery.body = 'Authorization=Basic' + base64data;
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
        }
        else {
            queueStatus = JSON.parse(await request(queueStatusQueryLive));
        }
        console.log(`QueueStatus found: ${queueStatus.length}` );

        let agentStatus = JSON.parse(await request(agentQuery));
        console.log(`Agents found: ${agentStatus.length}`);
        
        console.log(`Runtime: ${moment().diff(a)}`);
        
        return {runCount, data};
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

module.exports = run;