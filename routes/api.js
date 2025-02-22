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
const Transcript = require('../models/Transcript')
const AIUsage = require('../models/Usage')
const ReadyTime = require('../models/ReadyTime')
const moment = require('moment')
const {getSegments, getSegmentbyId, updateSegment} = require('../controllers/segment.js');
const { getForms } = require('../controllers/form.js');
const {createBPOFile,createBPOFilev2, getBPOFileForSkillAndDate} = require('../controllers/bpo.js');
const BPO = require('../models/BPO.js');
const { createCalibration, listCalibrations, deleteCalibration, readCalibration, assignContactToSession, removeContactFromSession, getContactsWithoutSession, 
    readContactCalibration, getCalibrationResults, readContactsOnCalibration, editSessionComment, editContactComment } = require('../controllers/calibration.js');
const { getTranscriptDataForContact, getBulkTranscriptData, getTranscriptsFromUpdateDate } = require('../controllers/aidata.js');
const Evaluation = require('../models/Evaluation.js');
const { readTarget, newTarget, updateTarget, deleteTarget } = require('../controllers/scorecardTargets.js');

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

router.get('/quality/segments', async(req, res)=>{
    try {
        const segments = await getSegments()
        res.send(segments)
    } catch (error) {
        res.status(500).send(genError(500,error.message))
    }
})

router.get('/quality/forms', async(req, res)=>{
    try {
        const forms = await getForms()
        res.send(forms)
    } catch (error) {
        res.status(500).send(genError(500,error.message))
    }
})
router.post('/quality/toggleSegment/:id', async(req, res)=>{
    try {
        const {id} = req.params
        const {isActive} = (await getSegmentbyId(id))
        updateSegment(id, {
            isActive: !isActive
        }).then(_=>res.status(200).send({msg: "OK"}))
    } catch (error) {
        res.status(500).send(genError(500,error.message))
    }
})

router.post('/quality/toggleUser/:segmentId/:userId', async(req, res)=>{
    try {
        const {segmentId, userId} = req.params
        const {users} = (await getSegmentbyId(segmentId))
        for (let i = 0; i < users.length; i++){
    
            if (users[i]._id.toString() === userId){
                // console.log(users[i]);
                if (users[i].assignment === 0) users[i].assignment = 1
                else users[i].assignment = 0
            }

        }
        updateSegment(segmentId, {users})
        .then(_=>res.status(200).send({msg: "OK"}))

    } catch (error) {
        res.status(500).send(genError(500,error.message))
    }
})

router.post('/quality/bumpUser/:segmentId/:userId', async(req, res)=>{
    try {
        const {segmentId, userId} = req.params
        const {users} = (await getSegmentbyId(segmentId))
        for (let i = 0; i < users.length; i++){
    
            if (users[i]._id.toString() === userId) users[i].assignment ++

        }
        updateSegment(segmentId, {users})
        .then(_=>res.status(200).send({msg: "OK"}))

    } catch (error) {
        res.status(500).send(genError(500,error.message))
    }
})

router.post('/quality/toggleForm/:segmentId/:formId', async(req, res)=>{
    try {
        const {segmentId, formId} = req.params
        const {users} = (await getSegmentbyId(segmentId))
        for (let i=0; i<users.length; i++){
            users[i].evalFormId = formId
        }
        updateSegment(segmentId, {users})
        .then(_=>res.status(200).send({msg: "OK"}))

    } catch (error) {
        res.status(500).send(genError(500,error.message))
    }
})

router.get('/bpo/:skill/:date/:activeOrAll', async(req, res)=>{
    try {
        const {skill, date, activeOrAll} = req.params
        const files = await getBPOFileForSkillAndDate(skill, date, activeOrAll == 'active')
        res.status(200).send(files)
    } catch (error) {
        res.status(500).send(genError(500,error.message))        
    }
})

router.post('/bpo/file', async (req, res)=>{
    try {
        const {fileType, fileData, separator} = req.body
        await createBPOFile(fileType, true, fileData, separator)
        res.status(200).send({msg: 'OK'})
    } catch (error) {
        res.status(500).send(genError(500,error.message))
    }
})

router.post('/bpo/filev2', async (req, res)=>{
    try {
        // console.log(req.body);
        const fileStatus = await createBPOFilev2(req.body)
        // console.log(fileStatus);
        res.status(fileStatus.code).send({msg: fileStatus.msg, code: fileStatus.code})
    } catch (error) {
        res.status(500).send(genError(500,error.message))
    }
})

