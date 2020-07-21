'use strict';

const Chariot = require('chariot.js');

class DisplaySettings extends Chariot.Command {
    constructor() {
        super();

        this.name = 'displaySettings';
        this.help = {
            usage: '!displaySettings',
            description: 'Displays the current settings'
        };
        this.embedOptions = {
            title: 'Current Setting Values',
            description: 'Displays the current settings values. Use `!editSetting {settingName} {newValue} to edit`.',
            color: 26367,
            type: 'rich'
        }
    }

    async execute(msg, args, chariot) { 
        let settingsFields = [{
            name: 'boundChannel', 
            value: boundChannel.name
        }]; 
    
        for (setting in settings) {
            if (settingsFilter.includes(setting))
                continue;
    
            settingsFields.push({
                name: setting, 
                value: settings[setting]
            });
        }
    
        this.embedOptions.fields = settingsFields;
    
        msg.channel.createMessage({
            embed: this.embedOptions
        });
    }
}

module.exports = new DisplaySettings();