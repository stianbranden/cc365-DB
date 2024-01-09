const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    goalId: {
        type: Number,
        required: true
    },
    evaluator: {
        type: String,
        required: true,
        default: 'John Doe'
    },
    backlog: {
        type: Number,
        required: true,
        default: 0
    },
    completed: {
        type: Number,
        required: true,
        default: 0
    },
    totalToComplete: {
        type: Number,
        required: true,
        default: 0
    },
}, {timestamps: true});

module.exports = mongoose.model('C1-ContactGoalProgress', ProgressSchema);