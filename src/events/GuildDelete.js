'use strict'; 

const Chariot = require('chariot.js');

class GuildDelete extends Chariot.Event { 
    constructor() { 
        super('guildDelete');
    }

    async execute(guild) { 
        console.log(guild);
    }
};

module.exports = new GuildDelete();