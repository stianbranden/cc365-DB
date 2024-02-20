const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    segmentName: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true,
        default: "N/A"
    },
    contactsPushed: {
        type: Number,
        required: true
    },
    contacts: [{type: Number, required: false}]
}, {timestamps: true});


module.exports = mongoose.model('C1-push-history', HistorySchema);