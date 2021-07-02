const Agent = require('../models/Agent');
const BusinessUnit = require('../models/BusinessUnit');
const Team = require('../models/Team');

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
    getTeams,
    getAgents
}