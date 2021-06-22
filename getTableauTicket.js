require('dotenv').config();
const fs = require('fs')
const req = require('request');
const {tableauTicketRequest} = require('./controllers/config');

function getTableauTicket(){
    tableauTicketRequest.form.username = 'stianbra@elkjop.no';
    console.log(tableauTicketRequest);
    req(tableauTicketRequest, (e,r,b)=>{
        console.log(r.statusCode);
        console.log(b);
        //fs.writeFileSync('./tmp/r.json', JSON.stringify(r), 'utf8');
    });
}

getTableauTicket();