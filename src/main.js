'use strict'; 

const Chariot = require('chariot.js');

class LoLShamer extends Chariot.Client { 
    constructor() {
        super (new Chariot.Config('egge',
            {
                prefix: '!ls ', 
                defaultHelpCommand: true,
                owner: ['123495583397707776']
            }));
    }
}

module.exports = new LoLShamer();