// exports.createMessage = function (matchDetails, participantDetails, playerDetails) { 
//     let particpantTeam = participantDetails.teamId;
//     let didWin = _.find(matchDetails.teams, team => team.teamId === particpantTeam).win === 'Win';
//     let deathCount = participantDetails.stats.deaths;

//     if (didWin || deathCount < settings.feedingDeathThreshold)
//         return null;

//     let message = _.sample(messages);

//     return message.format(playerDetails.discordName, deathCount);
// }