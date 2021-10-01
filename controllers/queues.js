//require('dotenv').config();
const {BASE64, NODE_ENV, USENEWAUTH, RUNRAI} = process.env;
const {authQuery, queueStatusQuery, queueQuery, queueStatusQueryLive, contactsQuery, singleContactQuery} = require('./config')
const {raiContactStatsToday} = require('./rai');
const {logStd, logSys, logErr} = require('./logger')
const Config = require('../models/Config');


const request = require('request-promise').defaults({jar: true})
const req = require('request').defaults({jar: true});
const moment = require('moment');
//const fs = require('fs');

/*const queueMap = {
    updated: moment().subtract(1,'d'),
    map: {

    },
    queues: {}
}*/

const data = {

}


function getQueues(authenticated, runCount){
    return new Promise(async (resolve, reject)=>{
        runCount++;
        if ( runCount === 6 ) runCount = 0;
        try {
            let a = moment();
            if (!authenticated){ //If not authenticated, then authenticate
                if (USENEWAUTH==='true'){
                    logSys(`Running x-api authentication`);
                } else {
                    JSON.parse(await request(authQuery));
                }
                authenticated = true;
            }
            let queueMap = await Config.findOne({name: 'queueMap'});

            let fetchQueueMap = false;
            if ( !queueMap ) {
                queueMap = await Config.create({
                    name: 'queueMap',
                    data: JSON.stringify({
                        definition: ['map', 'queues'],
                        map: {sample: 1},
                        queues: {sample: 2}
                    })
                });
                fetchQueueMap = true;

            } else if (moment().date() != moment(queueMap.updatedAt).date()){
                fetchQueueMap = true;
            } 
            else if (Object.keys(queueMap.data.map).length === 0 || Object.keys(queueMap.data.queues).length === 0){
                fetchQueueMap = true;
            }

            if (fetchQueueMap){
                logSys('Fetching new QueueMaps')
                queueMap_map = {};
                queueMap_queues = {};
                let queues = JSON.parse(await request(queueQuery));
                //queueMap.updated = moment();
                logStd(`Queues found: ${queues.length}`);
    
                for (q of queues){
                    if (typeof queueMap_map[q.description] === 'undefined' && q.description != null && q.description.length < 15 ){
                        queueMap_map[q.description] = [q.id]
                        queueMap_queues[q.id] = q.description;
                        
                    }
                    else if (q.description != null && q.description.length < 15) {
                        queueMap_map[q.description].push(q.id)
                        queueMap_queues[q.id] = q.description;
                    }
                };

                queueMap = await Config.findOneAndUpdate({'name': 'queueMap'}, {data: {map: queueMap_map, queues: queueMap_queues}}, {new: true});
                
            }
            logStd(`QueueMap length: ${Object.keys(queueMap.data.map).length}`);     
            let queueStatus;
            //const data = {}
            if ( runCount === 1 ){
                //Get queue status all queues
                queueStatus = JSON.parse(await request(queueStatusQuery));
                data.queueStatus = queueStatus;
                data.queueStatus.forEach(q=>{
                    q.group = queueMap.data.queues[q.id];
                })
    
                if (RUNRAI === 'true'){
                    let rai = await raiContactStatsToday();
                    data.queueStats = rai;
                    data.queueStats.forEach(q=>{
                        q.group = queueMap.data.queues[q.queueId];
                    });
    
                }
            }
            else {
                //Get queue status for live channel queues
                queueStatus = JSON.parse(await request(queueStatusQueryLive));
                queueStatus.forEach(qs=>{
                    data.queueStatus.forEach((dqs, i)=>{
                        if ( qs.id === dqs.id ){
                            qs.group = queueMap.data.queues[qs.id]
                            data.queueStatus.splice(i,1,qs);
                        }
                    });
                });
            }
    
    
            logStd(`QueueStatus found: ${queueStatus.length}` );
            logStd(`Runtime: ${moment().diff(a)}`);
                    
            
            resolve( {
                runCount, 
                data, 
                queueMap
            });
        } catch (err) {
            reject(err);
            authenticated = false;
            logErr(err)
        }

    })

    
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
        logErr(error)
    }
}


function getContactsWithLimit(req, offset, min, max){
    let opt = {...contactsQuery};
    if ( offset > 0){
        opt.url = opt.url + '&offset=' + offset;
    }
    req(opt, (e,r,b)=>{
        if ( e|| r.statusCode > 299){
            logErr(r.statusCode);
            
        }
        b = JSON.parse(b);
        logStd(`${offset} run with ${b.length}`);
        
        if ( b.length > 0){
            //fs.writeFileSync(`./test${offset}.json`, JSON.stringify(b), 'utf8');
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
            logStd('DONE');
            logStd({max, min, offset});
            
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
            logStd('Running query with params');
            logStd({key, value, opt});
        }
        let doc = await request(opt);
        return doc;
    } catch (error) {
        return error;
    }
    

}

module.exports = {
    getQueues,
    getContacts,
    getSingleContact
};