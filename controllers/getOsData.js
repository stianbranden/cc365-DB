var os 	= require('os-utils');
const moment = require('moment-timezone');
const {logTab, logErr} = require('./logger')


function getCpuUsage(){
    return new Promise((resolve, reject)=>{
        os.cpuUsage(function(v){
            resolve(Math.floor(v*100));
        });
    });
}

function getCpuFree(){
    return new Promise((resolve, reject)=>{
        os.cpuFree(function(v){
            resolve(Math.floor(v*100));
        });
    });
}


function getOsData(){
    return new Promise( async (resolve, reject)=>{
        try {
            const obj = {
                cpuUsage: await getCpuUsage(),
                cpuFree: await getCpuFree(),
                plattform: os.platform(),
                cpuCount: os.cpuCount(),
                freeMem: Math.floor(os.freemem()), 
                totalMem: Math.floor(os.totalmem()),
                freeMemPercentage: Math.floor(os.freememPercentage()*100),
                sysUptime: os.sysUptime(),
                processUptime: Math.floor(os.processUptime()),
                loadAvg10Min: os.loadavg(10),
                time: moment().tz('Europe/Oslo').toISOString()
            }
            resolve(obj);
        } catch (error) {
            reject(error.msg);
        }
    });
}




module.exports = {getOsData}