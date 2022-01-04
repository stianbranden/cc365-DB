const router= require('express').Router();

router.get('/admin', async (req, res)=>{
    try {
        const osData = await getOsData();
        const pm2Data = await getPm2Data();
        res.send({osData, pm2Data});
    } catch (error) {
        logErr(error.message);
        res.send({});
    }
});

module.exports = router;