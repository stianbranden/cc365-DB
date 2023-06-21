//require('dotenv').config();
const req = require('request');
const request= require('request-promise');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const BusinessUnit = require('../models/BusinessUnit');
const Team = require('../models/Team');
const Agent = require('../models/Agent');
const Schedule = require('../models/Schedule');
const Skill = require('../models/Skill');
const Contract = require('../models/Contract');
const Alert = require('../models/Alert')
const {logStd, logErr, logSys} = require('./logger')
const {getAgentWithId, getAllBusinessUnits, getTeams, getAgents, getBusinessUnit, getSkillById, getContractById} = require('./getTeleoptiData');
const {createAlert} = require('./createAlert');
const {getAlertByTextAndDate} = require('./getAlerts')
const {importPersonAccountData} = require('./getPersonAccounts')

const {getBusinessUnits, getAllTeamsWithAgents, getPeopleByTeamId, getSchedulesByPersonIds, getScheduleByTeamId, getUpdatedSchedules, getPersonById, getTeamById, getSkillsByUnit, getAllContracts} = require('./config');

const runScheduleUpdate = _ =>{
    return new Promise(async (resolve, reject)=>{
    try {
        const businessUnits = await getAllBusinessUnits();
        let updatedSchedules = [];
        for ( let j = 0; j < businessUnits.length; j++){
            const unit = businessUnits[j];
            const now = moment().toISOString();
            //logStd(`Running ${unit.name} page 1`);
            let query = updateGetUpdatedSchedulesQuery(getUpdatedSchedules, unit, 1, 100, now );
            const returnData = JSON.parse(await request(query))
            const errors = returnData["Errors"];
            if (errors.length > 0){
                logErr(JSON.stringify(errors));
            }
            let results = returnData["Result"][0];
            //logStd(results)
            updatedSchedules = [...updatedSchedules, ...results["Schedules"]];
            if ( results["TotalPages"] > 1 ){
                logStd(`Running ${unit.name} total of ${results["TotalPages"]} pages`);
                for ( let i = 2; i <= results["TotalPages"]; i++ ){
                    query = updateGetUpdatedSchedulesQuery(getUpdatedSchedules, unit, i, 100, now );
                    updatedSchedules = [...updatedSchedules, ...JSON.parse(await request(query))["Result"][0]["Schedules"]]
                }
            }
            unit.lastScheduleUpdateTime = Date(now);
            await unit.save();
        };
        logStd(`Number of updated schedules: ${updatedSchedules.length}`);

        let newSchedules = []
        for ( let i = 0; i < updatedSchedules.length; i++){
            let schedule = updatedSchedules[i];
            newSchedules.push(await updateOrCreateSchedule(schedule));
        }

        if ( newSchedules.length > 0 ){
            newSchedules.forEach(s=>{
                if (s.date === moment().format('YYYY-MM-DD')){

                //} && s.shift[0].absenceId){
                    let text;
                    let title;
                    let alert = false;
                    let icon; 
                    const {agent} = s
                    const {displayName} = agent;
                    if ( s.shift ){
                        s.shift.forEach(shift=>{
                            if (shift.absenceId){
                                if (alert) {
                                    text += '<br>'
                                } else {
                                    text = `${displayName} is reported with: <br>`
                                }
                                alert = true;
                                title = `${s.agent.displayName} is absent`;
                                icon = null;
                                if ( shift.name.startsWith('Late') ){
                                    title = `${s.agent.displayName} is late`
                                    icon = '<ion-icon name="alarm-sharp"></ion-icon>'
                                }
                                text += `${shift.name} from ${moment(shift.startTime).tz(agent.timeZone).format('HH:mm')} to ${moment(shift.endTime).tz(agent.timeZone).format('HH:mm')} (${moment().tz(agent.timeZone).format('z')})`
                            }
                        })
                    }
                    else {
                        logStd(`${agent} has no shift`)
                    }
                    

                    if (alert){
                        //Check if alert already has been created
                        getAlertByTextAndDate(text)
                            .then(a=>{
                                if (!a){
                                    createAlert(text,s.agent.departmentName, true, 'Absence', true, title, icon);
                                }
                            });

                    }

                    
                    /*
                    Alert.create({
                        personrelated: true, 
                        alerttype: 'Absence',
                        text: `${s.agent.displayName} is reported with ${s.shift[0].name} from ${moment(s.shift[0].startTime).format('HH:mm')} to ${moment(s.shift[0].endTime).format('HH:mm')}`,
                        department: s.agent.departmentName
                    });*/
                }
            });
        }
        
        resolve(newSchedules);
        
    } catch (error) {
        reject(error);
        logErr(error, false);
    }})
}

