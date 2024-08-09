const ContactGoalProgress = require('../models/ContactGoalProgress')

function returnContactGoalProgress(){
    return new Promise( async (resolve, reject)=>{
        try {
            const cgp = await ContactGoalProgress.find().sort({ evaluator: 'asc' }).lean()
            resolve(cgp)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {returnContactGoalProgress}