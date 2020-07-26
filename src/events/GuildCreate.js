'use strict'; 

const Chariot = require('chariot.js');

class GuildCreate extends Chariot.Event { 
    constructor() { 
        super('guildCreate');
    }

    async execute(guild) { 
        console.log(guild);

        console.log(this.name);
    }
};

module.exports = new GuildCreate();