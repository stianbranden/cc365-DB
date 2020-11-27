const router = require('express').Router();
const {units} = require('../config.js')

router.get('/', (req, res)=>{
    //res.set("Content-Security-Policy", "object-src 'self' 'unsafe-eval'");
    res.set("Content-Security-Policy", "script-src https://*.elkjop.com * blob: 'unsafe-eval' 'unsafe-inline'");
    //"script-src * blob:"
    res.render('reporttest', {pageTitle: 'nordic'});
});




module.exports = router;