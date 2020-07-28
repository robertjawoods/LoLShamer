'use strict';

const Chariot = require('chariot.js');

class AddMessage extends Chariot.Command {
    constructor() {
        super();

        this.name = 'addmessage';
        this.help = {
            usage: '!ls addmessage "{0} died {1} times"',
            description: 'Adds a new message template to announcement list'
        }
    }

    async runPreconditions(msg, args, chariot, next) {
        let message = args.join(' ');

        if (!message.includes('{0}') || !message.includes('{1}')) {
            msg.channel.createMessage('Incorrect message format. Format must be like `!ls setmessage "{0} died {1} times"`');
            return;
        }

        let messageFormatted = message.replace('"', '').replace('"', '');

        next(messageFormatted);
    }

    async execute(msg, args, chariot) {
        let message = args.join(' ');
        message = message.replace('"', '').replace('"', '');

        this.client.settings[msg.guild.id].writeMessage(message)

        msg.channel.createMessage(`Message has been added. Example: "${message.format('Faker', 18)}"`);
    }
}

module.exports = new AddMessage();