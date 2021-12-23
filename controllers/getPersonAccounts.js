require('dotenv').config();
require('./connectDB')();

const mongoose = require('mongoose');
const Agent = require('../models/Agent');
const {logStd, logErr, logTab} = require('./logger')
const request = require('request-promise');
const {getPersonAccounts, getAbsences} = require('./config');
const moment = require('moment')
const businessUnitId = "5f63f20c-7a0e-4735-bc4b-a1b000b68adf"

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
    });
}

getPersonAccountData().then(table => logTab(table, 'Person Accounts'));