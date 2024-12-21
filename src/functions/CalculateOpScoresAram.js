const calculateOpScoresAram = (gameData, playerData) => {
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
            killParticipation: killParticipation / maxValues.killParticipation
        };

        const weights = {
            kills: 1.5,
            deaths: 1.5,
            assists: 1.2,
            damage: 1.3,
            gold: 1.1,
            cs: 1.0,
            killParticipation: 1.4
        };

        const score = (
            normalized.kills * weights.kills +
            normalized.deaths * weights.deaths +
            normalized.assists * weights.assists +
            normalized.damage * weights.damage +
            normalized.gold * weights.gold +
            normalized.cs * weights.cs +
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

    // Update the gameData object with the new opScores
    const updatedGameData = { ...gameData };
    updatedGameData.info.participants = sortedPlayers;

    return { highestDamageDealt, playersWithScores: updatedGameData.info.participants }

    // setHighestDamageDealt(highestDamageDealt)
    // setPlayersWithScore(updatedGameData.info.participants)
};

export default calculateOpScoresAram;