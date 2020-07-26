'use strict';

const Chariot = require('chariot.js');
const sql = require('mssql');
const Settings = require('../core/Settings');
const Timer = require('../core/Timer');
const RiotApi = require('../core/RiotApi');
const { result } = require('underscore');
const { response } = require('express');

class Ready extends Chariot.Event {
    constructor() {
        super('ready');

        sql.on('error', err => {
            console.log(err);
        });
    }

    getParticipantDetails(accountId, match) {
        let participantIdentity = match.participantIdentities
            .find(p => p.player.accountId === accountId);

        let participantDetails = match.participants.find(
            p => p.participantId === participantIdentity.participantId
        );

        return participantDetails;
    }

    async execute() {
        this.client.editStatus('online', {
            name: 'scrubs try to play LoL',
            type: 3
        });

        this.client.settings = {};
        this.client.guildIntervals = {};

        this.client.pool = new sql.ConnectionPool({
            user: 'lol-shamer',
            password: 'lolshamer123',
            server: '35.187.79.60', // You can use 'localhost\\instance' to connect to named instance
            database: 'default',
        });

        await this.client.pool.connect();

        for (const guild of this.client.guilds) {
            let guildSettings = new Settings();
            let guildId = guild[0];

            const settingsResult = await this.client.pool.request()
                .input('guildId', guildId)
                .query(
                    'select SettingName as \'name\', SettingValue as \'value\' from dbo.Settings where GuildId = @guildId'
                );

            if (!settingsResult.recordset.length) {
                guildSettings.writeDefaultSettings(guildId, this.client.pool);
            }

            const summonersResult = await this.client.pool.request()
                .input('guildId', guildId)
                .query(
                    'select SummonerName as \'summonerName\', DiscordName as \'discordName\' from dbo.Summoners where GuildId = @guildId'
                );

            guildSettings.set(settingsResult.recordset, summonersResult.recordset);

            this.client.settings[`${guildId}`] = guildSettings;

            this.client.guildIntervals[guildId] = new Timer(0.1, () => {
                let settings = this.client.settings[guildId];

                if (!settings.boundChannelId)
                    return;

                let summoners = settings.summoners;

                for (const summoner in summoners) {
                    let accountId = undefined;

                    RiotApi
                        .getSummonerByName(summoner.summonerName)
                        .then(result => {
                            let data = result.data;
                            accountId = data.accountId;

                            return data.accountId;
                        })
                        .then(accountId => {
                            return RiotApi.getMatchesByAccountId(accountId);
                        })
                        .then(response => {
                            let latestMatch = response.data.matches[0];

                            return RiotApi.getMatchDetails(latestMatch.gameId);
                        })
                        .then(match => {
                            let matchDetails = match.data;
                            let participantDetails = this.getParticipantDetails(accountId, match);

                            // create message 

                            this.client.createMessage(settings.boundChannelId, 'message');
                        })
                        .catch(err => {
                            if (err.config.url.includes('lol/match/v4/matchlists/by-account/')) {
                                console.log(`No games found in the last ${settings.gamesInTheLastMinutes} minutes for summoner "${summonerName}"`);
                                return;
                            }
                            else
                                console.log(err)
                        })
                }
            });
        }

        console.log("Ready");;
    }
}

module.exports = new Ready();