const mongoose = require('mongoose')

const Evaluation = new mongoose.Schema({
    evaluator: {
        type: String,
        required: true
    },
    isGauge: {
        type: Boolean,
        default: false
    },
    scores: [Number],
    accuracy: [Number],
    comments: [String],
    total: {
        type: Number
    },
    totalCritical: {
        type: Number
    }

}, {_id: false})

const Question = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    kpi: {
        type: Boolean,
        default: false
    },
    weight: {
        type: Number,
        default: 100
    },
    possible_score: {
        type: Number,
        default: 100
    }
}, {_id: false})

const Section = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    question: [Question]
}, {_id: false})

const CalibrationSchema = new mongoose.Schema({
    _id: {
        required: true,
        type: Number
    },
    segment: {
        type: String,
        default: 'TBA'
    },
    gaugeSet: {
        type: Boolean,
        default: false
    },
    calibration: {
        type: String
    },
    section: [Section],
    evaluation: [Evaluation],
    comment: String
})

const Calibration = new mongoose.Schema({
    name: {type: String, unique: true},
    gauge: String,
    contacts: [Number],
    comment: String, 
    deleted: {
        required: true,
        type: Boolean, 
        default: false
    }
}, {timestamps: true})


module.exports = {
    ContactCalibration: mongoose.model('contact-calibration', CalibrationSchema),
    Calibration: mongoose.model('calibration', Calibration)
}
