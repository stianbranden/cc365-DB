const mongoose = require('mongoose')

const ReleaseNoteSchema = new mongoose.Schema({
    version: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('releasenote', ReleaseNoteSchema);