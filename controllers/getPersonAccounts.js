// require('dotenv').config();
// require('./connectDB')();

const mongoose = require('mongoose');
const request = require('request-promise');
const moment = require('moment')

const Agent = require('../models/Agent');
const BusinessUnit = require('../models/BusinessUnit')
const PersonAccount = require('../models/PersonAccount');

const {getPersonAccounts, getAbsences} = require('./config');
const {logErr} = require('./logger')


const importPersonAccountData = (purge = false)=>{
    return new Promise( async (resolve, reject)=>{
        try {
            if (purge) await mongoose.connection.dropCollection('personaccounts')
            const businessUnits = await BusinessUnit.find().lean()
            for ( let i = 0; i < businessUnits.length; i++ ){
                const businessUnitId = businessUnits[i].businessUnitId

                const absenceMap = await createAbsenceMap(businessUnitId)
                const agents = await Agent.find({businessUnitId}).lean()
                agents.forEach(agent=>{
                    getAccountByAgent(agent, absenceMap)
                })
            }
            resolve('OK')
        } catch (error) {
            reject(error)
        }


    })
}

const createAbsenceMap = businessUnitId =>{
    return new Promise( async (resolve, reject)=>{
        try {
            const absences = JSON.parse(await request({
                ...getAbsences,
                body: JSON.stringify({
                    "BusinessUnitId": businessUnitId,
                    "Filter": 0
                })
            })).Result
            const absenceMap = {}
            absences.forEach(a=>absenceMap[a.Id] = a.Name)
            resolve(absenceMap)
        } catch (error) {
            reject(error)
        }
    })
}



const getAccountByAgent = async (agent, absenceMap)=>{
    try {
        if ( !absenceMap ) absenceMap = await createAbsenceMap(agent.businessUnitId)
        if (agent.employmentNumber && agent.employmentNumber.length > 4){
            const accounts = JSON.parse(await request({
                ...getPersonAccounts,
                body: JSON.stringify({
                    "BusinessUnitId": agent.businessUnitId,
                    "PersonId": agent._id,
                    "Date": moment().format('yyyy-MM-DD')
                })
            })).Result;
            accounts.forEach(async account=>{
                const data = {
                    agent: agent.displayName,
                    trackedBy: account.TrackedBy,
                    startDate: moment(account.Period.startDate).format('DD.MM.YYYY'),
                    endDate: moment(account.Period.endDate).format('DD.MM.YYYY'),
                    absence: absenceMap[account.AbsenceId],
                    remaining: account.Remaining,
                    balanceIn: account.BalanceIn,
                    accrued: account.Accrued,
                    extra: account.Extra,
                    balanceOut: account.BalanceOut,
                    used: account.Used,
                    businessUnitName: agent.businessUnitName,
                    businessUnitId: agent.businessUnitId,
                    departmentName: agent.departmentName,
                    teamName: agent.teamName
                }
    
    
                let personAccount = await PersonAccount.findOne({
                    employmentNumber: agent.employmentNumber,
                    absenceId: account.AbsenceId
                })
                if ( personAccount ){
                    await PersonAccount.findByIdAndUpdate(personAccount._id, {
                        ...data
                    })
                } else {
                    await PersonAccount.create({
                        ...data,
                        employmentNumber: agent.employmentNumber,
                        absenceId: account.AbsenceId
                    })
                }
            })
    
        }
        
    } catch (error) {
        logErr(error)
    }
}


module.exports = {
    importPersonAccountData,
    getAccountByAgent
}