const updateGetUpdatedSchedulesQuery = (query, unit, page = 1, pageSize = 10, now)=>{
    query.body = JSON.stringify({
        "ChangesFrom": moment(unit.lastScheduleUpdateTime).toISOString(),
        "ChangesTo": now,
        "Page": page,
        "PageSize": pageSize,
        "BusinessUnitId": unit.businessUnitId
    })
    //console.log('UpdateScheduleBody', query.body);
    return query;
}

const getTodaysTeleoptiData = async (options = {
        dropScheduleCollection: false
    })=>{
    return new Promise(async (resolve, reject)=>{
        try { //Dropping what needs to be dropped
            if (options.dropScheduleCollection){
                await mongoose.connection.dropCollection('schedules')
                logStd('Schedule collection dropped');
                await Alert.remove({personrelated: true});
                logStd('People alerts dropped');
            }
        } catch (error) {
            if (error.codeName === 'NamespaceNotFound'){
                logStd('Could not find collection to drop');
            }
            else {
                logErr('Error found: ' + error.codeName);
            }
        }
    
        try {
            
            const units = JSON.parse(await request(getBusinessUnits))["Result"]
            let schedulePromises = [];
            for ( let m = 0; m < units.length; m++){
                let unit = units[m]
                if (unit.Name != 'Default'){
                    const businessUnit = await updateOrCreateBusinessUnit(unit);
                    const skillsQuery = await updateGetSkillsQuery(getSkillsByUnit, businessUnit);
                    const skills = JSON.parse(await request(skillsQuery))["Result"];
                    const contractQuery = await updateGetAllContractsQuery(getAllContracts, businessUnit)
                    const contracts = JSON.parse(await request(contractQuery))["Result"];
                    
                    
                    skills.forEach(skill=>{
                        updateOrCreateSkill(skill)
                    })

                    contracts.forEach(contract=>{
                        updateOrCreateContract(contract);
                    })

                    const teamsQuery = updateGetTeamQuery(getAllTeamsWithAgents, businessUnit);
                    const teams = JSON.parse(await request(teamsQuery))["Result"];
                    
                    for (let l = 0; l < teams.length; l++){
                        let t = teams[l];
                        const team = await updateOrCreateTeam(t, businessUnit);
                        if (team.departmentName !== 'Default EDI'){

                            const peopleQuery = updateGetPeopleQuery(getPeopleByTeamId, team);
                            const people = JSON.parse(await request(peopleQuery))["Result"];
                            for ( let j = 0; j < people.length; j++){
                                let person = people[j]
                                /*if (j === 0){
                                    console.log(person);
                                }*/
                                const agent = await updateOrCreateAgent(person, team);
                            };
                            const scheduleQuery = updateGetScheduleByTeamId(getScheduleByTeamId, team);
                            const rawSchedules = JSON.parse(await request(scheduleQuery))["Result"];
                            schedulePromises = [...schedulePromises, ...rawSchedules.map(personDay=>updateOrCreateSchedule(personDay))];
                        }
                    };
                    
                }
            };
            Promise.allSettled(schedulePromises)
            .then(data=>{
                importPersonAccountData(options.dropScheduleCollection)
                    .then(_=>logSys('PersonAccounts imported'))
                    .catch(err=>logErr('PersonAccounts import failed, ' + err))
                resolve({status: 'completed'})
            })
            .catch(err=>{logErr(err)});
            /*resolve({
                status: 'Completed'
            });*/
        } catch (error) {
            reject(error);
            logErr(error);
        } finally {
            getAllBusinessUnits().then(units=> logStd(`Number of Business units in storage: ${units.length}`));
            getTeams().then(teams=> logStd(`Number of teams in storage: ${teams.length}`));
            getAgents().then(agents=>logStd(`Number of agents in storage: ${agents.length}`));
        }
    })


    
}

