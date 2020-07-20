'use strict'; 

const Chariot = require('chariot.js');

class Error extends Chariot.Event { 
    constructor() { 
        super('error');
    }

    async execute(err) { 
        console.log(err);
    }
};

module.exports = new Error();