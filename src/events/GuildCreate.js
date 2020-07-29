'use strict'; 

const Chariot = require('chariot.js');
const Settings = require('../core/Settings');

const BOT_ADD = 28; 

class GuildCreate extends Chariot.Event { 
    constructor() { 
        super('guildCreate');
    }    

    async execute(guild) {         
        let auditLogs = await guild.getAuditLogs();
        let self = await this.client.getSelf();

        for (const entry of auditLogs.entries)
        {               
            if (entry.actionType === BOT_ADD && (entry.targetID === self.id))
            {
                entry.user.getDMChannel().then(dmChannel => { 
                    dmChannel.createMessage('Hello there, thanks for adding me. To configure this bot, please use the command `!ls setchannel #<channel_name>`' 
                    + 'to set a channel for the bot to write messages to. You can see all of this bot\'s commands by using the command `!ls help`.');
                });

                break;
            } 
        }

        if (!this.settings[guild.id]) {
            let guildSettings = this.client.settings[`${guild.id}`] = await new Settings(guild[0]).init();

            this.client.checkFeedIntervals[`${guild.id}`] = new Timer(guildSettings.checkInterval, () => checkFeed(guildSettings));
        }
    }
};

module.exports = new GuildCreate();