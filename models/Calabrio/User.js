const mongoose = require('mongoose')
const UserSchema = require('./JointSchemas/UserSchema')

module.exports = mongoose.model('C1-User', UserSchema)