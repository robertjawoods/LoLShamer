'use strict';
const RiotApi = require('../core/RiotApi');
const ChampionData = require('../core/ChampionData');

function getParticipantDetails(matchDetails, accountId) {
    let participantIdentity = matchDetails.participantIdentities
        .find(p => p.player.accountId === accountId);
    let participantDetails = matchDetails.participants.find(
        p => p.participantId === participantIdentity.participantId);
    return participantDetails;
}

async function getMatchDetails(match, participantDetails) {
    let particpantTeam = participantDetails.teamId;
    let didWin = match.teams.find(team => team.teamId === particpantTeam).win === 'Win';
    let deathCount = participantDetails.stats.deaths;
    let championData = await ChampionData.getChampionData();
    let champion = Object.keys(championData).filter(data => data.key === participantDetails.championId).map(key => championData[key]);

    return {
        didWin: didWin, 
        deathCount: deathCount, 
        championName : championData[0]
    }
}

async function checkFeed(settings) {
    if (!settings.boundChannel)
        return;

    let summoners = settings.summoners;

    for (const summoner of summoners) {
        let accountId = undefined;

        RiotApi
            .getSummonerByName(summoner.summonerName)
            .then(result => {
                let data = result.data;
                accountId = data.accountId;

                return data.accountId;
            })
            .then(accountId => {
                return RiotApi.getMatchesByAccountId(accountId, settings.gamesInTheLastMinutes);
            })
            .then(response => {
                let latestMatch = response.data.matches[0];

                if (summoner.checkedGameIds.includes(latestMatch.gameId))
                   return Promise.reject('Game already checked');

                summoner.checkedGameIds.push(latestMatch.gameId);

                return RiotApi.getMatchDetails(latestMatch.gameId);
            })
            .then(match => {
                let participantDetails = getParticipantDetails(match.data, accountId);
                
                return getMatchDetails(match.data, participantDetails);              
            })
            .then (details => { 
                let message = undefined;
                let messages = settings.messages;

                if (details.didWin && details.deathCount >= settings.feedingDeathThreshold)
                    message = 'You might have won, {0}, but dying {1} times is still feeding. Bastard.'.format(summoner.discordName, deathcount);

                if (details.didWin || details.deathCount < settings.feedingDeathThreshold)
                    return null;

                if (details.deathCount >= settings.feedingDeathThreshold)
                    message = messages[Math.floor(Math.random() * messages.length)].format(summoner.discordName, details.deathCount);

                settings.boundChannel.createMessage(message);
            })
            .catch(err => {
                if ((err.config && err.config.url) && err.config.url.includes('lol/match/v4/matchlists/by-account/')) {
                    console.log(`No games found in the last ${settings.gamesInTheLastMinutes} minutes for summoner "${summoner.summonerName}"`);
                    return;
                }       
                
                console.log(err);                                       
            });
    }
}

module.exports = checkFeed;


