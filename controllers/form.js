const axios = require('axios');
const authCalabrio = require('./authCalabrio')
const {c1evalForms} = require('./config');
const { logErr } = require('./logger');
function getForms(){
    return new Promise(async (resolve, reject)=>{
        try {
            const {sessionId} = (await authCalabrio()).data
            const forms = (await axios({
                ...c1evalForms,
                headers: {
                    cookie: "hazelcast.sessionId=" + sessionId
                }
            })).data
            resolve(forms)
        } catch (error) {
            logErr(error)
            reject(error)
        }
    })

}

module.exports= {
    getForms
}


/*
const moment = require('moment')

const {findRecordings} = require('./apiconfig')
const getSegment = require('./getSegment')
// const { logErr, logTab } = require('./logger');

function getContacts(segment, sessionId){
    return new Promise(async (resolve, reject)=>{
    // headers.common['cookie'] = "hazelcast.sessionId=" + auth.data.sessionId;
        try {
            const {sample} = (await getSegment(segment))[segment]
            const beginDate = moment().startOf('isoWeek').subtract(7, 'days').format('YYYY-MM-DD')
            const endDate = moment().endOf('isoWeek').subtract(7, 'days').format('YYYY-MM-DD')
            // console.log({beginDate, endDate});
            const recordings = (await axios({
                ...findRecordings,
                headers: {
                    cookie: "hazelcast.sessionId=" + sessionId
                },
                params: {
                    limit: '10000',
                    beginDate, endDate,
                    metadata: 'segment-key~equals~' + segment,
                    expand: 'metadata'
                }
            })).data.filter(a=>a.evaluator.evaluatorId === 0)

            //Do more filtering here

            const randomIds = new Set()
            for ( let i = 0; i < sample; i++){
                randomIds.add(recordings[Math.floor(Math.random()*recordings.length)].id)
            }
            resolve(Array.from(randomIds))
        } catch (error) {
            reject('Error in getContacts ' + error)
        }
    });
}

module.exports = getContacts

// getContacts('Technical Helpdesk', 20)
//     .then(randomIds=>logTab(randomIds))
//     .catch(error=>logErr(error))
*/