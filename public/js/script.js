/*
      ----------------------
        Menu Controls
        General
      ----------------------
*/
let burgermenu = document.querySelector('.menu');
let navmenu = document.querySelector('nav .navitems');

burgermenu.addEventListener('click', ()=>{
    burgermenu.classList.toggle('open');
    navmenu.classList.toggle('open');
    navmenu.classList.remove('no-anim');
    navmenu.classList.toggle('closed')
});

document.querySelector('.container').classList.add(key);


/*
      ----------------------
        Socket.io init
        General
      ----------------------
*/

const socket = io();


socket.on('submit-room', ()=>{
    console.log(`Asked for room, giving ${key}`);
    socket.emit('connect-to', key);
})
socket.on('connect-ok', data=>{
    console.log(`Connected ok, ${data}`);
});


/*
      ----------------------
        On QueueUpdate, 
        spesific to key
      ----------------------
*/
socket.on('updateQueues', data=>{
    console.log(data);
    let dataSet = {
        qu: 0,
        lw: 0,
        min: 1000,
        max: 0
    }
    let ex = {
        ph: {
            ...dataSet,
            queues: []
        },
        em: {
            ...dataSet,
            queues: []
        },
        ch: {
            ...dataSet,
            queues: []
        },
        ac: {
            ...dataSet,
            queues: []
        }
    }
    if ( key === 'helpdesk'){
        ex = {
            dk: {
                ...dataSet,
                queues: []
            },
            fi: {
                ...dataSet,
                queues: []
            },
            se: {
                ...dataSet,
                queues: []
            },
            no: {
                ...dataSet,
                queues: []
            }
        }
    }

    data.forEach(g=>{

        let abbr = g.group.split('-')[2].toLowerCase();
        if (abbr === 'cb'){
            abbr = 'ph';
        }
        //console.log(abbr, ex[abbr]);
        if ( key === 'helpdesk'){
            abbr = g.group.split('-')[0].toLowerCase();
        }
        
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

/*
      ----------------------
        Update for cards, 
        Generic
      ----------------------
*/
function updateGroups(data){
    Object.keys(data).forEach(cardKey=>{
        const card = document.querySelector(`#${cardKey}`);
        card.queueData = data[cardKey].queues;
        
        card.queue = data[cardKey].qu;
        //lw = longest wait
        card.longestWait = data[cardKey].lw;
        //min max agents
        if ( data[cardKey].min === data[cardKey].max ){
            card.agents = data[cardKey].min
        } else {
            card.agents = data[cardKey].min + ' - ' + data[cardKey].max
        }

    });
}