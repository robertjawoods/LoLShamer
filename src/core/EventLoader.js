'use strict';

const path = require('path');
const utilities = require('./Utilities');

class EventLoader { 
    async loadEvents(erisBot) { 
        let eventFiles = await utilities.getFileNames(path.join(__dirname, './../events'));

        for (const file of eventFiles) { 
            const evt = require(file);
            const event = new evt(erisBot);

            erisBot.on(event.name, e =>  event.exec(e));

            console.log(`Event ${event.name} loaded`);
        }
    }
}

module.exports = new EventLoader();