const setGlobalLocalsVariables = (req, res, next)=>{
    res.locals.user = req.user || null
    res.locals.beta = false
    next()
}

const setBeta = (req, res, next)=>{
    res.locals.beta = true;
    next();
}

module.exports = {
    setGlobalLocalsVariables,
    setBeta
}