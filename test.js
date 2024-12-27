require('dotenv').config()


const platformClient = require('purecloud-platform-client-v2');
const getQueues = require('./controllers/genesys/getQueues.js');
const auth = require('./controllers/genesys/authGC.js');


async function run(){
    require('./controllers/connectDB.js')()
    await auth(platformClient)
    // const client = platformClient.ApiClient.instance
    const queues = await getQueues(platformClient)
    console.log(queues.length)
}

run()