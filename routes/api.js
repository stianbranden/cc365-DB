const router= require('express').Router();
const cors = require('cors')
const {NODE_ENV} = process.env



const {getOsData} = require('../controllers/getOsData');
const { logErr, logStd, logTab } = require('../controllers/logger.js');
const { getPm2Data } = require('../controllers/getPm2.js');
const {createAlert, updateAlert} = require('../controllers/createAlert')
const {getAlerts, getPeopleAlerts, getAlertReportData} = require('../controllers/getAlerts')
const {getUsersWithAccess, pushSingleUserAccess} = require('../controllers/userAccesses')
const {getSchedulesForAgent} = require('../controllers/getTeleoptiData')
const {getTranscript} = require('../controllers/chatTranscripts.js');
const {getReleaseNotes} = require('../controllers/releaseNote')
const User = require('../models/User')
const Access = require('../models/Access')
const Collection = require('../models/Collection')
const PersonAccount = require('../models/PersonAccount')
const moment = require('moment')

const genError = (statusCode, error)=>{
    return {
        statusCode,
        error
    }
}

if (NODE_ENV !== 'production'){
    router.use(cors({
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
      }))
    router.use(async (req, res, next)=>{
        if ( req.headers.origin === 'http://localhost:8080' || req.headers.origin === 'http://localhost:5173' ){
            req.user = await User.findById('stianbra@elkjop.no') 
            logStd('Dev request from vue');
        }
        next();
    })
} 

const protectRoute = (req, res, next)=>{
    if ( !req.user ){
        res.status(401).send(genError(401, 'User not logged in'))
    }
    else next();
}

router.get('/chattranscript/:botId/:chatId', async (req, res)=>{
    const {botId, chatId} = req.params
    try {
        const transcript = await getTranscript(botId, chatId);
        res.send(transcript)
    } catch (error) {
        res.status(500).send(genError(500, error.message))
    }
})


router.get('/admin', async (req, res)=>{
    try {
        const osData = await getOsData();
        const pm2Data = await getPm2Data();
        res.send({osData, pm2Data});
    } catch (error) {
        res.status(500).send(genError(500, error.message))
    }
});

router.get('/user', async (req, res)=>{
    res.send(req.user || {custom_access:[], alerts: [], pages: []})
});

router.get('/user/schedule/:agentId', async (req, res)=>{
    const {agentId} = req.params
    const schedule = await getSchedulesForAgent(agentId);
    res.send(schedule)
})

router.post('/alertsreport', protectRoute, async (req, res)=>{
    const {startDate, endDate, departments} = req.body
    try {
        const alerts = await getAlertReportData(departments, startDate, endDate)
        res.send(alerts)
    } catch (error) {
        res.status(500).send(genError(500, error.message))
    }
})

router.get('/alerts', async (req, res)=>{
    let alerts = []
    alerts = [...await getAlerts(null, null, true)]
    if ( NODE_ENV !== 'production' && req.headers.origin === 'http://localhost:8080' ) req.user = await User.findById('stianbra@elkjop.no')
    if ( req.user && req.user.alerts){
        for ( let i = 0; i < req.user.alerts.length; i++)  {
            if ( !['Helpdesk', 'Loyalty'].includes(req.user.alerts[i]) ) alerts = [...alerts, ...await getPeopleAlerts(req.user.alerts[i])];
        }
    }
    res.send(alerts);
})

router.post ('/alerts', protectRoute, async (req, res)=>{
    const {body} = req;
    body.user = req.user._id;
    logTab(body, 'Post request to Alerts');
    

    const newAlerts = []
    for (let i = 0; i < body.departments.length; i++){
        const department = body.departments[i];
        let text = processText(body.text, req.user, department)
        newAlerts.push(await createAlert(text, department, false, body.alerttype, body.status == 'Closed', `${department} - ${body.alerttype}`, '<ion-icon name="clipboard-outline"></ion-icon>', body.user, new Date(), true));
    }
    
    res.status(200).send({msg: 'Alert created', newAlerts});
})


