const router = require('express').Router();
const {getTranscript} = require('../controllers/chatTranscripts.js');


router.get('/:botid/:chatid', async (req, res)=>{ //handlde chat requests
    let key = 'ChatTranscripts';
    let pageTitle = 'Chat Transcripts';
    let {botid, chatid} = req.params;
    let doc = await getTranscript(botid, chatid);
    res.render('chat', {key, pageTitle, chatData: JSON.parse(doc)});
});




module.exports = router;