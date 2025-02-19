module.exports = function(platformClient, queues){
    return new Promise (async (resolve, reject)=>{
        try {
            let apiInstance = new platformClient.AnalyticsApi();
            let body = {
                "filter": {
                  "type": "and",
                  "clauses": [
                    {
                      "type": "or",
                      "predicates": queues.map(a=>{
                        return {"dimension": "queueId", "value": a._id}
                      })
                    },
                    {
                        "type": "or",
                        "predicates": [{
                            "dimension": "mediaType",
                            "value": "email"
                        },
                        {
                            "dimension": "mediaType",
                            "value": "voice"
                        },
                        {
                            "dimension": "mediaType",
                            "value": "callback"
                        },
                        {
                            "dimension": "mediaType",
                            "value": "message"
                        }]
                    }
                  ]
                },
              
                "metrics": ["oAlerting", "oInteracting", "oOnQueueUsers", "oWaiting"],
                "detailMetrics": ["oWaiting"]
              }
            const observations = await apiInstance.postAnalyticsQueuesObservationsQuery(body)
            resolve(observations)
            // resolve({results: []})
        } catch (error) {
            reject(error)
        }
    })
}

/*[
    {
        "dimension": "queueId",
        "value": "{{queueId}}" 
      },
      {
        "dimension": "queueId",
        "value": "{{queueId2}}" 
      }
    ]
    */