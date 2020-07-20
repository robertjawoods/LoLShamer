'use strict'; 

const Chariot = require('chariot.js');

class MessageCreate extends Chariot.Event { 
    constructor() { 
        super('messageCreate');
    }

    async execute(message) { 
        console.log(`Message created in ${message.channel.name} by ${message.member.user.username}. Message content: '${message.content}'`);
    }
};

module.exports = new MessageCreate();