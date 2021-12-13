
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

fetch('/user').then(response=>response.json()).then(user=>{
    //console.log(user.custom_access);
    user.custom_access.forEach(access=>{
      //  console.log(access.alter);
        if ( access.alter === 'new' ){ //New links
        //    console.log('new', access);
            document.querySelector('.navitems ul').insertAdjacentHTML('beforeend', `<li>
                <a href='${access.path}'>${access.label}</a>
            </li>`);
        } else {
            const li = document.querySelector(`[data-alter='${access.alter}']`)
            if ( li ) li.insertAdjacentHTML( 'beforeend', `<a class='alternative' href='${access.path}'>${access.label}</a>`)
        }
    });
})


/*
    ----------------------
        Footer Menu Controls
        General
      ----------------------

*/
let footer = document.querySelector('footer');
footer.addEventListener('click', ()=>{
    footer.classList.toggle('clicked');
})


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
    console.log(`Connected ok, ${JSON.stringify(data)}`);
});


/*
      ----------------------
        On QueueUpdate, 
        spesific to key
      ----------------------
*/
socket.on('agentStatus', agentStatus=>{
    //console.log(agentStatus);

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

                    let free = q.agentsFree;// - q.agentsWrapUp;
                    //console.log({q, free, agentsFree: q.agentsFree, agentsWrapUp: q.agentsWrapUp});
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
                let agFree = q.agentsFree;//- q.agentsWrapUp;
                //console.log({q, ag, agFree, agentsFree: q.agentsFree, agentsWrapUp: q.agentsWrapUp});
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
    
    //console.log(ex);
    
    
});

socket.on('updateStats', data=>{
    //console.log('UpdateStats',data);
    if (key === 'nordic'){
        Object.keys(data).forEach(countrycode=>{
            let channels = {
                ph: {
                    offered: 0,
                    answered: 0,
                    inSLA: 0,
                    totSA: 0,
                    active: false
                },
                ch: {
                    offered: 0,
                    answered: 0,
                    inSLA: 0,
                    totSA: 0,
                    active: false
                },
                em: {
                    offered: 0,
                    answered: 0,
                    inSLA: 0,
                    totSA: 0,
                    active: false
                },
                ac: {
                    offered: 0,
                    answered: 0,
                    inSLA: 0,
                    totSA: 0,
                    active: false
                }
            }
            data[countrycode].forEach(group=>{
                let code = group.group.split('-')[2].toLowerCase()
                if ( code === 'cb'){
                    code = 'ph'
                }
                let channel = channels[code];
                group.data.forEach(q=>{
                    channel.offered += q.countOfArrivedContacts;
                    if ( code === 'ch' || code == 'ph' ){
                        channel.answered += q.countOfHandledContacts;
                    } else {
                        channel.answered += q.countOfCompletedContacts;
                    }
                    channel.inSLA += q.countOfAnsweredOnTimeContacts;
                    channel.totSA += q.waitingDurationForHandled;
                    channel.active = true;
                })
            });
            document.getElementById(countrycode).dailyData = channels;
            //console.log(channels);
        });
    } 
    else if (key === 'helpdesk') {
        let channels = {
            dk: {
                offered: 0,
                answered: 0,
                totHandling: 0,
                inSLA: 0,
                totSA: 0,
                active: false,
                channel: 'ph'
            },
            fi: {
                offered: 0,
                answered: 0,
                totHandling: 0,
                inSLA: 0,
                totSA: 0,
                active: false,
                channel: 'ph'
            },
            no: {
                offered: 0,
                answered: 0,
                totHandling: 0,
                inSLA: 0,
                totSA: 0,
                active: false,
                channel: 'ph'
            },
            se: {
                offered: 0,
                answered: 0,
                totHandling: 0,
                inSLA: 0,
                totSA: 0,
                active: false,
                channel: 'ph'
            }
        }
        data.forEach(group=>{
            let channel = channels[group.group.split('-')[0].toLowerCase()];
            group.data.forEach(q=>{
                channel.offered += q.countOfArrivedContacts;
                if ( channel.channel === 'ch' || channel.channel == 'ph' ){
                    channel.answered += q.countOfHandledContacts;
                } else {
                    channel.answered += q.countOfCompletedContacts;
                }
                channel.inSLA += q.countOfAnsweredOnTimeContacts;
                channel.totSA += q.waitingDurationForHandled;
                channel.totHandling += q.handlingDuration + q.afterworkDuration;
                channel.active = true;
            });
        });
        Object.keys(channels).forEach(channel=>{
            let data = channels[channel];
            document.getElementById(channel).dailyData = data;
        });
        //document.getElementById(countrycode).dailyData = channels;
        //console.log(channels);
    }
    else {
        let channels = {
            ph: {
                offered: 0,
                answered: 0,
                totHandling: 0,
                inSLA: 0,
                totSA: 0,
                active: false,
                channel: 'ph'
            },
            ch: {
                offered: 0,
                answered: 0,
                totHandling: 0,
                inSLA: 0,
                totSA: 0,
                active: false,
                channel: 'ch'
            },
            em: {
                offered: 0,
                answered: 0,
                totHandling: 0,
                inSLA: 0,
                totSA: 0,
                active: false,
                channel: 'em'
            },
            ac: {
                offered: 0,
                answered: 0,
                totHandling: 0,
                inSLA: 0,
                totSA: 0,
                active: false,
                channel: 'ac'
            }
        }
        data.forEach(group=>{
            let channelCode = group.group.split('-')[2].toLowerCase();
            if (channelCode==='cb'){
                channelCode ='ph';
            }
            let channel = channels[channelCode];
            group.data.forEach(q=>{
                channel.offered += q.countOfArrivedContacts;
                if ( channel.channel === 'ch' || channel.channel == 'ph' ){
                    channel.answered += q.countOfHandledContacts;
                } else {
                    channel.answered += q.countOfCompletedContacts;
                }
                channel.inSLA += q.countOfAnsweredOnTimeContacts;
                channel.totSA += q.waitingDurationForHandled;
                channel.totHandling += q.handlingDuration + q.afterworkDuration;
                channel.active = true;
            });
        });
        Object.keys(channels).forEach(channel=>{
            let data = channels[channel];
            document.getElementById(channel).dailyData = data;
        });
        //document.getElementById(countrycode).dailyData = channels;
        //console.log(channels);

    }
    
})

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

