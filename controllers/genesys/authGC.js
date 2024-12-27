const {GENESYS_CLIENT_ID, GENESYS_CLIENT_SECRET} = process.env
async function auth({ApiClient,PureCloudRegionHosts }){
    ApiClient.instance.setEnvironment(PureCloudRegionHosts.eu_west_1);
    await ApiClient.instance.loginClientCredentialsGrant(GENESYS_CLIENT_ID,GENESYS_CLIENT_SECRET)
}

module.exports = auth