require('dotenv').config();

const baseurl = "https://cc365-eu-c1.sapcctr.com/elkjop";
const raiUrl = 'https://dl6rdbsvg3.execute-api.eu-central-1.amazonaws.com';
const {USEPROXY, PROXY, BASE64, KINDLY2107, KINDLY2347, KINDLY2348, KINDLY2398, XAPIKEY} = process.env


const queries =  {
    authQuery: {
        method: "POST",
        url: baseurl + '/ecfs/authentication',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            authorization: 'ECFAUTH' 
        },
        body: 'Authorization=Basic ' + BASE64
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
    },
    raiQuery: {
        method: "GET",
        url: raiUrl + '/p/rai/contactStatistic?startTime=${today}&timeCategory=day&channelType=EmailIn,CallIn,ChatIn',
        headers: {
            authorization: 'Basic ' + BASE64,
            'x-api-key': XAPIKEY
        }
    }
}


const kindly =  {
    "2107": {
        "method": "GET",
        "url": "https://api.kindly.ai/api/v1/bot/2107/conversations/chat/${chatid}/",
        "headers": {
            "authorization": KINDLY2107
        }
    },
    "2348": {
        "method": "GET",
        "url": "https://api.kindly.ai/api/v1/bot/2348/conversations/chat/${chatid}/",
        "headers": {
            "authorization": KINDLY2348
        }
    },
    "2347": {
        "method": "GET",
        "url": "https://api.kindly.ai/api/v1/bot/2347/conversations/chat/${chatid}/",
        "headers": {
            "authorization": KINDLY2347
        }
    },
    "2398": {
        "method": "GET",
        "url": "https://api.kindly.ai/api/v1/bot/2398/conversations/chat/${chatid}/",
        "headers": {
            "authorization": KINDLY2398
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