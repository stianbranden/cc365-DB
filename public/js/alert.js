//const { getAlerts } = require("../../controllers/getAlerts");

const alertsTemplate = document.createElement('template');
alertsTemplate.innerHTML = `
<link rel="stylesheet" type="text/css" href="/css/alerts.css" />
<div class="alerts">
    <div class="alerts-header">Alerts</div>
    <div class="alerts-content">
        
    </div>
    <!-- Trigger/Open The Modal -->
    <button class="openModal" id="openAlertWriter">Add log</button>

    <!-- The Modal -->
    <div id="alertWriter" class="modal">

        <!-- Modal content -->
        <div class="modal-content">
            <span id="closeAlertWriter" class="close">&times;</span>
            <p>Some text in the Modal..</p>
        </div>

    </div>
</div>`

//const rowTemplate = document.createElement('template');
const rowTemplate = `<div class="alert">
    <div class="alert-department"></div>
    <div class="alert-type"></div>
    <div class="alert-text"></div>
    <div class="alert-date"></div>
    <div class="alert-title"></div>
    <div class="alert-arrow">
    </div>
</div>
`
/*<% alerts.forEach(alert=>{ %>
                <div class="alert" data-closed=<%= alert.closed %> data-updated="<%= alert.updatedAt %>" id="<%= alert._id %>">
                    <div class="alert-department"><%= alert.department %></div>
                    <div class="alert-type" title="<%= alert.alerttype %>">
                        <% if (alert.alerttype == 'Absence'){ %>
                            <ion-icon name="thermometer-sharp"></ion-icon>
                        <% } else if (alert.alerttype == 'Channel Chat') { %>
                            <ion-icon name="chatbox-ellipses-sharp"></ion-icon>
                        <% } else { %>
                            <%= alert.alerttype %>
                        <% } %>
                    </div>
                    <div class="alert-text"><%= alert.text %></div>
                    <div class="alert-date"><%= alert.shortdate %></div>
                </div>
            <% }) %>
            */

class Alerts extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({mode: 'open'});
        const shadow = this.shadowRoot;
        shadow.appendChild(alertsTemplate.content.cloneNode(true));
        
        const modal = shadow.getElementById('alertWriter');
        shadow.getElementById('openAlertWriter').onclick= e=>{
            modal.classList.toggle('open');
        }
        shadow.getElementById('closeAlertWriter').onclick=e=>{
            modal.classList.toggle('open');
        };

        modal.onclick = e=> {
            if (e.target == modal) {
                modal.classList.toggle('open');;
            }
        } 
        
    }
}

class Alert extends HTMLElement {
    set data(data){
        if (moment(data.updated).unix() > this.updated){
            this.updated = moment(data.updated).unix();
            this._updateData(data);
        }
    }

    constructor(){
        super();
        this.moved = false;
        this._updateData = data=>{
            this.querySelector('.alert-department').innerHTML= data.department;
            this.querySelector('.alert-type').setAttribute('title', data.type);
            this.querySelector('.alert-type').innerHTML= data.type;
            this.setAttribute('data-updated', this.updated);
            this.querySelector('.alert').setAttribute('data-closed', data.closed)
            this.querySelector('.alert-date').innerHTML= moment(data.date).format('DD.MM HH:mm');
            this.querySelector('.alert-text').innerHTML= data.text;
            this.querySelector('.alert-title').innerHTML= data.title;
            this.querySelector('.alert-type').innerHTML= data.icon;
        }
        
        

    }
    connectedCallback(){
        const closed = this.getAttribute('closed');
        const department = this.getAttribute('department');
        let type = this.getAttribute('type');
        const text = this.getAttribute('text');
        const date = this.getAttribute('date');
        const top = this.getAttribute('top');
        const title = this.getAttribute('title')
        const icon = this.getAttribute('icon');
        //this.attachShadow({mode: 'open'});
        //const shadow = this.shadowRoot;
        
        if (!this.moved){
            this.moved = true;
            this.updated = moment(this.getAttribute('updated')).unix();
            this.innerHTML = rowTemplate;
            this.querySelector('.alert-department').innerHTML= department;
            this.querySelector('.alert-type').setAttribute('title', type);
            this.querySelector('.alert-type').innerHTML= icon;
            this.setAttribute('updated', this.updated);
            this.querySelector('.alert').setAttribute('data-closed', closed)
            this.querySelector('.alert-date').innerHTML= moment(date).format('DD.MM HH:mm');
            this.querySelector('.alert-text').innerHTML= text;
            this.querySelector('.alert-title').innerHTML= title;
            if ( top ){
                console.log(`Added ${this.id}`);
                document.querySelector('alerts-card').shadowRoot.querySelector('.alerts-content').prepend(this)
            } 
            else {
                document.querySelector('alerts-card').shadowRoot.querySelector('.alerts-content').appendChild(this)
            }
            this.querySelector('.alert').onclick = _=>{
                this.querySelector('.alert').classList.toggle('open')
            };
            
        }
        
    }

}

window.customElements.define('alerts-card', Alerts);
window.customElements.define('alert-row', Alert);