const calculateOpScores = (gameData, playerData) => {
    const players = gameData.info.participants;

    // Calculate total kills for each team
    const teamKills = players.reduce((acc, player) => {
        if (!acc[player.teamId]) {
            acc[player.teamId] = 0;
        }
        acc[player.teamId] += player.kills;
        return acc;
    }, {});

    const maxValues = {
        kills: Math.max(...players.map(p => p.kills)),
        deaths: Math.max(...players.map(p => p.deaths)),
        assists: Math.max(...players.map(p => p.assists)),
        damage: Math.max(...players.map(p => p.totalDamageDealtToChampions)),
        gold: Math.max(...players.map(p => p.goldEarned)),
        cs: Math.max(...players.map(p => p.totalMinionsKilled + p.neutralMinionsKilled)),
        wards: Math.max(...players.map(p => p.wardsPlaced)),
        killParticipation: Math.max(...players.map(p => (p.kills + p.assists) / teamKills[p.teamId]))
    };

    const normalizedPlayers = players.map((player, index) => {
        const killParticipation = (player.kills + player.assists) / teamKills[player.teamId];

        const normalized = {
            kills: player.kills / maxValues.kills,
            deaths: 1 - (player.deaths / maxValues.deaths),
            assists: player.assists / maxValues.assists,
            damage: player.totalDamageDealtToChampions / maxValues.damage,
            gold: player.goldEarned / maxValues.gold,
            cs: (player.totalMinionsKilled + player.neutralMinionsKilled) / maxValues.cs,
            wards: player.wardsPlaced / maxValues.wards,
            killParticipation: killParticipation / maxValues.killParticipation
        };

        const weights = {
            kills: 1.5,
            deaths: 1.5,
            assists: 1.2,
            damage: 1.3,
            gold: 1.1,
            cs: 1.0,
            wards: 2,
            killParticipation: 1.4
        };

        const score = (
            normalized.kills * weights.kills +
            normalized.deaths * weights.deaths +
            normalized.assists * weights.assists +
            normalized.damage * weights.damage +
            normalized.gold * weights.gold +
            normalized.cs * weights.cs +
            normalized.wards * weights.wards +
            normalized.killParticipation * weights.killParticipation
        );

        return { ...player, score: score + (index * 0.001) }; // Adjust for uniqueness
    });

    const minScore = Math.min(...normalizedPlayers.map(p => p.score));
    const maxScore = Math.max(...normalizedPlayers.map(p => p.score));

    const playersWithOpScores = normalizedPlayers.map(player => ({
        ...player,
        opScore: ((player.score - minScore) / (maxScore - minScore)) * 10
    }));

    // Sort players by score
    let sortedPlayers = playersWithOpScores.sort((a, b) => b.opScore - a.opScore);

    // Assign game standing and find highest damage dealt
    let highestDamageDealt = 0;
    sortedPlayers.forEach((player, index) => {
        if (player.totalDamageDealtToChampions > highestDamageDealt) {
            highestDamageDealt = player.totalDamageDealtToChampions;
        }

        let standing = index + 1;
        if (standing === 1) {
            player.standing = '1st'
        }
        else if (standing === 2) {
            player.standing = '2nd'
        }
        else if (standing === 3) {
            player.standing = '3rd'
        }
        else {
            player.standing = `${standing}th`
        }
    });

    // Re-sort by role
    const roleOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
    let reSortedPlayers = sortedPlayers.sort((a, b) => roleOrder.indexOf(a.teamPosition) - roleOrder.indexOf(b.teamPosition));

    // Set matchup result descriptors
    const roles = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM'];
    let topDescEndGame = null;
    let jgDescEndGame = null;
    let midDescEndGame = null;
    let botDescEndGame = null;
    for (let i = 0; i < roles.length; i++) {
        // Calculate bot lane as BOT + UTILITY
        if (roles[i] === 'BOTTOM') {
            const allyADC = playersWithOpScores.find((player => player.teamPosition === `BOTTOM` && player.teamId === playerData.teamId))
            const allySupp = playersWithOpScores.find((player => player.teamPosition === `UTILITY` && player.teamId === playerData.teamId))
            const oppADC = playersWithOpScores.find((player => player.teamPosition === `BOTTOM` && player.teamId !== playerData.teamId))
            const oppSupp = playersWithOpScores.find((player => player.teamPosition === `UTILITY` && player.teamId !== playerData.teamId))
            let scoreDiff = null;
            let winner = null;
            let allies = [allyADC, allySupp];
            let opps = [oppADC, oppSupp];
            if (allyADC && allySupp && oppSupp && oppADC) {
                let allyCombinedScore = allyADC.score + allySupp.score;
                let oppCombinedScore = oppADC.score + oppSupp.score;
                if (allyCombinedScore > oppCombinedScore) {
                    scoreDiff = allyCombinedScore - oppCombinedScore;
                    winner = [allyADC, allySupp];
                }
                if (oppCombinedScore > allyCombinedScore) {
                    scoreDiff = oppCombinedScore - allyCombinedScore;
                    winner = [oppADC, oppSupp];
                }
            }
            // Description from results
            let descEndGame = null;

            // Calculate win/loss tag
            // console.log(roles[i], scoreDiff)
            let resTag = null;
            if (scoreDiff > 2) {
                if (winner[0] === allyADC || winner[1] === allyADC) {
                    resTag = 'dominated'
                }
                else {
                    resTag = 'got crushed'
                }
            }
            else if (scoreDiff < 0.1) {
                resTag = 'tied'
            }
            else {
                if (winner[0] === allyADC || winner[1] === allyADC) {
                    resTag = 'won'
                }
                else {
                    resTag = 'lost'
                }
            }

            // Calculate win/loss tag
            if (winner[0] === allyADC || winner[1] === allyADC) {
                if (winner[0].puuid === playerData.puuid || winner[1].puuid === playerData.puuid) {
                    descEndGame = `${playerData.riotIdGameName} ${resTag} alongside ${allies.find(player => player.puuid !== playerData.puuid).championName} in bot lane against ${oppADC.championName} and ${oppSupp.championName}`
                }
                else {
                    descEndGame = `${resTag} in bot`;
                }
            }
            else if (winner[0] === oppADC || winner[1] === oppADC) {
                if (winner[0].teamPosition === playerData.teamPosition || winner[1].teamPosition === playerData.teamPosition) {
                    descEndGame = `${playerData.riotIdGameName} ${resTag} alongside ${allies.find(player => player.puuid !== playerData.puuid).championName} in bot lane against ${oppADC.championName} and ${oppSupp.championName}`
                }
                else {
                    descEndGame = `${resTag} in bot`;
                }
            }
            botDescEndGame = descEndGame
            // setBotDescEndGame(descEndGame);
        }

        else {
            const ally = playersWithOpScores.find((player => player.teamPosition === `${roles[i]}` && player.teamId === playerData.teamId))
            const opp = playersWithOpScores.find((player => player.teamPosition === `${roles[i]}` && player.teamId !== playerData.teamId))
            let scoreDiff = null;
            let winner = null;
            if (ally && opp) {
                if (ally.score > opp.score) {
                    scoreDiff = ally.score - opp.score;
                    winner = ally;
                }
                if (opp.score > ally.score) {
                    scoreDiff = opp.score - ally.score;
                    winner = opp;
                }
            }
            // Description from results
            let descEndGame = null;

            // Calculate win/loss tag
            // console.log(roles[i], scoreDiff)
            let resTag = null;
            if (scoreDiff > 2) {
                if (winner === ally) {
                    resTag = 'dominated'
                }
                else {
                    resTag = 'got crushed'
                }
            }
            else if (scoreDiff < 0.1) {
                resTag = 'tied'
            }
            else {
                if (winner === ally) {
                    resTag = 'won'
                }
                else {
                    resTag = 'lost'
                }
            }


            if (winner === ally) {
                if (winner.puuid === playerData.puuid) {
                    descEndGame = `${playerData.riotIdGameName} ${resTag} in ${winner.teamPosition.toLowerCase()} against ${opp.championName}`
                }
                else {
                    descEndGame = `${resTag} in ${winner.teamPosition.toLowerCase()}`
                }
            }
            if (winner === opp) {
                if (winner.teamPosition === playerData.teamPosition) {
                    descEndGame = `${playerData.riotIdGameName} ${resTag} ${winner.teamPosition.toLowerCase()} against ${opp.championName}`
                }
                else {
                    descEndGame = `${resTag} in ${winner.teamPosition.toLowerCase()}`
                }
            }

            if (roles[i] === 'TOP') {
                topDescEndGame = descEndGame
                // setTopDescEndGame(descEndGame);
            }
            if (roles[i] === 'JUNGLE') {
                jgDescEndGame = descEndGame
                // setjgDescEndGame(descEndGame);
            }
            if (roles[i] === 'MIDDLE') {
                midDescEndGame = descEndGame
                // setMidDescEndGame(descEndGame);
            }
        }
    }

    // Assemble match summary text
    let matchSummaryText = null;
    if (playerData.teamPosition === 'TOP') {
        matchSummaryText = `${topDescEndGame} while their team ${jgDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
    }
    if (playerData.teamPosition === 'JUNGLE') {
        matchSummaryText = `${jgDescEndGame} while their team ${topDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
    }
    if (playerData.teamPosition === 'MIDDLE') {
        matchSummaryText = `${midDescEndGame} while their team ${topDescEndGame}, ${jgDescEndGame}, and ${botDescEndGame}.`
    }
    else if (playerData.teamPosition === 'BOTTOM' || playerData.teamPosition === 'UTILITY') {
        matchSummaryText = `${botDescEndGame} while their team ${topDescEndGame}, ${jgDescEndGame}, and ${midDescEndGame}.`
    }

    // Update the gameData object with the new opScores
    const updatedGameData = { ...gameData };
    updatedGameData.info.participants = reSortedPlayers;

    return { matchSummaryText, highestDamageDealt, playersWithScores: updatedGameData.info.participants }

    // setMatchSummaryDesc(matchSummaryText);

    
    // // console.log(updatedGameData.info.participants)
    // setHighestDamageDealt(highestDamageDealt)
    // setPlayersWithScore(updatedGameData.info.participants)
};

export default calculateOpScores;