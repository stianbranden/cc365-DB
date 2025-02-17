module.exports = function(platformClient, queues, subtract=0){
    return new Promise (async (resolve, reject)=>{
        try {
            const moment = require('moment')
            let apiInstance = new platformClient.AnalyticsApi();
            let body = {
                "interval": moment().subtract(subtract, 'day').format('YYYY-MM-DD') + "T00:00:00Z/" + moment().subtract(subtract, 'day').add(1, 'day').format('YYYY-MM-DD') + "T00:00:00Z",
                "granularity": "PT30M",
                "timeZone": "Europe/Copenhagen",
                "groupBy": ["queueId", "mediaType"],
                "filter": {
                  "type": "and",
                  "clauses": [
                    {
                      "type": "or",
                      "predicates": queues.map(a=>{
                        return {"dimension": "queueId", "value": a._id}
                      })
                    }, {
                      "type": "or",
                      "predicates": [{
                          "dimension": "mediaType",
                          "value": "email"
                      },{
                          "dimension": "mediaType",
                          "value": "voice"
                      },{
                          "dimension": "mediaType",
                          "value": "callback"
                      },{
                          "dimension": "mediaType",
                          "value": "message"
                      }
                      ]
                    }
                  ]
                },
                "metrics": ["nOffered", "tAnswered", "oServiceLevel", "tAbandon", "tHandle"],
                "flattenMultivaluedDimensions": false
              }
            const data = await apiInstance.postAnalyticsConversationsAggregatesQuery(body)
            if ( data.results ) resolve(data.results)
            else resolve([])
        } catch (error) {
            reject(error)
        }
    })
}