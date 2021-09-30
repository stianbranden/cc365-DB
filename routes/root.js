const router = require('express').Router();
const {units} = require('../config.js')
const User = require('../models/User');
const {getPhoto} = require('../controllers/config')
const request= require('request-promise');

router.get('/', (req, res)=>{
    //console.log({user: req.user, req});
    res.render('root', {pageTitle: 'nordic'});
});

const favicon = new Buffer.from('AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAA/4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEREQAAAAAAEAAAEAAAAAEAAAABAAAAEAAAAAAQAAAQAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD8HwAA++8AAPf3AADv+wAA7/sAAP//AAD//wAA+98AAP//AAD//wAA//8AAP//AAD//wAA', 'base64'); 
router.get("/favicon.ico", function(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Length', favicon.length);
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader("Cache-Control", "public, max-age=2592000");                // expiers after a month
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
    res.end(favicon);
});

router.get('/getPicture/:upn', async (req, res)=>{
    try {
        let user = await User.findById(req.params.upn);
        let query = {...getPhoto};
        query.headers["Authorization"] = 'Bearer ' + user.access_token;
        let photo = await request(query);
        res.send(photo);
    } catch (error) {
        res.status(400);
    }

});

router.get('/:unit/', (req, res)=>{
    
    let unit = units[req.params.unit];
    let site = null;

    res.render('unit', {pageTitle: unit.key, unit, site})
})

router.get('/:unit/:site', (req, res)=>{
    
    let unit = units[req.params.unit];
    let site = units[req.params.site];

    res.render('unit', {pageTitle: unit.key, unit, site})
})



module.exports = router;