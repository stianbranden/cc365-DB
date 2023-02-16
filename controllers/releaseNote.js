const ReleaseNote = require('../models/ReleaseNote')

const getReleaseNotes = ()=>{
    return new Promise(async (resolve, reject)=>{
        try {
            const notes = await ReleaseNote.find()
            resolve(notes)
        } catch (error) {
            reject(error)
        }
    })
}

const setReleaseNote = (version, name, content)=>{
    return new Promise( async (resolve, reject)=>{
        try {
            const note = await new ReleaseNote({
                version,
                name,
                content
            }).save()
            resolve(note)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getReleaseNotes,
    setReleaseNote
}