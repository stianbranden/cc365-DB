const Agent = require('../models/Agent');
const BusinessUnit = require('../models/BusinessUnit');
const Team = require('../models/Team');
const Schedule = require('../models/Schedule');
const Skill = require('../models/Skill')
const Contract = require('../models/Contract')
const moment = require('moment');
const { logStd } = require('./logger');

const getSkillById = id=>{
    return new Promise(async (resolve, reject)=>{
        const skill = await Skill.findOne({skillId: id});
        if (skill){
            resolve(skill)
        }
        else{
            logStd(`Skill id ${id} not found`)
            reject(skill)
        }
    })
}

const getContractById = id =>{
    return new Promise(async (resolve, reject)=>{
        const contract = await Contract.findOne({contractId: id});
        if (contract){
            resolve(contract)
        }
        else{
            logStd(`Contract id ${id} not found`)
            reject(contract)
        }
    })
}

const getSchedulesForAgent = (agentId, date = moment().format('YYYY-MM-DD')) => {
    return new Promise( async (resolve, reject)=>{
        resolve( await Schedule.findOne({
            agentId,
            date
        }))
    });
}

const getSchedulesForTeam = (teamId, date = moment().format('YYYY-MM-DD'), includeEmpty = false)=>{
    return new Promise( async (resolve, reject)=>{
        let query = {
            "agent.teamId": teamId, 
            date
        }
        if ( !includeEmpty ){
            query.$or = [
                {"shift.0":{$exists: true}},
                {dayOff: {$ne: null}}
            ]
        }
        try {
            resolve(await Schedule.find(query));
        } catch (error) {
            reject(error)
        }
    });
}

const getSchedulesForDepartment = (department, date = moment().format('YYYY-MM-DD'), includeEmpty=false)=>{
    return new Promise( async (resolve, reject)=>{
        let query = {
            "agent.departmentName": {$regex: department,$options:'i'},
            date
        }
        if ( !includeEmpty ){
            query.$or = [
                {"shift.0":{$exists: true}},
                {dayOff: {$ne: null}}
            ]
        }
        try {
            resolve(await Schedule.find(query));
        } catch (error) {
            reject(error);
        }
    });
};

const getAgentWithId = id =>{
    return new Promise(async (resolve, reject)=>{
        try {
            let agent = await Agent.findById(id);
            //console.log({agent});
            resolve(agent)
        } catch (error) {
            reject(error)
        }
    }); 
}

const getAgentWithEmail = email =>{
    return new Promise(async(resolve, reject)=>{
        try {
            let agent = await Agent.findOne({email});
            resolve(agent);
        } catch (error) {
            reject(error)
        }
    })
}

const getAgents = (options = {businessUnitId: null, teamId: null}) =>{
    return new Promise(async (resolve, reject)=>{
        let query = {};
        if (options.teamId){
            query = {teamid};
        } else if (options.businessUnitId){
            query = {businessUnitId}
        }
        try {
            let agents = await Agent.find(query);
            resolve(agents)
        } catch (error) {
            reject(error)
        }

    })
};


const getAllBusinessUnits = _ =>{
    return new Promise(async (resolve, reject)=>{
        try {
            let units = await BusinessUnit.find({});
            resolve(units);
        } catch (error){
            reject(error)
        }
    });
}

const getBusinessUnit = businessUnitId =>{
    return new Promise( async (resolve, reject)=>{
        try {
            resolve(await businessUnit.findOne({businessUnitId}));
        } catch (error) {
            reject(error)
        }
    });
}

const getTeam = teamId =>{
    return new Promise( async (resolve, reject)=>{
        try {
            resolve(await Team.findOne({teamId}));
        } catch (error) {
            reject(error)
        }
    });
}

const getTeams = (businessUnitId=null)=>{
    return new Promise(async (resolve, reject) => {
        let query = {}
        if (businessUnitId){
            query = {businessUnitId}
        }
        try {
            let teams = await Team.find(query);
            resolve (teams)
        } catch (error) {
            reject(error);
        }
    })
    
}

module.exports = {
    getAgentWithId,
    getAgentWithEmail,
    getAllBusinessUnits,
    getBusinessUnit,
    getTeams,
    getAgents,
    getSchedulesForAgent,
    getSchedulesForTeam,
    getSchedulesForDepartment,
    getTeam,
    getSkillById,
    getContractById
}