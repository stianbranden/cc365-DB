

let burgermenu = document.querySelector('.menu');
let navmenu = document.querySelector('nav .navitems');

burgermenu.addEventListener('click', ()=>{
    burgermenu.classList.toggle('open');
    navmenu.classList.toggle('open');
    navmenu.classList.remove('no-anim');
    navmenu.classList.toggle('closed')
});



const socket = io();


socket.on('submit-room', ()=>{
    console.log(`Asked for room, giving ${key}`);
    socket.emit('connect-to', key);
})
socket.on('connect-ok', data=>{
    console.log(`Connected ok, ${data}`);
});

socket.on('updateQueues', data=>{
    //console.log(data);
    let ex = {
        ph: {
            qu: 0,
            lw: 0,
            min: 1000,
            max: 0,
            queues: []
        },
        em: {
            qu: 0,
            lw: 0,
            min: 1000,
            max: 0,
            queues: []
        },
        ch: {
            qu: 0,
            lw: 0,
            min: 1000,
            max: 0,
            queues: []
        },
        ac: {
            qu: 0,
            lw: 0,
            min: 1000,
            max: 0,
            queues: []
        }
    }
    data.forEach(g=>{
        let abbr = g.group.split('-')[2].toLowerCase();
        g.data.forEach(q=>{
            ex[abbr].qu += q.inQueueCurrent;
            if ( q.waitingDurationCurrentMax > ex[abbr].lw ) {
                ex[abbr].lw = q.waitingDurationCurrentMax;
            }
            let ag = q.agentsServing - q.agentsNotReady;
            if ( ag < ex[abbr].min ){
                ex[abbr].min = ag;
            }
            if ( ag > ex[abbr].max ){
                ex[abbr].max = ag
            }
            ex[abbr].queues.push(q);
        });
    });
    console.log(ex);
    updateGroups(ex)
    
});

function updateGroups(data){
    Object.keys(data).forEach(key=>{
        const card = document.querySelector(`#${key}`);
        card.queueData = data[key].queues;
        
        card.queue = data[key].qu;
        //lw = longest wait
        card.longestWait = data[key].lw;
        //min max agents
        if ( data[key].min === data[key].max ){
            card.agents = data[key].min
        } else {
            card.agents = data[key].min + ' - ' + data[key].max
        }

    });
}