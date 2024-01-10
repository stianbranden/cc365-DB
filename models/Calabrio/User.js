const mongoose = require('mongoose')
const UserSchema = require('./jointSchemas/UserSchema')

module.exports = mongoose.model('C1-User', UserSchema)