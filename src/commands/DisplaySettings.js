'use strict';

const Chariot = require('chariot.js');

class DisplaySettings extends Chariot.Command {
    constructor() {
        super();

        this.name = 'displaysettings';
        this.help = {
            usage: '!displaysettings',
            description: 'Displays the current settings'
        };
     }

    async execute(msg, args, chariot) { 
        let settings = this.client.settings[msg.guild.id];

        let embed = new Chariot.RichEmbed()
        .setColor('BLURPLE')
        .setTitle('Current Setting Values')
        .setDescription('Displays the current settings values. Use `!editSetting {settingName} {newValue} to edit`.')
        .addField('boundChannel', settings.boundChannel ? settings.boundChannel.name : 'None')       

        let settingsFilter = ['summoners', 'boundChannelId'];

        for (const setting in settings) {
            if (settingsFilter.includes(setting))
                continue;
    
            embed.addField(setting, settings[setting]);
        }

        msg.channel.createEmbed(embed);
    }
}

module.exports = new DisplaySettings();