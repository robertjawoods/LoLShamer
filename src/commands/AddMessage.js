'use strict';

const Chariot = require('chariot.js');

class AddMessage extends Chariot.Command {
    constructor() {
        super(); 

        this.name = 'addMessage';
        this.help = {
            usage: '!addMessage "{message}" Example: "{0} died {1} times"',
            description: 'Adds a new message template to announcement list'
        }
    }

    async execute(msg, args, chariot) {
        let message = args.join(' ');

        if (!message.includes('{0}') || !message.includes('{1}')) {
            msg.channel.createMessage('Incorrect message format. Format must be `!setMessage "{0} died {1} times`"');
            return;
        }

        let messageFormatted = message.replace('"', '').replace('"', '');

        messages.push(messageFormatted);

        fs.writeFile('./messages.json', JSON.stringify({ "messages": messages }), err => {
            if (err) console.log(err);
        });

        msg.channel.createMessage(`Message has been added. Example: "${messageFormatted.format('Faker', 18)}"`);
    }
}

module.exports = new AddMessage();