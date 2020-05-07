const router = require('express').Router();
const {units} = require('../config.js')

router.get('/', (req, res)=>{

    res.render('root', {pageTitle: 'nordic'});
});

router.get('/:unit', (req, res)=>{
    
    let unit = units[req.params.unit];

    res.render('unit', {pageTitle: unit.key, unit})
})



module.exports = router;