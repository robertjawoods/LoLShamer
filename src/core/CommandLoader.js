'use strict';

const utilities = require('./Utilities');
const path = require('path');

class CommandLoader { 
    async loadCommands(erisBot) { 
        let commandFiles = await utilities.getFileNames(path.join(__dirname, './../Commands'));
   
        for (const file of commandFiles) { 
            const command = require(file);

            erisBot.registerCommand(command.commandText, command.exec, command.options);
        
            if (command.alias) {
                command.alias.forEach(alias => {
                    erisBot.registerCommandAlias(alias, command.commandText);
                });
            }

            console.log(`Command ${command.commandText} loaded`);
        }
    }
}

module.exports = new CommandLoader();