const updateOrCreateContract = contract =>{
    return new Promise(async (resolve, reject)=>{
        try {
            let ct = await Contract.findOne({contractId: contract.Id});
            if (ct){
                Contract.findByIdAndUpdate(ct._id, {
                    name: contract.Name
                });
            }
            else {
                ct = await Contract.create({
                    contractId: contract.Id,
                    name: contract.Name
                })
            }
            resolve(ct)
        } catch (error) {
            logErr(`Failed to get Skill: ${contract.Id}`);
            reject (error);
        }
    });
}

const updateOrCreateSkill = skill => {
    return new Promise(async (resolve, reject)=>{
        try {
            let sk = await Skill.findOne({skillId: skill.Id});
            if (sk){
                Skill.findByIdAndUpdate(sk._id, {
                    name: skill.Name
                });
            }
            else {
                sk = await Skill.create({
                    skillId: skill.Id,
                    name: skill.Name
                })
            }
            resolve(sk)
        } catch (error) {
            logErr(`Failed to get Skill: ${skill.Id}`);
            reject (error);
        }
    });
}

const getSingleTeam = (teamId, businessUnitId)=>{
    return new Promise(async (resolve, reject)=>{
        try {
            const res = await request({
                ...getTeamById,
                body: JSON.stringify({
                    BusinessUnitId: businessUnitId,
                    Id: teamId
                })
            });
            const team = res["Result"][0];
            if (!team){
                reject(`Team not found, team ${teamId}, buId ${businessUnitId}`)
            }else{
                const savedTeam = await updateOrCreateTeam(team, await getBusinessUnit(businessUnitId));
                resolve(savedTeam);
            }
        } catch (error) {
            logErr(error);
            reject(`Something went wrong with GetSingelTeam, team ${teamId}, buId ${businessUnitId}`)
        }
    });
}

const getSingleAgent = (agentId, date = moment().format('YYYY-MM-DD')) =>{
    return new Promise(async (resolve, reject)=>{
        try {
            const res = await request({
                ...getPersonById, body: JSON.stringify({
                    PersonId: agentId,
                    Date: date
                })
            });
            if ( !res["Result"] ){
                logErr(JSON.stringify(res));
                logErr(res.result);
                logErr(Object.keys(res));
                reject ('Agent returned from GetPersonById did not contain a Result node');
            }
            else {
                const person = res["Result"][0];
                if ( person ){
                    let team = await Team.findOne({teamId: person.TeamId});
                    if ( !team ){
                        logSys(`Fetching one team with ID ${person.TeamId} and buid ${person.BusinessUnitId}`)
                        logSys(`${person}`)
                        team = await getSingleTeam(person.TeamId, person.BusinessUnitId)
                    }
                    resolve(await updateOrCreateAgent(person, team));
                }
                else {
                    reject(`No agent found with id ${agentId} and date ${date}`)
                }
            }
        } catch (error) {
            logErr(`Failed to get user: ${agentId} and date ${date}`);
            reject (error);
        }
    });
}

