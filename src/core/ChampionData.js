'use strict'; 

const axios = require('axios').default.create({
    baseURL: process.env.RIOT_API_BASE_URL,
    headers: {
        'X-Riot-Token': process.env.RIOT_API_TOKEN
    }
});

class ChampionData { 
    static championData; 

    static async getChampionData() { 
        if (!this.championData) { 
            this.championData = await (await axios.get('http://ddragon.leagueoflegends.com/cdn/10.15.1/data/en_US/champion.json')).data.data;
        }

        return this.championData;
    } 
}

module.exports = ChampionData;