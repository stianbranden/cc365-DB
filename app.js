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
const teamRoute = require('./routes/team');
const departmentRoute = require('./routes/department');
const alertsRoute = require('./routes/alerts');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./controllers/connectDB');
const passport = require('passport');
const ejsLayouts = require('express-ejs-layouts');
const morgan = require('morgan')
const cron = require('node-cron');
const {units} = require('./config')
const queueUpdateFrequency = process.env.UPDATE_FREQUENCY || 10000;
const {NODE_ENV, SESSION_SECRET, MONGODBURI, MONGODBNAME, TELEOPTI_UPDATE_FREQUENCY, OSUPDATEFREQ} = process.env;
const {logStd,logSys,logErr, logTab} = require('./controllers/logger');
const {getAlerts} = require('./controllers/getAlerts');
const {getOsData} = require('./controllers/getOsData');
const { checkChatStatus } = require('./controllers/checkChat');
/*Setup EJS*/
app.set('view engine', 'ejs');
app.use(ejsLayouts);

//Connect to MongoDB
const mongoConnection = connectDB();

// Passport config
require('./controllers/passportAzure')(passport)

//Middleware to take care of load balancer requests
app.use(require('./middleware/loadbalancer'));

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

//Body middleware
app.use(express.json())

//Logging middleware
if (NODE_ENV !== 'production'){
    app.use(morgan('common'));
}


//Routes
app.use('/contact', contactRoute);
app.use('/tableau', tableauRoute);
app.use('/chat', chatBotTranscriptRoute);
app.use('/mngrs', reportRoute);
app.use('/myStats', myStatsRoute);
app.use('/auth', authRoute);
app.use('/team', teamRoute);
app.use('/department', departmentRoute);
app.use('/alerts', alertsRoute);

app.use('/', rootRoute);

const intervals = {
    scheduleUpdate: {
        status: 'not running',
        interval: null,
        updateFrequency: TELEOPTI_UPDATE_FREQUENCY,
        function: _=>{ 
            runScheduleUpdate()
            .then(newSchedules=>{
                newSchedules.forEach(schedule =>{
                    io.in(schedule.agentId).emit('updatedSchedule', schedule);
                });
            })
            .catch(err=>logErr(err, false))}
    },
    queueUpdate: {
        status: 'not running',
        interval: null,
        updateFrequency: queueUpdateFrequency,
        function: _=>{
            const {auth, i} = intervals.queueUpdate.data;
            getQueues(auth, i)
            .then(res=>{
                updateQueues(res);
                updateIntervalData('queueUpdate', {auth: true, i: res.runCount});
            }).catch(err=>{
                logErr('Error in queueUpdate');
                logErr(err);
                stopInterval('queueUpdate');
                updateIntervalData('queueUpdate', {auth: false, i: 0});
                setTimeout(_=>startInterval('queueUpdate'), queueUpdateFrequency*6)
            });
        },
        data: {
            auth: false,
            i: 0
        }
    }
}

function startInterval(key){
    const action = intervals[key];
    if ( action.status === 'not running'){
        action.interval = setInterval(action.function, action.updateFrequency);
        action.status = 'running';
        logSys(`Action "${key}" has been set to ${action.status}`);
    }
    else {
        logSys(`Cannot start ${key}, already running`);
    }
}

function stopInterval(key){
    const action = intervals[key];
    if ( action.status === 'not running'){
        logSys(`Cannot stop ${key}, already stopped`);
    }
    else {
        clearInterval(action.interval);
        action.status = 'not running';
        logSys(`Action "${key}" has been set to ${action.status}`);
    }
}

function updateIntervalData(key, data){
    intervals[key].data = data;
}

server.listen(process.env.PORT, ()=>{
    logSys(`Server listening on port ${process.env.PORT}`);

    //Start up Sinch ContactCenter fetching
    //run(false, 0);
    getQueues(false, 0).then(data=> {
        updateQueues(data);
        updateIntervalData('queueUpdate', {i: 1, auth: true});
        startInterval('queueUpdate');
    });

    //Start up Teleopti data fetching
    getTodaysTeleoptiData({dropScheduleCollection: false}).then(_=>startInterval('scheduleUpdate'));
    
    cron.schedule('0 0 3 * * *', _=>{ //Getting data at 03:00 each night
        stopInterval('scheduleUpdate');
        logSys('Running daily read of Teleopti data');
        getTodaysTeleoptiData({dropScheduleCollection: true}).then(_=>{
            startInterval('scheduleUpdate')
        }).catch(err=>logErr(err));
    })

    cron.schedule('0 */1 * * * *', _=>{ //Alerts
        //logStd('Checking for alerts');
        getAlerts().then(alerts=>{
            io.in('nordic').emit('new-alert', {alerts});
        });
        ['Denmark', 'Finland', 'Norway', 'Sweden', 'Kitchen', 'Helpdesk'].forEach(department=>{
            getAlerts(department).then(alerts=>{
                const room = department.toLowerCase();
                logStd(`Contacting ${room} with ${alerts.length} alerts`);
                io.in(room).emit('new-alert', {alerts});
            });
        })
    });

    cron.schedule('0 42 * * * *', _=>{
        //getQueues(true, 0).then(data=>console.log(data.data.queueStatus[1]))
    })

    cron.schedule('0 */1 * * * *', _=>{ //Check chat
        checkChatStatus();
    });

    cron.schedule(`0 */${OSUPDATEFREQ} * * * *`, _=>{ //Get Admin data
        getOsData().then(osData=>{
            logTab(osData, 'OS-Data');
            io.in('nordic').emit('admin-data', osData);
        });
    })

});

//Socket.io stuff

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.on('connection', socket =>{
    if ( socket.request.user){
        logStd(socket.request.user._id + ' is connected');
    }
    else {
        logStd('a user is connected')
    }
    socket.emit('submit-room');

    socket.on('connect-to', room =>{
        logStd(`Connect to ${room} from ${socket.id}`);
        socket.emit('connect-ok', {id: socket.id, room})
        if (dataToUsers.queueData[room] && dataToUsers.dailyStats[room]){
            socket.emit('updateQueues', dataToUsers.queueData[room])
            socket.emit('updateStats', dataToUsers.dailyStats[room])
            
        }
        socket.emit('reconnect-to-agents');
        
        socket.join(room);
    });

    socket.on('connect-to-agent', agentId =>{
        logStd(`Socket ${socket.id} is listening to agent id ${agentId} schedule`);
        socket.emit('confirm-connection-to-agent', agentId);
        socket.join(agentId);
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
    queueMap = queueMap.data;
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
    logStd(`Number of missing groups: ${missingGroups.length}`);
    
}