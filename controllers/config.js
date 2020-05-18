require('dotenv').config();

const baseurl = "https://cc365-eu-c1.sapcctr.com/elkjop";
const {USEPROXY, PROXY} = process.env


const queries =  {
    authQuery: {
        method: "POST",
        url: baseurl + '/ecfs/authentication',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            authorization: 'ECFAUTH' 
        }
    },
    queueStatusQuery: {
        headers:{ 'Accept':  'application/json'},
        method: 'GET',
        url: baseurl + '/ecfs/RI/rmi/queueStatuses'
    },
    queueStatusQueryLive: {
        headers:{ 'Accept':  'application/json'},
        method: 'GET',
        url: baseurl + '/ecfs/RI/rmi/queueStatuses?type=Phone,Chat'
    },
    agentQuery: {
        headers:{ 'Accept':  'application/json'},
        method: 'GET',
        url: baseurl + '/ecfs/RI/rmi/agents?showQueueInfo=3&availability=Away,Busy,Free'
    },
    queueQuery: {
        headers:{ 'Accept':  'application/json'},
        method: 'GET',
        url: baseurl + '/ecfs/RI/rci/queues'
    },
    contactsQuery: {
        headers: {'Accept': 'application/json'},
        method: 'GET',
        url: baseurl + '/ecfs/RI/rmi/contacts/?startTime=2020-05-12T06:00:00.000Z&endTime=2020-05-12T07:59:59.999Z&applicationName=ContactCenter&limit=5000&Channel=Phone'
    },
    singleContactQuery: {
        headers: {'Accept': 'application/json'},
        method: 'GET',
        url: baseurl + '/ecfs/RI/rmi/contacts/'
    }
}

if (USEPROXY==="true"){
    Object.keys(queries).forEach(key=>{
        queries[key].proxy = PROXY;
    });
}

module.exports = queries