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
socket.on('agentStatus', agentStatus=>{
    console.log(agentStatus);

});


socket.on('updateQueues', data=>{
    //console.log(data);
    let dataSet = {
        qu: 0,
        lw: 0,
        min: 1000,
        max: 0,
        minFree: 1000,
        maxFree: 0
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

    if ( key === 'nordic' ){
        ex = {}
        Object.keys(data).forEach(key=>{
            if ( !ex[key] ){
                ex[key] = {
                    channels:{
                        ph: {...dataSet, queues: []},
                        ch: {...dataSet, queues: []},
                        em: {...dataSet, queues: []},
                        ac: {...dataSet, queues: []}
                    },
                    queueCount: 0
                }
            }
            let obj = data[key];
            obj.forEach(g=>{
                let abbr = g.group.split('-')[2].toLowerCase();
                if (abbr === 'cb'){
                    abbr = 'ph';
                }

                g.data.forEach(q=>{
                    ex[key].queueCount ++;
                    ex[key].channels[abbr].qu += q.inQueueCurrent;
                    if ( q.waitingDurationCurrentMax >ex[key].channels[abbr].lw ) {
                       ex[key].channels[abbr].lw = q.waitingDurationCurrentMax;
                    }
                    let ag = q.agentsServing - q.agentsNotReady;
                    if ( ag <ex[key].channels[abbr].min ){
                       ex[key].channels[abbr].min = ag;
                    }
                    if ( ag >ex[key].channels[abbr].max ){
                       ex[key].channels[abbr].max = ag
                    }

                    let free = q.agentsFree;
                    if ( free < ex[key].channels[abbr].minFree ){
                        ex[key].channels[abbr].minFree = free
                    }
                    if ( free > ex[key].channels[abbr].maxFree ){
                        ex[key].channels[abbr].maxFree = free
                    }
                   ex[key].channels[abbr].queues.push(q);
                });
            });
        })
        updateNordicCard(ex);
    }
    else {
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
                let agFree = q.agentsFree;
                if ( agFree < ex[abbr].minFree ){
                    ex[abbr].minFree = agFree;
                }
                if ( agFree > ex[abbr].maxFree ){
                    ex[abbr].maxFree = agFree;
                }
                ex[abbr].queues.push(q);
            });
        });
        updateGroups(ex)
    }
    
    console.log(ex);
    
    
});

/*
      ----------------------
        Update for cards, 
        Generic, not used for Nordic
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
        if ( data[cardKey].minFree === data[cardKey].maxFree ){
            card.freeAgents = data[cardKey].minFree;
        } else {
            card.freeAgents = data[cardKey].minFree + ' - ' + data[cardKey].maxFree
        }

    });
}

function updateNordicCard(data){
    Object.keys(data).forEach(cardKey=>{
        let cardData = data[cardKey];
        if (document.getElementById(cardKey)){
            document.getElementById(cardKey).data = cardData; 
        }
    })
}

if (key = 'ChatTranscript'){
    function enc(){
        let obj = document.querySelectorAll('.card-text');
        //console.log(obj.length)
        for ( let i = 0; i < obj.length; i++){
          let o = obj[i];
//          console.log(o);
          o.innerHTML = o.innerText;
        }
      }
      function chDate(){

        let obj = document.querySelectorAll('.card-footer');
        //console.log(obj.length)
        for ( let i = 0; i < obj.length; i++){
          let o = obj[i].innerText;
          //$(o).html(o.innerText);
          let created = moment(o).format("HH:mm:ss");
          obj[i].innerText = created ;
        }

      }
      function adjB (){
        let obj = document.querySelectorAll('.bRow');
        for ( let i = 0; i < obj.length; i++){
          let r = obj[i];
          let mH = 0;
          for ( let j = 0; j < r.length; j++ ){
            let b = r[j];
            if ( b.style.height > mH ){
              mH = b.style.height;
            }
          }
          for ( let j = 0; j < r.length; j++ ){
            r[j].style.height = mH;
          }
        }
      }
      enc();
      chDate();
      adjB();
}