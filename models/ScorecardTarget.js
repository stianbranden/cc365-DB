const mongoose = require('mongoose')

const TargetSchema = new mongoose.Schema({
    businessUnit: {
        required: true,
        type: String
    },
    kpi: {
        required: true,
        type: String
    },
    type: {
        required: true,
        type: String
    },
    min: {
        required: true,
        type: Number
    },
    max: {
        required: true,
        type: Number
    },
    textTarget: {
        required: true,
        type: String
    },
    priority: {
        required: true,
        type: String
    },
    validFrom: {
        required: true,
        type: Number
    },
    validTo: {
        required: true,
        type: Number
    },
    strategicArea: {
        required: true,
        type: String
    },
    unit: {
        required: true,
        type: String
    },
    decimals: {
        required: true,
        type: Number,
        default: 0
    },
    active: {
        required: true,
        default: true,
        type: Boolean
    }
})

module.exports = mongoose.model('Target', TargetSchema)