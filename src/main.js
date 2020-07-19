'use strict'; 

const erisBot = require('./core/ErisBot'); 
const commandLoader = require('./core/CommandLoader');

const run = async () => { 
    await commandLoader.loadCommands(erisBot);
    await erisBot.connect();
};

run();