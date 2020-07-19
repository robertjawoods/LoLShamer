const eris = require('eris');
const fs = require('fs');
const settings = require('./settings.json');
const riotApi = require('./riotApi')
const messages = require('./messages.json').messages;
const _ = require('underscore');

const bot = new eris.CommandClient(settings.botToken, {
    prefix:'!'
});

let boundChannel = undefined;

if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
  }

function writeSettings() {
    let data = JSON.stringify(settings);

    fs.writeFile('./settings.json', data, err => {
       if (err) console.log(err);
    });
}

function getParticipantDetails(accountId, match) { 
    let participantIdentity = _.find(match.participantIdentities, participant => 
        accountId === participant.player.accountId
    );

    let participantDetails = _.find(match.participants, participant => 
        participant.participantId === participantIdentity.participantId
    );

    return participantDetails;
}

function writeFeederMessage(deathCount, discordName) {
    let message = _.sample(messages);

    boundChannel.createMessage(message.format(discordName, deathCount));
}

function isFeeding() {
    _.forEach(settings.summoners, (summoner) => { 
        let summonerName = summoner.summonerName;
        let accountId = undefined;

        riotApi.getSummonerByName(summonerName)
        .then(res => { 
            let data = res.data; 
            accountId = data.accountId

            return data.accountId;
        })
        .then(accountId => {
            return riotApi.getMatchesByAccountId(accountId);
        })
        .then(response => { 
            let match = response.data.matches[0];
            
            return riotApi.getMatchDetails(match.gameId);
        })
        .then(match => { 
            let matchDetails = match.data;
            let participantDetails = getParticipantDetails(accountId, matchDetails);
            let particpantTeam = participantDetails.teamId;
            let didWin = _.find(matchDetails.teams, team => team.teamId === particpantTeam).win === 'Win';
            let deathCount = participantDetails.stats.deaths;

            if (!didWin && deathCount >= settings.feedingDeathThreshold)
                writeFeederMessage(deathCount, summoner.discordName);

        })
        .catch(err => {
            if (err.config.url.includes('lol/match/v4/matchlists/by-account/')) 
            {
                console.log(`No games found in the last ${settings.gamesInTheLastMinutes} minutes for summoner "${summonerName}"`);
                return;
            }
            else
                console.log(err)
        });
    });
}

// minutes to milliseconds 
setInterval(isFeeding, settings.checkInterval * 60000);

bot.on('ready', () => {
    boundChannel = bot.getChannel(settings.boundChannelId);
    console.log("Ready");
}); 

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
        if (err.response.status === 404) {
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
        if (error.response.status === settings.notFound) {
            msg.channel.createMessage(`Summoner "${summonerName}" doesn't exist, you fucking moron.`);
        }
    });

    if (!summonerFound)
        return;

    settings.summoners.push({
        "summonerName": summonerName, 
        "discordName": discordName
    });

    writeSettings();
});

bot.registerCommand("!removeSummoner", (msg, args) => { 
    let summonerName = args[0]; 

    if (!summonerName)
    {
        msg.channel.createMessage('Please input summoner name: `!removeSummoner {summonerName}`'); 
        return;
    }
    
    let summonerIndex = _.findIndex(settings.summoners, summoner => 
        summoner.summonerName === summonerName);

    if (summonerIndex === -1)
    {
        msg.channel.createMessage('This command can only be used to remove existing summoners');
        return;
    }

    settings.summoners.splice(summonerIndex, 1);

    writeSettings();
});

bot.registerCommand('!setChannel', (msg, args) => {
    let channelId = args[0];

    if (!channelId)
        msg.channel.createMessage("Please use a valid channel hashtag"); 

    // nice and clean lmao
    channelId = channelId.substr(2, channelId.length).replace('>', '');

    settings.boundChannelId = channelId;

    writeSettings();
});

bot.registerCommand("!addMessage", (msg, args) => {
    let message = args[0]; 

    if (!message.includes('{0}') || !message.includes('{1}'))
    {
        msg.channel.createMessage('Incorrect message format. Format must be `!setMessage "{0} died {1} times`"');
        return;
    }

    let messageFormatted = message.replace('"', '');

    messages.push(messageFormatted);
    
    fs.writeFile('./messages.json', JSON.stringify({"messages":messages}, err => {
        if (err) console.log(err);
    }))
})

bot.connect();
