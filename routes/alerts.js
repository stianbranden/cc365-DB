const router = require('express').Router();
const {getAlerts} = require('../controllers/getAlerts');
const {logTab} = require('../controllers/logger');
const {createAlert} = require('../controllers/createAlert')

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


router.get('/', async (req, res)=>{
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

router.post ('/', async (req, res)=>{
    if ( !req.user ){
        res.status(401).send({msg: 'Not logged in'})
    }
    else {
        const {body} = req;
        body.user = req.user.name;
        logTab(body, 'Post request to Alerts');
        const newAlerts = []
        for (let i = 0; i < body.departments.length; i++){
            const department = body.departments[i];
            newAlerts.push(await createAlert(body.text, department, false, body.alerttype, body.status == 'Closed', `${department} - ${body.alerttype}`, '<ion-icon name="clipboard-outline"></ion-icon>', body.user));
        }
        
        res.status(200).send({msg: 'Alert created', newAlerts});
    }
});

router.get('/:unit', async (req, res)=>{
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