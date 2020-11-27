require('dotenv').config();

const {getQueues, getContacts, getSingleContact} = require('./controllers/queues');
const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const moment = require('moment')
const rootRoute = require('./routes/root');
const contactRoute = require('./routes/contact');
const tableauRoute = require('./routes/tableau');
const chatBotTranscriptRoute = require('./routes/chatBotTranscript');
const reportRoute = require('./routes/report');
const ejsLayouts = require('express-ejs-layouts');
const morgan = require('morgan')
const {units} = require('./config')
const updateFrequency = process.env.UPDATE_FREQUENCY || 10000;
const {NODE_ENV} = process.env;
/*Setup EJS*/
app.set('view engine', 'ejs');
app.use(ejsLayouts);

//Static file middleware
app.use(express.static('public'));

//Logging middleware
if (process.env.NODE_ENV !== 'production'){
    app.use(morgan('common'));
  }


//Routes
app.use('/contact', contactRoute);
app.use('/tableau', tableauRoute);
app.use('/chat', chatBotTranscriptRoute);
app.use('/mngrs', reportRoute);

app.use('/', rootRoute);


function run(auth, i){
    //getSingleContact('4599557514');
    //getContacts();
    
    getQueues(auth, i).then(data=>{
        //Do stuff with the data
        //console.log(data);

        updateQueues(data);
        setTimeout(()=>{
            run(true, data.runCount); //Redo fecth after 10 sec, incrementing runCount
        }, updateFrequency)
    }).catch(err=>{
        console.log('An error has happened', err);
        setTimeout(()=>{
            run(false, 0); //If something is going wrong then restart after 60 sec
        }, updateFrequency*6)
    });
}

server.listen(process.env.PORT, ()=>{
    console.log(`${moment().format()} - Server listening on port ${process.env.PORT}`);
    run(false, 0);
});

//Socket.io stuff
io.on('connection', socket =>{
    console.log('a user is connected')
    socket.emit('submit-room');

    socket.on('connect-to', room =>{
        console.log(`Connect to ${room} from ${socket.id}`);
        socket.emit('connect-ok', {id: socket.id, room})
        socket.join(room);
    });
});



function updateQueues({data, queueMap}){
    let missingGroups = []
    let nordic = {}
    Object.keys(units).forEach(unit=>{        
        let objs = [];
        units[unit].groups.forEach(group=>{
            
            let obj = {
                group,
                data: []
            };
            if ( queueMap.map[group] ){
                queueMap.map[group].forEach(q=>{
                    let qu = data.queueStatus.find(e=>{
                        return e.id === q;
                    });
                    if ( qu ){
                        obj.data.push(qu);
                    }
                });
            }
            else {
                //console.log('Not found: ' + group);
                //Some kind of error handling
                missingGroups.push(group)
            }
            
            objs.push(obj)
            
        });
        io.in(unit).emit('updateQueues', objs);
        nordic[units[unit].abbr] = objs;
    });
    io.in('nordic').emit('updateQueues', nordic);

    //Update daily stats
    let nordicStats = {}
    Object.keys(units).forEach(unit=>{
        let objs = [];
        units[unit].groups.forEach(group=>{
            let obj = {
                group,
                data: []
            };
            if (queueMap.map[group]){
                queueMap.map[group].forEach(q=>{
                    let qu = data.queueStats.find(e=>{
                        return e.queueId === q;
                    });
                    if ( qu ){
                        obj.data.push(qu);
                    }
                });
            }
            else {

            }
            objs.push(obj)
        });
        io.in(unit).emit('updateStats', objs);
        nordicStats[units[unit].abbr] = objs;
    });
    io.in('nordic').emit('updateStats', nordicStats);
    //io.in('denmark').emit('agentStatus', agentStatus);
    //io.in('denmark').emit('agentStatus', queueMap);
    if ( NODE_ENV != 'production'){
        console.log(`Number of missing groups: ${missingGroups.length}`);
    }
    
    
    
}