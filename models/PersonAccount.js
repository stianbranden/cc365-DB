const mongoose = require("mongoose");

const PersonAccountSchema = new mongoose.Schema({
    agent: String,
    employmentNumber: String,
    trackedBy: String,
    startDate: String,
    endDate: String,
    absenceId: String,
    absence: String,
    remaining: Number,
    balanceIn: Number,
    accrued: Number,
    extra: Number,
    balanceOut: Number,
    used: Number,
    businessUnitName: String,
    businessUnitId: String,
    departmentName: String,
    teamName: String
})

module.exports = mongoose.model('PersonAccount', PersonAccountSchema)