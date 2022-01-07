const router = require('express').Router();
const {getAlerts} = require('../controllers/getAlerts');
const {setBeta} = require('../middleware/setLocals');

//createAlert = async (text = 'Undefined', department, personrelated = false, alerttype = 'Absence', closed = true, title = null, icon=null, author = 'ccc.elkjop.com', date = new Date())=>{

function capitalizeFLetter(str) {
    return str[0].toUpperCase() + str.slice(1);
}

function foundAccess(user, path){
    let hasAccess = false;
    if ( user.custom_access ){
        user.custom_access.forEach(access=>{
            if (access.path == path ) hasAccess=true;
        });
    }
    return hasAccess;
}


router.get('/', setBeta, async (req, res)=>{
    if ( !req.user ){
        res.redirect('/');
    }
    else if (!foundAccess(req.user, '/alerts/root')){
        res.redirect('/')
    } else {

        const alerts = await getAlerts();
        res.render('alerts', {pageTitle: 'nordic', alerts});
    }
});



router.get('/:unit', setBeta, async (req, res)=>{
    const {unit} = req.params;
    if ( unit == 'root' ) return res.redirect('/alerts');

    if ( !req.user ){
        res.redirect('/' + unit);
    } 
    else if (!foundAccess(req.user, '/alerts/' + unit)){
        res.redirect('/' + unit)
    } 
    else {
        const alerts = await getAlerts(capitalizeFLetter(unit));
        res.render('unit-alerts',{pageTitle: unit, alerts, unit, site: null} )
    }
})


module.exports = router;