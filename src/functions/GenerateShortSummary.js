const generateShortSummary = (gameData, playerData, timelineData, stats15) => {
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
    if (playerData.teamPosition === 'TOP') {
        if (lanes.TOP.laneWinner.riotIdGameName === playerData.riotIdGameName) {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerData.championName}) ${topDescEndGame} against '${lanes.TOP.laneLoser.riotIdGameName}' (${lanes.TOP.laneLoser.championName}) while their team ${jgDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
        } else {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerData.championName}) ${topDescEndGame} against '${lanes.TOP.laneWinner.riotIdGameName}' (${lanes.TOP.laneWinner.championName}) while their team ${jgDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
        }
    }
    if (playerData.teamPosition === 'JUNGLE') {
        if (lanes.JUNGLE.laneWinner.riotIdGameName === playerData.riotIdGameName) {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerData.championName}) ${jgDescEndGame} against '${lanes.JUNGLE.laneLoser.riotIdGameName}' (${lanes.JUNGLE.laneLoser.championName}) while their team ${topDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
        } else {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerData.championName}) ${jgDescEndGame} against '${lanes.JUNGLE.laneWinner.riotIdGameName}' (${lanes.JUNGLE.laneWinner.championName}) while their team ${topDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
        }
    }
    if (playerData.teamPosition === 'MIDDLE') {
        // Player won lane
        if (lanes.MIDDLE.laneWinner.riotIdGameName === playerData.riotIdGameName) {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerData.championName}) ${midDescEndGame} against '${lanes.MIDDLE.laneLoser.riotIdGameName}' (${lanes.MIDDLE.laneLoser.championName}) while their team ${topDescEndGame}, ${jgDescEndGame}, and ${botDescEndGame}.`
        }
        // Player lost lane
        else {
            matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerData.championName}) ${midDescEndGame} against '${lanes.MIDDLE.laneWinner.riotIdGameName}' (${lanes.MIDDLE.laneWinner.championName}) while their team ${topDescEndGame}, ${jgDescEndGame}, and ${botDescEndGame}.`
        }
    }
    else if (playerData.teamPosition === 'BOTTOM' || playerData.teamPosition === 'UTILITY') {
        if (playerData.teamPosition === 'BOTTOM') {
            // Player won lane
            if (lanes.BOTTOM.laneWinner.some(player => player.riotIdGameName === playerData.riotIdGameName)) {
                const utilityWinner = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'UTILITY');
                const bottomOpponent = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'BOTTOM');
                const utilityOpponent = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'UTILITY');
                matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerData.championName}) ${botDescEndGame} with 
                '${utilityWinner.riotIdGameName}' (${utilityWinner.championName}) against '${bottomOpponent.riotIdGameName}'
                (${bottomOpponent.championName}) and '${utilityOpponent.riotIdGameName}' (${utilityOpponent.championName}) while their team ${topDescEndGame}, ${jgDescEndGame}, 
                and ${midDescEndGame}.`;
            }
            // Player lost lane 
            else {
                const utilityLoser = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'UTILITY');
                const bottomOpponent = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'BOTTOM');
                const utilityOpponent = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'UTILITY');
                matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerData.championName}) ${botDescEndGame} with 
                '${utilityLoser.riotIdGameName}' (${utilityLoser.championName}) against '${bottomOpponent.riotIdGameName}'
                (${bottomOpponent.championName}) and '${utilityOpponent.riotIdGameName}' (${utilityOpponent.championName}) while their team ${topDescEndGame}, ${jgDescEndGame}, 
                and ${midDescEndGame}.`;
            }
        } else if (playerData.teamPosition === 'UTILITY') {
            // Player won lane
            if (lanes.BOTTOM.laneWinner.some(player => player.riotIdGameName === playerData.riotIdGameName)) {
                const bottomWinner = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'BOTTOM');
                const bottomOpponent = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'BOTTOM');
                const utilityOpponent = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'UTILITY');
                matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerData.championName}) ${botDescEndGame} with 
                '${bottomWinner.riotIdGameName}' (${bottomWinner.championName}) against '${bottomOpponent.riotIdGameName} '
                (${bottomOpponent.championName}) and '${utilityOpponent.riotIdGameName}' (${utilityOpponent.championName}) while their team ${topDescEndGame}, ${jgDescEndGame}, 
                and ${midDescEndGame}.`;
            }
            // Player lost lane
            else {
                const bottomLoser = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'BOTTOM');
                const bottomOpponent = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'BOTTOM');
                const utilityOpponent = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'UTILITY');
                matchSummaryText = `In laning phase, '${playerData.riotIdGameName}' (${playerData.championName}) ${botDescEndGame} with 
                '${bottomLoser.riotIdGameName}' (${bottomLoser.championName}) against '${bottomOpponent.riotIdGameName}'
                (${bottomOpponent.championName}) and '${utilityOpponent.riotIdGameName}' (${utilityOpponent.championName}) while their team ${topDescEndGame}, ${jgDescEndGame}, 
                and ${midDescEndGame}.`;
            }
        }
    }


    console.log(matchSummaryText)

    return (matchSummaryText)



    // Set matchup result descriptors
    // let playersWithOpScores = gameData.info.participants;
    // const roles = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM'];
    // let topDescEndGame = null;
    // let jgDescEndGame = null;
    // let midDescEndGame = null;
    // let botDescEndGame = null;
    // for (let i = 0; i < roles.length; i++) {
    //     // Calculate bot lane as BOT + UTILITY
    //     if (roles[i] === 'BOTTOM') {
    //         const allyADC = playersWithOpScores.find((player => player.teamPosition === `BOTTOM` && player.teamId === playerData.teamId))
    //         const allySupp = playersWithOpScores.find((player => player.teamPosition === `UTILITY` && player.teamId === playerData.teamId))
    //         const oppADC = playersWithOpScores.find((player => player.teamPosition === `BOTTOM` && player.teamId !== playerData.teamId))
    //         const oppSupp = playersWithOpScores.find((player => player.teamPosition === `UTILITY` && player.teamId !== playerData.teamId))

    //         let scoreDiff = null;
    //         let winner = null;
    //         let allies = [allyADC, allySupp];
    //         let opps = [oppADC, oppSupp];
    //         if (allyADC && allySupp && oppSupp && oppADC) {
    //             let allyCombinedScore = allyADC.score + allySupp.score;
    //             let oppCombinedScore = oppADC.score + oppSupp.score;
    //             if (allyCombinedScore > oppCombinedScore) {
    //                 scoreDiff = allyCombinedScore - oppCombinedScore;
    //                 winner = [allyADC, allySupp];
    //             }
    //             if (oppCombinedScore > allyCombinedScore) {
    //                 scoreDiff = oppCombinedScore - allyCombinedScore;
    //                 winner = [oppADC, oppSupp];
    //             }
    //         }
    //         // Description from results
    //         let descEndGame = null;

    //         // Calculate win/loss tag
    //         console.log(roles[i], scoreDiff)
    //         let resTag = null;
    //         if (scoreDiff > 2) {
    //             if (winner[0] === allyADC || winner[1] === allyADC) {
    //                 resTag = 'dominated'
    //             }
    //             else {
    //                 resTag = 'got crushed'
    //             }
    //         }
    //         else if (scoreDiff < 0.1) {
    //             resTag = 'tied'
    //         }
    //         else {
    //             if (winner[0] === allyADC || winner[1] === allyADC) {
    //                 resTag = 'won'
    //             }
    //             else {
    //                 resTag = 'lost'
    //             }
    //         }

    //         // Calculate win/loss tag
    //         if (winner[0] === allyADC || winner[1] === allyADC) {
    //             if (winner[0].puuid === playerData.puuid || winner[1].puuid === playerData.puuid) {
    //                 descEndGame = `${playerData.riotIdGameName} ${resTag} alongside ${allies.find(player => player.puuid !== playerData.puuid).championName} in bot lane against ${oppADC.championName} and ${oppSupp.championName}`
    //             }
    //             else {
    //                 descEndGame = `${resTag} in bot`;
    //             }
    //         }
    //         else if (winner[0] === oppADC || winner[1] === oppADC) {
    //             if (winner[0].teamPosition === playerData.teamPosition || winner[1].teamPosition === playerData.teamPosition) {
    //                 descEndGame = `${playerData.riotIdGameName} ${resTag} alongside ${allies.find(player => player.puuid !== playerData.puuid).championName} in bot lane against ${oppADC.championName} and ${oppSupp.championName}`
    //             }
    //             else {
    //                 descEndGame = `${resTag} in bot`;
    //             }
    //         }
    //         botDescEndGame = descEndGame
    //         // setBotDescEndGame(descEndGame);
    //     }

    //     else {
    //         const ally = playersWithOpScores.find((player => player.teamPosition === `${roles[i]}` && player.teamId === playerData.teamId))
    //         const opp = playersWithOpScores.find((player => player.teamPosition === `${roles[i]}` && player.teamId !== playerData.teamId))
    //         let scoreDiff = null;
    //         let winner = null;
    //         if (ally && opp) {
    //             if (ally.score > opp.score) {
    //                 scoreDiff = ally.score - opp.score;
    //                 winner = ally;
    //             }
    //             if (opp.score > ally.score) {
    //                 scoreDiff = opp.score - ally.score;
    //                 winner = opp;
    //             }
    //         }
    //         // Description from results
    //         let descEndGame = null;

    //         // Calculate win/loss tag
    //         // console.log(roles[i], scoreDiff)
    //         let resTag = null;
    //         if (scoreDiff > 2) {
    //             if (winner === ally) {
    //                 resTag = 'dominated'
    //             }
    //             else {
    //                 resTag = 'got crushed'
    //             }
    //         }
    //         else if (scoreDiff < 0.1) {
    //             resTag = 'tied'
    //         }
    //         else {
    //             if (winner === ally) {
    //                 resTag = 'won'
    //             }
    //             else {
    //                 resTag = 'lost'
    //             }
    //         }


    //         if (winner === ally) {
    //             if (winner.puuid === playerData.puuid) {
    //                 descEndGame = `${playerData.riotIdGameName} ${resTag} in ${winner.teamPosition.toLowerCase()} against ${opp.championName}`
    //             }
    //             else {
    //                 descEndGame = `${resTag} in ${winner.teamPosition.toLowerCase()}`
    //             }
    //         }
    //         if (winner === opp) {
    //             if (winner.teamPosition === playerData.teamPosition) {
    //                 descEndGame = `${playerData.riotIdGameName} ${resTag} ${winner.teamPosition.toLowerCase()} against ${opp.championName}`
    //             }
    //             else {
    //                 descEndGame = `${resTag} in ${winner.teamPosition.toLowerCase()}`
    //             }
    //         }

    //         if (roles[i] === 'TOP') {
    //             topDescEndGame = descEndGame
    //             // setTopDescEndGame(descEndGame);
    //         }
    //         if (roles[i] === 'JUNGLE') {
    //             jgDescEndGame = descEndGame
    //             // setjgDescEndGame(descEndGame);
    //         }
    //         if (roles[i] === 'MIDDLE') {
    //             midDescEndGame = descEndGame
    //             // setMidDescEndGame(descEndGame);
    //         }
    //     }
    // }

    // // Assemble match summary text
    // let matchSummaryText = null;
    // if (playerData.teamPosition === 'TOP') {
    //     matchSummaryText = `${topDescEndGame} while their team ${jgDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
    // }
    // if (playerData.teamPosition === 'JUNGLE') {
    //     matchSummaryText = `${jgDescEndGame} while their team ${topDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
    // }
    // if (playerData.teamPosition === 'MIDDLE') {
    //     matchSummaryText = `${midDescEndGame} while their team ${topDescEndGame}, ${jgDescEndGame}, and ${botDescEndGame}.`
    // }
    // else if (playerData.teamPosition === 'BOTTOM' || playerData.teamPosition === 'UTILITY') {
    //     matchSummaryText = `${botDescEndGame} while their team ${topDescEndGame}, ${jgDescEndGame}, and ${midDescEndGame}.`
    // }

    // console.log(matchSummaryText, stats15)
}

export default generateShortSummary;