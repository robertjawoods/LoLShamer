const eris = require('eris');
const fs = require('fs');
const settings = require('./settings.json');
const messages = require('./messages.json').messages;
const riotApi = require('./riotApi');
const messageService = require('./messageService');
const _ = require('underscore');
const sql = require('mssql');
const { config } = require('process');

let boundChannel = undefined;
let sqlPool = undefined;
let settingsFilter = ['riotApiBaseUrl', 'riotApiToken', 'botToken', 'summoners', 'boundChannelId'];

function getSettings() { 
    sql.connect(config, function (err) {    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select * from Student', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset);
            
        });
    });
}

bot.on('guildCreate', guild => {

});

async function writeSettings() {
    let data = JSON.stringify(settings);

    fs.writeFile('./settings.json', data, err => {
       if (err) console.log(err);
    });

    let guildId = bot.channelGuildMap.

    pool.request().query('insert into ')
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

    sqlPool = sql.connect({
        user: 'lol-shamer',
        password: 'lolshamer123',
        server: '35.187.79.60', 
        database: 'default' 
    });

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
