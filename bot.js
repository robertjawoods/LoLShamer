const eris = require('eris');
const fs = require('fs');
const variables = require('./variables.json');
const summoners = require('./summoners.json');
const axios = require('axios').default.create({
        baseURL: variables.riotApiBaseUrl,
        headers: {
            'X-Riot-Token': variables.riotApiToken
        }
    }
);
const _ = require('underscore');

const bot = new eris.Client(variables.botToken, {
    prefix: '!'
});

const getSummonerLevel = function(msg) {
    let summonerName = msg.content.replace(variables.summonerLevelCommandString, '').trimLeft().trimRight(); 

    let encodedSummonerName = encodeURI(summonerName);

    axios
    .get(`lol/summoner/v4/summoners/by-name/${encodedSummonerName}`)
    .then((res) => { 
        var data = res.data;

        console.log(res);
        msg.channel.createMessage(`Summoner ${data.name} is level ${data.summonerLevel}... what a scrub.`);
    })
    .catch((err) => {
        if (err.response.status === variables.notFound) {
            msg.channel.createMessage(`Summoner "${summonerName}" doesn't exist, you fucking moron.`);
        }
    });
}

bot.on('ready', () => console.log("Ready")); 

bot.on('messageCreate', async (msg) => {
    if (msg.channel.name !== 'bot_spam')
        return;

    if (msg.content.includes(variables.summonerLevelCommandString))
        getSummonerLevel(msg);
});

bot.on('error', err => {
    console.warn(err);
});

bot.connect();