router.get('/bpo/ready/:date', async (req, res)=>{
    const {date} = req.params
    try {
        const readyTime = await ReadyTime.find({date: Number(date)}).lean()
        res.status(200).send(readyTime)
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

router.get('/evaluations', async (req, res)=>{
    const {id, mode} = req.query
    // console.log(req.params);
    
    if ( mode === "evaluator" ){
        try {
            const evaluations = await Evaluation.find({"evaluator.username": new RegExp(id, 'i')}).lean()
            res.status(200).send(evaluations)
        } catch (error) {
            res.status(500).send({message: error.message})
        }
    }
    else {
        try {
            const evaluations = await Evaluation.find({
                "agent.username": new RegExp(id, 'i')
            }).lean()
            res.status(200).send(evaluations)
        } catch (error) {
            res.status(500).send({message: error.message})
        }
    }
})

router.post('/calibration', async (req, res)=>{
    const {body} = req
    try {
        const calibration = await createCalibration(body)
        res.status(200).send(calibration)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/calibration', async (req, res)=>{
    try {
        const calibrations = await listCalibrations()
        res.status(200).send(calibrations)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/calibration/contacts', async (req, res)=>{
    try {
        const contacts = await getContactsWithoutSession()
        res.status(200).send(contacts)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/calibration/comment', async (req, res)=>{
    try {
        const {sessionId, comment}= req.body
        await editSessionComment(sessionId, comment)
        const calibrations = await listCalibrations()
        res.status(200).send(calibrations)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/calibration/:id', async (req, res)=>{
    const {id} = req.params
    try {
        const calibration = await readCalibration(id)
        res.status(200).send(calibration)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/calibration/delete/:id', async (req, res)=>{
    const {id} = req.params
    try {
        await deleteCalibration(id)
        res.status(204).send({})
    } catch (error) {
        res.status(500).send(error)
        logErr(error)
    }
})
router.get('/calibration/:id/contacts', async (req, res)=>{
    const {id} = req.params
    try {
        const contacts = await readContactsOnCalibration(id)
        res.status(200).send(contacts)
    } catch (error) {
        res.status(500).send(error)
    }
})


router.post('/calibration/contact', async (req, res)=>{
    const {sessionId, contactId}= req.body
    try {
        const session = await assignContactToSession(contactId, sessionId)
        res.status(200).send(session)
    } catch (error) {
        res.status(500).send(error)
    } 
})
router.post('/calibration/contact/refresh', async (req, res)=>{
    const {contactId}= req.body
    try {
        await getCalibrationResults(contactId)
        const contact = await readContactCalibration(contactId)
        res.status(200).send(contact)
    } catch (error) {
        res.status(500).send(error)
    } 
    
})

router.post('/calibration/contact/comment', async (req, res)=>{
    const {contactId, comment}= req.body
    try {
        await editContactComment(contactId, comment)
        const contact = await readContactCalibration(contactId)
        res.status(200).send(contact)
    } catch (error) {
        res.status(500).send(error)
    } 
    
})

router.get('/calibration/contact/:contactId', async (req, res)=>{
    const {contactId} = req.params
    try {
        const contact = await readContactCalibration(contactId)
        res.status(200).send(contact)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/calibration/deleteContact/:contactId/:sessionId', async (req, res)=>{
    const {sessionId, contactId}= req.params
    try {
        const session = await removeContactFromSession(contactId, sessionId)
        res.status(200).send(session)
    } catch (error) {
        res.status(500).send(error)
    } 
})

router.get('/aidata', async (req, res)=>{
    const {date = moment().format('YYYY-MM-DD'), limit=100, page=1, details='false'} = req.query
    try {
        const response = await getTranscriptsFromUpdateDate(date, limit, page, details === 'true')
        res.status(200).send(response)
    } catch (error) {
        res.status(500).send(error.message)
    }

})

router.get('/aidata/:contactId', async (req, res)=>{
    const {contactId}= req.params
    try {
        const contact = await getTranscriptDataForContact(contactId)
        if (!contact) return res.status(200).send({hasSummary: false})
        res.status(200).send(contact)
    } catch (error) {
        // logErr(error)
        res.status(500).send(error)
    } 
})

router.get('/contacts/:dates/:language', async (req, res)=>{
    try {
        // logStd('Hello from api')
        const {language, dates} = req.params
        const query = {}
        if ( language && language != 'all'){
            query['meta'] = {
                language
            }
        }
        const contacts = await getBulkTranscriptData(dates, query)
        res.status(200).send(contacts)
    } catch (error) {
        logErr(error)
        res.status(500).send(error)
    }


})

router.get('/pbi/:model', async (req, res)=>{
    const {model} = req.params
    const {date} = req.query
    const query = {}
    if (date) query.date = date
    
    try {
        if ( model === 'transcript') res.status(200).send(await Transcript.find(query).lean())
        else if ( model === 'aiusage') res.status(200).send(await AIUsage.find(query).lean())
        else if ( model === 'bpo') res.status(200).send(await BPO.find(query).lean())
        else if ( model === 'readytime') res.status(200).send(await ReadyTime.find(query).lean())
        else res.status(404).send({message: "Could not find model " + model})
    } catch (error) {
        res.status(500).send({message: error.message})
    }

})

router.get('/target', async (req, res)=>{
    try {
        const targets = await readTarget()
        res.status(200).send(targets)
    } catch ({message}) {
        res.status(500).send({message})
    }
})

router.post('/target', async ({body}, res)=>{
    try {
        await newTarget(body)
        res.status(200).send('OK')
    } catch ({message}) {
        res.status(500).send({message})
    }
})
router.post('/updateTarget/:id', async ({body, params}, res)=>{
    try {
        await updateTarget(params.id, body)
        res.status(200).send('OK')
    } catch ({message}) {
        res.status(500).send({message})
    }
})
router.post('/deleteTarget/:id', async ({params}, res)=>{
    try {
        await deleteTarget(params.id)
        res.status(200).send('OK')
    } catch ({message}) {
        res.status(500).send({message})
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