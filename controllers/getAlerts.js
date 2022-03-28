const Alert = require('../models/Alert');
const {logStd, logErr} = require('../controllers/logger')
const moment = require('moment')

const getAlerts = async (department = null, sort = -1, not_person_sensitive = false, filter_date = true, date = moment().format('YYYY-MM-DD'))=>{
    const query = {};
    if (not_person_sensitive){
        query.personrelated = false;
    }
    if (filter_date){
        query.date = {$gte: date}
//        new Date(date);
    }
    if ( department == 'Norway' ){
        //likes: { $in: ['vaporizing', 'talking'] }
        query.department =  { $in: ['Loyalty', 'Norway']};
    }
    else if ( department == 'Helpdesk' || department == 'Support') {
        query.department =  { $in: ['Support', 'Helpdesk']};
    }
    else if (department){
        query.department = department;
    } 
    //logStd(JSON.stringify(query));
    return await Alert.find(query).sort({date: sort});
}

const getAlertReportData = (departments = [], startDate, endDate)=>{
    return new Promise( async (resolve, reject)=>{
        const query = {
            personrelated: false,
            date: {$gte: moment(startDate).format('YYYY-MM-DD'), $lte: moment(endDate).format('YYYY-MM-DD')}
        }
        if (departments.length > 0) query.department = {$in: departments}
        try {
            const data = await Alert.find(query).sort({date: 1}).lean()
            resolve(data)
        } catch (error) {
            reject(error)
        }
    })
}


const getPeopleAlerts = async (department = null, sort = -1, filter_date = true, date = moment().format('YYYY-MM-DD'))=>{
    const query = {personrelated: true};

    if (filter_date){
        query.date = {$gte: date}
//        new Date(date);
    }
    if ( department == 'Norway' ){
        //likes: { $in: ['vaporizing', 'talking'] }
        query.department =  { $in: ['Loyalty', 'Norway']};
    }
    else if ( department == 'Helpdesk' || department == 'Support') {
        query.department =  { $in: ['Support', 'Helpdesk']};
    }
    else if (department){
        query.department = department;
    } 
    //logStd(JSON.stringify(query));
    return await Alert.find(query).sort({date: sort});
}

const getRelatedAlert = (alerttype, department)=>{
    return new Promise(async (resolve, reject)=>{
        try {
            const alert = await Alert.findOne({
                alerttype, 
                department,
                closed: false
            });
            resolve(alert)
        } catch (error) {
            reject(error)
        }
    });
}

const getAlertByTextAndDate = (text, date = moment().format('YYYY-MM-DD'))=>{
    return new Promise(async (resolve, reject)=>{
        try {
            const alert = await Alert.findOne({
                text,
                date: {$gte: date}
            });
            resolve(alert);
        } catch (error) {
            logErr(error)
            reject(error);
        }
    })
}

module.exports = {getPeopleAlerts, getAlerts, getRelatedAlert, getAlertByTextAndDate, getAlertReportData}