const Alert = require('../models/Alert');
const moment = require('moment');

const createAlert = async (text = 'Undefined', department, personrelated = false, alerttype = 'Absence', closed = true, author = 'ccc.elkjop.com', date = new Date())=>{
    return await Alert.create({
        text,
        department,
        alerttype,
        author,
        date,
        personrelated,
        closed,
        shortdate: moment(date).format('MMM Do HH:mm')
    });
}

const updateAlert = async (_id, obj)=>{
    return await Alert.findByIdAndUpdate(_id, obj, {new: true});
}

module.exports= {
    createAlert,
    updateAlert
}

/*
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
    }
    */