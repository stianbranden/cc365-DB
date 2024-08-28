const axios = require('axios')
const FormData = require('form-data');
const {Calibration, ContactCalibration} = require('../models/Calibration')
const {generateReport, getReportData} = require('./config')
const authCalabrio = require('./authCalabrio');
const { logErr } = require('./logger');

function createCalibration({name, gauge}){
    return new Promise(async (resolve, reject)=>{
        try {
            const record = await Calibration.findOne({name})
            if ( record ) 
                reject({message: 'Calibration name must be unique'})
            else {
                const calibration = await new Calibration({name, gauge}).save()
                resolve(calibration.toJSON())
            }
        } catch (error) {
            reject(error)
        }
    })
}

function readCalibration(_id){
    return new Promise(async (resolve, reject)=>{
        try {
            const calibration = await Calibration.findById(_id).lean()
            if (calibration)
                resolve(calibration)
            else
                reject({message: 'Could not find calibration'})
        } catch (error) {
            reject(error)
        }
    })
}

function listCalibrations(searchObj={}){
    return new Promise(async (resolve, reject)=>{
        try {
            searchObj.deleted = false
            const calibrations = await Calibration.find(searchObj).sort({updatedAt: -1}).lean()
            if (calibrations)
                resolve(calibrations)
            else
                reject({message: 'No calibrations found'})
        } catch (error) {
            logErr(error)
            reject(error)
        }
    })
}

function updateCalibration(_id, updateObj){
    return new Promise(async (resolve, reject)=>{
        try {
            const calibration = await Calibration.findById(_id)
            if (calibration){
                const keys = updateObj.keys()
                for (let i = 0; i < keys.length; i++){
                    const key = keys[i]
                    calibration[key] = updateObj[key]
                }
                resolve((await calibration.save()).toJSON())
            }
            else
                reject({message: 'Could not find calibration'})
        } catch (error) {
            reject(error)
        }
    })
}

function deleteCalibration(_id){
    return new Promise(async (resolve, reject)=>{
        try {
            const calibration = await Calibration.findById(_id)
            if (calibration){
                for ( let i = 0; i < calibration.contacts.length; i++){
                    const contactId = calibration.contacts[i]
                    // await ContactCalibration.findByIdAndUpdate(contactId, {calibration: null})
                    await removeContactFromSession(contactId, _id)
                }
                await Calibration.findByIdAndUpdate(_id, {deleted: true, name: _id, contacts: []})

                resolve({})
            }
            else
                reject({message: 'Could not find calibration'})
        } catch (error) {
            reject(error)
        }
    })
}

function readContactCalibration(_id){
    return new Promise(async (resolve, reject)=>{
        try {
            const contact = await ContactCalibration.findById(_id).lean()
            if (contact)
                resolve(contact)
            else
                reject({message: 'Could not find contact'})
        } catch (error) {
            reject(error)
        }
    })
}

//helpers

function assignContactToSession(contactId, sessionId){
    return new Promise(async (resolve, reject)=>{
        try {
            const contact = await ContactCalibration.findById(contactId)
            const session = await Calibration.findById(sessionId)
            if ( !contact ) return reject({message: 'Can not find contact'})
            if ( !session ) return reject({message: 'Can not find calibration session'})
            if ( contact.calibration ) return reject({message: 'Contact has already bin assigned to a calibration session'})
            session.contacts.push(contactId)
            contact.calibration = session.name
            contact.gaugeSet = true
            await session.save()
            await contact.save()
            await getCalibrationResults(contactId)
            resolve(session.toJSON())
        } catch (error) {
            reject(error)
        }
    })
}
function removeContactFromSession(contactId, sessionId){
    return new Promise(async (resolve, reject)=>{
        try {
            const contact = await ContactCalibration.findById(contactId)
            const session = await Calibration.findById(sessionId)
            if ( !contact ) return reject({message: 'Can not find contact'})
            if ( !session ) return reject({message: 'Can not find calibration session'})
                // if ( contact.calibration ) return reject({message: 'Contact has already bin assigned to a calibration session'})
            
            session.contacts.splice(session.contacts.indexOf(contactId), 1)
            console.log(session.contacts);
            contact.calibration = null
            contact.gaugeSet = false
            await session.save()
            await contact.save()
            resolve(session.toJSON())
        } catch (error) {
            reject(error)
        }
    })
}

