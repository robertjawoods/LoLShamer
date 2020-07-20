const riotApi = require('../core/RiotApi');
const Chariot = require('chariot.js');

class SummonerLevel extends Chariot.Command {
    constructor() {
        super();

        this.name = 'summonerLevel';
        this.help = {
            usage: '!summonerLevel {summonerName}',
            description: 'Get a summoner\'s level'
        };
    }

    async execute(message, args, chariot) {
        if (!args)
            return;

        let summonerName = args.join(' ');

        riotApi.getSummonerByName(summonerName)
            .then((res) => {
                var data = res.data;

                message.channel.createMessage(`Summoner ${data.name} is level ${data.summonerLevel}... what a scrub.`);
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

module.exports = new SummonerLevel();