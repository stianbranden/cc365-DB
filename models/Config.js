const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true,
        default: 'systemuser'
    },
    data: {
        type: Object
    }
}, {timestamps: true});

module.exports = mongoose.model('Config', ConfigSchema);