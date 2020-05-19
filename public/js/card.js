function msToTime(ms){
    let s = Math.round(ms/1000);
    if ( s < 100 ){
        return s+'s';
    } 
    else if ( s < 600 ){
        let m = Math.floor(s/60);
        s = s - (m * 60);
        if ( s < 10 ){
            return m + ':0' + s;
        }
        else {
            return m + ':' + s;
        }
    }
    else if ( s < 3600 ){
        return Math.round(s/60) + 'm'
    }
    else if ( s < 259200 ) {
        return Math.round(s/3600) + 'h'
    } else {
        return Math.round(s/86400) + 'd'
    }
}

function queueSort(a,b){
    let comp = 0;
    if (a.name > b.name){
        comp = 1;
    }
    else if (a.name < b.name) {
        comp = -1;
    }
    return comp;
}

const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" type="text/css" href="/css/card.css" />
<div class="loader" hidden>
    <svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>
        <circle cx='256' cy='256' r='32' style='fill:none;stroke-miterlimit:10;stroke-width:16px'/>
        <circle cx='416' cy='256' r='32' style='fill:none;stroke-miterlimit:10;stroke-width:16px'/>
        <circle cx='96' cy='256' r='32' style='fill:none;stroke-miterlimit:10;stroke-width:16px'/>
    </svg>
