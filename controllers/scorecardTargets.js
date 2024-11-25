// CRUD
const ScorecardTarget = require('../models/ScorecardTarget')
const moment = require('moment')
const { logErr } = require('./logger')

function createScorecardTarget(data){
    return new Promise( async (resolve, reject)=>{
        try {
            const target = await new ScorecardTarget(data).save()
            resolve(target)
        } catch (error) {
            reject(error)
        }
    })
} 

function readScorecardTarget(query={active: true}, lean=true){
    return new Promise (async (resolve, reject)=>{
        try {
            let targets
            if (lean) targets = await ScorecardTarget.find(query).lean()
            else targets = await ScorecardTarget.find(query)
            resolve(targets)
        } catch (error) {
            reject(error)
        }
    })
}

function updateScorecardTarget(id, data){
    return new Promise( async(resolve, reject)=>{
        try {
            let target = await ScorecardTarget.findByIdAndUpdate(id, data, {new: true, lean: true})
            resolve(target)
        } catch (error) {
            reject(error)
        }
    })
}

function deleteScorecardTarget(id){
    return new Promise(async(resolve, reject)=>{
        try {
            await ScorecardTarget.findByIdAndUpdate(id, {active: false})
            resolve(null)
        } catch (error) {
            reject(error)
        }
    })
}

async function removeDuplicates(businessUnit, kpi, priority, validFrom, idToKeep){
    console.log({
        businessUnit, kpi, priority, validFrom, idToKeep
    });
    
    const targets = await readScorecardTarget({
        businessUnit, kpi, priority,
        validFrom: {$lte: validFrom}, validTo: {$gte: validFrom},
        active: true, _id: {$ne: idToKeep}
    }, true)
    for ( let i = 0; i < targets.length; i++){
        if (targets[i].validFrom === validFrom ) await updateScorecardTarget(targets[i]._id, {active: false})
        else await updateScorecardTarget(targets[i]._id, {validTo: validFrom-1})
    }
    return 'ok'
}

function newTarget({
    businessUnit, kpi, type, min, max, priority, 
    validFrom = moment().format('YYYYMMDD'), validTo = 20591231, 
    strategicArea, unit, decimals}){
        return new Promise ( async(resolve, reject)=>{
            try {
                let textTarget = max.toFixed(decimals) + unit
                if ( unit === '%' ) textTarget = (max*100).toFixed(decimals) + '%'
                if ( unit === 'NPS' ) textTarget = (max < 0 ? '-': '+') + Math.abs(max)
                if ( unit === '#') textTarget = max.toFixed(decimals)

                const data = {
                    businessUnit, kpi, type, min, max,
                    textTarget, priority, validFrom, validTo, 
                    strategicArea, unit, decimals
                }
                const newTarget = await createScorecardTarget(data)
                await removeDuplicates(businessUnit, kpi, priority, validFrom, newTarget._id)
                resolve('OK')
            } catch (error) {
                logErr(error.message)
                reject(error)
            }
        })
}

function updateTarget(id, data){
    return new Promise (async(resolve, reject)=>{
        try {
            const target = await updateScorecardTarget(id, data)
            await removeDuplicates(target.businessUnit, target.kpi, target.priority, target.validFrom, target._id)
            resolve('OK')
            //When updating target, we need to check if there are overlapping target periods
        } catch (error) {
            reject(error)
        }
    })
}


module.exports = {
    readTarget: readScorecardTarget,
    newTarget,
    updateTarget,
    deleteTarget: deleteScorecardTarget,
}