//require('dotenv').config();
const req = require('request');
const request= require('request-promise');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const BusinessUnit = require('../models/BusinessUnit');
const Team = require('../models/Team');
const Agent = require('../models/Agent');
const Schedule = require('../models/Schedule');
const {getAgentWithId, getAllBusinessUnits, getTeams, getAgents} = require('./getTeleoptiData');

const {getBusinessUnits, getAllTeamsWithAgents, getPeopleByTeamId, getSchedulesByPersonIds, getScheduleByTeamId, getUpdatedSchedules} = require('./config');

const runScheduleUpdate = async _ =>{
    try {
        
        const businessUnits = await getAllBusinessUnits();
        new Promise(async (resolve, reject)=>{
            let updatedSchedules = [];
            for ( let j = 0; j < businessUnits.length; j++){
                const unit = businessUnits[j];
                const now = moment().format();
                console.log(`${now} - running ${unit.name}`);
                let query = updateGetUpdatedSchedulesQuery(getUpdatedSchedules, unit, 1, 100, now );
                let results = JSON.parse(await request(query))["Result"][0];
                updatedSchedules = [...updatedSchedules, ...results["Schedules"]];
                if ( results["TotalPages"] > 1 ){
                    for ( let i = 2; i <= results["TotalPages"]; i++ ){
                        query = updateGetUpdatedSchedulesQuery(getUpdatedSchedules, unit, i, 100, now );
                        updatedSchedules = [...updatedSchedules, ...JSON.parse(await request(query))["Result"][0]["Schedules"]]
                    }
                }
                //unit.lastScheduleUpdateTime = Date(now);
                //await unit.save();
            };
            console.log('Lenght: ' + updatedSchedules.length);
            resolve(updatedSchedules);
        }).then(updatedSchedules=>{
            asyncForEach(updatedSchedules, schedule=>{
                console.log('Updating');
                updateOrCreateSchedule(schedule);
            });
            console.log('Updated schedules: ' + updatedSchedules.length);
        });
        
        
    } catch (error) {
        console.log(error);
    }
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

    try { //Dropping what needs to be dropped
        if (options.dropScheduleCollection){
            await mongoose.connection.dropCollection('schedules')
            console.log('Schedule collection dropped');
        }
    } catch (error) {
        if (error.codeName === 'NamespaceNotFound'){
            console.log('Could not find collection to drop');
        }
        else {
            console.log('Error found: ' + error.codeName);
        }
    }

    try {
        
        const units = JSON.parse(await request(getBusinessUnits))["Result"]
        asyncForEach(units, async unit=>{
            if (unit.Name != 'Default'){
                const businessUnit = await updateOrCreateBusinessUnit(unit);
                const teamsQuery = updateGetTeamQuery(getAllTeamsWithAgents, businessUnit);
                const teams = JSON.parse(await request(teamsQuery))["Result"];
                asyncForEach(teams, async t =>{
                    const team = await updateOrCreateTeam(t, businessUnit);
                    const peopleQuery = updateGetPeopleQuery(getPeopleByTeamId, team);
                    const people = JSON.parse(await request(peopleQuery))["Result"];
                    //console.log(people);
                    asyncForEach(people, async person=>{
                        //console.log('Trying ' + person.DisplayName);
                        const agent = await updateOrCreateAgent(person, team);
                    });
                    const scheduleQuery = updateGetScheduleByTeamId(getScheduleByTeamId, team);
                    const rawSchedules = JSON.parse(await request(scheduleQuery))["Result"];
                    asyncForEach(rawSchedules, async personDay=>{
                        for (let i = 0; i < personDay.Shift.length; i++){
                            let shift = personDay.Shift[i];
                            shift.StartTime = shift.Period.StartTime;
                            shift.EndTime = shift.Period.EndTime;
                        }
                        updateOrCreateSchedule(personDay);
                    });
                });
            }
        });
    } catch (error) {
        console.log(error);
    } finally {
        if (process.env.NODE_ENV != 'Production' ){
            getAllBusinessUnits().then(units=> console.log(`Number of Business units in storage: ${units.length}`));
            getTeams().then(teams=> console.log(`Number of teams in storage: ${teams.length}`));
            getAgents().then(agents=>console.log(`Number of agents in storage: ${agents.length}`));
        }
    }

    
}

const updateOrCreateSchedule = async (personDay)=>{
    try {
        const agent = await getAgentWithId(personDay.PersonId);
        //console.log({agent});
        let schedule = await Schedule.findOne({agentId: personDay.PersonId, date: personDay.Date});
        if (schedule){

            schedule = await Schedule.findByIdAndUpdate(schedule._id, {
                ...createScheduleObject(personDay, agent),
                agent
            }, {new: true});
            
            //await schedule.save();
        } else {
            schedule = await Schedule.create({
                agentId: personDay.PersonId,
                date: personDay.Date,
                ...createScheduleObject(personDay, agent),
                agent
            });
        }
    } catch (error) {
        console.log(`Failed on ${personDay.PersonId} @ ${personDay.Date}`);
        console.log(error);
    }
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
            const {StartTime, EndTime} = s;
            let lengthOfShift = -moment(s.StartTime).diff(moment(s.EndTime), 'minutes');
            let obj = {
                name: s.Name,
                activityId: s.ActivityId,
                absenceId: s.AbsenceId,
                displayColorHex: s.DisplayColorHex,
                overtime: s.Overtime,
                startTime: moment(s.StartTime).tz(agent.timeZone).format(),
                endTime: moment(s.EndTime).tz(agent.timeZone).format(),
                lengthOfShift
            }
            scheduleObject.shift.push(obj)
            //console.log(scheduleObject.shift);
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
//60d9e611ef5a581a88aa3289

const updateGetScheduleByIdsQuery = (query, agents, date = moment().format('YYYY-MM-DD'))=>{
    let agentIds = [];
    //console.log(agents);
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

const updateOrCreateAgent = async (person, team)=>{
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
        //console.log(timeZone);
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
        return agent;
    } catch (error) {
        console.log('Error on ' + person.DisplayName);
        console.log(error);
    }
    
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