if (key == 'ChatTranscript'){
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

/*
      ----------------------
        HotBot - Kindly - ChatBot
      ----------------------
*/

if ( key === 'norway'){
    if ( !site){
        //Launch site picker
        //<ion-icon name="arrow-back-outline" id='site-picker'></ion-icon>
        let nav = document.getElementById('site-nav');
        nav.classList.remove('hidden');
        nav.addEventListener('click', ()=>{
            nav.classList.toggle('open');
        });
        nav.querySelectorAll('button').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                let key = btn.getAttribute('key');
                nav.classList.toggle('open');
                nav.classList.add('hidden');
                showBot(key);
            });
        });
    }
}
else if (key === 'denmark' ){
    showBot('d067a39f-c160-4824-8f7a-0863e9f9ef67');
}
else if (key === 'sweden' ){
    showBot('c8f2f820-e41d-470b-9b69-a003ec24d2c1');
}




function showBot(botKey){

    window.kindlyOptions = {
        bubbleAvatar: '/images/hotbot.webp',
        name: 'HotBot',
        context: {
            country: key
        }
    }

    var script = document.createElement('script');
    script.src = 'https://chat.kindlycdn.com/kindly-chat.js';
    script.async = true;
    script.id = 'kindly-chat';
    script.setAttribute('data-shadow-dom', '1');
    //script.setAttribute('data-bot-key', '49359f26-44ed-4703-b301-b169a224955c');
    script.setAttribute('data-bot-key', botKey);
    document.body.appendChild(script);

}

/*
      ----------------------
        Alerts
      ----------------------
*/

//alertWriter
/*
const modal = document.getElementById('alertWriter');
document.getElementById('openAlertWriter').onclick= e=>{
    modal.classList.toggle('open');
}
document.getElementById('closeAlertWriter').onclick=e=>{
    modal.classList.toggle('open');
};

window.onclick = e=> {
    if (e.target == modal) {
        modal.classList.toggle('open');;
    }
}*/
let lis = []
if (typeof listeners != 'undefined'){
    lis = listeners;
}

if (lis && lis.indexOf('alerts') >= 0){
    socket.on('new-alert', data=>{
        //console.log('new-alert', data);
        data.alerts.forEach(alert=>{
            let div = document.querySelector('alerts-card').shadowRoot.getElementById(alert._id);
            let updateOrNew = 'update'
            if (!div){
                updateOrNew = 'new';
                
            }
            /*else if (alert.updatedAt > div.getAttribute('data-updated')){
                updateOrNew = 'update'
            }*/
            if ( updateOrNew == 'new' ){
                console.log(`New ${alert._id}`);
                div = document.createElement('alert-row');
                div.id = alert._id;
                div.setAttribute('closed', alert.closed)
                div.setAttribute('updated', alert.updatedAt)
                div.setAttribute('department', alert.department)
                div.setAttribute('type', alert.alerttype)
                div.setAttribute('text', alert.text)
                div.setAttribute('date', alert.date)
                div.setAttribute('top', true)
                div.setAttribute('title', alert.title)
                div.setAttribute('icon', alert.icon)

                document.querySelector('alerts-card').prepend(div);
            }
            else {
                div.data = {
                    closed: alert.closed,
                    updated: alert.updatedAt,
                    department: alert.department,
                    type: alert.alerttype,
                    text: alert.text,
                    date: alert.date,
                    title: alert.title,
                    icon: alert.icon
                };
            }
        });
    });
}


