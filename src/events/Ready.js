'use strict';

const Chariot = require('chariot.js');
const sql = require('mssql');
const Settings = require('../core/Settings');
const Timer = require('../core/Timer');
const RiotApi = require('../core/RiotApi');

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
        this.client.checkFeedIntervals = {};

        for (const guild of this.client.guilds) {
            let guildSettings = this.client.settings[`${guild[0]}`] = await new Settings(guild[0]).init();

            if (guildSettings.boundChannelId)
                this.client.settings[`${guild[0]}`].boundChannel = this.client.getChannel(guildSettings.boundChannelId);                           

            this.client.checkFeedIntervals[`${guild[0]}`] = new Timer(guildSettings.checkInterval, () => {
                let settings = this.client.settings[`${guild[0]}`];

                if (!settings.boundChannel)
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

                            // TODO: create message 

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