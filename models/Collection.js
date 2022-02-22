const mongoose = require('mongoose')

const CollectionSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    name: {
        required: true,
        type: String,
    },
    visibleOnAll: {
        required: true, 
        default: false,
        type: Boolean
    },
    queues: [String],
    channel: {
        default: 'PH',
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Collection', CollectionSchema)