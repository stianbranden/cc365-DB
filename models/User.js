const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    upn: {
        type: String,
        required: true
    },
    name: String,
    given_name: String,
    family_name: String,
    first_login: {
        required: true,
        type: Date,
        default: Date.now
    },
    last_login: {
        required: true,
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);