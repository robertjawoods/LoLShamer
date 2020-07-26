'use strict';

const Chariot = require('chariot.js');

class EditSetting extends Chariot.Command {
    constructor() {
        super();

        this.name = 'editsetting';
        this.help = {
            usage: '!editsetting {settingName} {newValue}',
            description: 'Edit a setting'
        }
    }

    async runPreconditions(message, args, chariot, next) {
        let settingName = args[0];
        let newSettingValue = args[1];

        let settingsFilter = ['summoners', 'boundChannelId'];

        if (!settingName || !newSettingValue) {
            msg.channel.createMessage('Incorrect format. Use `!editsetting {settingName} {newValue} to edit`.');
            return;
        }

        if (settingsFilter.includes(settingName)) {
            msg.channel.createMessage('Cannot edit this setting using this command');
            return;
        }

        if (!this.client.settings[message.guild.id][settingName]) {
            msg.channel.createMessage('Setting doesn\'t exist. Use `!displaysettings` to see valid settings.');
            return;
        }

        let validSettingsValueTypes = [{
            type: Number,
            settingNames: ['gamesInTheLastMinutes', 'feedingDeathThreshold', 'checkInterval']
        }];

        let settingType = validSettingsValueTypes.find(setting => setting.settingNames.includes(settingName)).type;       

        let settingValueConverted = undefined;
        try {
            settingValueConverted = settingType(newSettingValue);

            if (!settingValueConverted)
                throw newSettingValue;
        } catch (value) {
            msg.channel.createMessage(`Cannot set value to \`${newSettingValue}\`. Type needs to be \`${settingType.name}\``);
            return;
        }

        next(settingName, newSettingValue);
    }

    async execute(msg, args, chariot) {
        let settingName = args[0];
        let settingValue = args[1];

        let oldSettingValue = this.client.settings[msg.guild.id][settingName];
        this.client.settings[msg.guild.id][settingName] = settingValue;

        await this.client.settings[msg.guild.id].writeSetting(settingName, args[1], msg.guild.id, this.client.pool);

        msg.channel.createMessage(`Setting \`${settingName}\` has been changed. Old value: \`${oldSettingValue}\` New value: \`${settingValue}\``);
    }
}

module.exports = new EditSetting(); 