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
        url: baseurl + '/ecfs/RI/rci/queues?limit=1000'
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


const kindly =  {
    "2107": {
        "method": "GET",
        "url": "https://api.kindly.ai/api/v1/bot/2107/conversations/chat/${chatid}/",
        "headers": {
            "authorization": "Kr2V3v-dBwgVM-dxen9DjBDLYm4ufO-7QgqWm5dnWW_jvgahr9P0xn7YDsuux6Ap"
        }
    },
    "2348": {
        "method": "GET",
        "url": "https://api.kindly.ai/api/v1/bot/2348/conversations/chat/${chatid}/",
        "headers": {
            "authorization": "sxNND7xL6ypqt-z2XuiFzpy4XdffRZFPHnZAzbgFtZg0fYJsHESYDSc4SmfWB2zh"
        }
    },
    "2347": {
        "method": "GET",
        "url": "https://api.kindly.ai/api/v1/bot/2347/conversations/chat/${chatid}/",
        "headers": {
            "authorization": "JwMeuaG9ugtjfZEPg9Aaq3KCHOCpx3X-il-5M9atkIIQL13zEUfVm8yORunH7S99"
        }
    },
    "2398": {
        "method": "GET",
        "url": "https://api.kindly.ai/api/v1/bot/2398/conversations/chat/${chatid}/",
        "headers": {
            "authorization": "xVD3Zty22JpvWjaGQfC420vHgWbq9tc6ILlLS0LUfFvDoEpyiKL3XJypkTPmHvKW"
        }
    }
}

if (USEPROXY==="true"){
    Object.keys(queries).forEach(key=>{
        queries[key].proxy = PROXY;
    });
    Object.keys(kindly).forEach(key=>{
        kindly[key].proxy  = PROXY;
    })
}

queries.kindly = kindly;

module.exports = queries