const updateOrCreateSchedule = (personDay)=>{
    return new Promise(async (resolve, reject)=>{
        try {
            let agent = await getAgentWithId(personDay.PersonId);
            if (!agent){
                agent = await getSingleAgent(personDay.PersonId, personDay.Date)
            }
            let schedule = await Schedule.findOne({agentId: personDay.PersonId, date: personDay.Date});
            if (schedule){
    
                schedule = await Schedule.findByIdAndUpdate(schedule._id, {
                    ...createScheduleObject(personDay, agent),
                    agent
                }, {new: true});
                
            } else {
                schedule = await Schedule.create({
                    agentId: personDay.PersonId,
                    date: personDay.Date,
                    ...createScheduleObject(personDay, agent),
                    agent
                });
            }
            resolve(schedule);
        } catch (error) {
            logErr(`Failed on ${personDay.PersonId} @ ${personDay.Date}`);
            reject(error);
        }
    })
}

const createScheduleObject = (personDay, agent) =>{
    let scheduleObject = {
        shift: null,
        dayOff: null
    }
    if (personDay.DayOff){
        scheduleObject.dayOff = {
            name: personDay.DayOff.Name,
            displayColorHex: personDay.DayOff.DisplayColorHex
        }
    }
    else {
        scheduleObject.shift = [];
        for (let i = 0; i < personDay.Shift.length; i++){
            let s = personDay.Shift[i];
            const {StartTime, EndTime} = s["Period"];
            let lengthOfShift = -moment(StartTime).diff(moment(EndTime), 'minutes');
            let offset = moment(StartTime).tz(agent.timeZone).hour()*60 + moment(StartTime).minute()
            let obj = {
                name: s.Name,
                activityId: s.ActivityId,
                absenceId: s.AbsenceId,
                displayColorHex: s.DisplayColorHex,
                overtime: s.Overtime,
                startTime: moment(StartTime).tz(agent.timeZone).format(),
                endTime: moment(EndTime).tz(agent.timeZone).format(),
                lengthOfShift,
                offset
            }
            scheduleObject.shift.push(obj)
        }
    }
    return scheduleObject;
}


const updateGetAllContractsQuery = (query, unit) => {
    query.body = JSON.stringify({
        'BusinessUnitId': unit.businessUnitId
    });
    return query;
}

const updateGetSkillsQuery = (query, unit) =>{
    query.body = JSON.stringify({
        'BusinessUnitId': unit.businessUnitId
    });
    return query;
}

const updateGetScheduleByTeamId = (query, team, date = moment().format('YYYY-MM-DD'))=>{
        query.body = JSON.stringify({
        "BusinessUnitId": team.businessUnitId,
        "TeamId": team.teamId,
        "Period": {
            "StartDate": date,
            "EndDate": date
        }
    });
    return query;
}

const updateGetScheduleByIdsQuery = (query, agents, date = moment().format('YYYY-MM-DD'))=>{
    let agentIds = [];
    agents.forEach(agent=>{
        agentIds.push(agent.personId);
    });
    query.body = JSON.stringify({
        "PersonIds": agentIds,
        "Period": {
          "StartDate": date,
          "EndDate": date
        }
      });
    return query;
}

