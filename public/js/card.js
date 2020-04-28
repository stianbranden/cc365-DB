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
    else {
        return Math.round(s/3600) + 'h'
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
<div class="card">
        <div class="card-header">
            <h2></h2>
        </div>
        <div class="card-main anim" num="0">
            <div class="card-queue">
                <h1></h1>
            </div>
            <div class="card-stat">
                <div class="stat sla">
                    <div class="stat-number">TBA</div>
                    <div class="stat-text">daily sla</div>
                </div>
                <div class="stat agents">
                    <div class="stat-number"> </div>
                    <div class="stat-text">agents</div>
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
            </div>
            <div class="center">
                <ion-icon></ion-icon>
            </div>
            <div class="arrow-down">
                <ion-icon name="chevron-down-outline"></ion-icon>
            </div>
        </div>
    </div>`

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

    set queueData(data){
        
        if ( this.queues.length === 0 ){
            this.queues = data.sort(queueSort);
            if ( this.queues.length === 0 ){
                this.shadowRoot.querySelector('.card').setAttribute('hidden', true)
            } else {
                //this.shadowRoot.querySelector('.card').removeAttribute('hidden');
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
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.querySelector('.card-header h2').innerText = name;
        this.shadowRoot.querySelector('.card-sub .center ion-icon').setAttribute('name', icon);
        
        this._createMain = (list)=>{
            let num = this.pageLength;
            this.pageLength++;
            let ele = `<div class="card-table">
                <table>
                    <tr><th class="name">Name</th><th>Queue</th><th>Agents</th><th>Oldest</th></tr>`;
            list.forEach(q=>{
                ele += `<tr id="${q.id}"><td class="name" title="${q.name}">${q.name}</td><td class="queue">${q.inQueueCurrent}</td><td class="agents">${q.agentsServing-q.agentsNotReady}</td><td class="oldest">${msToTime(q.waitingDurationCurrentMax)}</td></tr>`
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
                this.page += i;
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

window.customElements.define('queue-card', Card);