/*
      ----------------------
        Schedules
      ----------------------
*/

if ( page === 'team' ){
    const notifyMeOn = new Set();
    let url = (key.startsWith('dep_') ? '/department/' : '/team/') + `schedules/${key}/${day}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {  
        const container = document.querySelector('.container');
        data = data.map(schedule=>{
            if (schedule.shift && schedule.shift.length > 0){
                schedule.startTime = schedule.shift[0].startTime;
                schedule.endTime = schedule.shift[schedule.shift.length-1].endTime;
            } else {
                schedule.startTime = moment().hour(23).format();
            }
            return schedule;
        });
        data.sort((a,b)=> (moment(a.startTime).format('HH:mm') < moment(b.startTime).format('HH:mm')) ? -1 : 1)
        console.log(data);
        data.forEach(schedule=>{
            createScheduleContainer(schedule, container)           
            if (schedule.dayOff){
                addDayOffBlock(schedule);                
            } else {
                addShiftBlocks(schedule);
            }
            socket.emit('connect-to-agent', schedule.agentId);
      });
      if ( moment().format('YYYY-MM-DD') === day ){
        markActive();
        setInterval(_=>{
            markActive()
            notifyChangeUpcoming();
        }, 60000)
      }
      resizeTimeLabels();
      //resizeActivityLabels()
      window.onresize = _=>{
          resizeTimeLabels();
          //resizeActivityLabels()
      }
    });

    const addNotification = async agentId =>{

        let permission = false
        if (Notification.permission === 'granted'){
            permission = true;
        } else if ( await Notification.requestPermission() === 'granted'){
            permission = true;
        }

        if (permission){
            const bell = document.querySelector(`[id="${agentId}"] ion-icon`)
            if (bell.classList.contains('active')){
                bell.classList.remove('active')
                bell.name = 'notifications-outline'
                notifyMeOn.delete(agentId);
            }
            else {
                bell.classList.add('active')
                bell.name = 'notifications'
                notifyMeOn.add(agentId);
            }
        }
    }

    const createScheduleContainer = (schedule, container)=>{
        let div = document.createElement("div");
        div.id = schedule.agentId;
        div.classList.add("schedule-container");
        
        container.appendChild(div);
        div.insertAdjacentHTML( 'beforeend',`<ion-icon name="notifications-outline"></ion-icon><div class="name"><span>${schedule.agent.displayName}</span></div><div class="shift"></div>`);
        let bell = div.querySelector('ion-icon');
        bell.onclick = _=> addNotification(schedule.agentId);
    }

    const addShiftBlocks = (schedule)=>{
        let shift = document.querySelector(`[id="${schedule.agentId}"] .shift`);
        shift.innerHTML = '';
        let first = true;
        schedule.shift.forEach(activity=>{
            let block = document.createElement("div");
            let name = activity.name;
            let bgColor = activity.displayColorHex;
            block.id = activity._id;
            block.setAttribute("data-start-time", activity.startTime)
            block.setAttribute("data-end-time", activity.endTime)
            block.setAttribute("data-name", schedule.agent.displayName)
            block.className = "block";
            let width = activity.lengthOfShift;
            if (width < 60){
                block.classList.add('extra-small');
            }
            if (activity.activityId){
                block.classList.add("activity");
            } else {
                block.classList.add("absence");
                name = 'Absence';
                bgColor = '#ffffff'
            }
            block.setAttribute('data-activity', name);
            
            block.insertAdjacentHTML( 'beforeend',`<span class="activity-name"> ${name}</span><span class="time">${moment(activity.startTime).format("HH:mm")} - ${moment(activity.endTime).format("HH:mm")}</span>`);
            block.insertAdjacentHTML('beforeend', `<div class="tooltiptext"><span class="activity-name"> ${name}</span><br><span class="time">${moment(activity.startTime).format("HH:mm")} - ${moment(activity.endTime).format("HH:mm")}</span></div>`)
            
            block.style.backgroundColor = bgColor;
            let textColor = 'white';
            if ( lightOrDark(bgColor) == 'light' ){
                textColor = 'black';
            }
            block.style.color = textColor;  
            block.style.border = "1px solid black";
            
            block.style["grid-column-end"] = "span " + width;
            if (first){
                first = false;
                block.style["grid-column-start"] = activity.offset-360;
            }
            shift.appendChild(block)
        });
    }

    const addDayOffBlock = (schedule) => {
        let shift = document.querySelector(`[id="${schedule.agentId}"] .shift`);
        shift.innerHTML = '';
        let block = document.createElement("div");
        block.insertAdjacentHTML( 'beforeend',`<span class="activity-name"> ${schedule.dayOff.name}</span>`);
        block.className = "block dayoff";
        block.style.backgroundColor = schedule.dayOff.displayColorHex;
        let textColor = 'white';
        if ( lightOrDark(schedule.dayOff.displayColorHex) == 'light' ){
            textColor = 'black';
        }
        block.style.color = textColor;  
        block.style.border = "1px solid black";
        let width = 60
        block.style["grid-column-end"] = "span " + width;
        block.style["grid-column-start"] = 30;
        shift.appendChild(block)

    }

    function resizeTimeLabels(){
        let sizeToHide = 45;
        document.querySelectorAll('.time-label.even').forEach(el=>{
            if (el.offsetWidth < sizeToHide && el.style.visibility != "hidden") {
                el.style.visibility = "hidden";
            }
            else if (el.offsetWidth >= sizeToHide && el.style.visibility == "hidden") {
              el.style.visibility = "visible";
            }
        })
    }

    function resizeActivityLabels(){
        let smallScreen = 700;
        let body = document.querySelector('body');
        let isSmallScreen = body.offsetWidth <= smallScreen;
        document.querySelectorAll('.block span').forEach(el=>{
            if (isSmallScreen && !el.classList.contains('small')){
                el.classList.add('small');
            }
            else if (!isSmallScreen && el.classList.contains('small') ){
                el.classList.remove('small');
            }
        })
    }

    function markActive(time = moment(), node = document){
        node.querySelectorAll('.block.activity').forEach(block=>{
            block.classList.remove('active');
            block.classList.add('checked');
            if ( time >= moment(block.getAttribute("data-start-time")) && time <= moment(block.getAttribute("data-end-time"))){
                block.classList.add('active');
            }


        });
    }

    function notifyChangeUpcoming(verbose = false){
        notifyMeOn.forEach(agentId=>{
            let nextActivity = findNextActivity(moment(), document.querySelector(`[id="${agentId}"]`));
            if ( verbose ){
                console.log({agentId, nextActivity});
            }
            if ( nextActivity.nextIn === 5 ){
                let title, body;
                title = `Upcoming activity change for ${document.querySelector(`[id="${agentId}"] .name span`).innerText}!`;
                body = `Get ready to change activity\nNext activity is ${nextActivity.nextActivity} @ ${nextActivity.nextAt}`;
                new Notification(title, 
                {
                    body,
                    icon: '/images/icon.png'
                })
            }
        });
    }

    function findNextActivity(time = moment(), node = document){
        let nextActivity = {
            nextIn: 1000
        }
        node.querySelectorAll('.block.activity').forEach(block=>{
            let timeTo = moment(block.getAttribute("data-start-time")).diff(time, 'minutes');
            //console.log({time, block});
            if (timeTo>=0 && timeTo < nextActivity.nextIn ){
                nextActivity = {
                    nextActivity: block.getAttribute('data-activity'),
                    nextIn: timeTo,
                    nextAt: moment(block.getAttribute("data-start-time")).format('HH:mm')
                }
            }
        });
        if ( nextActivity.nextIn < 1000 ){
            return nextActivity
        }
        else {
            return {}
        }
    }

    socket.on('updatedSchedule', schedule=>{
        //console.log('update to schedule', schedule);
        if ( schedule.date === day ){
            if ( schedule.dayOff ){
                addDayOffBlock(schedule);
            }
            else {
                addShiftBlocks(schedule);
                markActive(null, document.querySelector(`[id="${schedule.agentId}"]`))
            }
            if ( notifyMeOn.has(schedule.agentId) ){
                const nextActivity= findNextActivity(moment(), document.querySelector(`[id="${schedule.agentId}"]`));

                new Notification(`Schedule change for ${schedule.agent.displayName}`, 
                {
                    body: 'A schedule you are watching has changed!\n' + nextActivity.nextIn > 0 ? `Next activity is ${nextActivity.nextActivity} @ ${nextActivity.nextAt}` : '',
                    icon: '/images/icon.png'
                })
            }
        }
        
    });
    //'reconnect-to-agents'

    const subscribedAgents = new Set();
    socket.on('confirm-connection-to-agent', agentId => subscribedAgents.add(agentId));
    socket.on('reconnect-to-agents', _=>{
        //console.log(subscribedAgents);
        subscribedAgents.forEach(agentId => socket.emit('connect-to-agent', agentId));
    });

}


function lightOrDark(color) {

    // Variables for red, green, blue values
    let r, g, b, hsp;
    
    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

        // If RGB --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        
        r = color[1];
        g = color[2];
        b = color[3];
    } 
    else {
        
        // If hex --> Convert it to RGB: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }
    
    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp>127.5) {

        return 'light';
    } 
    else {

        return 'dark';
    }
}

