const eris = require('eris');

const commandOptions = {
    prefix: ['!', '@mention'], 
    defaultHelpCommand: true,
    name: 'LoLShamer', 
    description: 'Shame the feeders (including yourself of course)',
    ignoreSelf: true, 
    ignoreBots: true, 
    defaultCommandOptions: { 
        caseInsensitive: true
    }
};

const erisBot = new eris.CommandClient(process.env.BOT_TOKEN, {}, commandOptions);

module.exports = erisBot;