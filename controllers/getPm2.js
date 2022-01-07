const {logStd, logTab, logErr} = require('./logger');
const pm2 = require('pm2');
const moment = require('moment')

const getPm2Data = _=>{
    return new Promise(async (resolve, reject)=>{
        pm2.connect(err=>{
            const processes = []
            if (err) reject(err);
            else {
                pm2.list(async (err, list)=>{
                    if (err) reject(err);
                    else {
                        list.forEach(async p=>{
                            //logStd(JSON.stringify(p))
                            //const data = await getProcessData(p.pid);
                            processes.push({
                                pid: p.pid, 
                                name: p.name, 
                                memory: Math.trunc(p.monit.memory/100000)/10 + 'MB', 
                                cpu: p.monit.cpu + '%', 
                                status: p.pm2_env.status,
                                uptime: moment(p.pm2_env.pm2_uptime).format(),
                                createdAt: moment(p.pm2_env.createdAt).format(),
                                restarts: p.pm2_env.unstable_restarts
                            })
                        });
                    }
                    resolve(processes)
                    pm2.disconnect();
                })
            }
        });
    });
}

const getProcessData = name =>{
    return new Promise((resolve, reject)=>{
        pm2.describe(name, (err, data)=>{
            logStd(JSON.stringify(data));
            resolve(data)
        })
    })
    
}
function logIt(data){
    logTab(data)
}

module.exports = {getPm2Data};
/*getPm2Data()
    .then(logIt)
    .catch(err=>logErr(data));*/
//getProcessData("local")