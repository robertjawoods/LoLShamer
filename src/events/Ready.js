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
    
        const avi = fs.readFileSync('./avatar.jpg', {encoding: 'base64'});
    
        this.client.editSelf({
            avatar: `data:image/jpeg;base64,${avi}`
        }).catch(err => {});
    
        console.log("Ready");
        console.log(this.client.commands);
        console.log(this.client.prefix);
    }
}

module.exports = new Ready();