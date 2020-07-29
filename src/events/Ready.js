'use strict';

const Chariot = require('chariot.js');
const sql = require('mssql');
const Settings = require('../core/Settings');
const Timer = require('../core/Timer');
const checkFeed = require('../core/CheckFunction');

class Ready extends Chariot.Event {
    constructor() {
        super('ready');

        sql.on('error', err => {
            console.log(err);
        });
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

            this.client.checkFeedIntervals[`${guild[0]}`] = new Timer(guildSettings.checkInterval, () => checkFeed(guildSettings));
        }

        console.log("Ready");;
    }
}

module.exports = new Ready();