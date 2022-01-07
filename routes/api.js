const router= require('express').Router();
const cors = require('cors')
const {NODE_ENV} = process.env
const User = require('../models/User')

if (NODE_ENV !== 'production'){
    router.use(cors())
} 

const {getOsData} = require('../controllers/getOsData');
const { logErr, logStd } = require('../controllers/logger.js');
const { getPm2Data } = require('../controllers/getPm2.js');

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
        res.send(req.user || {custom_access:[]});
    }
});

module.exports = router;