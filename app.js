require('dotenv').config();

const {getQueues, getContacts, getSingleContact} = require('./controllers/queues');
const {getTodaysTeleoptiData, runScheduleUpdate} = require('./controllers/fetchTeleoptiData');
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
const myStatsRoute = require('./routes/myStats');
const authRoute = require('./routes/auth');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./controllers/connectDB');
const passport = require('passport');
const ejsLayouts = require('express-ejs-layouts');
const morgan = require('morgan')
const {units} = require('./config')
const updateFrequency = process.env.UPDATE_FREQUENCY || 10000;
const {NODE_ENV, SESSION_SECRET, MONGODBURI, MONGODBNAME} = process.env;
/*Setup EJS*/
app.set('view engine', 'ejs');
app.use(ejsLayouts);

//Connect to MongoDB
const mongoConnection = connectDB();

// Passport config
require('./controllers/passportAzure')(passport)


// Sessions
const sessionMiddleware = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGODBURI + MONGODBNAME }),
});
app.use(sessionMiddleware);
  
// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
res.locals.user = req.user || null
next()
})


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
app.use('/myStats', myStatsRoute);
app.use('/auth', authRoute);

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
        console.log(moment().toISOString() + ' - An error has happened', err);
        setTimeout(()=>{
            run(false, 0); //If something is going wrong then restart after 60 sec
        }, updateFrequency*6)
    });
}

server.listen(process.env.PORT, ()=>{
    console.log(`${moment().format()} - Server listening on port ${process.env.PORT}`);
    run(false, 0);
    //getTodaysTeleoptiData();
    runScheduleUpdate();
});

//Socket.io stuff

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.on('connection', socket =>{
    if ( NODE_ENV != 'production' && socket.request.user){
        console.log(socket.request.user.upn + ' is connected');
    }
    else if (NODE_ENV != 'production'){
        console.log('a user is connected')
    }
    socket.emit('submit-room');

    socket.on('connect-to', room =>{
        console.log(`Connect to ${room} from ${socket.id}`);
        socket.emit('connect-ok', {id: socket.id, room})
        if (dataToUsers.queueData[room] && dataToUsers.dailyStats[room]){
            socket.emit('updateQueues', dataToUsers.queueData[room])
            socket.emit('updateStats', dataToUsers.dailyStats[room])
            
        }
        
        socket.join(room);
    });
});

let dataToUsers = {
    queueData: {
        denmark: null,
        finland: null,
        norway: null,
        sweden: null, 
        helpdesk: null,
        kitchen: null,
        nordic: null
    },
    dailyStats: {
        denmark: null,
        finland: null,
        norway: null,
        sweden: null, 
        helpdesk: null,
        kitchen: null,
        nordic: null
    }
}

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
        dataToUsers.queueData[unit] = objs;
        nordic[units[unit].abbr] = objs;
    });
    io.in('nordic').emit('updateQueues', nordic);
    dataToUsers.queueData.nordic = nordic;

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
                    if ( data.queueStats){
                        let qu = data.queueStats.find(e=>{
                            return e.queueId === q;
                        });
                        if ( qu ){
                            obj.data.push(qu);
                        }
                    }
                    
                });
            }
            else {

            }
            objs.push(obj)
        });
        io.in(unit).emit('updateStats', objs);
        dataToUsers.dailyStats[unit] = objs;
        nordicStats[units[unit].abbr] = objs;
    });
    io.in('nordic').emit('updateStats', nordicStats);
    dataToUsers.dailyStats.nordic = nordicStats;
    //io.in('denmark').emit('agentStatus', agentStatus);
    //io.in('denmark').emit('agentStatus', queueMap);
    if ( NODE_ENV != 'production'){
        console.log(`Number of missing groups: ${missingGroups.length}`);
    }
    
    
    
}