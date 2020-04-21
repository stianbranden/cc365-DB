require('dotenv').config();

const {getQueues} = require('./controllers/queues');
const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const moment = require('moment')
const rootRoute = require('./routes/root');
const ejsLayouts = require('express-ejs-layouts');
const morgan = require('morgan')
const {units} = require('./config')

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
    getQueues(auth, i).then(data=>{
        //Do stuff with the data
        //console.log(data);
        updateQueues(data);
        setTimeout(()=>{
            run(true, data.runCount); //Redo fecth after 10 sec, incrementing runCount
        }, 10000)
    }).catch(err=>{
        setTimeout(()=>{
            run(false, 0); //If something is going wrong then restart after 60 sec
        }, 60000)
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
    
    Object.keys(units).forEach(unit=>{        
        let objs = [];
        units[unit].groups.forEach(group=>{
            
            let obj = {
                group,
                data: []
            };
            queueMap.map[group].forEach(q=>{
                let qu = data.queueStatus.find(e=>{
                    return e.id === q;
                });
                obj.data.push(qu);
            });
            objs.push(obj)
            
        });
        io.in(unit).emit('updateQueues', objs);
        
    });
}