</div>
<div class="card" hidden>
        <div class="card-header">
            <h2></h2>
        </div>
        <div class="card-main anim" num="0">
            <div class="card-queue">
                <h1></h1>
            </div>
            <div class="card-stat">
                <div class="stat free">
                    <div class="stat-number">TBA</div>
                    <div class="stat-text">idle agents</div>
                </div>
                <div class="stat agents">
                    <div class="stat-number"> </div>
                    <div class="stat-text">ready agents</div>
                </div>
                <div class="stat lw">
                    <div class="stat-number"> </div>
                    <div class="stat-text">Longest wait</div>
                </div>
            </div>
        </div>
        
        
        <div class="card-sub">
            <div class="arrow-up">
                <ion-icon name="chevron-up-outline"></ion-icon>
                <ion-icon name="chevron-back-outline"></ion-icon>
            </div>
            <div class="center">
                <ion-icon></ion-icon>
            </div>
            <div class="arrow-down">
                <ion-icon name="chevron-down-outline"></ion-icon>
                <ion-icon name="chevron-forward-outline"></ion-icon>
            </div>
        </div>
    </div>`

function getMainElement(type, num, key){
    const mainTemp = document.createElement('template')
    if (type === 'main'){
        mainTemp.innerHTML = `<div class="card-main" num="${num}" key="${key}">
            <div class="card-queue">
                <h1></h1>
            </div>
            <div class="card-stat">
                <div class="stat free">
                    <div class="stat-number">TBA</div>
                    <div class="stat-text">idle agents</div>
                </div>
                <div class="stat agents">
                    <div class="stat-number"> </div>
                    <div class="stat-text">ready agents</div>
                </div>
                <div class="stat lw">
                    <div class="stat-number"> </div>
                    <div class="stat-text">Longest wait</div>
                </div>
            </div>
        </div>`;
    } 
    
    else if (type === 'summary'){
        mainTemp.innerHTML = `<div class="card-summary center anim" num="0" key=center>
            <div class="card-queue ph">
                <h1 class="queue-number">0</h1>
                <h5>Phone</h5>
            </div>
            <div class="card-queue ch">
                <h1 class="queue-number">0</h1>
                <h5>Chat</h5>
            </div>
            <div class="card-queue em">
                <h3 class="queue-number">0</h3>
                <h5>Email</h5>
            </div>
            <div class="card-queue ac">
                <h3 class="queue-number">0</h3>
                <h5>Action</h5>
            </div>
        </div>`;
    }

    return mainTemp;
}



class Card extends HTMLElement {
    static get observedAttributes() {
        return ['hidden'];
    }

    set queue(q){
        this.shadowRoot.querySelector('.card-queue h1').innerText = q;
    }

    set longestWait(lw){
        this.shadowRoot.querySelector('.lw .stat-number').innerText = msToTime(lw);
    }

    set agents(ag){
        this.shadowRoot.querySelector('.agents .stat-number').innerText = ag;
    }

    set freeAgents(ag){
        this.shadowRoot.querySelector('.free .stat-number').innerText = ag;
    }

    set queueData(data){
        
        if ( this.queues.length === 0 ){
            this.queues = data.sort(queueSort);
            if ( this.queues.length === 0 ){
                this.shadowRoot.querySelector('.card').setAttribute('hidden', true)
                this.setAttribute('hidden', true)
            } else {
                this.shadowRoot.querySelector('.card').removeAttribute('hidden');
                this.shadowRoot.querySelector('.loader').setAttribute('hidden', true);
                let i = 0;
                let list = []
                this.queues.forEach(queue=>{
                    if ( i === 6) {
                        i = 0;
                        this._createMain(list);
                        list = [];
                    }
                    list.push(queue);
                    i++;
                });
                if ( list.length > 0 ){
                    this._createMain(list);
                }
            }
        } else {
            this.queues = data.sort(queueSort);
            this.queues.forEach(q=>{
                this.shadowRoot.querySelector(`[id='${q.id}'] .queue`).innerText = q.inQueueCurrent;
                this.shadowRoot.querySelector(`[id='${q.id}'] .agents`).innerText = `${q.agentsFree}/${q.agentsServing-q.agentsNotReady}`;
                this.shadowRoot.querySelector(`[id='${q.id}'] .oldest`).innerText = msToTime(q.waitingDurationCurrentMax);
            });

        }
        
    }

    get queueData(){
        return this.queues;
    }

    constructor(){
        super();
        this.queues = [];
        this.page = 0;
        this.pageLength = 1;
        let name = this.getAttribute('name');
        let icon = this.getAttribute('icon');
        let showLoader = this.getAttribute('showLoader');
        let hideCountryName = this.getAttribute('hide-country-abbr');
        let hideChannelAbbr = this.getAttribute('hide-channel-abbr');
        let trimAway = this.getAttribute('trim-away');
        if ( trimAway && trimAway.includes(',') ){
            trimAway = trimAway.split(',')
        } else if (trimAway){
            trimAway = [trimAway]
        }
        else {
            trimAway = []
        }
        //this.setAttribute('something', trimAway[0])

        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        if (showLoader){
            this.shadowRoot.querySelector('.loader').removeAttribute('hidden');
        }
        this.shadowRoot.querySelector('.card-header h2').innerText = name;
        this.shadowRoot.querySelector('.card-sub .center ion-icon').setAttribute('name', icon);
        
        this._createMain = (list)=>{
            let num = this.pageLength;
            this.pageLength++;
            let ele = `<div class="card-table">
                <table>
                    <tr><th class="name">Name</th><th>Queue</th><th>Idle/Ready</th><th>Oldest</th></tr>`;
            list.forEach(q=>{
                let qname = q.name;
                if ( hideCountryName && qname.includes('(')){
                    let rep = qname.substr(qname.indexOf('('), 4);
                    qname = qname.replace(rep, '');
                }
                if ( hideChannelAbbr ){
                    qname = qname.replace('@ ', '').replace('Action ', '');
                }
                if (trimAway.length > 0){
                    trimAway.forEach(trim=>{
                        qname = qname.replace(trim, '')
                    })
                }
                ele += `<tr id="${q.id}"><td class="name" title="${q.name}">${qname}</td><td class="queue">${q.inQueueCurrent}</td><td class="agents">${q.agentsFree}/${q.agentsServing-q.agentsNotReady}</td><td class="oldest">${msToTime(q.waitingDurationCurrentMax)}</td></tr>`
            })

            ele += `
                    </table>
                </div>`;
            let div = document.createElement('div')
            div.setAttribute('class', 'card-main')
            div.setAttribute('num', String(num))
            div.innerHTML = ele;
            this.shadowRoot.querySelector('.card').appendChild(div);
        }

        let _toggleMain = i=>{
            if ( this.pageLength > 0){
                let currFront = this.shadowRoot.querySelector(`.card-main[num="${this.page}"]`);
                this.page -= i;
                if (this.page === this.pageLength){
                    this.page = 0;
                } else if (this.page < 0 ){
                    this.page = this.pageLength -1;
                }
                let nextFront = this.shadowRoot.querySelector(`.card-main[num="${this.page}"]`);
                nextFront.className = 'card-main';
                if ( i < 0 ){
                    nextFront.classList.add('up')
                    setTimeout(()=>{
                        currFront.classList.add('down');
                        nextFront.className = 'card-main anim'
                    }, 10)
                }
                else {
                    nextFront.classList.add('down');
                    setTimeout(()=>{
                        currFront.classList.add('up');
                        nextFront.className = 'card-main anim'
                    },10);
                }
            }
        }
        this.shadowRoot.querySelector('.arrow-up').addEventListener('click', ()=>{
            _toggleMain(1);
        });
        this.shadowRoot.querySelector('.arrow-down').addEventListener('click', ()=>{
            _toggleMain(-1);
        });

        
    }
} 

class SummaryCard extends HTMLElement{
    static get observedAttributes() {
        return ['icon', 'name'];
    }

    set data(data){
        if ( data.queueCount > 0 ){
            this.shadowRoot.querySelector('.card').removeAttribute('hidden');
            this.shadowRoot.querySelector('.loader').setAttribute('hidden', true);
        }
        else {
            this.shadowRoot.querySelector('.card').setAttribute('hidden', true);
            this.setAttribute('hidden', true);
        }
        let channels = []
        Object.keys(data.channels).forEach(channel=>{
            let queueData = data.channels[channel];
            if ( queueData.queues.length > 0 ){
                channels.push(channel)
                this.shadowRoot.querySelector(`.card-queue.${channel}`).removeAttribute('hidden');
                this.shadowRoot.querySelector(`.card-queue.${channel} .queue-number`).innerText = queueData.qu;
                this.shadowRoot.querySelector(`.card-menu .${channel}`).removeAttribute('hidden');
                if (!this.mainExists(channel)){
                    let tmp = getMainElement('main', this.pageLength, channel);
                    this.shadowRoot.querySelector('.card').append(tmp.content.cloneNode(true));
                    this.pageLength++;
                }
                this.shadowRoot.querySelector(`.card-main[key="${channel}"] .card-queue h1`).innerText = queueData.qu;
                let minMax = queueData.min + '-' + queueData.max;
                if (queueData.min === queueData.max){
                    minMax = queueData.max;
                }
                let minMaxFree = queueData.minFree + '-' + queueData.maxFree;
                if (queueData.minFree === queueData.maxFree){
                    minMaxFree = queueData.maxFree;
                }
                this.shadowRoot.querySelector(`.card-main[key="${channel}"] .stat.agents .stat-number`).innerText = minMax
                this.shadowRoot.querySelector(`.card-main[key="${channel}"] .stat.free .stat-number`).innerText = minMaxFree
                this.shadowRoot.querySelector(`.card-main[key="${channel}"] .stat.lw .stat-number`).innerText = msToTime(queueData.lw)
            } else{
                this.shadowRoot.querySelector(`.card-queue.${channel}`).setAttribute('hidden', "");
                this.shadowRoot.querySelector(`.card-menu .${channel}`).setAttribute('hidden', "");
                if ( channel === 'ph' || channel === 'ch' ){
                    this.shadowRoot.querySelector(`.card-queue.ph`).classList.add('use-entire-line');
                    this.shadowRoot.querySelector(`.card-queue.ch`).classList.add('use-entire-line');
                }
            }   
                     //console.log(channel);
        });

        if ( channels.length === 1 ){
            this.moveTo(channels[0])
            this.shadowRoot.querySelector('.card-menu .center').setAttribute('hidden', "");
            //Move to the one page when there is only 1 page
        }
    }

    constructor(){
        super();
        let name = this.getAttribute('name');
        let icon = this.getAttribute('icon');
        let showLoader = this.getAttribute('showLoader');
        this.page = 0;
        this.pageLength = 1;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        if (showLoader){
            this.shadowRoot.querySelector('.loader').removeAttribute('hidden');
        }
        this.shadowRoot.querySelector('.card-header h2').innerText = name;
        this.shadowRoot.querySelector('.card-sub .center ion-icon').setAttribute('name', icon);
        this.shadowRoot.querySelector('.card-sub .center').setAttribute('baseIcon', icon);
        let main = this.shadowRoot.querySelector('.card-main');
        main.parentNode.removeChild(main);
        let arrow = this.shadowRoot.querySelector('.arrow-up');
        arrow.parentNode.removeChild(arrow);
        arrow = this.shadowRoot.querySelector('.arrow-down');
        arrow.parentNode.removeChild(arrow);
        main = null; arrow = null;
        this.shadowRoot.querySelector('.card-sub').classList.add('card-menu')
        let centerMenu = this.shadowRoot.querySelector('.card-sub .center')
        centerMenu.classList.add('active');
        centerMenu.setAttribute('key', 'center');
        //centerMenu.addEventListener('click', menuClick, false);
        let sub = this.shadowRoot.querySelector('.card-sub');
        sub.prepend(getSubMenuElement('ph', 'call').content.cloneNode(true), getSubMenuElement('ch', 'chatbubbles').content.cloneNode(true));
        sub.append(getSubMenuElement('em', 'mail').content.cloneNode(true), getSubMenuElement('ac', 'document-attach').content.cloneNode(true));

        this.shadowRoot.querySelectorAll('.card-menu > div').forEach(divs=>{
            divs.addEventListener('click', menuClick);
        })

        this.shadowRoot.querySelector('.card').appendChild(getMainElement('summary').content.cloneNode(true));
        
        function menuClick(e){
            let key = e.target.getAttribute('key');
            if ( !key ){
                key = e.target.parentNode.getAttribute('key');
            }
            //console.log(e.target);
            
            _moveTo(key);
        }

        let _moveTo = (key)=>{
            let clickedMenuItem = this.shadowRoot.querySelector('.card-menu .' + key);
           // console.log(key);
            
            if ( !clickedMenuItem.classList.contains('active') ){ //If it is already active then do nothing
                let newMain = this.shadowRoot.querySelector(`.card > [key="${key}"]`);
                let oldMain = this.shadowRoot.querySelector(`.card > .anim`);
                oldMain.classList.add('down');
                newMain.classList.add('up');
                newMain.classList.add('anim');
                newMain.classList.remove('up');
                let oldMenuIcon = this.shadowRoot.querySelector('.card-menu .active').getAttribute('baseIcon');
                this.shadowRoot.querySelector('.card-menu .active ion-icon').setAttribute('name', `${oldMenuIcon}-outline`);
                this.shadowRoot.querySelector('.card-menu .active').classList.remove('active');
                clickedMenuItem.classList.add('active');
                clickedMenuItem.children[0].setAttribute('name', clickedMenuItem.getAttribute('baseIcon'));
                oldMain.classList.remove('anim', 'down')
                let newName = name;
                switch (key){
                    case 'ph': 
                        newName += ' - Phone';
                        break;
                    case 'ch':
                        newName += ' - Chat';
                        break;
                    case 'em':
                        newName += ' - Email';
                        break;
                    case 'ac':
                        newName += ' - Actions';
                        break;
                }
                this.shadowRoot.querySelector('.card-header h2').innerText = newName;
            }
        }

        this.moveTo = _moveTo;
        this.mainExists = key=>{
            return this.shadowRoot.querySelectorAll(`.card-main[key="${key}"]`).length > 0;
        }

    }

}

function getSubMenuElement(type, baseIcon, position){
    const menu = document.createElement('template');
    menu.innerHTML = `<div class="${type}" baseIcon="${baseIcon}" key="${type}">
        <ion-icon name="${baseIcon}-outline"></ion-icon>
    </div>`;
    return menu;
}



window.customElements.define('queue-card', Card);
window.customElements.define('summary-card', SummaryCard);
