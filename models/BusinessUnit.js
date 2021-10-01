const mongoose = require('mongoose');

const BusinessUnitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    businessUnitId: {
        type: String,
        required: true
    },
    lastScheduleUpdateTime: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('BusinessUnit', BusinessUnitSchema);