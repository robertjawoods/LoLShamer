'use strict'

const Chariot = require('chariot.js');


class SetChannel extends Chariot.Command {
    constructor() {
        super();

        this.name = 'setchannel';
        this.help = {
            usage: '!setChannel {channelHashtag}',
            description: 'Sets a channel for bot announcements'
        }
    }

    async runPreconditions(msg, args, chariot, next) {
        let channelId = args[0];

        if (!channelId)
            msg.channel.createMessage("Please use a valid channel hashtag");

        next();
    }

    async execute(msg, args, chariot) {
        let channelId = args[0];

        // nice and clean lmao
        channelId = channelId.substr(2, channelId.length).replace('>', '');

        this.client.settings[msg.guild.id].boundChannelId = channelId;

        this.client.settings[msg.guild.id].boundChannel = this.client.getChannel(channelId);

        this.client.settings[msg.guild.id].writeSetting('boundChannelId', channelId);

        msg.channel.createMessage(`I have been bound to #${this.client.settings[msg.guild.id].boundChannel.name}... release me, human.`);
    }
}

module.exports = new SetChannel();