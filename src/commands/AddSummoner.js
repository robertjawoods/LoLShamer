'use strict'; 

const riotApi = require('../core/RiotApi');
const Chariot = require('chariot.js');

class AddSummoner extends Chariot.Command {
    constructor() { 
        super();

        this.name = 'addSummoner';
        this.help = { 
            usage: '!addSummoner {summonerName} {discordMention}', 
            description: 'Adds a summoner to the watch list'
      }
    }

    async execute(msg, args, chariot) { 
        let summonerName = args.slice(0, args.length - 1);
    
        summonerName = summonerName.join(' '); 
        let discordName = args[args.length - 1];
    
        if (!(summonerName && discordName))    
        {
            msg.channel.createMessage('Invalid command format, please use `!addSummoner {summonerName} {discordName}`. Ensure that the discord name is a valid mention.');
            return;
        }
    
        let summonerFound = false;
        await riotApi.getSummonerByName(summonerName)      
        .then(() => {
            summonerFound = true;
        }) 
        .catch((error) => {
            if (error.response.status === 404) {
                msg.channel.createMessage(`Summoner "${summonerName}" doesn't exist, you fucking moron.`);
            }
        });
    
        if (!summonerFound)
            return;
    
        let alreadyAdded = _.find(settings.summoners, (summoner) => { 
            return summoner.summonerName === summonerName;
        });
    
        if (alreadyAdded)
        {
            msg.channel.createMessage(`What sort of moron tries to add someone twice? Summoner "${summonerName}" is already added.`)
            return;
        }
    
        settings.summoners.push({
            "summonerName": summonerName, 
            "discordName": discordName
        });

        // write settings

        msg.channel.createMessage(`Summoner "${summonerName}" has been added.`);
    }
}

module.exports = new AddSummoner();