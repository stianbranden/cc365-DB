const router = require('express').Router();
const {getSingleContact} = require('../controllers/queues'); 


router.get('/:key/:value', async (req, res)=>{
    const {key, value} = req.params;
    let ret = await getSingleContact(key, value);
    res.send(ret);
});




module.exports = router;