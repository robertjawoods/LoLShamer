const settings = require('./settings.json');
const axios = require('axios').default.create({
    baseURL: settings.riotApiBaseUrl,
    headers: {
        'X-Riot-Token': settings.riotApiToken
    }
});

exports.getSummonerByName = function(summonerName) {
    let encodedSummonerName = encodeURI(summonerName.trimLeft().trimRight()); 

    return axios.get(`lol/summoner/v4/summoners/by-name/${encodedSummonerName}`);   
};

exports.getMatchesByAccountId = function(accountId) { 
    // Get a date 90 mins ago, will get games that ended within that time 
    let date = new Date(Date.now() - (settings.gamesInTheLastMinutes * 60000)).valueOf();

    return axios.get(`lol/match/v4/matchlists/by-account/${accountId}`, {
        params: { 
            beginTime: date
        }
    });
}

exports.getMatchDetails = function(matchId) { 
    return axios.get(`/lol/match/v4/matches/${matchId}`);
}
