import axios from "axios";

// Makes a GET request to the API
// Returns match timeline data
const getMatchTimeline = async (matchRegion, matchId) => {
    console.log('CALLING RIOT API')
    const timelineResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/matchtimeline?alternateRegion=${matchRegion}&matchId=${matchId}`)
    return timelineResponse;
}

// Find each players kda at 15
const findKillsAt15 = (timelineResponse) => {
    let kda = {};

    // populate kda with participantIds
    timelineResponse.data.info.participants.forEach(player => kda[player.participantId] = { kills: 0, deaths: 0, assists: 0 });
    for (let i = 0; i < 15; i++) {
        timelineResponse.data.info.frames[i].events.forEach(event => {
            if (event.type === 'CHAMPION_KILL') {
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
    return kda;
}

// Consolidate data into array
const pair15Data = (timelineResponse, kda, gameData) => {
    const statsAt15 = timelineResponse.data.info.frames[15].participantFrames
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
            kdaAlt: `${kdaObj.kills}/${kdaObj.deaths}/${kdaObj.assists}`
            // wonLane: 
        }
        statsAt15Arr.push(statsForPlayerAt15)
    }
    return statsAt15Arr;
}

// Determine laning phase winners
const determineWinners = (statsAt15Arr) => {
    const roles = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY']
    const laneResults = {};
    // console.log(statsAt15Arr)
    for (let i = 0; i < roles.length; i++) {
        const laners = statsAt15Arr.filter(player => player.teamPosition === roles[i]);
        let laneWinner = null;
        let laneLoser = null;
        let goldDifference = 0;
        let resTag = null;
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
        if (goldDifference >= 1500) {
            resTag = 'dominates';
        }
        else if (goldDifference >= 150) {
            resTag = 'won';
        }
        else if (goldDifference < 150) {
            resTag = 'draw';
        }
        
        const laneResultsObj = {
            laneWinner: laneWinner,
            laneLoser: laneLoser,
            resTag: resTag,
            goldDifference: goldDifference,
            lanePosition: roles[i],
            teamWonLane: laneWinner.teamId
        }
        laneResults[roles[i]] = laneResultsObj;
        console.log(laneResults)
    }
    return laneResults;
}

const getStatsAt15 = async (matchRegion, matchId, gameData) => {
    const timelineData = await getMatchTimeline(matchRegion, matchId);
    const kda = findKillsAt15(timelineData);
    const statsAt15Arr = pair15Data(timelineData, kda, gameData)
    const laneResults = determineWinners(statsAt15Arr);
    const payloadObj = {
        laneResults: laneResults
    }
    return payloadObj;
}

export default getStatsAt15