function getContactsWithoutSession(){
    return new Promise(async (resolve, reject)=>{
        try {
            const contacts = await ContactCalibration.find({calibration: null}).lean()
            resolve(contacts)
        } catch (error) {
            reject(error)
        }
    })
}

function getEvaluatorsFromCSV(lines, gauge, colStart){
    const evaluators = []
    const fields = lines[4].split(',')
    // const colStart = fields.indexOf('Called Number')

    //We need to be able to account for a variable distance betwwen evaluators...
    const columns = [colStart+11]
    for ( let i = columns[0]+1; i < fields.length; i++){
        if (fields[i]) columns.push(i)
    }
    console.log('Columns found: ' + columns );
    

    // for (let i=colStart+11; i < fields.length; i = i+3){
    for ( let ind in columns){
        const i = columns[ind]
        const name = fields[i]
        console.log({i, name});
        
        const isGauge = name === gauge
        //Need to create an array over line numbers for each question
        const questions = getQuestionLineNumberArray(lines)
        const scores = []
        for ( let qLineNumber in questions){
            const j = questions[qLineNumber]
            const scoreFields = lines[j].split(',')
            for ( let k = 0; k < 3; k++){
                const score = scoreFields[i+k]
                if (typeof score === 'string' && score.length > 0 && !isNaN(Number(score))) {
                    // console.log(score, typeof score)
                    scores.push(Number(score))
                    break
                }

            }
        }

        // for (let j = 0; j < lines.length; j++){
        //     const score = lines[j].split(',')[i+2]
        //     if (typeof score === 'string' && score.length > 0 && !isNaN(Number(score))) {
        //         // console.log(score, typeof score)
        //         scores.push(Number(score))
        //     }
        // }

        const comments = []
        lines.forEach((line, index)=>{
            const f = line.split(',')
            if ( f[1] === 'Form Comments'){
                for ( let j = index+1; j< lines.length-1; j++){
                    const comName = lines[j].split(',')[1]
                    if (comName.length && comName === name ){
                        for ( let k = j; k < lines.length-2; k++){
                            const comLine = lines[k].split(',')
                            let comment = comLine[5]
                            if (comment.startsWith('"')){
                                const full = lines.join('')
                                const start = full.indexOf(comment)
                                const lastPart = full.slice(start)
                                comment = lastPart.slice(1, lastPart.indexOf('",'))
                                // console.log({start, lastPart, comment});
                                
                            }
                            const commentName = comLine[1]
                            
                            if ( comment && comment.length && (commentName.length === 0 || commentName === name)) {
                                // console.log({k, comment, commentName, name});
                                comments.push(comment)
                            }
                            if ( commentName.length > 0 && commentName != name){
                                // console.log({k, line: lines[k], comment, commentName, comNameL: commentName?.length, name, break: 'yes'});
                                break; 
                            }
                            else
                            {
                                // console.log({k, line: lines[k], comment, commentName, comNameL: commentName?.length, name, break: 'no'});
                                
                            } 
                        }
                    }
                }
            }
        })

        if (name) evaluators.push({evaluator: name, isGauge, scores, comments})
    }
    const g = evaluators.filter(a=>a.isGauge)[0]
    if ( g ){
        evaluators.filter(a=>!a.isGauge).forEach(e=>{
            const a = []
            e.scores.forEach((s,i)=>{
                if ( s === g.scores[i]) a.push(1)
                else a.push(0)
            })
            e.accuracy = a
        })
    }

    return evaluators
}

function getQuestionsFromCSV(lines, colStart){
    const sections = []
    for (let i = 0; i<lines.length; i++){
        const fields = lines[i].split(',')
        if ( fields[1] === 'Section:'){
            const section = {
                name: fields[3],
                question: []
            }
            for (let j= i+2; j<lines.length; j++){
                const fields2 = lines[j].split(',')
                if ( fields2[1].length && fields2[1] !== 'Form Comments' ){
                    section.question.push({
                        name: fields2[1],
                        kpi: fields2[colStart+4] === 'Y',
                        weight: fields2[colStart+1],
                        possible_score: fields2[colStart+10]
                    })
                }
                else break
            }
            sections.push(section)
        }
    }
    return sections
}

