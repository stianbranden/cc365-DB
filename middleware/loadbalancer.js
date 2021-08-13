const {NODE_ENV} = process.env;
const {logStd,logSys,logErr} = require('../controllers/logger');

module.exports = function(req, res, next){
    if (NODE_ENV != 'production'){
        logStd(`LoadBalancer Request from ${req.ip}`);
    }
    next();
}