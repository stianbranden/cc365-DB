const router = require('express').Router();
const moment = require('moment')
const {ensureAuth} = require('../middleware/auth');
const {getSchedulesForDepartment, getTeam} = require('../controllers/getTeleoptiData');
const {
    logStd,
    logSys,
    logErr
} = require('../controllers/logger');


router.get('/schedules/:key/', ensureAuth, async (req, res)=>{
    try {
        let {key} = req.params;
        res.send(await getSchedulesForDepartment(key.split('_')[1]));
    } catch (error) {
        res.status(500).send({error});
    }
});


router.get('/schedules/:key/:day', ensureAuth, async (req, res)=>{
    try {
        let {key, day} = req.params;
        res.send(await getSchedulesForDepartment(key.split('_')[1], day));
    } catch (error) {
        res.status(500).send({error});
    }
});

router.get('/:key', ensureAuth,  (req, res)=>{
    let {key} = req.params;
    const day = moment().format('YYYY-MM-DD')
    res.render('team', {key: 'dep_' + key, pageTitle: key, day});
});

router.get('/:key/:day', ensureAuth, (req, res)=>{
    let {key, day} = req.params;
    res.render('team', {key: 'dep_' + key, pageTitle: key, day});
});


module.exports = router;