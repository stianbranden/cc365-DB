require('dotenv').config();
const {BASE64, NODE_ENV, USENEWAUTH} = process.env;
const {authQuery, queueStatusQuery, queueQuery, queueStatusQueryLive, contactsQuery, singleContactQuery} = require('./config')
const {raiContactStatsToday} = require('./rai');


const request = require('request-promise').defaults({jar: true})
const req = require('request').defaults({jar: true});
const moment = require('moment');
const fs = require('fs');

const queueMap = {
    updated: moment().subtract(1,'d'),
    map: {

    },
    queues: {}
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
            //let base64data = encode.encode(`${USER}:${PASS}`, 'base64');
            //authQuery.body = 'Authorization=Basic ' + BASE64;
            //console.log(authQuery.body);
            if (USENEWAUTH==='true'){
                if (NODE_ENV != 'production'){
                    console.log(`Running x-api authentication`);
                }
            } else {
                let resp = JSON.parse(await request(authQuery));
            }
            authenticated = true;
        }
        if ( moment().date() != queueMap.updated.date() ){
            queueMap.map = {};
            queueMap.queues = {};
            let queues = JSON.parse(await request(queueQuery));
            //fs.writeFileSync('./tmp/queue.json', JSON.stringify(queues), 'utf8')
            queueMap.updated = moment();
            console.log(`Queues found: ${queues.length}`);

            queues.forEach(q=>{
                if (typeof queueMap.map[q.description] === 'undefined' && q.description != null && q.description.length < 15 ){
                    queueMap.map[q.description] = [q.id]
                    queueMap.queues[q.id] = q.description;
                }
                else if (q.description != null && q.description.length < 15) {
                    queueMap.map[q.description].push(q.id)
                    queueMap.queues[q.id] = q.description;
                }
            });
            if (NODE_ENV != 'production'){
                console.log(`QueueMap length: ${Object.keys(queueMap.map).length}`);
            }

            
            
        }
        let queueStatus;
        if ( runCount === 1 ){
            //Get queue status all queues
            queueStatus = JSON.parse(await request(queueStatusQuery));
            data.queueStatus = queueStatus;
            data.queueStatus.forEach(q=>{
                q.group = queueMap.queues[q.id];
            })
            //get daily stats
            let rai = await raiContactStatsToday();
            data.queueStats = rai;
            data.queueStats.forEach(q=>{
                q.group = queueMap.queues[q.queueId];
            });
            if (NODE_ENV != 'production'){
                console.log('RAI1: ' + JSON.stringify(data.queueStats[0]));
            }
        }
        else {
            //Get queue status for live channel queues
            queueStatus = JSON.parse(await request(queueStatusQueryLive));
            queueStatus.forEach(qs=>{
                data.queueStatus.forEach((dqs, i)=>{
                    if ( qs.id === dqs.id ){
                        qs.group = queueMap.queues[qs.id]
                        data.queueStatus.splice(i,1,qs);
                    }
                });
            });
        }
        /*
        let agentStatus = JSON.parse(await request(agentQuery));
        agentStatus.forEach(agent=>{

            let queues = [...agent.queues.queue];
            delete agent.queues;
            agent.queues = []
            agent.queueGroups = []
            queues.forEach(q=>{
                if ( q.serving ){
                    agent.queues.push(q);
                    let qG = queueMap.queues[q.id]||'NA';
                    if (!agent.queueGroups.includes(qG)){
                        agent.queueGroups.push(qG);
                    }
                    
                }
            });
        });
        */


        if ( NODE_ENV != 'production' ){
            console.log(`QueueStatus found: ${queueStatus.length}` );
            //console.log(`Agents found: ${agentStatus.length}`);
            console.log(`Runtime: ${moment().diff(a)}`);
        }
        

       /* let contacts = request(contactsQuery);
        console.log(contacts);*/
        
        
        return {
            runCount, 
            data, 
            queueMap
        };
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

function getContacts(){
    try {
        authQuery.body = 'Authorization=Basic ' + BASE64;
        req(authQuery, (e,r,b)=>{
            let min = moment().format();
            let max = moment().subtract(3, 'd').format()
            getContactsWithLimit(req, 0, min, max )
        })
        
        
        
    } catch (error) {
        
    }
}


function getContactsWithLimit(req, offset, min, max){
    let opt = {...contactsQuery};
    if ( offset > 0){
        opt.url = opt.url + '&offset=' + offset;
    }
    req(opt, (e,r,b)=>{
        if ( e|| r.statusCode > 299){
            console.log(r.statusCode);
            
        }
        b = JSON.parse(b);
        console.log(`${offset} run with ${b.length}`);
        
        if ( b.length > 0){
            fs.writeFileSync(`./test${offset}.json`, JSON.stringify(b), 'utf8');
            b.forEach(c=>{
                if ( typeof c.arrivalQueueTime != 'undefined' && c.queueName === 'Delivery (DK)'){
                    let q = moment(c.arrivalQueueTime).format();
                    if ( q > max ){
                        max = q;
                    }
                    if ( q < min ){
                        min = q;
                    }
                }
            });
            getContactsWithLimit(req, offset+b.length, min, max);
        }
        else {
            console.log('DONE');
            console.log({max, min, offset});
            
        }
    });
}

async function getSingleContact(key, value){
    
    
    try {
        let opt = {...singleContactQuery};
        if ( key === 'id' ){
            opt.url += `${value}/`
        }
        else {
            opt.url += `${key}=${value}`;
        }
        if ( NODE_ENV != 'production' ){
            console.log('Running query with params');
            console.log({key, value, opt});
        }
        let doc = await request(opt);
        return doc;
    } catch (error) {
        return error;
    }
    



    /*authQuery.body = 'Authorization=Basic ' + BASE64;
    req(authQuery, (e,r,b)=>{
        console.log(`${r.statusCode} on authentication`);
        
        req(opt, (e,r,b)=>{
            console.log(`${r.statusCode} on single contact`);
            fs.writeFileSync(`./${id}.json`, b, 'utf8');
        });
    })*/

}

module.exports = {
    getQueues,
    getContacts,
    getSingleContact
};