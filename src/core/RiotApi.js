'use strict'; 

const axios = require('axios').default;

class RiotApi { 
    constructor() {
        this.axiosClient = axios.create({
            baseURL: process.env.RIOT_API_BASE_URL,
            headers: {
                'X-Riot-Token': process.env.RIOT_API_TOKEN
            }
        });
    }

    getSummonerByName(summonerName) { 
        let encodedSummonerName = encodeURI(summonerName.trimLeft().trimRight()); 

        return this.axiosClient.get(`lol/summoner/v4/summoners/by-name/${encodedSummonerName}`);   
    }

    getMatchesByAccountId = function(accountId) { 
        // Get a date 90 mins ago, will get games that ended within that time 
        let date = new Date(Date.now() - (settings.gamesInTheLastMinutes * 60000)).valueOf();
    
        return this.axiosClient.get(`lol/match/v4/matchlists/by-account/${accountId}`, {
            params: { 
                beginTime: date
            }
        });
    }

    getMatchDetails = function(matchId) { 
        return this.axiosClient.get(`/lol/match/v4/matches/${matchId}`);
    }
}

module.exports = new RiotApi();