router.patch('/alerts/:id', protectRoute,  async (req, res)=>{
    const {body, params, user} = req
    const {id} = params
    try {
        body.text = processText(body.text, user, body.department)
        body.closed = body.status == 'Closed'
        const newAlert = await updateAlert(id, body, true)
        res.status(200).send({msg: 'Alert updated', newAlerts: [newAlert]})
    } catch (error) {
        res.status(500).send(genError(500, error.message))
    }
})

router.get('/access', protectRoute, async (req, res)=>{
    const accesses = await Access.find()
    res.status(200).send(accesses)
})
router.get('/access/:access_id', protectRoute, async (req, res)=>{
    const access = await Access.findById(req.params.access_id)
    res.status(200).send(access)
})

router.post('/access', protectRoute, async (req, res)=>{
    try {
        const access = await Access.create({
            rule: {
                upn: 'nobody@elkjop.no'
            },
            grant: [],
            alerts: [],
            pages: [],
            name: 'New access level'
        });
        res.send(access)
    } catch (error) {
        res.status(500).send(genError(500, error.message))
    }
})

router.patch('/access/:access_id', protectRoute, async (req, res)=>{
    try {
        const {body, params} = req
        const {access_id} = params
        const affectedUsers = await getUsersWithAccess(access_id);
        await Access.findByIdAndUpdate(access_id, body);
        [...affectedUsers, ...await getUsersWithAccess(access_id)]
            .forEach(user=> pushSingleUserAccess(user))
        res.status(200).send('OK')
    } catch (error) {
        res.status(500).send(genError(500, error.message))
    }
})

router.delete('/access/:access_id', protectRoute, async (req, res)=>{
    try {
        const {access_id} = req.params
        const affectedUsers = await getUsersWithAccess(access_id);
        await Access.findByIdAndDelete(access_id);
        affectedUsers.forEach(user=> pushSingleUserAccess(user))
        res.status(204).send('OK')
    } catch (error) {
        res.status(500).send(genError(500, error.message))
    }
})

router.get('/access/:access_id/users', protectRoute, async (req, res)=>{
    const {access_id} = req.params
    const users = await getUsersWithAccess(access_id)
    res.status(200).send(users)
})

router.get('/collections', async(req, res)=>{
    logStd(JSON.stringify(req.user))
    if (!req.user) res.status(200).send([])
    else {
        try {
            const collections = await Collection.find({user: req.user._id}).lean()
            res.send(collections)
        } catch (error) {
            res.status(500).send(genError(500, error.message))
        }
    }
})

router.post('/collections', protectRoute, async(req, res)=>{
    const {body}= req
    body.user = req.user._id
    try {
        const collection = await Collection.create(body)
        res.status(200).send(collection);
    } catch (error) {
        res.status(500).send(genError(500, error.message))
    }

})

router.put('/collections/:id', protectRoute, async(req, res)=>{
    const {body}= req
    const {id} = req.params
    try {
        const collection = await Collection.findByIdAndUpdate(id, body)
        res.status(200).send(collection);
    } catch (error) {
        res.status(500).send(genError(500, error.message))
    }
})

router.delete('/collections/:id', protectRoute, async(req, res)=>{
    const {id} = req.params
    try {
        await Collection.findByIdAndDelete(id);
        res.status(204).send('OK')
    } catch (error) {
        res.status(500).send(genError(500, error.message))
        
    }
})

router.get('/personaccounts', protectRoute, async(req, res)=>{
    try {
        const personAccounts = await PersonAccount.find().lean()
        res.send(personAccounts)
    } catch (error) {
        res.status(500).send(genError(500, error.message))
    }
})

router.get('/releasenotes', async(req, res)=>{
    try {
        const releaseNotes = await getReleaseNotes()
        res.send(releaseNotes)
    } catch (error) {
        res.status(500).send(genError(500,error.message))
    }
})


function processText(text, user, department){
    let timeStamp = moment().tz('Europe/Oslo').format('HH:mm');
    let timeZone = moment().tz('Europe/Oslo').format('z')
    if (department === 'Finland'){
        timeZone = moment().tz('Europe/Helsinki').format('z')
        timeStamp = moment().tz('Europe/Helsinki').format('HH:mm')
    }
    return `${timeStamp} (${timeZone}): ${text} - ${user.name}`
    
}

module.exports = router;