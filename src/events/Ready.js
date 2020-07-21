'use strict'; 

const fs = require('fs');
const Chariot = require('chariot.js');

class Ready extends Chariot.Event { 
    constructor() {
        super('ready');
    }

    async execute() { 
        this.client.editStatus('online', { 
            name: 'scrubs try to play LoL', 
            type: 3
        });
    
        console.log("Ready");
        console.log(this.client.commands);
        console.log(this.client.prefix);
    }
}

module.exports = new Ready();