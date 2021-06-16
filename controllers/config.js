//require('dotenv').config();

const {USEPROXY, PROXY, BASE64, KINDLY2107, KINDLY2347, KINDLY2348, KINDLY2398, XAPIKEY, USENEWAUTH, RAI_URL, AUTH_URL, BASE_URL} = process.env
const authUrl = AUTH_URL
let baseurl = BASE_URL
const raiUrl = RAI_URL

if (USENEWAUTH === 'true'){
    baseurl = raiUrl;
}

const queries =  {
    authQuery: {
        method: "POST",
        url: authUrl + '/authentication',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            authorization: 'ECFAUTH' 
        },
        body: 'Authorization=Basic ' + BASE64
    },
    queueStatusQuery: {
        headers:{ 'Accept':  'application/json'},
        method: 'GET',
        url: baseurl + '/rmi/queueStatuses'
    },
    queueStatusQueryLive: {
        headers:{ 'Accept':  'application/json'},
        method: 'GET',
        url: baseurl + '/rmi/queueStatuses?type=Phone,Chat'
    },
    agentQuery: {
        headers:{ 'Accept':  'application/json'},
        method: 'GET',
        url: baseurl + '/rmi/agents?showQueueInfo=3&availability=Away,Busy,Free'
    },
    queueQuery: {
        headers:{ 'Accept':  'application/json'},
        method: 'GET',
        url: baseurl + '/rci/queues?limit=1000'
    },
    contactsQuery: {
        headers: {'Accept': 'application/json'},
        method: 'GET',
        url: baseurl + '/rmi/contacts/?startTime=2020-05-12T06:00:00.000Z&endTime=2020-05-12T07:59:59.999Z&applicationName=ContactCenter&limit=5000&Channel=Phone'
    },
    singleContactQuery: {
        headers: {'Accept': 'application/json'},
        method: 'GET',
        url: baseurl + '/rmi/contacts/'
    },
    raiQuery: {
        method: "GET",
        url: raiUrl + '/rai/contactStatistic?startTime=${today}&channelType=EmailIn,CallIn,ChatIn',
        headers: {
            authorization: 'Basic ' + BASE64,
            'x-api-key': XAPIKEY
        }
    }
}

if (USENEWAUTH === 'true'){
    Object.keys(queries).forEach(key=>{
        queries[key].headers = {
            'Accept': 'application/json',
            authorization: 'Basic ' + BASE64,
            'x-api-key': XAPIKEY
        }
    })
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