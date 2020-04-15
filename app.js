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
            console.log(queues[0]);

            queues.forEach(q=>{
                if (typeof queueMap.map[q.description] === 'undefined' && q.description != null && q.description.length < 15 ){
                    queueMap.map[q.description] = [q.id]
                }
                else if (q.description != null && q.description.length < 15) {
                    queueMap.map[q.description].push(q.id)
                }
            });
            
            console.log(queueMap)
            
        }
        let queueStatus;
        if ( runCount === 1 ){
            queueStatus = JSON.parse(await request(queueStatusQuery));
        }
        else {
            queueStatus = JSON.parse(await request(queueStatusQueryLive));
        }
        console.log(queueStatus[0]);

        let agentStatus = JSON.parse(await request(agentQuery));
        console.log(`Agents found: ${agentStatus.length}`);
        
        /*agentStatus.forEach(a=>{
            //if (a.email === 'stian.branden@elkjop.no'){
                console.log(a);
                console.log(moment().subtract(a.userStatusDuration).format('HH:mm:ss'));
            //}
        });*/

        //console.log(agentStatus[1].queues.queue[0]);
        console.log(`Runtime: ${moment().diff(a)}`);
        setTimeout(()=>{
            run(authenticated, runCount)}, 
            10000
        );
        

    } catch (err) {
        authenticated = false;
        setTimeout(()=>{
            run(authenticated, 0)
        }, 60000); //When fuck-up try again in 60sec without authentication...
        console.log(err)
    }
    
}

run(false, 0)