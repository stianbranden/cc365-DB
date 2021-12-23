const {logStd, logTab, logErr} = require('./logger');
const pm2 = require('pm2');
const moment = require('moment')

const getPm2Data = async _=>{
    pm2.connect(err=>{
        const processes = []
        if (err) logErr(err);
        else {
            pm2.list(async (err, list)=>{
                if (err) logErr(err);
                else {
                    list.forEach(async p=>{
                        //logStd(JSON.stringify(p))
                        //const data = await getProcessData(p.pid);
                        processes.push({
                            pid: p.pid, 
                            name: p.name, 
                            memory: p.monit.memory, 
                            cpu: p.monit.cpu, 
                            status: p.pm2_env.status,
                            uptime: moment(p.pm2_env.pm2_uptime).format(),
                            createdAt: moment(p.pm2_env.createdAt).format(),
                            restarts: p.pm2_env.unstable_restarts
                        })
                    });
                }
                logTab(processes, 'Process-list')
                pm2.disconnect();
            })
        }
    });
}

const getProcessData = pid =>{
    return new Promise((resolve, reject)=>{
        pm2.describe(pid, (err, data)=>{
            logStd(JSON.stringify(data));
            resolve(data)
        })
    })
    
}

getPm2Data();
//getProcessData("local")