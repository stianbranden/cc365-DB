const Alert = require('../models/Alert');
const moment = require('moment');

const createAlert = async (text = 'Undefined', department, personrelated = false, alerttype = 'Absence', closed = true, title = null, icon=null, author = 'ccc.elkjop.com', date = new Date(), editable=false)=>{
    if (!title){
        title = `${alerttype} on ${department}`
    }
    if (!icon && alerttype =='Absence'){
        icon = '<ion-icon name="thermometer-sharp"></ion-icon>'
    }
    else if (!icon && alerttype == 'Channel Chat'){
        icon = '<ion-icon name="chatbox-ellipses-sharp"></ion-icon>';
    }
    let status = 'Closed';
    if ( !closed ) status = 'Open';
    return await Alert.create({
        title,
        icon,
        text,
        department,
        alerttype,
        author,
        date,
        personrelated,
        closed,
        status,
        editable,
        shortdate: moment(date).format('MMM Do HH:mm')
    });
}

const updateAlert = async (_id, obj, appendText = false)=>{
    if ( appendText ){
        const alert = await Alert.findById(_id)
        obj.text = alert.text + '<br>' + obj.text
    }
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