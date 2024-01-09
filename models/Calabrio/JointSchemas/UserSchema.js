const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    "agentId": {
        type: Number,
        required: true
    },
    "goalId": {
        type: Number,
        required: true
    },
    "name": {
        type: String,
        required: true
    },
    "assignment": {
        type: Number,
        required: true,
        default: 0
    },
    "contacts": {
        type: Array,
        required: true
    },
    "numContacts": {
        type: Number,
        required: true
    },
    "instruction": {
        type: String,
        required: false
    },
    "evalFormId": {
        type: Number,
        required: false
    }
})

module.exports = UserSchema