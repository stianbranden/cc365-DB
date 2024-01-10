const mongoose = require('mongoose');


const LogSchema = new mongoose.Schema({
    request: {
        type: Object
    },
    status: {
        type: Number,
        required: true,
        default: 999
    }
}, {timestamps: true});

module.exports = mongoose.model('C1-log', LogSchema);