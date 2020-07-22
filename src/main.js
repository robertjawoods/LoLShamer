'use strict'; 

const Chariot = require('chariot.js');
const logger = require('./core/Logger')

class LoLShamer extends Chariot.Client { 
    constructor() {
        logger.info(process.env);

        super (new Chariot.Config(process.env.BOT_TOKEN,
            {
                prefix: '!ls ', 
                defaultHelpCommand: true,
                owner: ['123495583397707776']
            }));
    }
}

module.exports = new LoLShamer();