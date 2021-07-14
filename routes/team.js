const router = require('express').Router();
const moment = require('moment')
const {ensureAuth} = require('../middleware/auth');
const {getSchedulesForTeam, getTeam} = require('../controllers/getTeleoptiData');
const {
    logStd,
    logSys,
    logErr
} = require('../controllers/logger');


router.get('/schedules/:key/', ensureAuth, async (req, res)=>{
    try {
        let {key} = req.params;
        res.send(await getSchedulesForTeam(key));
    } catch (error) {
        res.status(500).send({error});
    }
});


router.get('/schedules/:key/:day', ensureAuth, async (req, res)=>{
    try {
        let {key, day} = req.params;
        res.send(await getSchedulesForTeam(key, day));
    } catch (error) {
        res.status(500).send({error});
    }
});

router.get('/:key', ensureAuth,  async (req, res)=>{
    let {key} = req.params;
    const team = await getTeam(key);
    const day = moment().format('YYYY-MM-DD')
    if (!team){
        res.status(400)
    }
    logStd(JSON.stringify(team))
    res.render('team', {key, pageTitle: team.name, day});
});

router.get('/:key/:day', ensureAuth,  async (req, res)=>{
    let {key, day} = req.params;
    const team = await getTeam(key);
//    const day = moment().format('YYYY-MM-DD')

    if (!team){
        res.status(400)
    }
    logStd(JSON.stringify(team))
    res.render('team', {key, pageTitle: team.name, day});
});


module.exports = router;