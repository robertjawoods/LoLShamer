'use strict'; 

const erisBot = require('./core/ErisBot'); 
const commandLoader = require('./core/CommandLoader');
const eventLoader = require('./core/EventLoader');

const run = async () => { 
    await commandLoader.loadCommands(erisBot);
    await eventLoader.loadEvents(erisBot);
    await erisBot.connect();
};

run();