function getQuestionLineNumberArray(lines){
    const questions = []
    for ( let i = 0; i < lines.length; i++) {
        const f = lines[i].split(',')[1]
        if ( f === 'Section:'){
            for ( let j = i+2; j < lines.length; j++){
                const fields2 = lines[j].split(',')
                if ( fields2[1].length && fields2[1] !== 'Form Comments' ){
                    questions.push(j)
                }
                else break
            }
        }
    }
    return questions
}

function getCSVReport({paramString, collation, signature, contactId, sessionId}){
    let param = '{"paramString":"report=report_evaluation_calibration&param_contact={contactId}&param_decimal_precision=2&param_output_format=csv&Pref=&LocaleLanguage=en&tz=Europe\\/Stockholm&tenantId=67","collation":"{collation}","signature":"{signature}","param_contact":"{contactId}", "param_decimal_precision":"2","param_output_format":"csv","Pref":"",   "LocaleLanguage":"en","tz":"Europe/Stockholm","tenantId":"67","report":"report_evaluation_calibration"}'
    param = param.replace(/{collation}/g, collation).replace(/{signature}/g, signature).replace(/{contactId}/g, contactId)
    return new Promise (async(resolve, reject)=>{
        try {
            let data = new FormData();
            data.append('reportParams', param);
            const reportQuery = {...getReportData,
                headers: {
                    cookie: "hazelcast.sessionId=" + sessionId,
                    ...data.getHeaders()
                },
                data
            }
            // console.log(reportQuery);
            const output = (await axios(reportQuery)).data
            const contact = await ContactCalibration.findById(contactId)
            const session = await Calibration.findOne({name: contact.calibration})
            const lines = output.split('\n')
            const colAdjustment = lines[4].split(',').indexOf('Called Number')
            const evaluation = getEvaluatorsFromCSV(lines, session.gauge, colAdjustment)
            const section = getQuestionsFromCSV(lines, colAdjustment)

            // console.log({evaluation, section})
            contact.evaluation = evaluation
            contact.section = section
            await contact.save()
            resolve(output)
        } catch (error) {
            console.error(error);
            reject(error)
        }
    })
}

function getCalibrationResults(contactId){
    return new Promise(async (resolve, reject)=>{
        try {
            const {sessionId} = (await authCalabrio()).data
            const reportQuery = {...generateReport}
            reportQuery.headers["cookie"] =  "hazelcast.sessionId=" + sessionId
            reportQuery.data = reportQuery.data.replace('{contactId}', contactId)
            const {paramString, collation, signature} = (await axios(reportQuery)).data
            // console.log({paramString, collation, signature} );
            await getCSVReport({paramString, collation, signature, contactId, sessionId})
            resolve('OK')
        } catch (error) {
            console.log(error);
            
            reject(error)
        }
    })
}

function readContactsOnCalibration(sessionId){
    return new Promise(async (resolve, reject)=>{
        try {
            const session = await Calibration.findById(sessionId).lean()
            const contacts = await ContactCalibration.find({calibration: session.name}).lean()
            // if (contacts.length)
                resolve(contacts)
    //         else
    //         reject({message: 'Could not find contacts on session'})
    } catch (error) {
        reject(error)
    }
})
}

function editSessionComment(sessionId, comment){
    return new Promise (async (resolve, reject)=>{
        try {
            const session = await Calibration.findById(sessionId)
            session.comment = comment
            await session.save()
            resolve('ok')
        } catch (error) {
            reject(error)
        }
    })
}
function editContactComment(contactId, comment){
    return new Promise (async (resolve, reject)=>{
        try {
            const contact = await ContactCalibration.findById(contactId)
            contact.comment = comment
            await contact.save()
            resolve('ok')
        } catch (error) {
            reject(error)
        }
    })
}

module.exports ={
    createCalibration,
    readCalibration,
    listCalibrations,
    updateCalibration,
    deleteCalibration,
    readContactCalibration,
    assignContactToSession,
    removeContactFromSession,
    getContactsWithoutSession,
    getCalibrationResults,
    readContactsOnCalibration,
    editSessionComment,
    editContactComment
}