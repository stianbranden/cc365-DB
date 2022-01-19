const router= require('express').Router();
const cors = require('cors')
const {NODE_ENV} = process.env


if (NODE_ENV !== 'production'){
    router.use(cors())
} 

const {getOsData} = require('../controllers/getOsData');
const { logErr, logStd, logTab } = require('../controllers/logger.js');
const { getPm2Data } = require('../controllers/getPm2.js');
const {createAlert} = require('../controllers/createAlert')
const {getAlerts, getPeopleAlerts} = require('../controllers/getAlerts')
const User = require('../models/User')


router.get('/admin', async (req, res)=>{
    try {
        const osData = await getOsData();
        const pm2Data = await getPm2Data();
        res.send({osData, pm2Data});
    } catch (error) {
        res.send({});
        logErr(error.message);
        
    }
});

router.get('/user', async (req, res)=>{
    if ( NODE_ENV !== 'production' && req.headers.origin === 'http://localhost:8080' ){
        res.send(await User.findById('stianbra@elkjop.no'))
        logStd('Dev request from vue, sending std user');
    }
    else {
        res.send(req.user || {custom_access:[], alerts: []});
    }
});

router.get('/alerts', async (req, res)=>{
    let alerts = []
    alerts = [...await getAlerts(null, null, true)]
    if ( req.user && req.user.alerts){
        for ( let i = 0; i < req.user.alerts.length; i++)  {
            alerts = [...alerts, ...await getPeopleAlerts(req.user.alerts[i])]
        }
    }
    res.send(alerts);
})

router.post ('/alerts', async (req, res)=>{
    if ( !req.user ){
        res.status(401).send({msg: 'Not logged in'})
    }
    else {
        const {body} = req;
        body.user = req.user.name;
        logTab(body, 'Post request to Alerts');
        const newAlerts = []
        for (let i = 0; i < body.departments.length; i++){
            const department = body.departments[i];
            newAlerts.push(await createAlert(body.text, department, false, body.alerttype, body.status == 'Closed', `${department} - ${body.alerttype}`, '<ion-icon name="clipboard-outline"></ion-icon>', body.user));
        }
        
        res.status(200).send({msg: 'Alert created', newAlerts});
    }
});

module.exports = router;