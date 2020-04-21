

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
    console.log(data);
    let ex = {
        ph: {
            qu: 0,
            lw: 0,
            min: 1000,
            max: 0
        },
        em: {
            qu: 0,
            lw: 0,
            min: 1000,
            max: 0
        },
        ch: {
            qu: 0,
            lw: 0,
            min: 1000,
            max: 0
        },
        ac: {
            qu: 0,
            lw: 0,
            min: 1000,
            max: 0
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
        });
    });
    console.log(ex);
    updateGroups(ex)
    
});

function updateGroups(data){
    Object.keys(data).forEach(key=>{
        document.querySelector(`#${key} .card-queue h1`).innerText = data[key].qu;
        //lw = longest wait
        let lw = moment.duration(data[key].lw);
        let lwDisplay = Math.floor(lw.as('s'));
        let lwSuffix = 's';
        if ( lw.as('s') > 100 && lw.as('s') < 600 ){
            lwDisplay = lw.minutes();
            if (lw.seconds() < 10 ){
                lwDisplay += ':0' + lw.seconds();
            }
            lwSuffix =''
        }
        else if (lw.as('s') >= 600 && lw.as('s') < 3600 ){
            lwDisplay = Mats.floor(lw.as('m'));
            lwSuffix = 'min'
        }
        else if (lw.as('s') >= 3600) {
            lwDisplay = Math.floor(lw.as('h'));
            lwSuffix = 'h'
        }
        document.querySelector(`#${key} .lw .stat-number`).innerText = lwDisplay + lwSuffix;
        //min max agents
        if ( data[key].min === data[key].max ){
            document.querySelector(`#${key} .agents .stat-number`).innerText = data[key].min
        } else {
            document.querySelector(`#${key} .agents .stat-number`).innerText = data[key].min + ' - ' + data[key].max
        }

    });
}