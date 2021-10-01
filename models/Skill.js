/*{
      "Id": "string",
      "Name": "string",
      "Description": "string",
      "SkillType": {
        "Id": "string",
        "Name": "string",
        "ShortName": "string"
      },
      "TimeZoneId": "string",
      "ActivityId": "string",
      "ResolutionMinutes": 0
    }
    */

const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    skillId: {
        type: String,
        required: true
    },
    lastScheduleUpdateTime: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('Skill', SkillSchema);