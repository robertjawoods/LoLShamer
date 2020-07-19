const messages = require('./messages.json').messages;
const _ = require('underscore');
const settings = require('./settings.json');

if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
}


exports.createMessage = function (matchDetails, participantDetails, playerDetails) { 
    let particpantTeam = participantDetails.teamId;
    let didWin = _.find(matchDetails.teams, team => team.teamId === particpantTeam).win === 'Win';
    let deathCount = participantDetails.stats.deaths;

    if (didWin || deathCount < settings.feedingDeathThreshold)
        return null;

    let message = _.sample(messages);

    return message.format(playerDetails.discordName, deathCount);
}