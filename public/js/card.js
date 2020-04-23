
const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" type="text/css" href="/css/card.css" />
<div class="card">
        <div class="card-header">
            <h2></h2>
        </div>
        <div class="card-main front" num="0">
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
        <div class="card-main" num="1">
            <div>Hellooo</div>
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
        this.shadowRoot.querySelector('.lw .stat-number').innerText = lw;
    }

    set agents(ag){
        this.shadowRoot.querySelector('.agents .stat-number').innerText = ag;
    }

    set queueData(data){
        this.queues = data;
        if ( this.queues.length === 0 ){
            this.shadowRoot.querySelector('.card').setAttribute('hidden', true)
        } else {
            this.shadowRoot.querySelector('.card').removeAttribute('hidden')
        }
    }

    get queueData(){
        return this.queues;
    }

    constructor(){
        super();
        this.queues = [];
        this.page = 0;
        this.pageLength = 2;
        let name = this.getAttribute('name');
        let icon = this.getAttribute('icon');
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.querySelector('.card-header h2').innerText = name;
        this.shadowRoot.querySelector('.card-sub .center ion-icon').setAttribute('name', icon);
        console.log(this.shadowRoot.querySelector('.card-main').getAttribute('num'));

        this._toggleMain= ()=>{
            this.shadowRoot.querySelector(`.card-main[num="${this.page}"]`).classList.remove('front');
            this.page ++;
            if (this.page === this.pageLength){
                this.page = 0;
            }
            this.shadowRoot.querySelector(`.card-main[num="${this.page}"]`).classList.add('front');
        }
        
    }
} 

window.customElements.define('queue-card', Card);