// require('dotenv').config()
// const connectDB = require('./connectDB')

const moment = require('moment')
const BPOfile = require('../models/BPO')

function fileTemplate(name, isActive, skill, date){
    return {
        name, isActive, skill, date,
        schedule: []
    }
}

function findInArr(files, skill, date){
    return files.findIndex(file=>file.skill === skill && file.date === date)
}

function deactiveActive(skill, date){
    return new Promise(async (resolve, reject)=>{
        try {
            await BPOfile.findOneAndUpdate({skill, date, isActive: true}, {isActive: false})
            resolve('ok')
        } catch (error) {
            reject(error)
        }
    })
}

function deleteOldVersion(name, skill, date){
    return new Promise(async (resolve, reject)=>{
        try {
            await BPOfile.findOneAndDelete({name,skill, date, isActive: false})
            resolve('ok')
        } catch (error) {
            reject(error)
        }
    })
}

function inAcceptedRange(name, date){
    const now = moment()
    let test = false
    if (name === 'Custom') test = true
    else if ( ['08:00', '09:00', '11:00', '14:00'].indexOf(name) >= 0) {
        test = Number(now.format('YYYYMMDD')) === date
        // console.log({name, date, test})
    }
    else if ( name === 'Next week') {
        test = date >= Number(now.add(1,'week').startOf('isoWeek').format('YYYYMMDD')) && date <= Number(now.endOf('isoWeek').format('YYYYMMDD'))
        // console.log({name, date, test})
    } 
    else if ( name === 'Long term') {
        test = date >= Number(now.add(1,'month').startOf('month').format('YYYYMMDD')) && date <= Number(now.endOf('month').format('YYYYMMDD'))
        // console.log({name, date, test})
    } 
    return test
}

function createBPOFile(name, isActive, rows, delimiter='	'){
    return new Promise(async (resolve, reject)=>{
        const rowArr = rows.split('\n')
        const files = []
        for (let i = 0; i < rowArr.length; i++){
            const row = rowArr[i].split(delimiter)
            const skill = row[1]
            if (skill != 'skillcombination'){
                const date = Number(row[2].split(' ')[0])
                if (inAcceptedRange(name, date)) {
                    if (findInArr(files, skill, date)=== -1){
                        files.push(fileTemplate(name, isActive, skill, date))
                    }
                    const file = files[findInArr(files, skill, date)]
    
                    file.schedule.push({
                        intervalStart: row[2].split(' ')[1],
                        intervalEnd: row[3].split(' ')[1],
                        agents: Number(row[4])
                    })
                }
            }//kdfkldsfv
        }
        try {
            //await connectDB()
            for (let i = 0; i<files.length; i++){
                const file = files[i]
                await deactiveActive(file.skill, file.date)
                await new BPOfile(file).save()
                await deleteOldVersion(file.name, file.skill, file.date)
            }
            resolve(files.length)
            // store.dispatch("getAllActiveBPOFiles")
        } catch (error) {
            reject(error)
        }

        // console.table(file)
    })
}

function createBPOFilev2(data){
    return new Promise(async (resolve, reject)=>{
        try {
            const {skillcombination, date, type, isActive, rows} = data
            if (inAcceptedRange(type, date)){
                const file = fileTemplate(type, isActive, skillcombination, date)
                rows.forEach(row=>{
                    file.schedule.push({
                        intervalStart: row.startdatetime.split(' ')[1],
                        intervalEnd: row.enddatetime.split(' ')[1],
                        agents: Number(row.agents)
                    })
                })
                if (isActive) await deactiveActive(file.skill, file.date)
                await new BPOfile(file).save()
                await deleteOldVersion(file.name, file.skill, file.date)
                resolve({msg: 'OK', code: 200})
            }
            else resolve({msg: date + ' is not included in file ' + type, code: 201})
        } catch (error) {
            resolve({msg: error.message, code: 500})
        }
    })
}


function getBPOFileForSkillAndDate(skill, date, onlyActive=false){
    return new Promise(async (resolve, reject)=>{
        try {
            // await connectDB()
            const query = {date}
            if(skill != 'all') query.skill = skill
            if(onlyActive) query.isActive = true
            const files = await BPOfile.find(query).lean()
            resolve(files)
        } catch (error) {
            reject(error)
        }
    })
}


