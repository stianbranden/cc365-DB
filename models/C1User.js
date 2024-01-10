const mongoose = require('mongoose')
const UserSchema = require('./C1UserSchema')

module.exports = mongoose.model('C1-User', UserSchema)