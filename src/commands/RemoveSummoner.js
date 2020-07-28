'use strict';

const Chariot = require('chariot.js');

class RemoveSummoner extends Chariot.Command {
    constructor() {
        super();

        this.name = 'removesummoner';
        this.help = {
            usage: '!removesummoner {summonerName}',
            description: 'Removes a summoner from the watch list'
        };
    }

    async runPreconditions(msg, args, chariot, next) { 
        let summonerName = args[0].trimLeft().trimRight();
        let summoners = this.client.settings[msg.guild.id].summoners;

        if (!summonerName) {
            msg.channel.createMessage('Please input summoner name: `!removeSummoner {summonerName}`');
            return;
        }

        let summoner = summoners.find(summoner => summoner.summonerName === summonerName);

        if (!summoner) {
            msg.channel.createMessage('This command can only be used to remove existing summoners, dipshit.');
            return;
        }

       next();
    }

    async execute(msg, args, chariot) {
        this.client.settings[msg.guild.id].removeSummoner(args[0]);

        msg.channel.createMessage(`Summoner "${args[0]}" has been removed.`);
    }
}

module.exports = new RemoveSummoner(); 
