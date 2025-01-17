const mongoose = require('mongoose');


const ConversationSchema = new mongoose.Schema({
    // Define your schema fields here
    _id: {
        type: String,
        required: true
    }, 
    queueId: {
        type: String,
        required: true
    },
    queueName: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        required: true, 
        default: 'voice'
    },
    program: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        default: 'inQueue'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

ConversationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

ConversationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 3600 * 24 });

module.exports = mongoose.model('Conversation', ConversationSchema);