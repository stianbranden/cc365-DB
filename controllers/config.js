const baseurl = "https://cc365-eu-c1.sapcctr.com/elkjop";

module.exports = {
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
    }
}