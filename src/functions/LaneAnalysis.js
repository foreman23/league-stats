// Find each players kda at 15
const findKillsAt15 = (timelineResponse) => {
    let kda = {};
    let allLaningKills = [];

    // Lower max frames if short game
    let maxFrames = 15;
    if (timelineResponse.info.frames.length < 15) {
        maxFrames = timelineResponse.info.frames.length
    }

    // populate kda with participantIds
    timelineResponse.info.participants.forEach(player => kda[player.participantId] = { kills: 0, deaths: 0, assists: 0 });
    for (let i = 0; i < maxFrames; i++) {
        timelineResponse.info.frames[i].events.forEach(event => {
            if (event.type === 'ELITE_MONSTER_KILL') {
                event.victimId = 0;
                allLaningKills.push(event)
            }

            if (event.type === 'CHAMPION_KILL') {
                allLaningKills.push(event)
                const killerId = event.killerId;
                const victimId = event.victimId;
                const assistingParticipantIds = event.assistingParticipantIds;

                // Update KDA values
                if (kda[killerId]) {
                    kda[killerId].kills += 1;
                }
                if (kda[victimId]) {
                    kda[victimId].deaths += 1;
                }
                if (assistingParticipantIds) {
                    assistingParticipantIds.forEach(id => {
                        if (kda[id]) {
                            kda[id].assists += 1;
                        }
                    });
                }
            }
        })
    }
    return [ kda, allLaningKills ];
}

// Consolidate data into array
const pair15Data = (timelineResponse, kda, gameData) => {

    // Lower max frames if short game
    let maxFrames = 15;
    if (timelineResponse.info.frames.length < 15) {
        maxFrames = timelineResponse.info.frames.length - 1
    }

    const statsAt15 = timelineResponse.info.frames[maxFrames].participantFrames
    let statsAt15Arr = [];

    for (const participantId in kda) {
        const participantData = gameData.info.participants.find(player => player.participantId === Number(participantId))
        const kdaObj = kda[participantId];
        const statsForPlayerAt15 = {
            kda: kdaObj,
            championName: participantData.championName,
            teamPosition: participantData.teamPosition,
            riotIdGameName: participantData.riotIdGameName,
            cs: statsAt15[participantId].minionsKilled + statsAt15[participantId].jungleMinionsKilled,
            participantId: participantId,
            gold: statsAt15[participantId].totalGold,
            teamId: participantData.teamId,
            wonGame: participantData.win,
            kdaAlt: `${kdaObj.kills}/${kdaObj.deaths}/${kdaObj.assists}`,
            championId: participantData.championId,
            riotIdTagline: participantData.riotIdTagline
            // wonLane: 
        }
        statsAt15Arr.push(statsForPlayerAt15)
    }
    return statsAt15Arr;
}

// Determine bot laning phase winners
const determineWinnersBot = (statsAt15Arr) => {
    const botLanersBlue = statsAt15Arr.filter(player => (player.teamPosition === 'BOTTOM' || player.teamPosition === 'UTILITY') && player.teamId === 100);
    const botLanersRed = statsAt15Arr.filter(player => (player.teamPosition === 'BOTTOM' || player.teamPosition === 'UTILITY') && player.teamId === 200);

    let laneWinner = null;
    let laneLoser = null;
    let goldDifference = 0;
    let resTag = null;
    let bubbleCount = 0;
    let bubbleColor = null;
    if ((botLanersBlue[0].gold + botLanersBlue[1].gold) > (botLanersRed[0].gold + botLanersRed[1].gold)) {
        laneWinner = botLanersBlue;
        laneLoser = botLanersRed;
        goldDifference = (botLanersBlue[0].gold + botLanersBlue[1].gold) - (botLanersRed[0].gold + botLanersRed[1].gold);
    }
    if ((botLanersBlue[0].gold + botLanersBlue[1].gold) < (botLanersRed[0].gold + botLanersRed[1].gold)) {
        laneWinner = botLanersRed;
        laneLoser = botLanersBlue;
        goldDifference = (botLanersRed[0].gold + botLanersRed[1].gold) - (botLanersBlue[0].gold + botLanersBlue[1].gold);
    }
    else if ((botLanersBlue[0].gold + botLanersBlue[1].gold) === (botLanersRed[0].gold + botLanersRed[1].gold)) {
        goldDifference = 0;
        laneWinner = botLanersBlue;
        laneLoser = botLanersRed;
    }

    // Determine resTag based on gold dif
    if (goldDifference >= 3000) {
        resTag = 'obliterates';
        bubbleCount = 5;
        if (laneWinner[0].teamId === 100) {
            bubbleColor = '#37B7FF'
        }
        else {
            bubbleColor = '#FF3F3F'
        }
    }
    else if (goldDifference >= 2000) {
        resTag = 'dominates';
        bubbleCount = 4;
        if (laneWinner[0].teamId === 100) {
            bubbleColor = '#37B7FF'
        }
        else {
            bubbleColor = '#FF3F3F'
        }
    }
    else if (goldDifference >= 1000) {
        resTag = 'won';
        bubbleCount = 3;
        if (laneWinner[0].teamId === 100) {
            bubbleColor = '#9EDCFF'
        }
        else {
            bubbleColor = '#FF8B8B'
        }
    }
    else if (goldDifference >= 650) {
        resTag = 'won';
        bubbleCount = 2;
        if (laneWinner[0].teamId === 100) {
            bubbleColor = '#9EDCFF'
        }
        else {
            bubbleColor = '#FF8B8B'
        }
    }
    else if (goldDifference >= 150) {
        resTag = 'won';
        bubbleCount = 1;
        if (laneWinner[0].teamId === 100) {
            bubbleColor = '#9EDCFF'
        }
        else {
            bubbleColor = '#FF8B8B'
        }
    }
    else if (goldDifference < 150) {
        resTag = 'draw';
        bubbleCount = 0;
        bubbleColor = '#D9D9D9'
    }

    const laneResultsObj = {
        laneWinner: laneWinner,
        laneLoser: laneLoser,
        resTag: resTag,
        goldDifference: goldDifference,
        lanePosition: 'BOTTOM',
        teamWonLane: laneWinner[0].teamId,
        bubbleCount: bubbleCount,
        bubbleColor: bubbleColor
    }
    return laneResultsObj
}

