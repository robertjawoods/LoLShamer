'use strict';

const riotApi = require('../core/RiotApi');

class SummonerLevel {
    constructor() {
        this.commandText = 'summonerLevel';
        this.options = {
            usage: '!summonerLevel {summonerName}',
            description: 'Get a summoner\'s level'
        };
    }

    async exec(msg, args) {
        if (!args)
            return;

        let summonerName = args.join(' ');

        riotApi.getSummonerByName(summonerName)
            .then((res) => {
                var data = res.data;

                msg.channel.createMessage(`Summoner ${data.name} is level ${data.summonerLevel}... what a scrub.`);
            })
            .catch((err) => {
                console.log(err);

                // if (err.response.status === 404) {
                //     msg.channel.createMessage(`Summoner "${summonerName}" doesn't exist, you fucking moron.`);
                // }
            });
    }
}

module.exports = new SummonerLevel();