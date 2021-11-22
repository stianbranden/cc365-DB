//https://kindlywebhook.azurewebsites.net/api/queues?code=KczvYf3ARDqa3mNUt5AgrflkuDUD11wC6IwO74O8K117xSN9ot6YTA==&clientId=default
//require('dotenv').config();
//require('./connectDB')();
const {logStd, logErr} = require('./logger')
const {createAlert, updateAlert} = require('./createAlert')
const {getRelatedAlert} = require('./getAlerts')
const request = require('request-promise');
const moment = require('moment');
const url = 'https://kindlywebhook.azurewebsites.net/api/queues?code=KczvYf3ARDqa3mNUt5AgrflkuDUD11wC6IwO74O8K117xSN9ot6YTA==&clientId=default';
const chains = ['dk', 'fi', 'no', 'se'];
const getCountry = chain=>{
    switch(chain){
        case 'dk': 
            return 'Denmark';
            break;
        case 'fi':
            return 'Finland';
            break;
        case 'no':
            return 'Norway';
            break;
        case 'se':
            return 'Sweden';
            break;
    }
}

const isInErrorState = (slug, agents) =>{
    if (slug == 'q_full' && agents === 0){
        return 'no agents logged on'
    }
    else if (slug == 'q_full'){
        return 'queue over threshold'
    }
    else if ( slug == 'q_error' ){
        return 'error in queue check'
    }
    else {
        return null;
    }
}

const getChatStatus = async chain=>{
    try {
        const chatStatus = await request({
            method: 'POST',
            url, 
            body: JSON.stringify({context: {chain}})
        })
        //if ( chain == 'fi') logStd(chatStatus);
        return JSON.parse(chatStatus);
    } catch (error) {
        logErr(error)
    }
}

const processResult = async result =>{
    return new Promise(async (resolve, reject)=>{
        let alert = await getRelatedAlert('Channel Chat', result.country);
        const state = isInErrorState(result.result.exchange_slug, result.result.agents);
       /* if (result.country == 'Finland' ){
            logStd(JSON.stringify({alert, state,slug: result.exchange_slug, result}))
        }*/
        if (!alert && state){
            logStd(result.country + ': Alert not found, must be created');
            alert = await createAlert(`${result.result.name}: <br> ${left(moment().format('HH:mmZ'),8)} - closed due to ${state}`, result.country, false, 'Channel Chat', false, `${result.country}: Chat is closed`);
        }
        else if ( alert && state) {
            logStd(result.country + ': Alert found, still active')
        }
        else if ( alert && !state ){
            if ( result.result.inQueue > result.result.quueLimit * 0.8) {
                if (alert.status === 'Open' ){
                    alert = await updateAlert(alert._id, {
                        text: alert.text + `<br>${left(moment().format('HH:mmZ'),8)} - Queue is open, but close to limit`,
                        status: 'Pending'
                    })
                }
                logStd(result.country + ': Alert, we are open, but waiting to close alert (still ' + result.result.inQueue + ' in queue)')
            }
            else {
                logStd(result.country + ': Alert, closing it')
                alert = await updateAlert(alert._id, {
                    closed: true, 
                    status: 'Closed',
                    text: alert.text + `<br>${left(moment().format('HH:mmZ'),8)} - Queue is open`
                });
            }
        }
        else if ( !alert && !state ){
            logStd(result.country + ': No alert, no reason')
        }
        result.alert = alert;
        resolve(result);
    })
}
const checkChatStatus = _=>{
    chains.forEach(async chain =>{
        const {exchange_slug, new_context} = await getChatStatus(chain);
        let {quueLimit, queueStatus} = new_context
        let country = getCountry(chain);
        if ( !queueStatus ){
            queueStatus = {inQueueCurrent: 0,name: country, agentsServing: 0, agentsNotReady: 0}
        }
        
    
        const result = {
            chain,
            country,
            result: {
                exchange_slug, quueLimit, 
                inQueue: queueStatus.inQueueCurrent, 
                name: queueStatus.name, 
                agents: queueStatus.agentsServing-queueStatus.agentsNotReady
            }
        }
        //let ag = q.agentsServing - q.agentsNotReady;
        //logStd(JSON.stringify(result));
        processResult(result).then(result=>{
            //logStd(JSON.stringify(result));
        });
    });
}

module.exports = {checkChatStatus}
//checkChatStatus();