const eris = require('eris');

let commandOptions = {
    prefix: ['!', '@mention'], 
    defaultHelpCommand: true
};

const erisBot = new eris.CommandClient(settings.botToken, {}, commandOptions);

module.exports = erisBot;