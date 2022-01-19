const mongoose = require('mongoose');

const AccessSchema = new mongoose.Schema({
    rule: {
        type: Map, 
        of: String
    },
    grant: [
        {
            label: String,
            alter: String,
            path: String
        }
    ],
    alerts: [String],
    name: String
});

module.exports = mongoose.model('Access', AccessSchema);