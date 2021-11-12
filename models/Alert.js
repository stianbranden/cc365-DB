const mongoose = require('mongoose');


const AlertSchema = new mongoose.Schema({
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
    }
}, {timestamps: true});

module.exports = mongoose.model('Alert', AlertSchema);
