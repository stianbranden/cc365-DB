//require('dotenv').config();
const req = require('request');
const request= require('request-promise');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const BusinessUnit = require('../models/BusinessUnit');
const Team = require('../models/Team');
const Agent = require('../models/Agent');
const Schedule = require('../models/Schedule');
const {logStd, logErr, logSys} = require('./logger')
const {getAgentWithId, getAllBusinessUnits, getTeams, getAgents, getBusinessUnit} = require('./getTeleoptiData');

const {getBusinessUnits, getAllTeamsWithAgents, getPeopleByTeamId, getSchedulesByPersonIds, getScheduleByTeamId, getUpdatedSchedules, getPersonById, getTeamById} = require('./config');

const runScheduleUpdate = _ =>{
    return new Promise(async (resolve, reject)=>{
    try {
        const businessUnits = await getAllBusinessUnits();
        let updatedSchedules = [];
        for ( let j = 0; j < businessUnits.length; j++){
            const unit = businessUnits[j];
            const now = moment().format();
            //logStd(`Running ${unit.name} page 1`);
            let query = updateGetUpdatedSchedulesQuery(getUpdatedSchedules, unit, 1, 100, now );
            let results = JSON.parse(await request(query))["Result"][0];
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
        
        resolve(newSchedules);
        
    } catch (error) {
        reject(error);
        //logErr(error, false);
    }})
}

const updateGetUpdatedSchedulesQuery = (query, unit, page = 1, pageSize = 10, now)=>{
    query.body = JSON.stringify({
        "ChangesFrom": moment(unit.lastScheduleUpdateTime).format(),
        "ChangesTo": now,
        "Page": page,
        "PageSize": pageSize,
        "BusinessUnitId": unit.businessUnitId
    })
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
                    const teamsQuery = updateGetTeamQuery(getAllTeamsWithAgents, businessUnit);
                    const teams = JSON.parse(await request(teamsQuery))["Result"];
                    
                    for (let l = 0; l < teams.length; l++){
                        let t = teams[l];
                        const team = await updateOrCreateTeam(t, businessUnit);
                        const peopleQuery = updateGetPeopleQuery(getPeopleByTeamId, team);
                        const people = JSON.parse(await request(peopleQuery))["Result"];
                        for ( let j = 0; j < people.length; j++){
                            let person = people[j]
                            const agent = await updateOrCreateAgent(person, team);
                        };
                        const scheduleQuery = updateGetScheduleByTeamId(getScheduleByTeamId, team);
                        const rawSchedules = JSON.parse(await request(scheduleQuery))["Result"];
                        schedulePromises = [...schedulePromises, ...rawSchedules.map(personDay=>updateOrCreateSchedule(personDay))];
                    };
                    
                }
            };
            Promise.allSettled(schedulePromises)
            .then(data=>{
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
            let offset = moment(StartTime).hour()*60 + moment(StartTime).minute()
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

            let countryAbbr = 'NO';

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
                    timeZone
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
                    timeZone
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
        team.departmentName = businessUnit.name == 'Finland' ? 'Finland' : teleoptiTeam.Name.split('/')[0];
        await team.save();
    }
    else {
        team = await Team.create({
            teamId: teleoptiTeam.Id,
            name: teleoptiTeam.Name.split('/')[1],
            departmentName: businessUnit.name == 'Finland' ? 'Finland' : teleoptiTeam.Name.split('/')[0],
            businessUnitName: businessUnit.name,
            businessUnitId: businessUnit.businessUnitId
        });
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
