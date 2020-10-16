const router = require('express').Router();
const {units} = require('../config.js')


router.get('/:key', (req, res)=>{
    let key = req.params.key;
    res.render('singleCard', {key, pageTitle: 'METRIC'});
});





module.exports = router;