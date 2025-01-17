const platformClient = require('purecloud-platform-client-v2');
const {GENESYS_CLIENT_ID, GENESYS_CLIENT_SECRET} = process.env
function auth(){
    const {ApiClient,PureCloudRegionHosts } = platformClient
    return new Promise( async (resolve, reject)=>{
        ApiClient.instance.setEnvironment(PureCloudRegionHosts.eu_west_1);
        ApiClient.instance.loginClientCredentialsGrant(GENESYS_CLIENT_ID,GENESYS_CLIENT_SECRET)
        .then(()=>{
            resolve(platformClient)
        })
        .catch(err=>reject('Failed to authenticate: ' + err.message))
    })
}

function authWithToken(token){
    const {ApiClient,PureCloudRegionHosts } = platformClient
    return new Promise( async (resolve, reject)=>{
        ApiClient.instance.setEnvironment(PureCloudRegionHosts.eu_west_1);
        ApiClient.instance.setAccessToken(token)
        resolve(platformClient)
        // resolve(platformClient)
    })
}

module.exports = {auth, authWithToken}