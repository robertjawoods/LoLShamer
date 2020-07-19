const eris = require('eris');
const fs = require('fs');
const settings = require('./settings.json');
const messages = require('./messages.json').messages;
const riotApi = require('./riotApi');
const messageService = require('./messageService');
const _ = require('underscore');
const { json } = require('body-parser');

const bot = new eris.CommandClient(settings.botToken, {}, {
    prefix: ['!', '[anal]', '@mention'], 
    defaultHelpCommand: true
});

let boundChannel = undefined;
let settingsFilter = ['riotApiBaseUrl', 'riotApiToken', 'botToken', 'summoners', 'boundChannelId'];

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
            
            let message = messageService.createMessage(matchDetails, participantDetails, summoner);

            if (message)
                boundChannel.createMessage(message);
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

    boundChannel.createMessage('I\'m alive!');

    bot.editStatus('dnd', { 
        name: 'scrubs try to play LoL', 
        type: 3
    });

    let avi = fs.readFileSync('./avatar.jpg', {encoding: 'base64'});

    bot.editSelf({
        avatar: `data:image/jpeg;base64,${avi}`
    }).catch(err => console.log(err));

    console.log("Ready");
}); 

bot.on('error', err => {
    console.warn(err);
});

bot.registerCommand('summonerLevel', (msg, args) =>
{
    if (!args)
        return;
    
    let summonerName = args.join(' ');

    riotApi.getSummonerByName(summonerName)
    .then((res) => { 
        var data = res.data;

        msg.channel.createMessage(`Summoner ${data.name} is level ${data.summonerLevel}... what a scrub.`);
    })
    .catch((err) => {
        if (err.response.status === 404) {
            msg.channel.createMessage(`Summoner "${args[0]}" doesn't exist, you fucking moron.`);
        }
    });
}, {
    usage: '!summonerLevel {summonerName}',
    description: 'Get a summoner\'s level'
});

bot.registerCommand('addSummoner', async (msg, args) => { 
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
        if (error.response.status === settings.notFound) {
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

    writeSettings();

    msg.channel.createMessage(`Summoner "${summonerName}" has been added.`);
}, {
    usage: '!addSummoner {summonerName} {discordMention}', 
    description: 'Adds a summoner to the watch list'
});

bot.registerCommand("removeSummoner", (msg, args) => { 
    let summonerName = args[0].trimLeft().trimRight(); 

    if (!summonerName)
    {
        msg.channel.createMessage('Please input summoner name: `!removeSummoner {summonerName}`'); 
        return;
    }
    
    let summonerIndex = _.findIndex(settings.summoners, summoner => 
        summoner.summonerName === summonerName);

    if (summonerIndex === -1)
    {
        msg.channel.createMessage('This command can only be used to remove existing summoners, dipshit.');
        return;
    }

    settings.summoners.splice(summonerIndex, 1);

    writeSettings();

    msg.channel.createMessage(`Summoner "${summonerName}" has been removed.`);
}, {
    usage: '!removeSummoner {summonerName}',
    description: 'Removes a summoner from the watch list'
});

bot.registerCommand('setChannel', (msg, args) => {
    let channelId = args[0];

    if (!channelId)
        msg.channel.createMessage("Please use a valid channel hashtag"); 

    // nice and clean lmao
    channelId = channelId.substr(2, channelId.length).replace('>', '');

    settings.boundChannelId = channelId;
    
    boundChannel = bot.getChannel(settings.boundChannelId);

    writeSettings();

    msg.channel.createMessage(`I have been bound to #${boundChannel.name}... release me, human.`);
}, {
    usage: '!setChannel {channelHashtag}', 
    description: 'Sets a channel for bot announcements'
});

bot.registerCommand("addMessage", (msg, args) => {
    let message = args.join(' '); 

    if (!message.includes('{0}') || !message.includes('{1}'))
    {
        msg.channel.createMessage('Incorrect message format. Format must be `!setMessage "{0} died {1} times`"');
        return;
    }

    let messageFormatted = message.replace('"', '').replace('"', '');

    messages.push(messageFormatted);

    fs.writeFile('./messages.json', JSON.stringify({"messages":messages}), err => {
        if (err) console.log(err);
     });

    msg.channel.createMessage(`Message has been added. Example: "${messageFormatted.format('Faker', 18)}"`);
}, {
    usage: '!addMessage "{message}" Example: "{0} died {1} times"', 
    description: 'Adds a new message template to announcement list'
})

bot.registerCommand('displaySettings', (msg) => { 
    let settingsFields = [{
        name: 'boundChannel', 
        value: boundChannel.name
    }]; 

    for (setting in settings) {
        if (settingsFilter.includes(setting))
            continue;

        settingsFields.push({
            name: setting, 
            value: settings[setting]
        });
    }

    let discordEmbed = {
        title: 'Current Setting Values', 
        description: 'Displays the current settings values. Use `!editSetting {settingName} {newValue} to edit`.',
        color: 26367,
        type: 'rich', 
        fields:settingsFields
    }; 

    msg.channel.createMessage({
        embed: discordEmbed
    });
}, {
    usage: '!displaySettings', 
    description: 'Displays the current settings'
});

bot.registerCommand('editSetting', (msg, args) => { 
    let settingName = args[0]; 
    let newSettingValue = args[1]; 

    if (!settingName || !newSettingValue)
    {
        msg.channel.createMessage('Incorrect format. Use `!editSetting {settingName} {newValue} to edit`.');
        return;
    }

    if (settingsFilter.includes(settingName))
    {
        msg.channel.createMessage('Cannot edit this setting using this command');
        return;
    }

    if (!settings[settingName])
    {
        msg.channel.createMessage('Setting doesn\'t exist. Use `!displaySettings` to see valid settings.');
        return;
    }

    let validSettingsValueTypes = [{
            type: Number, 
            settingNames: ['gamesInTheLastMinutes', 'feedingDeathThreshold' ,'checkInterval']
    }];

    let settingType = _.find(validSettingsValueTypes, (setting) => {
        return setting.settingNames.includes(settingName);
    }).type;

    let settingValueConverted = undefined;
    try { 
         settingValueConverted = settingType(newSettingValue);

         if (!settingValueConverted)
            throw newSettingValue;
    } catch (value) {
        msg.channel.createMessage(`Cannot set value to \`${newSettingValue}\`. Type needs to be \`${settingType.name}\``);
        return;
    }

    let oldSettingValue = settings[settingName];
    settings[settingName] = settingValueConverted;

    writeSettings(); 

    msg.channel.createMessage(`Setting \`${settingName}\` has been changed. Old value: \`${oldSettingValue}\` New value: \`${settingValueConverted}\``);
}, {
    usage: '!editSetting {settingName} {newValue}', 
    description: 'Edit a setting'
});

bot.connect();