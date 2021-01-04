const router = require('express').Router();
const {getTranscript} = require('../controllers/chatTranscripts.js');
const fs = require('fs');


router.get('/:botid/:chatid', async (req, res)=>{ //handlde chat requests
    //let key = 'ChatTranscripts';
    let pageTitle = 'Chat Transcripts';
    let {botid, chatid} = req.params;
    let doc = await getTranscript(botid, chatid);
    //fs.writeFileSync('./tmp/' + chatid + '.json', doc, 'utf8');
    res.render('chat', {pageTitle, chatData: JSON.parse(doc)});
});




module.exports = router;