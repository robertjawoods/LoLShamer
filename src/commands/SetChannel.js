'use strict'

class SetChannel { 
    constructor() {
        this.commandLabel = 'setChannel'; 
        this.options = {
            usage: '!setChannel {channelHashtag}', 
            description: 'Sets a channel for bot announcements'
        }
    }

    async exec(msg, args) {
        let channelId = args[0];

        if (!channelId)
            msg.channel.createMessage("Please use a valid channel hashtag"); 
    
        // nice and clean lmao
        channelId = channelId.substr(2, channelId.length).replace('>', '');
    
        settings.boundChannelId = channelId;
        
        boundChannel = bot.getChannel(settings.boundChannelId);
    
        writeSettings();
    
        msg.channel.createMessage(`I have been bound to #${boundChannel.name}... release me, human.`);
    }
}

module.exports = new SetChannel();