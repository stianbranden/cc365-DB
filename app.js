require('dotenv').config();

const getQueueData = require('./controllers/queues');
const express = require('express')
const app = express();
const moment = require('moment')
const rootRoute = require('./routes/root');
const ejsLayouts = require('express-ejs-layouts');
const morgan = require('morgan')

/*Setup EJS*/
app.set('view engine', 'ejs');
app.use(ejsLayouts);

//Static file middleware
app.use(express.static('public'));

//Logging middleware
if (process.env.NODE_ENV !== 'production'){
    app.use(morgan('common'));
  }


app.use('/', rootRoute);

function run(auth, i){
    getQueueData(auth, i).then(data=>{
        //Do stuff with the data
        console.log(data);
        
        setTimeout(()=>{
            run(true, data.runCount); //Redo fecth after 10 sec, incrementing runCount
        }, 10000)
    }).catch(err=>{
        setTimeout(()=>{
            run(false, 0); //If something is going wrong then restart after 60 sec
        }, 60000)
    });
}

app.listen(process.env.PORT, ()=>{
    console.log(`${moment().format()} - Server listening on port ${process.env.PORT}`);
    //run(false, 0);
});
