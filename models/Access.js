const mongoose = require('mongoose');

const PageSchema = require('./PageSchema')
const VizSchema = require('./VizSchema')

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
    pages: [PageSchema], 
    vizes: [VizSchema],
    name: String
});

module.exports = mongoose.model('Access', AccessSchema);