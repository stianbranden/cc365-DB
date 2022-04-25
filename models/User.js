const mongoose = require('mongoose');

const PageSchema = require('./PageSchema')
const VizSchema = require('./VizSchema')

const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: String,
    given_name: String,
    family_name: String,
    agentId: {
        type: String
    },
    photo: {
        type: String
    },
    role: {
        type: String
    },
    title: {
        type: String
    },
    access_token: {type: String},
    first_login: {
        required: true,
        type: Date,
        default: Date.now
    },
    last_login: {
        required: true,
        type: Date,
        default: Date.now
    },
    custom_access: [{
        label: String,
        path: String,
        alter: String
    }],
    alerts: [String],
    pages: [PageSchema], 
    vizes: [VizSchema]
},{
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true } // So `toObject()` output includes virtuals
});

UserSchema.virtual('agent', {
    ref: 'Agent', // The model to use
    localField: 'agentId', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: true
  });

module.exports = mongoose.model('User', UserSchema);