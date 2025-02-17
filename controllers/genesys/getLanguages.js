const Language = require('../../models/genesys/Language')

async function getLanguages(platformClient) {
    try {
        let opts = { 
            'pageSize': 100, // Number | Page size
            'pageNumber': 1, // Number | Page number
        }
        let apiInstance = new platformClient.RoutingApi();
        const {entities} = (await apiInstance.getRoutingLanguages(opts))
        if ( entities ){
            await Language.collection.drop()
            for ( let i = 0; i < entities.length; i++){
                const e = entities[i]
                await Language.create({
                    _id: e.id,
                    name: e.name,
                    state: e.state
                })
            }
        }


        return 'ok';
    } catch (error) {
        // console.error('Error getting languages:', error);
        throw error;
    }
}

module.exports = {getLanguages};