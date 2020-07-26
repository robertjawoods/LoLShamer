'use strict'; 

const riotApi = require('../core/RiotApi');
const Chariot = require('chariot.js');

class AddSummoner extends Chariot.Command {
    constructor() { 
        super();

        this.name = 'addsummoner';
        this.help = { 
            usage: '!addsummoner {discordMention} {summonerName}', 
            description: 'Adds a summoner to the watch list'
      }
    }

    async runPreconditions(message, args, chariot, next)  {
        if (args.length < 2) {            
            message.channel.createMessage('Invalid command format, please use `!addSummoner {discordName} {summonerName}`. Ensure that the discord name is a valid mention.');
            return;
        }      

        next();
    }

    async execute(msg, args, chariot) { 
        let discordName = args[0];
        let summonerName = args.slice(1, args.length).join(' ');

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

        let summoners = this.client.settings[msg.channel.guild.id].summoners;

        console.log(summoners.summoners);
    
        let alreadyAdded = summoners.find(s => s.summonerName === summonerName);
    
        if (alreadyAdded)
        {
            msg.channel.createMessage(`What sort of moron tries to add someone twice? Summoner "${summonerName}" is already added.`)
            return;
        }   
        
        summoners.push({
            summonerName: summonerName, 
            discordName: discordName,
            inDatabase: false
        });

        await this.client.settings[msg.guild.id].writeSummoners(msg.guild.id, this.client.pool);

        msg.channel.createMessage(`Summoner "${summonerName}" has been added.`);
    }
}

module.exports = new AddSummoner();