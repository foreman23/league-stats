import LaneMatchupTooltip from '../components/LaneMatchupTooltip';
import SummonerName from '../components/SummonerName';

const generateShortSummary = async (gameData, playerData, timelineData, stats15, dataDragonVersion, champsJSON) => {
    let lanes = stats15.laneResults;

    // Lane objects from stats15/lanes carry riotIdGameName/riotIdTagline/teamId/
    // participantId but NOT profileIcon. Resolve the full gameData participant so
    // SummonerName can show the profile icon in its tooltip.
    const resolveParticipant = (laner) => {
        if (!laner) return laner;
        const byId = gameData.info.participants.find(
            (p) => Number(p.participantId) === Number(laner.participantId)
        );
        if (byId) return byId;
        return gameData.info.participants.find(
            (p) =>
                p.riotIdGameName === laner.riotIdGameName &&
                p.riotIdTagline === laner.riotIdTagline
        ) || laner;
    };

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
            matchSummaryText = (<>In laning phase, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{playerData.riotIdGameName} ({playerChampionName})</SummonerName> <LaneMatchupTooltip role="TOP" label={topDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningTopAnchor')} /> against <SummonerName participant={resolveParticipant(lanes.TOP.laneLoser)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{lanes.TOP.laneLoser.riotIdGameName} ({oppLoseChampionName})</SummonerName> while their team <LaneMatchupTooltip role="JUNGLE" label={jgDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningJgAnchor')} />, <LaneMatchupTooltip role="MIDDLE" label={midDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningMidAnchor')} />, and <LaneMatchupTooltip role="BOTTOM" label={botDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningBotAnchor')} />.</>)
        } else {
            matchSummaryText = (<>In laning phase, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{playerData.riotIdGameName} ({playerChampionName})</SummonerName> <LaneMatchupTooltip role="TOP" label={topDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningTopAnchor')} /> against <SummonerName participant={resolveParticipant(lanes.TOP.laneWinner)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{lanes.TOP.laneWinner.riotIdGameName} ({oppWinChampionName})</SummonerName> while their team <LaneMatchupTooltip role="JUNGLE" label={jgDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningJgAnchor')} />, <LaneMatchupTooltip role="MIDDLE" label={midDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningMidAnchor')} />, and <LaneMatchupTooltip role="BOTTOM" label={botDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningBotAnchor')} />.</>)
        }
    }
    if (playerData.teamPosition === 'JUNGLE') {
        playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
        oppLoseChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.JUNGLE.laneLoser.championId)).name
        oppWinChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.JUNGLE.laneWinner.championId)).name
        if (lanes.JUNGLE.laneWinner.riotIdGameName === playerData.riotIdGameName) {
            matchSummaryText = (<>In laning phase, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{playerData.riotIdGameName} ({playerChampionName})</SummonerName> <LaneMatchupTooltip role="JUNGLE" label={jgDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningJgAnchor')} /> against <SummonerName participant={resolveParticipant(lanes.JUNGLE.laneLoser)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{lanes.JUNGLE.laneLoser.riotIdGameName} ({oppLoseChampionName})</SummonerName> while their team <LaneMatchupTooltip role="TOP" label={topDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningTopAnchor')} />, <LaneMatchupTooltip role="MIDDLE" label={midDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningMidAnchor')} />, and <LaneMatchupTooltip role="BOTTOM" label={botDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningBotAnchor')} />.</>)
        } else {
            matchSummaryText = (<>In laning phase, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{playerData.riotIdGameName} ({playerChampionName})</SummonerName> <LaneMatchupTooltip role="JUNGLE" label={jgDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningJgAnchor')} /> against <SummonerName participant={resolveParticipant(lanes.JUNGLE.laneWinner)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{lanes.JUNGLE.laneWinner.riotIdGameName} ({oppWinChampionName})</SummonerName> while their team <LaneMatchupTooltip role="TOP" label={topDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningTopAnchor')} />, <LaneMatchupTooltip role="MIDDLE" label={midDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningMidAnchor')} />, and <LaneMatchupTooltip role="BOTTOM" label={botDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningBotAnchor')} />.</>)
        }
    }
    if (playerData.teamPosition === 'MIDDLE') {
        playerChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name
        oppLoseChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.MIDDLE.laneLoser.championId)).name
        oppWinChampionName = Object.values(champsJSON.data).find(champ => champ.key === String(lanes.MIDDLE.laneWinner.championId)).name
        // Player won lane
        if (lanes.MIDDLE.laneWinner.riotIdGameName === playerData.riotIdGameName) {
            matchSummaryText = (<>In laning phase, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{playerData.riotIdGameName} ({playerChampionName})</SummonerName> <LaneMatchupTooltip role="MIDDLE" label={midDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningMidAnchor')} /> against <SummonerName participant={resolveParticipant(lanes.MIDDLE.laneLoser)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{lanes.MIDDLE.laneLoser.riotIdGameName} ({oppLoseChampionName})</SummonerName> while their team <LaneMatchupTooltip role="TOP" label={topDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningTopAnchor')} />, <LaneMatchupTooltip role="JUNGLE" label={jgDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningJgAnchor')} />, and <LaneMatchupTooltip role="BOTTOM" label={botDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningBotAnchor')} />.</>)
        }
        // Player lost lane
        else {
            matchSummaryText = (<>In laning phase, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{playerData.riotIdGameName} ({playerChampionName})</SummonerName> <LaneMatchupTooltip role="MIDDLE" label={midDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningMidAnchor')} /> against <SummonerName participant={resolveParticipant(lanes.MIDDLE.laneWinner)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{lanes.MIDDLE.laneWinner.riotIdGameName} ({oppWinChampionName})</SummonerName> while their team <LaneMatchupTooltip role="TOP" label={topDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningTopAnchor')} />, <LaneMatchupTooltip role="JUNGLE" label={jgDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningJgAnchor')} />, and <LaneMatchupTooltip role="BOTTOM" label={botDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningBotAnchor')} />.</>)
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

                matchSummaryText = (<>In laning phase, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{playerData.riotIdGameName} ({playerChampionName})</SummonerName> <LaneMatchupTooltip role="BOTTOM" label={botDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningBotAnchor')} /> with
                <SummonerName participant={resolveParticipant(utilityWinner)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink"> {utilityWinner.riotIdGameName} ({utilityWinnerChampionName})</SummonerName> against <SummonerName participant={resolveParticipant(bottomOpponent)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{bottomOpponent.riotIdGameName} ({bottomOpponentChampionName}) </SummonerName>
                and <SummonerName participant={resolveParticipant(utilityOpponent)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink"> {utilityOpponent.riotIdGameName} ({utilityOpponentChampionName})</SummonerName> while their team <LaneMatchupTooltip role="TOP" label={topDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningTopAnchor')} />, <LaneMatchupTooltip role="JUNGLE" label={jgDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningJgAnchor')} />, and <LaneMatchupTooltip role="MIDDLE" label={midDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningMidAnchor')} />.</>);
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

                matchSummaryText = (<>In laning phase, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{playerData.riotIdGameName} ({playerChampionName})</SummonerName> <LaneMatchupTooltip role="BOTTOM" label={botDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningBotAnchor')} /> with
                <SummonerName participant={resolveParticipant(utilityLoser)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink"> {utilityLoser.riotIdGameName} ({utilityLoserChampionName})</SummonerName> against <SummonerName participant={resolveParticipant(bottomOpponent)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{bottomOpponent.riotIdGameName} ({bottomOpponentChampionName}) </SummonerName>
                and <SummonerName participant={resolveParticipant(utilityOpponent)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink"> {utilityOpponent.riotIdGameName} ({utilityOpponentChampionName})</SummonerName> while their team <LaneMatchupTooltip role="TOP" label={topDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningTopAnchor')} />, <LaneMatchupTooltip role="JUNGLE" label={jgDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningJgAnchor')} />, and <LaneMatchupTooltip role="MIDDLE" label={midDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningMidAnchor')} />.</>);
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

                matchSummaryText = (<>In laning phase, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{playerData.riotIdGameName} ({playerChampionName})</SummonerName> <LaneMatchupTooltip role="BOTTOM" label={botDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningBotAnchor')} /> with
                <SummonerName participant={resolveParticipant(bottomWinner)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink"> {bottomWinner.riotIdGameName} ({bottomWinnerChampionName})</SummonerName> against <SummonerName participant={resolveParticipant(bottomOpponent)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{bottomOpponent.riotIdGameName} ({bottomOpponentChampionName}) </SummonerName>
                and <SummonerName participant={resolveParticipant(utilityOpponent)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink"> {utilityOpponent.riotIdGameName} ({utilityOpponentChampionName})</SummonerName> while their team <LaneMatchupTooltip role="TOP" label={topDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningTopAnchor')} />, <LaneMatchupTooltip role="JUNGLE" label={jgDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningJgAnchor')} />, and <LaneMatchupTooltip role="MIDDLE" label={midDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningMidAnchor')} />.</>);
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

                matchSummaryText = (<>In laning phase, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">{playerData.riotIdGameName} ({playerChampionName})</SummonerName> <LaneMatchupTooltip role="BOTTOM" label={botDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningBotAnchor')} /> with
                <SummonerName participant={resolveParticipant(bottomLoser)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink"> {bottomLoser.riotIdGameName} ({bottomLoserChampionName})</SummonerName> against <SummonerName participant={resolveParticipant(bottomOpponent)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink">'{bottomOpponent.riotIdGameName} ({bottomOpponentChampionName}) </SummonerName>
                and <SummonerName participant={resolveParticipant(utilityOpponent)} version={dataDragonVersion} platformId={gameData.info.platformId} className="matchSummaryPlayerLink"> {utilityOpponent.riotIdGameName} ({utilityOpponentChampionName})</SummonerName> while their team <LaneMatchupTooltip role="TOP" label={topDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningTopAnchor')} />, <LaneMatchupTooltip role="JUNGLE" label={jgDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningJgAnchor')} />, and <LaneMatchupTooltip role="MIDDLE" label={midDescEndGame} lanes={lanes} gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} onClick={() => scrollToSection('laningMidAnchor')} />.</>);
            }
        }
    }


    return (matchSummaryText)

}

export default generateShortSummary;