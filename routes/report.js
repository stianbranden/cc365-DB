const router = require('express').Router();
const {units} = require('../config.js')

router.get('/', (req, res)=>{
    res.render('reporttest', {pageTitle: 'nordic'});
});




module.exports = router;