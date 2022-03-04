// require('dotenv').config();
// require('./connectDB')();

const mongoose = require('mongoose');
const request = require('request-promise');
const moment = require('moment')

const Agent = require('../models/Agent');
const BusinessUnit = require('../models/BusinessUnit')
const PersonAccount = require('../models/PersonAccount');

const {getPersonAccounts, getAbsences} = require('./config');
const {logStd, logErr, logTab} = require('./logger')

const businessUnitId = "5f63f20c-7a0e-4735-bc4b-a1b000b68adf"

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

    // agent: String,
    // employmentNumber: String,
    // trackedBy: String,
    // startDate: String,
    // endDate: String,
    // absenceId: String,
    // absence: String,
    // remaining: Number,
    // balanceIn: Number,
    // accrued: Number,
    // extra: Number,
    // balanceOut: Number,
    // used: Number

    // "TrackedBy": "string",
    // "Period": {
    //   "StartDate": "2022-03-03",
    //   "EndDate": "2022-03-03"
    // },
    // "Remaining": 0,
    // "AbsenceId": "string",
    // "BalanceIn": 0,
    // "Accrued": 0,
    // "Extra": 0,
    // "BalanceOut": 0,
    // "Used": 0



}


// importPersonAccountData(true).then(msg=>logStd(msg))

module.exports = {
    importPersonAccountData,
    getAccountByAgent
}

const Account = mongoose.model('Account', new mongoose.Schema({
    name: String,
    department: String,
    team: String,
    contract: String,
    email: String,
    date: String,
    accountType: String,
    remaining: Number,
    trackedBy: String
}))

const getPersonAccountData = _=>{
    return new Promise(async (resolve, reject)=>{
        const absenceMap = {}
        const absences = JSON.parse(await request({
            ...getAbsences,
            body: JSON.stringify({
                "BusinessUnitId": businessUnitId,
                "Filter": 0
            })
        }));
        //logStd(typeof absences)
        absences.Result.forEach(ab=>{
            absenceMap[ab.Id] = ab.Name
        });
        const table = []
        const agents = await Agent.find({businessUnitName: 'Denmark'});
        for ( let i = 0; i < agents.length; i++){
            const agent = agents[i];
            if ( !agent.contract.includes('[No export]')){
                //if ( agent._id === '57fe2eb8-5b65-48b3-b7d4-a8ff007efe83'){
                const accounts = await getAccountById(agent._id, absenceMap);
                accounts.forEach(account=>{
                    const obj = {
                        name: agent.displayName,
                        //id: agent._id,
                        department: agent.departmentName,
                        team: agent.teamName,
                        contract: agent.contract,
                        email: agent.email,
                        date: moment().format('yyyy-MM-DD'),
                        ...account 
                    }
                    Account.create(obj);
                    table.push(obj);
                })
                
                //}
                
                
                /*
                let query = {
                    ...getPersonAccounts,
                    body: JSON.stringify({
                        "BusinessUnitId": businessUnitId,
                        "PersonId": agent._id,
                        "Date": "2021-12-23"
                    })
                }
                
                if ( agent._id === '57fe2eb8-5b65-48b3-b7d4-a8ff007efe83'){
                    //logTab(query)
                    const accounts = JSON.parse(await request(query)).Result;
                    //logStd(account)
                    accounts.forEach(async account=>{
                        account.absence = absenceMap[account.AbsenceId];
                        if ( account.TrackedBy === 'Minute' ){
                            account.Remaining = account.Remaining/60
                            account.TrackedBy = 'Hour'
                            
                        }
                        table.push({
                            name: agent.displayName,
                            id: agent._id,
                            department: agent.departmentName,
                            team: agent.teamName,
                            contract: agent.contract,
                            email: agent.email,
                            accountType: account.absence,
                            remaining: account.Remaining,
                            trackedBy: account.TrackedBy
                        })
                    })
                    logTab(accounts);
                    //logTab(absenceMap)
                }*/

                
            }
        }
        resolve(table)
    })
    /*Agent.find({businessUnitName: 'Denmark'})
    .then(agents=>{
        agents.forEach(agent=>{
            logStd(agent)
        })
    })
    .catch(err=>{logErr(err)})*/
}

const getAccountById = (id, absenceMap)=>{
    return new Promise(async (resolve, reject)=>{
        try {
            const accounts = JSON.parse(await request({
                ...getPersonAccounts,
                body: JSON.stringify({
                    "BusinessUnitId": businessUnitId,
                    "PersonId": id,
                    "Date": moment().format('yyyy-MM-DD')
                })
            })).Result;
            const arr = []
            for ( let i = 0; i < accounts.length; i++){
                const account = accounts[i];
                account.absence = absenceMap[account.AbsenceId];
                if ( account.TrackedBy === 'Minute' ){
                    account.Remaining = account.Remaining/60
                    account.TrackedBy = 'Hour'
                }
                arr.push({accountType: account.absence, remaining: account.Remaining, trackedBy: account.TrackedBy});
            }
            
            resolve(arr)
            
        } catch (error) {
            reject(error)
        }


    });
}

//getPersonAccountData().then(table => logTab(table, 'Person Accounts'));