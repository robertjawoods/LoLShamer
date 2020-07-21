'use strict';

const riotApi = require('../core/RiotApi');
const Chariot = require('chariot.js');
const { extend } = require('underscore');

class RemoveSummoner extends Chariot.Command {
    constructor() {
        super();

        this.name = 'removeSummoner';
        this.help = {
            usage: '!removeSummoner {summonerName}',
            description: 'Removes a summoner from the watch list'
        };
    }

    async execute(msg, args, chariot) {
        let summonerName = args[0].trimLeft().trimRight();

        if (!summonerName) {
            msg.channel.createMessage('Please input summoner name: `!removeSummoner {summonerName}`');
            return;
        }

        let summonerIndex = _.findIndex(settings.summoners, summoner =>
            summoner.summonerName === summonerName);

        if (summonerIndex === -1) {
            msg.channel.createMessage('This command can only be used to remove existing summoners, dipshit.');
            return;
        }

        settings.summoners.splice(summonerIndex, 1);

        //writeSettings();

        msg.channel.createMessage(`Summoner "${summonerName}" has been removed.`);
    }
}

module.exports = new RemoveSummoner(); 
