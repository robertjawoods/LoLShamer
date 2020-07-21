const riotApi = require('../core/RiotApi');
const Chariot = require('chariot.js');

class SummonerLevel extends Chariot.Command {
    constructor() {
        super();

        this.name = 'summonerlevel';
        this.help = {
            usage: '!ls summonerlevel {summonerName}',
            description: 'Get a summoner\'s level'
        };
    }

    async runPreconditions(message, args, chariot, next) { 
        if (!args.length) {
            message.channel.createMessage("Please enter a summoner name.");
            return;
        }

        next();
    }

    async execute(message, args, chariot) {
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