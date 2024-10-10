const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    evaluator: {
        type: String,
        required: true,
        default: 'John Doe'
    },
    username: {
        type: String,
        required: true,
        default: 'John_Doe@something.com'
    },

    backlog: {
        type: Number,
        required: true,
        default: 0
    },
    inProgress: {
        type: Number,
        required: true,
        default: 0
    },
    completed: {
        type: Number,
        required: true,
        default: 0
    }
}, {timestamps: true});

module.exports = mongoose.model('C1-New-ContactGoalProgress', ProgressSchema);