const eris = require('eris');
const fs = require('fs');
const variables = require('./variables.json');
const summoners = require('./summoners.json').summoners;
const riotApi = require('./riotApi')

const _ = require('underscore');

const bot = new eris.CommandClient(variables.botToken, {
    prefix:'!'
});

function isFeeding() {
    _.forEach(summoners, (summoner) => { 
        let summonerName = summoner.summonerName;

        riotApi.getSummonerByName(summonerName)
        .then(res => { 
            let data = res.data; 

            return data.accountId;
        })
        .then(accountId => {
            return riotApi.getMatchesByAccountId(accountId);
        })
        .then(response => { 
            let matchList = response.data.matches;
            
            let promises = [];
            
            _.forEach(matchList, match => promises.push(riotApi.getMatchDetails(match.gameId)))
            
        })
        .catch(err => {
            console.log(err)
        });
    });
}

setInterval(isFeeding, 6000);

bot.on('ready', () => console.log("Ready")); 

bot.on('error', err => {
    console.warn(err);
});

bot.registerCommand('!summonerLevel', (msg, args) =>
{
    if (!args[0])
        return;

    riotApi.getSummonerByName(args[0])
    .then((res) => { 
        var data = res.data;

        msg.channel.createMessage(`Summoner ${data.name} is level ${data.summonerLevel}... what a scrub.`);
    })
    .catch((err) => {
        if (err.response.status === variables.notFound) {
            msg.channel.createMessage(`Summoner "${args[0]}" doesn't exist, you fucking moron.`);
        }
    });
});

bot.registerCommand('!addSummoner', async (msg, args) => { 
    let summonerName = args[0]; 
    let discordName = args[1];

    if (!(summonerName && discordName) || args.length > 2)    
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
        if (error.response.status === variables.notFound) {
            msg.channel.createMessage(`Summoner "${summonerName}" doesn't exist, you fucking moron.`);
        }
    });

    if (!summonerFound)
        return;

    summoners.push({
        "summonerName": summonerName, 
        "discordName": discordName
    });

    let data = JSON.stringify({"summoners":summoners})

    fs.writeFile('./summoners.json', data, err => { 
        if (err) 
            msg.channel.createMessage('Could not add summoner to list, please contact <@123495583397707776> to find out why');
        else 
            msg.channel.createMessage(`Summoner "${summonerName}" added.`);
    })
});

bot.connect();