const mongoose = require('mongoose');
//const moment = require('moment');

const AlertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: false
    },
    text: {
        type: String,
        required: true
    },
    alerttype: {
        type: String,
        required: true,
        default: 'Undefined'
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    shortdate: {
        type: String
    },
    personrelated: {
        type: Boolean,
        default: false,
        required: true
    },
    department: {
        type: String,
        required: true,
        default: 'Undefined'
    },
    author: {
      type: String,
      required: true,
      default: 'ccc.elkjop.com'
    },
    closed: {
        type: Boolean,
        required: true,
        default: true
    },
    status: {
        type: String,
        default: 'Closed',
        default: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Alert', AlertSchema);
