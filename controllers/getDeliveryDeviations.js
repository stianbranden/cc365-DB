//require('dotenv').config()
//const {logTab} = require('./logger')
const {RUNDELDEV} = process.env
const rundeldev = RUNDELDEV === 'true'
const request = require('request-promise')
const moment = require('moment')
const {deliverDeviations} = require('./config')

const fetchDeliveryDeviations = _=>{
    return new Promise(async (resolve, reject)=>{
        if (!rundeldev) resolve([])
        else {
            try {
                const data = JSON.parse(await request(deliverDeviations))
                const delDev = []
                data.forEach(d=>{
                    const {id, contactGroupId, queueId, queueName, status, subject, arrivalQueueTime } = d
                    const subjectArray = subject.split(':')
                    const subjectFormat = subjectArray.length < 6 ? 'old': 'new'
                    const regExp = /\(([^)]+)\)/
                    const countryCode = regExp.exec(queueName)[1]
    /*
    var regExp = /\(([^)]+)\)/;
    var matches = regExp.exec("I expect five hundred dollars ($500).");

    //matches[1] contains the value between the parentheses
    console.log(matches[1]);
    */


                    const params = {
                        subtype: null,
                        epoq: null,
                        deliveryDate: null,
                        segment: null, 
                        articleAvailabilityDate: null,
                        deadlineCode: null,
                        numTimesBlocked: null,
                        deadline: null,
                        slaStatus: null
                    }
                    if ( subjectFormat === 'old' ){
                        params.subtype = subjectArray[0].split(' - ')[1]
                        if ( subjectArray[1] === 'EPOQ' ) params.epoq = true
                        else params.epoq = false
                        if (params.epoq) params.deliveryDate = subjectArray[3]
                        else params.deliveryDate = subjectArray[2]
                        params.deadline = calculateDeadline(arrivalQueueTime, params.subtype)
                    }
                    else {
                        if ( subjectArray[2] === 'EPOQ') params.epoq = false
                        else params.epoq = false
                        params.segment = subjectArray[5]
                        params.articleAvailabilityDate = subjectArray[0]
                        params.deadlineCode = subjectArray[1]
                        params.numTimesBlocked = subjectArray[4]
                        params.deadline = moment(articleAvailabilityDate).format()
                    }
                    params.slaStatus = getSlaStatus(params.deadline)
                    delDev.push({id, contactGroupId, queueId, queueName,countryCode, ...params, status, subject, subjectFormat, arrivalQueueTime })
                })
                resolve(delDev)
            } catch (error) {
                reject(error)
            }
        }
        
    });
}

/*fetchDeliveryDeviations()
    .then(data=>console.log(logTab(data[1])))
    //.catch(err=>console.log(err.message))
*/
function getSlaStatus(deadline){
    if (moment() > moment(deadline)) return 'breached'
    if (moment().add(24, 'hours') > moment(deadline)) return 'breachingToday'
    return 'open'

}


function calculateDeadline(time, type){ //Use if format === 'old'
    let days = 5
    switch (type) {
        case '-1W':
            days = 1
            break;
        case '0W':
            days = 1
            break;
        case '1W':
            days = 2
            break;
        case '2W':
            days = 3
            break;
        default:
            break;
    }
    return moment(time).add(days, 'day').format()
}

module.exports = {fetchDeliveryDeviations}