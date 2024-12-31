
module.exports = function(platformClient){
    return new Promise (async (resolve, reject)=>{
        try {
            let apiInstance = new platformClient.NotificationsApi();
            let opts = {'includechannels': "oauthclient"}
            const channels = await apiInstance.getNotificationsChannels(opts)
            resolve(channels)
        } catch (error) {
            reject(error)
        }

    })
}