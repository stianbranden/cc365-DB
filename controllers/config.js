//require('dotenv').config();

const {USEPROXY, DELDEVQUEUES, PROXY, BASE64, KINDLY2107, KINDLY2347, KINDLY2348, KINDLY2398, XAPIKEY, USENEWAUTH, RAI_URL, AUTH_URL, BASE_URL, TABLEAU_SERVER, TABLEAU_SITE, TELEOPTI_ACCESS_TOKEN, TELEOPTI_URL} = process.env
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
        url: raiUrl + '/rai/contactStatistic?startTime=${today}&channelType=EmailIn,CallIn,ChatIn&timeCategory=hour',
        headers: {
            authorization: 'Basic ' + BASE64,
            'x-api-key': XAPIKEY
        }
    },
    deliverDeviations: {
        method: "GET",
        url: raiUrl + '/rmi/contacts?showAllInProcess=1&limit=10000&queueId=' + DELDEVQUEUES,
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
        "url": "https://bot.kindly.ai/api/v1/chats/${chatid}/",
        "headers": {
            "Authorization": 'Bearer ' + KINDLY2107
        }
    },
    "2348": {
        "method": "GET",
        "url": "https://bot.kindly.ai/api/v1/chats/${chatid}/",
        "headers": {
            "authorization": 'Bearer ' + KINDLY2348
        }
    },
    "2347": {
        "method": "GET",
        "url": "https://bot.kindly.ai/api/v1/chats/${chatid}/",
        "headers": {
            "authorization": 'Bearer ' + KINDLY2347
        }
    },
    "2398": {
        "method": "GET",
        "url": "https://bot.kindly.ai/api/v1/chats/${chatid}/",
        "headers": {
            "authorization": 'Bearer ' + KINDLY2398
        }
    }
}

const tableauTicketRequest = {
    method: 'POST',
    url: TABLEAU_SERVER,
    headers:
     { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: {
        target_site: TABLEAU_SITE
    }
}

const teleoptiRequests = {
    getBusinessUnits: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/BusinessUnit/AllBusinessUnits',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getAllTeamsWithAgents: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/Team/AllTeamsWithAgents',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getPeopleByTeamId: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/Person/PeopleByTeamId',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getSchedulesByPersonIds: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/Schedule/ScheduleByPersonIds',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getScheduleByTeamId: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/Schedule/ScheduleByTeamId',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getUpdatedSchedules: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/ScheduleChanges/SchedulesByChangeDate',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getPersonById: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/Person/PersonById',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getTeamById: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/Team/TeamById',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getSkillsByUnit: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/Skill/AllSkills',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getAllContracts: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/Contract/AllContracts',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getPersonAccounts: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/PersonAccount/PersonAccountsByPersonId',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    },
    getAbsences: {
        method: 'POST',
        url: TELEOPTI_URL + '/query/Absence/AllAbsences',
        headers: {
            'Authorization': 'Bearer ' + TELEOPTI_ACCESS_TOKEN,
            'Accept': 'application/json'
        }
    }
}

const graphApi = {
    getPhoto: {
        method: 'GET',
        url: 'https://graph.microsoft.com/v1.0/me/photos/96x96/$value',
        headers: {
            
        }
    },
    getProfileData: {
        method: 'GET',
        url: 'https://graph.microsoft.com/v1.0/me?$select=displayName,state,jobtitle,employeeId',
        headers: {
            'Accept': 'application/json'
        }
    }
}

if (USEPROXY==="true"){
    Object.keys(queries).forEach(key=>{
        queries[key].proxy = PROXY;
    });
    Object.keys(kindly).forEach(key=>{
        kindly[key].proxy  = PROXY;
    });
    tableauTicketRequest.proxy = PROXY;
    Object.keys(teleoptiRequests).forEach(key=>{
        teleoptiRequests[key].proxy = PROXY;
    });
    Object.keys(graphApi).forEach(key=>{
        graphApi[key].proxy = PROXY;
    });
}

queries.kindly = kindly;
queries.tableauTicketRequest = tableauTicketRequest;

Object.keys(teleoptiRequests).forEach(key=>{
    queries[key] = teleoptiRequests[key];
});
Object.keys(graphApi).forEach(key=>{
    queries[key] = graphApi[key];
});

module.exports = queries