require('dotenv').config();

const {getQueues, getContacts, getSingleContact} = require('./controllers/queues');
const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const moment = require('moment')
const rootRoute = require('./routes/root');
const contactRoute = require('./routes/contact');
const ejsLayouts = require('express-ejs-layouts');
const morgan = require('morgan')
const {units} = require('./config')
const updateFrequency = process.env.UPDATE_FREQUENCY || 10000;

/*Setup EJS*/
app.set('view engine', 'ejs');
app.use(ejsLayouts);

//Static file middleware
app.use(express.static('public'));

//Logging middleware
if (process.env.NODE_ENV !== 'production'){
    app.use(morgan('common'));
  }


app.use('/contact', contactRoute);
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
        socket.emit('copnnect-ok', {id: socket.id, room})
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
    console.log(`Number of missing groups: ${missingGroups.length}`);
    
}