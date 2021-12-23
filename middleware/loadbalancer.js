const {NODE_ENV} = process.env;
//const {logStd} = require('../controllers/logger');

module.exports = function(req, res, next){
    if ( req.ip === '::ffff:10.7.50.43' || req.ip === '::ffff:10.7.50.44'){
        if (NODE_ENV != 'production'){
            //logStd(`LoadBalancer Request from ${req.ip}`);
        }
        res.status(200).send('Say hello to my little response')
    }
    else {
        next();
    }
    
}