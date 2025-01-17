// const platformClient = require('purecloud-platform-client-v2');
// const client = platformClient.ApiClient.instance
// // const accessToken = 'bgElZdqRy83VdoMpPEIhmv-ME4pIsb5wJBWu5Ltp7l20HypGYRWPu6ai-9IkC_QltVxyWZauUwGiszKRT1IttA'

// client.setEnvironment(platformClient.PureCloudRegionHosts.eu_west_1);
// client.loginClientCredentialsGrant(clientId,clientSecret)
// // platformClient.ApiClient.instance.setAccessToken(accessToken);
const Queue = require('../../models/genesys/Queue.js')
const { logSys } = require('../logger.js')



function getMeta(name){
    const items = name.split(' ')
    const meta = {
        program: 'na',
        mainProgram: 'na',
        country: 'na'
    }
    switch (items[0]){
        case 'PS': 
            meta.mainProgram = 'Premium Support' 
            break
        case 'GS': 
            meta.mainProgram = 'General Service' 
            break
        case 'BO': 
            meta.mainProgram = 'Inside Sales'
            break
    }
    switch (items[1]){
        case 'DK': 
            meta.country = 'Denmark' 
            break
        case 'FI': 
            meta.country = 'Finland' 
            break
        case 'NO': 
            meta.country = 'Norway' 
            break
        case 'SE': 
            meta.country = 'Sweden' 
            break
    }
    meta.program = meta.mainProgram
    if (items[0] != 'PS') meta.program += ' ' + meta.country
    else {
        switch (items[2]){
            case 'B2B': 
                meta.program += ' B2B'
                break
            case 'KI':
                meta.program += ' Kitchen&Interior'
                break
            case 'THD':
                meta.program += ' Technical Helpdesk'
        }
    }

    return meta
}

function getQueues(platformClient){
    const apiInstance = new platformClient.RoutingApi();
    const opts = { 
        pageNumber: 1, // Number | Page number
        pageSize: 10, // Number | Page size
    }
    return new Promise(async (resolve, reject)=>{
        try {
            const data = await apiInstance.getRoutingQueues(opts)
            // console.log({data})
            const allData = [...data.entities]
            for (let i = 2; i <= data.pageCount; i++){
                opts.pageNumber = i
                // console.log('Running page', i)
                allData.push(...(await apiInstance.getRoutingQueues(opts)).entities)
            }
            // console.log(allData.length)
            await Queue.collection.drop()
            logSys('Queues collection dropped')
            for (let i = 0; i < allData.length; i++){
                const {id, name} = allData[i]
                const {program, mainProgram, country} = getMeta(name)
                // await Queue.findByIdAndUpdate(id, {name, program, mainProgram, country}, {upsert: true})
                await Queue.create({
                    _id: id, name, program, mainProgram, country
                })
                // console.log('Queue', i, 'inserted (', name, ')')
            }
            logSys(allData.length + ' queues inserted')

            resolve(allData)
        } catch (error) {
            // console.error(error);
            reject(error)
        }
    })
}

module.exports = getQueues
// getQueues(platformClient).then(data=>console.log(data))
