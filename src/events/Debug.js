'use strict'; 

const Chariot = require('chariot.js');

class Debug extends Chariot.Event { 
    constructor() { 
        super('debug');
    }

    async execute(message, id) { 
        console.log(message);
    }
};

module.exports = new Debug();