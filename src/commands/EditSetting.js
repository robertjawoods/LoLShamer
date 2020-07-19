'use strict'; 

class EditSetting { 
    constructor() { 
        this.commandText = 'editSetting';
        this.options = { 
            usage: '!editSetting {settingName} {newValue}', 
            description: 'Edit a setting'
        }
    }
    
    async exec(msg, args) { 
        let settingName = args[0]; 
        let newSettingValue = args[1]; 
    
        if (!settingName || !newSettingValue)
        {
            msg.channel.createMessage('Incorrect format. Use `!editSetting {settingName} {newValue} to edit`.');
            return;
        }
    
        if (settingsFilter.includes(settingName))
        {
            msg.channel.createMessage('Cannot edit this setting using this command');
            return;
        }
    
        if (!settings[settingName])
        {
            msg.channel.createMessage('Setting doesn\'t exist. Use `!displaySettings` to see valid settings.');
            return;
        }
    
        let validSettingsValueTypes = [{
                type: Number, 
                settingNames: ['gamesInTheLastMinutes', 'feedingDeathThreshold' ,'checkInterval']
        }];
    
        let settingType = _.find(validSettingsValueTypes, (setting) => {
            return setting.settingNames.includes(settingName);
        }).type;
    
        let settingValueConverted = undefined;
        try { 
             settingValueConverted = settingType(newSettingValue);
    
             if (!settingValueConverted)
                throw newSettingValue;
        } catch (value) {
            msg.channel.createMessage(`Cannot set value to \`${newSettingValue}\`. Type needs to be \`${settingType.name}\``);
            return;
        }
    
        let oldSettingValue = settings[settingName];
        settings[settingName] = settingValueConverted;
    
        //writeSettings(); 
    
        msg.channel.createMessage(`Setting \`${settingName}\` has been changed. Old value: \`${oldSettingValue}\` New value: \`${settingValueConverted}\``);
    }
}

module.exports = new EditSetting(); 