import { Tooltip } from '@mui/material';

const generateShortSummary = async (gameData, playerData, timelineData, stats15, dataDragonVersion, champsJSON) => {
    let lanes = stats15.laneResults;

    console.log(lanes)

    let roles = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM'];

    // Calculate win/loss strings
    let topDescEndGame = null;
    let jgDescEndGame = null;
    let midDescEndGame = null;
    let botDescEndGame = null;
    for (let i = 0; i < roles.length; i++) {
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

    // Handle section button click
    const scrollToSection = (id) => {
        const element = document.getElementById('LaningAnchor');
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
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
            matchSummaryText = (<>In laning phase, <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{playerData.riotIdGameName}' ({playerChampionName})</a> <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningTopAnchor')}>{topDescEndGame}</u> against <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${lanes.TOP.laneLoser.riotIdGameName}/${lanes.TOP.laneLoser.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{lanes.TOP.laneLoser.riotIdGameName}' ({oppLoseChampionName})</a> while their team <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningJgAnchor')}>{jgDescEndGame}</u>, <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningMidAnchor')}>{midDescEndGame}</u>, and <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningBotAnchor')}>{botDescEndGame}</u>.</>)
        } else {
            matchSummaryText = (<>In laning phase, <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{playerData.riotIdGameName}' ({playerChampionName})</a> <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningTopAnchor')}>{topDescEndGame}</u> against <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${lanes.TOP.laneWinner.riotIdGameName}/${lanes.TOP.laneWinner.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{lanes.TOP.laneWinner.riotIdGameName}' ({oppWinChampionName})</a> while their team <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningJgAnchor')}>{jgDescEndGame}</u>, <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningMidAnchor')}>{midDescEndGame}</u>, and <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningBotAnchor')}>{botDescEndGame}</u>.</>)
        }
    }
    if (playerData.teamPosition === 'JUNGLE') {
        playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
        oppLoseChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.JUNGLE.laneLoser.championId)).name
        oppWinChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.JUNGLE.laneWinner.championId)).name
        if (lanes.JUNGLE.laneWinner.riotIdGameName === playerData.riotIdGameName) {
            matchSummaryText = (<>In laning phase, <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{playerData.riotIdGameName}' ({playerChampionName})</a> <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningJgAnchor')}>{jgDescEndGame}</u> against <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${lanes.JUNGLE.laneLoser.riotIdGameName}/${lanes.JUNGLE.laneLoser.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{lanes.JUNGLE.laneLoser.riotIdGameName}' ({oppLoseChampionName})</a> while their team <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningTopAnchor')}>{topDescEndGame}</u>, <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningMidAnchor')}>{midDescEndGame}</u>, and <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningBotAnchor')}>{botDescEndGame}</u>.</>)
        } else {
            matchSummaryText = (<>In laning phase, <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{playerData.riotIdGameName}' ({playerChampionName})</a> <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningJgAnchor')}>{jgDescEndGame}</u> against <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${lanes.JUNGLE.laneWinner.riotIdGameName}/${lanes.JUNGLE.laneWinner.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{lanes.JUNGLE.laneWinner.riotIdGameName}' ({oppWinChampionName})</a> while their team <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningTopAnchor')}>{topDescEndGame}</u>, <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningMidAnchor')}>{midDescEndGame}</u>, and <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningBotAnchor')}>{botDescEndGame}</u>.</>)
        }
    }
    if (playerData.teamPosition === 'MIDDLE') {
        playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
        oppLoseChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.MIDDLE.laneLoser.championId)).name
        oppWinChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.MIDDLE.laneWinner.championId)).name
        // Player won lane
        if (lanes.MIDDLE.laneWinner.riotIdGameName === playerData.riotIdGameName) {
            matchSummaryText = (<>In laning phase, <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{playerData.riotIdGameName}' ({playerChampionName})</a> <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningMidAnchor')}>{midDescEndGame}</u> against <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${lanes.MIDDLE.laneLoser.riotIdGameName}/${lanes.MIDDLE.laneLoser.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{lanes.MIDDLE.laneLoser.riotIdGameName}' ({oppLoseChampionName})</a> while their team <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningTopAnchor')}>{topDescEndGame}</u>, <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningJgAnchor')}>{jgDescEndGame}</u>, and <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningBotAnchor')}>{botDescEndGame}</u>.</>)
        }
        // Player lost lane
        else {
            matchSummaryText = (<>In laning phase, <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{playerData.riotIdGameName}' ({playerChampionName})</a> <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningMidAnchor')}>{midDescEndGame}</u> against <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${lanes.MIDDLE.laneWinner.riotIdGameName}/${lanes.MIDDLE.laneWinner.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{lanes.MIDDLE.laneWinner.riotIdGameName}' ({oppWinChampionName})</a> while their team <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningTopAnchor')}>{topDescEndGame}</u>, <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningJgAnchor')}>{jgDescEndGame}</u>, and <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningBotAnchor')}>{botDescEndGame}</u>.</>)
        }
    }
    else if (playerData.teamPosition === 'BOTTOM' || playerData.teamPosition === 'UTILITY') {
        // Player is ADC
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

                matchSummaryText = (<>In laning phase, <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{playerData.riotIdGameName}' ({playerChampionName})</a> <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningBotAnchor')}>{botDescEndGame}</u> with 
                <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${utilityWinner.riotIdGameName}/${utilityWinner.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink"> '{utilityWinner.riotIdGameName}' ({utilityWinnerChampionName})</a> against <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${bottomOpponent.riotIdGameName}/${bottomOpponent.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{bottomOpponent.riotIdGameName}' ({bottomOpponentChampionName}) </a>
                and <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${utilityOpponent.riotIdGameName}/${utilityOpponent.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink"> '{utilityOpponent.riotIdGameName}' ({utilityOpponentChampionName})</a> while their team <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningTopAnchor')}>{topDescEndGame}</u>, <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningJgAnchor')}>{jgDescEndGame}</u>, and <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningMidAnchor')}>{midDescEndGame}</u>.</>);
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

                matchSummaryText = (<>In laning phase, <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{playerData.riotIdGameName}' ({playerChampionName})</a> <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningBotAnchor')}>{botDescEndGame}</u> with 
                <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${utilityLoser.riotIdGameName}/${utilityLoser.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink"> '{utilityLoser.riotIdGameName}' ({utilityLoserChampionName})</a> against <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${bottomOpponent.riotIdGameName}/${bottomOpponent.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{bottomOpponent.riotIdGameName}' ({bottomOpponentChampionName}) </a>
                and <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${utilityOpponent.riotIdGameName}/${utilityOpponent.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink"> '{utilityOpponent.riotIdGameName}' ({utilityOpponentChampionName})</a> while their team <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningTopAnchor')}>{topDescEndGame}</u>, <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningJgAnchor')}>{jgDescEndGame}</u>, and <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningMidAnchor')}>{midDescEndGame}</u>.</>);
            }
        }
        // Player is support 
        else if (playerData.teamPosition === 'UTILITY') {
            // Player won lane
            if (lanes.BOTTOM.laneWinner.some(player => player.riotIdGameName === playerData.riotIdGameName)) {
                playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
                const bottomWinner = lanes.BOTTOM.laneWinner.find(player => player.teamPosition === 'BOTTOM');
                let bottomWinnerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(bottomWinner.championId)).name
                const bottomOpponent = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'BOTTOM');
                let bottomOpponentChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(bottomOpponent.championId)).name
                const utilityOpponent = lanes.BOTTOM.laneLoser.find(player => player.teamPosition === 'UTILITY');
                let utilityOpponentChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(utilityOpponent.championId)).name

                matchSummaryText = (<>In laning phase, <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{playerData.riotIdGameName}' ({playerChampionName})</a> <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningBotAnchor')}>{botDescEndGame}</u> with 
                <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${bottomWinner.riotIdGameName}/${bottomWinner.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink"> '{bottomWinner.riotIdGameName}' ({bottomWinnerChampionName})</a> against <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${bottomOpponent.riotIdGameName}/${bottomOpponent.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{bottomOpponent.riotIdGameName}' ({bottomOpponentChampionName}) </a>
                and <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${utilityOpponent.riotIdGameName}/${utilityOpponent.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink"> '{utilityOpponent.riotIdGameName}' ({utilityOpponentChampionName})</a> while their team <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningTopAnchor')}>{topDescEndGame}</u>, <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningJgAnchor')}>{jgDescEndGame}</u>, and <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningMidAnchor')}>{midDescEndGame}</u>.</>);
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

                matchSummaryText = (<>In laning phase, <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{playerData.riotIdGameName}' ({playerChampionName})</a> <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningBotAnchor')}>{botDescEndGame}</u> with 
                <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${bottomLoser.riotIdGameName}/${bottomLoser.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink"> '{bottomLoser.riotIdGameName}' ({bottomLoserChampionName})</a> against <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${bottomOpponent.riotIdGameName}/${bottomOpponent.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink">'{bottomOpponent.riotIdGameName}' ({bottomOpponentChampionName}) </a>
                and <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${utilityOpponent.riotIdGameName}/${utilityOpponent.riotIdTagline.toLowerCase()}`} className="matchSummaryPlayerLink"> '{utilityOpponent.riotIdGameName}' ({utilityOpponentChampionName})</a> while their team <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningTopAnchor')}>{topDescEndGame}</u>, <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningJgAnchor')}>{jgDescEndGame}</u>, and <u className="matchSummaryLaneLink" onClick={() => scrollToSection('laningMidAnchor')}>{midDescEndGame}</u>.</>);
            }
        }
    }


    return (matchSummaryText)

}

export default generateShortSummary;