module.exports = {
    getBPOFileForSkillAndDate,
    createBPOFile,
    createBPOFilev2
}

//Testing

//getBPOFileForSkillAndDate('GS-FI Phone', 20240321, true).then(file=>console.log(file))

/*
const data = `source	skillcombination	startdatetime	enddatetime	agents
GS-FI Phone	GS-FI Phone	20240321 09:00	20240321 09:15	2
GS-FI Phone	GS-FI Phone	20240321 09:15	20240321 09:30	2
GS-FI Phone	GS-FI Phone	20240321 09:30	20240321 09:45	2
GS-FI Phone	GS-FI Phone	20240321 09:45	20240321 10:00	2
GS-FI Phone	GS-FI Phone	20240321 10:00	20240321 10:15	5
GS-FI Phone	GS-FI Phone	20240321 10:15	20240321 10:30	5
GS-FI Phone	GS-FI Phone	20240321 10:30	20240321 10:45	5
GS-FI Phone	GS-FI Phone	20240321 10:45	20240321 11:00	4
GS-FI Phone	GS-FI Phone	20240321 11:00	20240321 11:15	4
GS-FI Phone	GS-FI Phone	20240321 11:15	20240321 11:30	6
GS-FI Phone	GS-FI Phone	20240321 11:30	20240321 11:45	5
GS-FI Phone	GS-FI Phone	20240321 11:45	20240321 12:00	5
GS-FI Phone	GS-FI Phone	20240321 12:00	20240321 12:15	5
GS-FI Phone	GS-FI Phone	20240321 12:15	20240321 12:30	6
GS-FI Phone	GS-FI Phone	20240321 12:30	20240321 12:45	7
GS-FI Phone	GS-FI Phone	20240321 12:45	20240321 13:00	6
GS-FI Phone	GS-FI Phone	20240321 13:00	20240321 13:15	5
GS-FI Phone	GS-FI Phone	20240321 13:15	20240321 13:30	6
GS-FI Phone	GS-FI Phone	20240321 13:30	20240321 13:45	5
GS-FI Phone	GS-FI Phone	20240321 13:45	20240321 14:00	5
GS-FI Phone	GS-FI Phone	20240321 14:00	20240321 14:15	6
GS-FI Phone	GS-FI Phone	20240321 14:15	20240321 14:30	6
GS-FI Phone	GS-FI Phone	20240321 14:30	20240321 14:45	6
GS-FI Phone	GS-FI Phone	20240321 14:45	20240321 15:00	7
GS-FI Phone	GS-FI Phone	20240321 15:00	20240321 15:15	6
GS-FI Phone	GS-FI Phone	20240321 15:15	20240321 15:30	5
GS-FI Phone	GS-FI Phone	20240321 15:30	20240321 15:45	4
GS-FI Phone	GS-FI Phone	20240321 15:45	20240321 16:00	5
GS-FI Phone	GS-FI Phone	20240321 16:00	20240321 16:15	7
GS-FI Phone	GS-FI Phone	20240321 16:15	20240321 16:30	6
GS-FI Phone	GS-FI Phone	20240321 16:30	20240321 16:45	6
GS-FI Phone	GS-FI Phone	20240321 16:45	20240321 17:00	8
GS-FI Phone	GS-FI Phone	20240321 17:00	20240321 17:15	7
GS-FI Phone	GS-FI Phone	20240321 17:15	20240321 17:30	6
GS-FI Phone	GS-FI Phone	20240321 17:30	20240321 17:45	4
GS-FI Phone	GS-FI Phone	20240321 17:45	20240321 18:00	4
GS-FI Phone	GS-FI Phone	20240321 18:00	20240321 18:15	2
GS-FI Phone	GS-FI Phone	20240321 18:15	20240321 18:30	2
GS-FI Phone	GS-FI Phone	20240321 18:30	20240321 18:45	2
GS-FI Phone	GS-FI Phone	20240321 18:45	20240321 19:00	2
GS-FI Phone	GS-FI Phone	20240321 19:00	20240321 19:15	2
GS-FI Phone	GS-FI Phone	20240321 19:15	20240321 19:30	2
GS-FI Phone	GS-FI Phone	20240321 19:30	20240321 19:45	2
GS-FI Phone	GS-FI Phone	20240321 19:45	20240321 20:00	2
GS-FI Chat	GS-FI Chat	20240321 09:00	20240321 09:15	3
GS-FI Chat	GS-FI Chat	20240321 09:15	20240321 09:30	3
GS-FI Chat	GS-FI Chat	20240321 09:30	20240321 09:45	3
GS-FI Chat	GS-FI Chat	20240321 09:45	20240321 10:00	3
GS-FI Chat	GS-FI Chat	20240321 10:00	20240321 10:15	4
GS-FI Chat	GS-FI Chat	20240321 10:15	20240321 10:30	4
GS-FI Chat	GS-FI Chat	20240321 10:30	20240321 10:45	4
GS-FI Chat	GS-FI Chat	20240321 10:45	20240321 11:00	3
GS-FI Chat	GS-FI Chat	20240321 11:00	20240321 11:15	3
GS-FI Chat	GS-FI Chat	20240321 11:15	20240321 11:30	2
GS-FI Chat	GS-FI Chat	20240321 11:30	20240321 11:45	3
GS-FI Chat	GS-FI Chat	20240321 11:45	20240321 12:00	3
GS-FI Chat	GS-FI Chat	20240321 12:00	20240321 12:15	4
GS-FI Chat	GS-FI Chat	20240321 12:15	20240321 12:30	4
GS-FI Chat	GS-FI Chat	20240321 12:30	20240321 12:45	4
GS-FI Chat	GS-FI Chat	20240321 12:45	20240321 13:00	4
GS-FI Chat	GS-FI Chat	20240321 13:00	20240321 13:15	4
GS-FI Chat	GS-FI Chat	20240321 13:15	20240321 13:30	5
GS-FI Chat	GS-FI Chat	20240321 13:30	20240321 13:45	4
GS-FI Chat	GS-FI Chat	20240321 13:45	20240321 14:00	4
GS-FI Chat	GS-FI Chat	20240321 14:00	20240321 14:15	3
GS-FI Chat	GS-FI Chat	20240321 14:15	20240321 14:30	3
GS-FI Chat	GS-FI Chat	20240321 14:30	20240321 14:45	4
GS-FI Chat	GS-FI Chat	20240321 14:45	20240321 15:00	4
GS-FI Chat	GS-FI Chat	20240321 15:00	20240321 15:15	4
GS-FI Chat	GS-FI Chat	20240321 15:15	20240321 15:30	3
GS-FI Chat	GS-FI Chat	20240321 15:30	20240321 15:45	5
GS-FI Chat	GS-FI Chat	20240321 15:45	20240321 16:00	4
GS-FI Chat	GS-FI Chat	20240321 16:00	20240321 16:15	3
GS-FI Chat	GS-FI Chat	20240321 16:15	20240321 16:30	3
GS-FI Chat	GS-FI Chat	20240321 16:30	20240321 16:45	4
GS-FI Chat	GS-FI Chat	20240321 16:45	20240321 17:00	3
GS-FI Chat	GS-FI Chat	20240321 17:00	20240321 17:15	3
GS-FI Chat	GS-FI Chat	20240321 17:15	20240321 17:30	3
GS-FI Chat	GS-FI Chat	20240321 17:30	20240321 17:45	3
GS-FI Chat	GS-FI Chat	20240321 17:45	20240321 18:00	3
GS-FI Chat	GS-FI Chat	20240321 18:00	20240321 18:15	3
GS-FI Chat	GS-FI Chat	20240321 18:15	20240321 18:30	3
GS-FI Chat	GS-FI Chat	20240321 18:30	20240321 18:45	3
GS-FI Chat	GS-FI Chat	20240321 18:45	20240321 19:00	3
GS-FI Chat	GS-FI Chat	20240321 19:00	20240321 19:15	3
GS-FI Chat	GS-FI Chat	20240321 19:15	20240321 19:30	3
GS-FI Chat	GS-FI Chat	20240321 19:30	20240321 19:45	3
GS-FI Chat	GS-FI Chat	20240321 19:45	20240321 20:00	3`

createBPOFile('sameday', true, data).then(_=>getBPOFileForSkillAndDate('GS-FI Chat', 20240321).then(files=>console.log(files)))

*/