//const { getAlerts } = require("../../controllers/getAlerts");

const alertsTemplate = document.createElement('template');
alertsTemplate.innerHTML = `
<link rel="stylesheet" type="text/css" href="/css/alerts.css" />
<div class="alerts">
    <div class="alerts-header">
        <ion-icon name="notifications-off-sharp"></ion-icon>
        <div>Alerts</div>
    </div>
    <div class="alerts-content">
        
    </div>
    <!-- Trigger/Open The Modal -->
    <button class="openModal" id="openAlertWriter">Add log</button>

    <!-- The Modal -->
    <div id="alertWriter" class="modal">

        <!-- Modal content -->
        <div class="modal-content">
            <span id="closeAlertWriter" class="close">&times;</span>
            <div class="modal-header">Create log</div>
            <div class="modal-subtext">Logs should only contain information related to events and decisions made<br>Do not enter information related to employees or customers</div>
            <form>
                <label for="type">Select type of log/event</label>
                <select id="type" name="type">
                    <option value="System Outage">System outage</option>
                    <option value="Power Outage">Power Outage</option>
                    <option value="Force Majeure event">Force Majeure event</option>
                    <option value="Intraday log" selected>Intraday log</option>
                </select>
                <label for="status" hidden>Status</label>
                <select id="status" name="status" hidden>
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed" selected>Closed</option>
                </select>

                <div class="department-selector">
                    <span>Select departments</span>
                    <div>
                        <input type="checkbox" id="log-denmark" name="Denmark">
                        <label for="log-denmark">Denmark</label>
                        <input type="checkbox" id="log-finland" name="Finland">
                        <label for="log-finland">Finland</label>
                        <input type="checkbox" id="log-norway" name="Norway">
                        <label for="log-norway">Norway</label>
                        <input type="checkbox" id="log-sweden" name="Sweden">
                        <label for="log-sweden">Sweden</label>
                        <input type="checkbox" id="log-kitchen" name="Kitchen">
                        <label for="log-kitchen">Kitchen</label>
                        <input type="checkbox" id="log-helpdesk" name="Helpdesk">
                        <label for="log-helpdesk">Helpdesk</label>
                    </div>
                </div>

                <textarea id="text" name="text" rows=4 placeholder="Write log text"></textarea>
                <div class="error-text"></div>
                <input type="submit" value="Create log">
            </form>
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
    set addAlert(alert){
        this._addAlert(alert);
    }

    constructor(){
        super();
        this.notifications = false;
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
        modal.querySelector('input[type="submit"]').onclick = async e =>{
            e.preventDefault();
            this._verifyAndSubmit()
        } 

        const bell = shadow.querySelector('.alerts-header > ion-icon');
        bell.onclick = _=>{
            //console.log('Bell clicked: ' + this.notifications);
            this._toggleNotification();
        }

        this._toggleNotification = _=>{
            if ( this.notifications ){
                this.notifications = false;
                bell.setAttribute('name', 'notifications-off-sharp');
            }
            else {
                //console.log(Notification.permission);
                if (Notification.permission !== "granted"){
                    Notification.requestPermission().then(permission =>{
                        //console.log(permission);
                        if ( permission === 'granted' ) {
                            this.notifications = true;
                            bell.setAttribute('name', 'notifications-sharp');
                        }
                    })
                }
                else {
                    this.notifications = true;
                    bell.setAttribute('name', 'notifications-sharp');
                }
            }
        }

        this._addAlert = alert =>{
            //console.log(this.notifications);
            if ( this.notifications ){
                //const notif = 
                new Notification(alert.title, {icon: '/images/icon.png', badge: '/images/icon.png', body: alert.text.replace('<br>', '\n')});
                //console.log(notif);
            }

            //console.log(`New ${alert._id}`);
            let div = document.createElement('alert-row');
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

            this.prepend(div);
        }

        this._verifyAndSubmit = id =>{
            const shadow = this.shadowRoot;
            //console.log(form);
            const text = shadow.getElementById('text').value;
            const alerttype = shadow.getElementById('type').value;
            const status = shadow.getElementById('status').value;
            const departments = [];
            const checkboxes = shadow.querySelectorAll('.department-selector input');
            checkboxes.forEach(checkbox=>{
                if (checkbox.checked){
                    departments.push(checkbox.getAttribute('name'));
                }
            });
            let error = false;
            let errorText = '';
            if (departments.length === 0){
                error = true;
                errorText = 'Add one or more department to the log!'
                console.error(errorText);
                shadow.querySelector('.department-selector').classList.add('error')
            }
            if ( text.length === 0 ){
                error = true;
                errorText = 'Add log text'
                console.error(errorText);
                shadow.getElementById('text').classList.add('error');
            }
            if (error){
                shadow.querySelector('.error-text').textContent = errorText;
            }
            else {
                const body = {id, text, alerttype, status, departments}
                console.table(body);
                fetch('/api/alerts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }).then(response=>{
                    if ( response.ok ){
                        shadow.querySelector('form').reset();
                        shadow.getElementById('alertWriter').classList.toggle('open');
                        response.json().then(data=>{
                            data.newAlerts.forEach(alert=>{
                                this._addAlert(alert)
                            });
                        
                        });

                    } else {

                    }
                    
                });
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