// Determine laning phase winners
const determineWinners = (statsAt15Arr) => {
    const roles = ['TOP', 'JUNGLE', 'MIDDLE']
    const laneResults = {};

    // Calculate bot lane
    let botLaneResultsObj = determineWinnersBot(statsAt15Arr);

    // Calculate remaning lanes
    for (let i = 0; i < roles.length; i++) {
        const laners = statsAt15Arr.filter(player => player.teamPosition === roles[i]);

        let laneWinner = null;
        let laneLoser = null;
        let goldDifference = 0;
        let resTag = null;
        let bubbleCount = 0;
        let bubbleColor = null;
        if (laners[0].gold > laners[1].gold) {
            laneWinner = laners[0];
            laneLoser = laners[1];
            goldDifference = laners[0].gold - laners[1].gold;
        }
        if (laners[0].gold < laners[1].gold) {
            laneWinner = laners[1]
            laneLoser = laners[0];
            goldDifference = laners[1].gold - laners[0].gold;
        }
        else if (laners[0].gold === laners[1].gold) {
            goldDifference = 0;
            laneWinner = laners[0];
            laneLoser = laners[1];
        }

        // Determine resTag based on gold dif
        if (goldDifference >= 3000) {
            resTag = 'obliterates';
            bubbleCount = 5;
            if (laneWinner.teamId === 100) {
                bubbleColor = '#568CFF'
            }
            else {
                bubbleColor = '#FF3F3F'
            }
        }
        else if (goldDifference >= 2000) {
            resTag = 'dominates';
            bubbleCount = 4;
            if (laneWinner.teamId === 100) {
                bubbleColor = '#568CFF'
            }
            else {
                bubbleColor = '#FF3F3F'
            }
        }
        else if (goldDifference >= 1000) {
            resTag = 'won';
            bubbleCount = 3;
            if (laneWinner.teamId === 100) {
                bubbleColor = '#7AC9FF'
            }
            else {
                bubbleColor = '#FF8B8B'
            }
        }
        else if (goldDifference >= 650) {
            resTag = 'won';
            bubbleCount = 2;
            if (laneWinner.teamId === 100) {
                bubbleColor = '#7AC9FF'
            }
            else {
                bubbleColor = '#FF8B8B'
            }
        }
        else if (goldDifference >= 150) {
            resTag = 'won';
            bubbleCount = 1;
            if (laneWinner.teamId === 100) {
                bubbleColor = '#7AC9FF'
            }
            else {
                bubbleColor = '#FF8B8B'
            }
        }
        else if (goldDifference < 150) {
            resTag = 'draw';
            bubbleCount = 0;
            bubbleColor = '#D9D9D9'
        }

        const laneResultsObj = {
            laneWinner: laneWinner,
            laneLoser: laneLoser,
            resTag: resTag,
            goldDifference: goldDifference,
            lanePosition: roles[i],
            teamWonLane: laneWinner.teamId,
            bubbleCount: bubbleCount,
            bubbleColor: bubbleColor
        }
        laneResults[roles[i]] = laneResultsObj;
    }
    laneResults["BOTTOM"] = botLaneResultsObj;
    return laneResults;
}

const getStatsAt15 = async (matchRegion, matchId, gameData, timelineData) => {
    const kdaAndallLaningKills = findKillsAt15(timelineData);
    const kda = kdaAndallLaningKills[0];
    const allLaningKills = kdaAndallLaningKills[1];
    const statsAt15Arr = pair15Data(timelineData, kda, gameData)
    const laneResults = determineWinners(statsAt15Arr);
    const payloadObj = {
        laneResults: laneResults,
        laningKills: allLaningKills
    }
    return payloadObj;
}

export default getStatsAt15