'use strict';

const sql = require('mssql');

class Settings {
    constructor() {
        this.boundChannelId = undefined;
        this.gamesInTheLastMinutes = undefined;
        this.feedingDeathThreshold = undefined;
        this.checkInterval = undefined;

        this.summoners = [];
    }

   async writeSettings(guildId, pool) {
        for (const setting in this) {
            var settingValue = this[setting];   

            if (!settingValue)
                continue;                
            
            if(setting === 'summoners')
                continue;           

            pool.request().input('settingName', setting)
                .input('settingValue', settingValue)
                .input('guildId', guildId)
                .query('insert into Settings (GuildId, SettingName, SettingValue) values (@guildId, @settingName, @settingValue)');
        }        
    }

    async removeSummoner(summonerName, guildId, pool) { 
        let summonerIndex = this.summoners.findIndex(s => s.summonerName === summonerName);

        this.summoners.splice(summonerIndex, 1);

        return pool.request()
            .input('guildId', guildId)
            .input('summonerName', summonerName)
            .query('delete from Summoners where SummonerName = @summonerName and GuildId = @guildId')
    }

    // should change the setting in here rather than changing it in caller 
    async writeSetting(settingName, settingValue, guildId, pool) {
        return pool.request().input('settingName', settingName)
        .input('settingValue', settingValue)
        .input('guildId', guildId)
        .query('update Settings set SettingValue = @settingValue where GuildId = @guildId and SettingName = @settingName');        
    }

    async writeSummoners(guildId, pool) { 
        for (const summoner of this.summoners.filter(s => !s.inDatabase)) { 
            pool.request().input('discordName', summoner.discordName)
            .input('summonerName', summoner.summonerName)
            .input('guildId', guildId)
            .query('insert into Summoners (GuildId, DiscordName, SummonerName) values (@guildId, @discordName, @summonerName)');

            summoner.inDatabase = true;
        }
    }

    async

    writeDefaultSettings(guildId, pool) {
        this.gamesInTheLastMinutes = 90;
        this.checkInterval = 10;
        this.feedingDeathThreshold = 10;

        this.writeSettings(guildId, pool);
    
    }    

    // this doesn't make sense but works for now 
    set(settings, summoners) { 
        for (const setting of (settings || this)) { 
            this[setting.name] = parseInt(setting.value);
        }

        for (const summoner of summoners) { 
            this.summoners.push({
                summonerName: summoner.summonerName,
                discordName: summoner.discordName,
                inDatabase: true
            });
        }
    }

    updateSetting(settingName, settingValue, guildId, sql) {

    }
}



module.exports = Settings;