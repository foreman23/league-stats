const generateShortSummary = (gameData, playerData, timelineData, stats15, champsJSON) => {
    console.log(playerData)
    let lanes = stats15.laneResults;
    console.log(lanes)
    let roles = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM'];

    // Calculate win/loss strings
    let topDescEndGame = null;
    let jgDescEndGame = null;
    let midDescEndGame = null;
    let botDescEndGame = null;
    for (let i = 0; i < roles.length; i++) {
        console.log(roles[i])
        let currLane = lanes[roles[i]]
        let resStr = null;
        if (currLane.bubbleCount > 3) {
            if (playerData.teamId === currLane.teamWonLane) {
                resStr = `dominated in ${currLane.lanePosition.toLowerCase()}`
            }
            else {
                resStr = `got crushed in ${currLane.lanePosition.toLowerCase()}`
            }
        }
        else if (currLane.bubbleCount === 0) {
            resStr = `tied in ${currLane.lanePosition.toLowerCase()}`
        }
        else {
            if (playerData.teamId === currLane.teamWonLane) {
                resStr = `won in ${currLane.lanePosition.toLowerCase()}`
            }
            else {
                resStr = `lost in ${currLane.lanePosition.toLowerCase()}`
            }
        }
        if (currLane.lanePosition === 'TOP') {
            topDescEndGame = resStr
        }
        if (currLane.lanePosition === 'JUNGLE') {
            jgDescEndGame = resStr
        }
        if (currLane.lanePosition === 'MIDDLE') {
            midDescEndGame = resStr
        }
        if (currLane.lanePosition === 'BOTTOM') {
            botDescEndGame = resStr
        }
    }

    // Assemble match summary text
    let matchSummaryText = null;
    let playerChampionName = null;
    let oppLoseChampionName = null;
    let oppWinChampionName = null;

    if (playerData.teamPosition === 'TOP') {
        playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
        oppLoseChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.TOP.laneLoser.championId)).name
        oppWinChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.TOP.laneWinner.championId)).name
        if (lanes.TOP.laneWinner.riotIdGameName === playerData.riotIdGameName) {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerChampionName}) ${topDescEndGame} against '${lanes.TOP.laneLoser.riotIdGameName}' (${oppLoseChampionName}) while their team ${jgDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
        } else {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerChampionName}) ${topDescEndGame} against '${lanes.TOP.laneWinner.riotIdGameName}' (${oppWinChampionName}) while their team ${jgDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
        }
    }
    if (playerData.teamPosition === 'JUNGLE') {
        playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
        oppLoseChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.JUNGLE.laneLoser.championId)).name
        oppWinChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.JUNGLE.laneWinner.championId)).name
        if (lanes.JUNGLE.laneWinner.riotIdGameName === playerData.riotIdGameName) {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerChampionName}) ${jgDescEndGame} against '${lanes.JUNGLE.laneLoser.riotIdGameName}' (${oppLoseChampionName}) while their team ${topDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
        } else {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerChampionName}) ${jgDescEndGame} against '${lanes.JUNGLE.laneWinner.riotIdGameName}' (${oppWinChampionName}) while their team ${topDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
        }
    }
    if (playerData.teamPosition === 'MIDDLE') {
        playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
        oppLoseChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.MIDDLE.laneLoser.championId)).name
        oppWinChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.MIDDLE.laneWinner.championId)).name
        // Player won lane
        if (lanes.MIDDLE.laneWinner.riotIdGameName === playerData.riotIdGameName) {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerChampionName}) ${midDescEndGame} against '${lanes.MIDDLE.laneLoser.riotIdGameName}' (${oppLoseChampionName}) while their team ${topDescEndGame}, ${jgDescEndGame}, and ${botDescEndGame}.`
        }
        // Player lost lane
        else {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerChampionName}) ${midDescEndGame} against '${lanes.MIDDLE.laneWinner.riotIdGameName}' (${oppWinChampionName}) while their team ${topDescEndGame}, ${jgDescEndGame}, and ${botDescEndGame}.`
        }
    }
    else if (playerData.teamPosition === 'BOTTOM' || playerData.teamPosition === 'UTILITY') {
        if (playerData.teamPosition === 'BOTTOM') {
            // Player won lane
            if (lanes.BOTTOM.laneWinner.some(player => player.riotIdGameName === playerData.riotIdGameName)) {
                playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
                const utilityWinner = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'UTILITY');
                let utilityWinnerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(utilityWinner.championId)).name
                const bottomOpponent = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'BOTTOM');
                let bottomOpponentChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(bottomOpponent.championId)).name
                const utilityOpponent = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'UTILITY');
                let utilityOpponentChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(utilityOpponent.championId)).name
                matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerChampionName}) ${botDescEndGame} with 
                '${utilityWinner.riotIdGameName}' (${utilityWinnerChampionName}) against '${bottomOpponent.riotIdGameName}'
                (${bottomOpponentChampionName}) and '${utilityOpponent.riotIdGameName}' (${utilityOpponentChampionName}) while their team ${topDescEndGame}, ${jgDescEndGame}, 
                and ${midDescEndGame}.`;
            }
            // Player lost lane 
            else {
                playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
                const utilityLoser = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'UTILITY');
                let utilityLoserChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(utilityLoser.championId)).name
                const bottomOpponent = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'BOTTOM');
                let bottomOpponentChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(bottomOpponent.championId)).name
                const utilityOpponent = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'UTILITY');
                let utilityOpponentChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(utilityOpponent.championId)).name
                matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerChampionName}) ${botDescEndGame} with 
                '${utilityLoser.riotIdGameName}' (${utilityLoserChampionName}) against '${bottomOpponent.riotIdGameName}'
                (${bottomOpponentChampionName}) and '${utilityOpponent.riotIdGameName}' (${utilityOpponentChampionName}) while their team ${topDescEndGame}, ${jgDescEndGame}, 
                and ${midDescEndGame}.`;
            }
        } else if (playerData.teamPosition === 'UTILITY') {
            // Player won lane
            if (lanes.BOTTOM.laneWinner.some(player => player.riotIdGameName === playerData.riotIdGameName)) {
                playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
                const bottomWinner = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'BOTTOM');
                let bottomWinnerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(bottomWinner.championId)).name
                const bottomOpponent = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'BOTTOM');
                let bottomOpponentChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(bottomOpponent.championId)).name
                const utilityOpponent = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'UTILITY');
                let utilityOpponentChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(utilityOpponent.championId)).name
                matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerChampionName}) ${botDescEndGame} with 
                '${bottomWinner.riotIdGameName}' (${bottomWinnerChampionName}) against '${bottomOpponent.riotIdGameName} '
                (${bottomOpponentChampionName}) and '${utilityOpponent.riotIdGameName}' (${utilityOpponentChampionName}) while their team ${topDescEndGame}, ${jgDescEndGame}, 
                and ${midDescEndGame}.`;
            }
            // Player lost lane
            else {
                playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
                const bottomLoser = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'BOTTOM');
                let bottomLoserChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(bottomLoser.championId)).name
                const bottomOpponent = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'BOTTOM');
                let bottomOpponentChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(bottomOpponent.championId)).name
                const utilityOpponent = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'UTILITY');
                let utilityOpponentChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(utilityOpponent.championId)).name
                matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerChampionName}) ${botDescEndGame} with 
                '${bottomLoser.riotIdGameName}' (${bottomLoserChampionName}) against '${bottomOpponent.riotIdGameName}'
                (${bottomOpponentChampionName}) and '${utilityOpponent.riotIdGameName}' (${utilityOpponentChampionName}) while their team ${topDescEndGame}, ${jgDescEndGame}, 
                and ${midDescEndGame}.`;
            }
        }
    }


    console.log(matchSummaryText)

    return (matchSummaryText)

}

export default generateShortSummary;