//require('dotenv').config()
//const {logTab} = require('./logger')
const {RUNDELDEV} = process.env
const rundeldev = RUNDELDEV === 'true'
const request = require('request-promise')
const moment = require('moment')
const {deliverDeviations} = require('./config')
const { logStd, logErr } = require('./logger')

const fetchDeliveryDeviations = _=>{
    return new Promise(async (resolve, reject)=>{
        if (!rundeldev) resolve([])
        else {
            logStd('Running Delivery deviations')
            try {
                const data = JSON.parse(await request(deliverDeviations))
                const delDev = []
                data.forEach(d=>{
                    const {id, contactGroupId, queueId, queueName, status, subject, arrivalQueueTime } = d
                    const subjectArray = subject.split(':')
                    let subjectFormat = subjectArray.length < 6 ? 'old': 'new'
                    if (subjectFormat === 'old' && (subject.endsWith('B2C') || subject.endsWith('B2B'))) subjectFormat = 'newShort'
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
                        slaStatus: null,
                        ticket: null
                    }

                    function getArticleAvailabilityDateAndTicket(subject){
                        const arr = subject.split('-')
                        const ticket = arr[0]
                        const year = arr[1]
                        const month = arr[2]
                        const day = arr[3]
                        const time = arr[4]
                        return {
                            ticket, 
                            articleAvailabilityDate: `${year}-${month}-${day}-${time}`
                        }
                    }

                    //"4512483 - 2022-04-21-0821:+D:EPOQ:2243189610:2B:B2C"
                    //"4529980 - 2022-03-20-2000:9D:2243642988:4B:B2C"
                    if ( subjectFormat === 'old' ){
                        params.subtype = subjectArray[0].split(' - ')[1]
                        if ( subjectArray[1] === 'EPOQ' ) params.epoq = true
                        else params.epoq = false
                        if (params.epoq) params.deliveryDate = subjectArray[3]
                        else params.deliveryDate = subjectArray[2]
                        params.deadline = calculateDeadline(arrivalQueueTime, params.subtype)
                    }
                    else if (subjectFormat === 'new') {
                        if ( subjectArray[2] === 'EPOQ') params.epoq = true
                        else params.epoq = false
                        params.segment = subjectArray[5]
                        const {ticket, articleAvailabilityDate} = getArticleAvailabilityDateAndTicket(subjectArray[0])
                        params.articleAvailabilityDate = articleAvailabilityDate
                        params.ticket = ticket
                        params.deadlineCode = subjectArray[1]
                        params.numTimesBlocked = subjectArray[4]
                        params.deadline = moment(params.articleAvailabilityDate, 'YYYY-MM-DD-hhmm').format()
                    }
                    else {
                        params.epoq = false
                        params.segment = subjectArray[4]
                        const {ticket, articleAvailabilityDate} = getArticleAvailabilityDateAndTicket(subjectArray[0])
                        params.articleAvailabilityDate = articleAvailabilityDate
                        params.ticket = ticket
                        params.deadlineCode = subjectArray[1]
                        params.numTimesBlocked = subjectArray[3]
                        params.deadline = moment(params.articleAvailabilityDate, 'YYYY-MM-DD-hhmm').format()

                    }
                    if ( params.deadline === 'Invalid date') logErr(`${params.articleAvailabilityDate} cannot be parsed into date (Ticket: ${params.ticket})`)
                    else params.slaStatus = getSlaStatus(params.deadline)
                    delDev.push({id, contactGroupId, queueId, queueName,countryCode, ...params, status, subject, subjectFormat, arrivalQueueTime })
                })
                resolve(delDev)
            } catch (error) {
                logErr(error)
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
    // console.log(deadline);
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