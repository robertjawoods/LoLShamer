'use strict'; 

const Chariot = require('chariot.js');

class GuildAvailable extends Chariot.Event { 
    constructor() { 
        super('guildAvailable');
    }

    async execute(guild) { 
        console.log(guild);
    }
};

module.exports = new GuildAvailable();