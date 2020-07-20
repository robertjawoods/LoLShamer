'use strict'; 

const fs = require('fs');

module.exports = class Ready { 
    constructor(erisBot) {
        this.name = 'ready';
        this.bot = erisBot;
    }

    async exec() { 
        this.editStatus('dnd', { 
            name: 'scrubs try to play LoL', 
            type: 3
        });
    
        const avi = fs.readFileSync('./avatar.jpg', {encoding: 'base64'});
    
        this.editSelf({
            avatar: `data:image/jpeg;base64,${avi}`
        }).catch(err => console.log(err));
    
        console.log("Ready");
    }
};