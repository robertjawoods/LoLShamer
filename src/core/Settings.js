'use strict';

const sql = require('mssql');

class Settings {
    constructor(guildId) {
        this.boundChannelId = undefined;
        this.gamesInTheLastMinutes = undefined;
        this.feedingDeathThreshold = undefined;
        this.checkInterval = undefined;
        this.messages = [];
        this.summoners = [];

        this.guildId = guildId;
    }

    static sqlPool = undefined;

    async Pool() {
        if (!this.sqlPool) {
            this.sqlPool = new sql.ConnectionPool({
                user: 'lol-shamer',
                password: 'lolshamer123',
                server: '35.187.79.60',
                database: 'default'
            });

            await this.sqlPool.connect();
        }

        return this.sqlPool;
    }

    async init() {
        let settingsResult = undefined;
        await this.Pool().then(pool => {
            return pool.request()
                .input('guildId', this.guildId)
                .query(
                    'select SettingName as \'name\', SettingValue as \'value\' from dbo.Settings where GuildId = @guildId'
                );
        }).then(result => settingsResult = result.recordset);

        if (!settingsResult.length) {
            this.writeDefaultSettings();
        }

        let summonersResult = undefined;
        await this.Pool().then(pool => {
            return pool.request()
                .input('guildId', this.guildId)
                .query(
                    'select SummonerName as \'summonerName\', DiscordName as \'discordName\' from dbo.Summoners where GuildId = @guildId'
                );
        }).then(result => summonersResult = result.recordset);

        for (const setting of settingsResult) {
            this[setting.name] = setting.name === 'boundChannelId' ? setting.value : parseInt(setting.value);
        }

        for (const summoner of summonersResult) {
            this.summoners.push({
                summonerName: summoner.summonerName,
                discordName: summoner.discordName,
                inDatabase: true
            });
        }

        let messagesResult = undefined;
        await this.Pool().then(pool => {
            return pool.request()
                .input('guildId', this.guildId)
                .query('select MessageText as "messageText" from Messages where GuildId = @guildId')
        }).then(result => messagesResult = result.recordset);

        if (!messagesResult.length) {
            let message = '{0} is a filthy feeder. How can you die {1} times? Embarrassing.';
            
            this.writeMessage(message);
        }

        for (const message of messagesResult) {
            this.messages.push(message.messageText);
        }

        return this;
    }

    async writeMessage(message) {
        this.messages.push(message); 

        await this.Pool().then(pool => {
            pool.request()
                .input('guildId', this.guildId)
                .input('message', message)
                .query('insert into Messages (GuildId, MessageText) values (@guildId, @message)');
        });
    }

    async writeSettings() {
        for (const setting in this) {
            var settingValue = this[setting];

            if (setting === 'summoners')
                continue;

            await this.Pool().then(pool =>
                pool.request()
                    .input('settingName', setting)
                    .input('settingValue', settingValue)
                    .input('guildId', this.guildId)
                    .query('insert into Settings (GuildId, SettingName, SettingValue) values (@guildId, @settingName, @settingValue)'));
        }
    }

    async removeSummoner(summonerName) {
        let summonerIndex = this.summoners.findIndex(s => s.summonerName === summonerName);

        this.summoners.splice(summonerIndex, 1);

        return await this.Pool().then(pool => {
            pool.request()
                .input('guildId', this.guildId)
                .input('summonerName', summonerName)
                .query('delete from Summoners where SummonerName = @summonerName and GuildId = @guildId')
        });
    }

    // should change the setting in here rather than changing it in caller 
    async writeSetting(settingName, settingValue) {
        this[settingName] = settingValue;

        return await this.Pool()
            .then(pool => {
                pool.request().input('settingName', settingName)
                    .input('settingValue', settingValue)
                    .input('guildId', this.guildId)
                    .query('update Settings set SettingValue = @settingValue where GuildId = @guildId and SettingName = @settingName');
            });
    }

    async writeSummoners() {
        for (const summoner of this.summoners.filter(s => !s.inDatabase)) {
            await this.Pool()
                .then(pool => {
                    pool.request().input('discordName', summoner.discordName)
                        .input('summonerName', summoner.summonerName)
                        .input('guildId', this.guildId)
                        .query('insert into Summoners (GuildId, DiscordName, SummonerName) values (@guildId, @discordName, @summonerName)');
                });

            summoner.inDatabase = true;
        }
    }

    async writeDefaultSettings() {
        this.gamesInTheLastMinutes = 90;
        this.checkInterval = 10;
        this.feedingDeathThreshold = 10;

        this.writeSettings();
    }
}

module.exports = Settings;