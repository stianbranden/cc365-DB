const morgan = require('morgan')
const Log = require('../models/Log')

module.exports = morgan(function(tokens, req, res){
    const doc = {
        method: tokens.method(req, res),
        status: Number(tokens.status(req, res))||0,
        url: tokens.url(req, res),
        contentLength: Number(tokens.res(req, res, 'content-length'))||0,
        responseTime: Number(tokens['response-time'](req, res))||0
    }
    //logTab(doc)
    const log = new Log(doc)
    log.save()
    return
})


/*tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
      */