const updateOrCreateAgent = (person, team)=>{

    return new Promise(async (resolve, reject)=>{
        try {
            let agent = await Agent.findById(person.Id);

            const skills = []
            for ( let i = 0; i < person.PersonSkills.length; i++){
                let id = person.PersonSkills[i].SkillId;
                try {
                    let skill = await getSkillById(id);
                    skills.push(skill.name)
                } catch (error) {
                    skills.push('n/a')
                }
            }
            
            const contract = (await getContractById(person.ContractId)).name
            
            let countryAbbr = 'NO';
            const contractCountry = contract.substring(contract.indexOf('[')+1, contract.indexOf(']'))
            //console.log(contract, contractCountry)

            switch(contractCountry) {
                case 'Denmark': 
                    countryAbbr = 'DK'
                    break;
                case 'Finland': 
                    countryAbbr =  'FI' 
                    break;
            } 
            switch(team.businessUnitName) {
                case 'Denmark': 
                    countryAbbr = 'DK'
                    break;
                case 'Finland': 
                    countryAbbr =  'FI' 
                    break;
            } 
            const timeZone = moment.tz.zonesForCountry(countryAbbr||'NO')[0];
           
            if (agent){
                agent = await Agent.findByIdAndUpdate(person.Id, {
                    email: person.Email || 'hasnoemail@elkjop.no',
                    displayName: person.DisplayName,
                    businessUnitName: team.businessUnitName,
                    businessUnitId: team.businessUnitId,
                    departmentName: team.departmentName,
                    teamName: team.name,
                    teamId: team.teamId,
                    timeZone,
                    skills,
                    contract,
                    employmentNumber: person.EmploymentNumber.substring(person.EmploymentNumber.length- 6)
                }, {new: true})
                
            }
            else {
                agent = await Agent.create({
                    displayName: person.DisplayName,
                    _id: person.Id,
                    email: person.Email || 'hasnoemail@elkjop.no',
                    businessUnitName: team.businessUnitName,
                    businessUnitId: team.businessUnitId,
                    departmentName: team.departmentName,
                    teamName: team.name,
                    teamId: team.teamId,
                    timeZone,
                    skills,
                    contract,
                    employmentNumber: person.EmploymentNumber
                });
            }
            resolve(agent);
        } catch (error) {
            logErr('Error on ' + person.DisplayName);
            reject(error);
        }
    })
    
    
}

const updateGetPeopleQuery = (query, team)=>{
    query.body = JSON.stringify({
        TeamId: team.teamId,
        Date: moment().format('YYYY-MM-DD')
    })
    return query;
}

const updateGetTeamQuery = (query, unit) =>{
    query.body = JSON.stringify({
        'BusinessUnitId': unit.businessUnitId,
        'Period': {
            'StartDate': moment().format('YYYY-MM-DD'),
            'EndDate': moment().format('YYYY-MM-DD')
        }
    });
    return query;
}

const updateOrCreateBusinessUnit = async teleoptiUnit => {
    let businessUnit = await BusinessUnit.findOne({'businessUnitId': teleoptiUnit.Id});
    if (businessUnit){
        businessUnit.name = teleoptiUnit.Name;
        businessUnit.lastScheduleUpdateTime = Date.now();


        await businessUnit.save();
    }
    else {
        businessUnit = await BusinessUnit.create({
            businessUnitId: teleoptiUnit.Id,
            name: teleoptiUnit.Name
        });
    }
    return businessUnit;
}

const updateOrCreateTeam = async (teleoptiTeam, businessUnit)=>{
    let team = await Team.findOne({teamId: teleoptiTeam.Id});
    if ( team ){
        team.name = teleoptiTeam.Name.split('/')[1];
        let depname = teleoptiTeam.Name.split('/')[0];
        if (businessUnit.name === 'Finland' && team.name === 'B2B') depname = 'Finland B2B';
        else if (businessUnit.name === 'Finland') depname = 'Finland';
        team.departmentName = depname;
        await team.save();
    }
    else {
        let depname = teleoptiTeam.Name.split('/')[0];
        if (businessUnit.name === 'Finland' && teleoptiTeam.Name.split('/')[1] === 'B2B') depname = 'Finland B2B';
        else if (businessUnit.name === 'Finland') depname = 'Finland';
        //team.departmentName = depname;
        team = await Team.create({
            teamId: teleoptiTeam.Id,
            name: teleoptiTeam.Name.split('/')[1],
            departmentName: depname,
            businessUnitName: businessUnit.name,
            businessUnitId: businessUnit.businessUnitId
        })
    }
    return team;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    getTodaysTeleoptiData,
    runScheduleUpdate
}
