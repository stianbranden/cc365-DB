const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    departmentName: {
        type: String,
        required: true
    },
    teamId: {
        type: String,
        required: true
    },
    businessUnitName: {
        type: String,
        required: true
    },
    businessUnitId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Team', TeamSchema);