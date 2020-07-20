'use strict'; 

const Chariot = require('chariot.js');

class LoLShamer extends Chariot.Client { 
    constructor() {
        super (new Chariot.Config(process.env.BOT_TOKEN,
            {
                prefix: 'c!', 
                defaultHelpCommand: true,
                owner: ['123495583397707776']
            }));
    }
}

module.exports = new LoLShamer();