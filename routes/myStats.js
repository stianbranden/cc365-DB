const router = require('express').Router();
//const {units} = require('../config.js')

router.get('/', (req, res)=>{
    res.render('myStats', {pageTitle: 'nordic'});
});




module.exports = router;