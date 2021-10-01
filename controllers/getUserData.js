
const User = require('../models/User');

const getUserById = id =>{
    return new Promise(async (resolve, reject)=>{
        try {
            let user = await User.findById(id).populate('agent');
            resolve(user);
        } catch (error) {
            reject(error)
        }
    });
}

module.exports = {
    getUserById
}