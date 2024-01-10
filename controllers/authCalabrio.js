const axios = require('axios')
const {c1authenticate} = require('./config')

function authCalabrio(){
    return new Promise(async (resolve, reject)=>{
        try {
            const auth = await axios(c1authenticate)
            resolve(auth)
        } catch (error) {
            reject(error)
        }

    })
}

module.exports = authCalabrio