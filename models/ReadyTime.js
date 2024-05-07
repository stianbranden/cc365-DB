const mongoose = require('mongoose');

const TimeSchema = new mongoose.Schema({
    dateTime: String,
    time: String, 
    date: String, 
    ready: Number
})

const ReadyTimeSchema = new mongoose.Schema({
    profile: {
        type: String,
        default: 'N/A',
        required: true
    },
    date: {
        type: Number,
        default: 20240301,
        required: true
    },
    actor: {
        type: String,
        default: 'Webhelp',
        required: true
    },
    time: [TimeSchema]
}, {timestamps: true});

module.exports = mongoose.model('ReadyTime', ReadyTimeSchema);