const {kindly} = require('./config.js');
const request = require('request');

const getTranscript = async function(botId, chatId){
    return new Promise((resolve, reject)=>{
        console.log(kindly, botId);
        let opt = kindly[botId];
        if (opt){
            opt.url = opt.url.replace('${chatid}', chatId);
            request(opt, (e,r,b)=>{
                resolve(b);
            })
        }
        else {
            reject('Config not defined for BotID = ' + botId)
        }
    })
}

module.exports = {
    getTranscript
}