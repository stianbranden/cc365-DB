const mongoose = require('mongoose');

const UserSchema = require('./JointSchemas/UserSchema')

const SegmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    users: [UserSchema],
    sample: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    }
}, {timestamps: true});


module.exports = mongoose.model('C1-segment', SegmentSchema);