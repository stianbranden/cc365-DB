const mongoose = require('mongoose');

const BPOScheduleSchema = new mongoose.Schema({
    intervalStart: {
        type: String,
        required: true
    },
    intervalEnd: {
        type: String,
        required: true
    },
    agents: {
        type: Number,
        required: true,
        default: 0
    }
})

const BPOSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'N/A',
        required: true
    },
    skill: {
        type: String,
        required: true,
        default: 'N/A'
    },
    isActive: {
        type: Boolean,
        default: false,
        required: true
    },
    date: {
        type: Number,
        default: 20240301,
        required: true
    },
    schedule: [BPOScheduleSchema]
}, {timestamps: true});

module.exports = mongoose.model('BPOfile', BPOSchema);