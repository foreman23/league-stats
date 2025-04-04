import React from 'react';
import { useState } from 'react';
import { Grid, Typography, Box, Button, Tooltip } from '@mui/material';
import { LineChart } from '@mui/x-charts';

const LanePhaseSummaryCardBot = (props) => {

    const [lastButtonPressedBot, setLastButtonPressedBot] = useState('laneSumBot1');

    const handleLaneCard = (lane, btnName) => {
        setLastButtonPressedBot(btnName)
    }

    const { statsAt15, gameData, timelineData, champsJSON } = props;

    const participants = gameData.info.participants;

    // Graph information
    const frames = timelineData.info.frames;
    const xAxisData = frames.map((_, index) => index).slice(2, 16);
    const yAxisDataWinner1 = frames.map(frame => frame.participantFrames[statsAt15.laneResults.BOTTOM.laneWinner[0].participantId].minionsKilled + frame.participantFrames[statsAt15.laneResults.BOTTOM.laneWinner[0].participantId].jungleMinionsKilled).slice(2, 16);
    const yAxisDataWinner2 = frames.map(frame => frame.participantFrames[statsAt15.laneResults.BOTTOM.laneWinner[1].participantId].minionsKilled + frame.participantFrames[statsAt15.laneResults.BOTTOM.laneWinner[1].participantId].jungleMinionsKilled).slice(2, 16);
    const yAxisDataLoser1 = frames.map(frame => frame.participantFrames[statsAt15.laneResults.BOTTOM.laneLoser[0].participantId].minionsKilled + frame.participantFrames[statsAt15.laneResults.BOTTOM.laneLoser[0].participantId].jungleMinionsKilled).slice(2, 16);
    const yAxisDataLoser2 = frames.map(frame => frame.participantFrames[statsAt15.laneResults.BOTTOM.laneLoser[1].participantId].minionsKilled + frame.participantFrames[statsAt15.laneResults.BOTTOM.laneLoser[1].participantId].jungleMinionsKilled).slice(2, 16);

    // Isolate laning kills for bot lane
    const botLaneKillTimeline = statsAt15.laningKills.filter(event =>
        event.killerId.toString() === statsAt15.laneResults.BOTTOM.laneWinner[0].participantId
        || event.killerId.toString() === statsAt15.laneResults.BOTTOM.laneLoser[0].participantId
        || event.victimId.toString() === statsAt15.laneResults.BOTTOM.laneWinner[0].participantId
        || event.victimId.toString() === statsAt15.laneResults.BOTTOM.laneLoser[0].participantId

        || event.killerId.toString() === statsAt15.laneResults.BOTTOM.laneWinner[1].participantId
        || event.killerId.toString() === statsAt15.laneResults.BOTTOM.laneLoser[1].participantId
        || event.victimId.toString() === statsAt15.laneResults.BOTTOM.laneWinner[1].participantId
        || event.victimId.toString() === statsAt15.laneResults.BOTTOM.laneLoser[1].participantId

    )

    // Find champion names for laners
    let winnerChampName1 = Object.values(champsJSON.data).find(champ => champ.key === String(statsAt15.laneResults.BOTTOM.laneWinner[0].championId)).id
    let winnerChampName2 = Object.values(champsJSON.data).find(champ => champ.key === String(statsAt15.laneResults.BOTTOM.laneWinner[1].championId)).id
    let loserChampName1 = Object.values(champsJSON.data).find(champ => champ.key === String(statsAt15.laneResults.BOTTOM.laneLoser[0].championId)).id
    let loserChampName2 = Object.values(champsJSON.data).find(champ => champ.key === String(statsAt15.laneResults.BOTTOM.laneLoser[1].championId)).id

    // Generate string for advantage description
    let advantageStr = null;
    if (statsAt15.laneResults.BOTTOM.goldDifference > 3000) {
        advantageStr = `almost guaranteeing ${statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'blue' : 'red'} team the victory`
    }
    else if (statsAt15.laneResults.BOTTOM.goldDifference > 2000) {
        advantageStr = `giving ${statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'blue' : 'red'} team a big lead entering the mid phase`
    }
    else if (statsAt15.laneResults.BOTTOM.goldDifference > 650) {
        advantageStr = `giving ${statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'blue' : 'red'} team an advantage entering the mid phase`
    }
    else if (statsAt15.laneResults.BOTTOM.goldDifference >= 150) {
        advantageStr = `giving ${statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'blue' : 'red'} team a small advantage entering the mid phase`
    }
    else if (statsAt15.laneResults.BOTTOM.goldDifference < 150) {
        advantageStr = `so we consider bottom lane to be a tie`
    }

    return (
        <div id='laningBotAnchor'>
            <Grid className={'LanePhaseSummaryCardActive'}>
                <div className='LaningPhaseGridHeader'>
                    <div className='LaneOutcomeTitle'>
                        {statsAt15.laneResults.BOTTOM.resTag === 'draw' ? (
                            <Typography fontWeight={'bold'}>{`Bottom was a draw`}</Typography>
                        ) : (
                            <Typography fontWeight={'bold'}>{`${statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'Blue' : 'Red'} ${statsAt15.laneResults.BOTTOM.resTag} bottom lane`}</Typography>
                        )}
                    </div>

                    <div className='LaneBubbleContainer'>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 0 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#d1d1d1', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 1 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#d1d1d1', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 2 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#d1d1d1', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 3 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#d1d1d1', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 4 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#d1d1d1', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                    </div>
                    <div className='LaneButtonsContainer' style={{ flexDirection: 'row', display: 'flex' }}>
                        <Button
                            className={lastButtonPressedBot === 'laneSumBot1' ? 'LanePhaseSummaryBtnClicked' : 'LanePhaseSummaryBtn'}
                            onClick={() => handleLaneCard('bot', 'laneSumBot1')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            Summary
                        </Button>

                        <Button
                            className={lastButtonPressedBot === 'laneSumBot2' ? 'LanePhaseSummaryBtnClicked' : 'LanePhaseSummaryBtn'}
                            onClick={() => handleLaneCard('bot', 'laneSumBot2')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            Bloodshed
                        </Button>

                        <Button
                            className={lastButtonPressedBot === 'laneSumBot3' ? 'LanePhaseSummaryBtnClicked' : 'LanePhaseSummaryBtn'}
                            onClick={() => handleLaneCard('bot', 'laneSumBot3')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            CS Graph
                        </Button>

                    </div>
                </div>
            </Grid>

            <Grid className={lastButtonPressedBot === 'laneSumBot1' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid item xs={12} sm={6}>
                    <p>
                        <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>
                            {statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName}</a> ({statsAt15.laneResults.BOTTOM.laneWinner[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[0].cs} CS) and <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>
                            {statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName}</a> ({statsAt15.laneResults.BOTTOM.laneWinner[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[1].cs} CS) in the bottom lane earned {statsAt15.laneResults.BOTTOM.goldDifference} more gold than <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.teamWonLane !== 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName}</a> ({statsAt15.laneResults.BOTTOM.laneLoser[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[0].cs} CS) and <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.teamWonLane !== 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName}</a> ({statsAt15.laneResults.BOTTOM.laneLoser[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[1].cs} CS) at the end of {props.gameData.info.gameDuration < 900 ? props.gameDuration : '15 minutes'}, {advantageStr}.
                    </p>
                </Grid>
                <Grid item style={{ display: 'inline-flex', justifyContent: 'center' }} xs={12} sm={6}>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -20] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName} #${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.BOTTOM.laneWinner[0].teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', marginRight: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgBotLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName1}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -20] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName} #${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.BOTTOM.laneWinner[1].teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgBotLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName2}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <img alt='' className='lanePhaseSummarySwords' src='/images/swords.svg'></img>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -20] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName} #${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.BOTTOM.laneLoser[0].teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', marginRight: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgBotLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName1}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -20] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName} #${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.BOTTOM.laneLoser[1].teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgBotLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName2}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <img alt='Lane' className='hideMobile hideTablet hideDesktop' style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', objectFit: 'contain' }} src='/images/laneIcons/Bottom.png'></img>
                </Grid>
            </Grid>

            <Grid className={lastButtonPressedBot === 'laneSumBot2' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid item xs={12} sm={6}>
                    <p style={{ marginBottom: '15px' }}>
                        Results of the deaths and objectives involving <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.laneWinner[0].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName}</a> ({statsAt15.laneResults.BOTTOM.laneWinner[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[0].cs} CS), <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.laneWinner[1].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName}</a> ({statsAt15.laneResults.BOTTOM.laneWinner[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[1].cs} CS), <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.laneLoser[0].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName}</a> ({statsAt15.laneResults.BOTTOM.laneLoser[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[0].cs} CS) and <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.laneLoser[1].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName}</a> ({statsAt15.laneResults.BOTTOM.laneLoser[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[1].cs} CS) during laning phase.
                    </p>
                    <div style={{ marginBottom: '10px' }}>
                        {botLaneKillTimeline.map((kill, index) => {
                            if (kill.victimId !== 0 && kill.killerId !== 0) {
                                return (
                                    <Typography key={`kill_${index}`}>{Math.round(kill.timestamp / 60000)}m - <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${participants.find(player => player.participantId === kill.killerId)?.riotIdGameName}/${participants.find(player => player.participantId === kill.killerId)?.riotIdTagline.toLowerCase()}`} style={{ color: participants.find(player => player.participantId === kill.killerId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.killerId)?.riotIdGameName}</a><img alt='Killer' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }}
                                        src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.killerId).championId)).id}.png`}></img> killed <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${participants.find(player => player.participantId === kill.victimId)?.riotIdGameName}/${participants.find(player => player.participantId === kill.victimId)?.riotIdTagline.toLowerCase()}`} style={{ color: participants.find(player => player.participantId === kill.victimId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.victimId)?.riotIdGameName}</a><img alt='Victim' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.victimId).championId)).id}.png`}></img></Typography>
                                )
                            }
                            if (kill.victimId === 0) {
                                return (
                                    <Typography key={`kill_${index}`}>{Math.round(kill.timestamp / 60000)}m - <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${participants.find(player => player.participantId === kill.killerId)?.riotIdGameName}/${participants.find(player => player.participantId === kill.killerId)?.riotIdTagline.toLowerCase()}`} style={{ color: participants.find(player => player.participantId === kill.killerId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.killerId)?.riotIdGameName}</a><img alt='Killer' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }}
                                        src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.killerId).championId)).id}.png`}></img> killed <span style={{ color: '#6A00AB', fontWeight: 'bold' }}>{kill.monsterType.toLowerCase()}</span></Typography>
                                )
                            }
                            if (kill.killerId === 0) {
                                return (
                                    <Typography key={`kill_${index}`}>{Math.round(kill.timestamp / 60000)}m - <span style={{ fontWeight: 'bold', color: 'green' }}>Environment</span> killed <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${participants.find(player => player.participantId === kill.killerId)?.riotIdGameName}/${participants.find(player => player.participantId === kill.killerId)?.riotIdTagline.toLowerCase()}`} style={{ color: participants.find(player => player.participantId === kill.victimId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.victimId)?.riotIdGameName}</a><img alt='Victim' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }}
                                        src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.victimId).championId)).id}.png`}></img></Typography>
                                )
                            }
                            return null;
                        })}
                    </div>
                </Grid>
                <Grid item style={{ display: 'inline-flex', justifyContent: 'center' }} xs={12} sm={6}>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -20] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName} #${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.BOTTOM.laneWinner[0].teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', marginRight: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgBotLarge'
                                src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName1}.png`}>
                            </img>
                            </a>
                        </div>
                    </Tooltip>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -20] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName} #${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.BOTTOM.laneWinner[1].teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgBotLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName2}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <img alt='' className='lanePhaseSummarySwords' src='/images/swords.svg'></img>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -20] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName} #${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.BOTTOM.laneLoser[0].teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', marginRight: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgBotLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName1}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -20] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName} #${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.BOTTOM.laneLoser[1].teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgBotLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName2}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <img alt='Lane' className='hideMobile hideTablet hideDesktop' style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', objectFit: 'contain' }} src='/images/laneIcons/Bottom.png'></img>
                </Grid>
            </Grid>

            <Grid className={lastButtonPressedBot === 'laneSumBot3' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid item xs={12}>
                    <p style={{ marginBottom: '15px' }}>
                        Graph of CS killed each minute by <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.laneWinner[0].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName}</a><img alt='Champion' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName1}.png`}></img>({statsAt15.laneResults.BOTTOM.laneWinner[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[0].cs} CS), <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.laneWinner[1].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName}</a><img alt='Champion' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName2}.png`}></img> ({statsAt15.laneResults.BOTTOM.laneWinner[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[1].cs} CS), <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.laneLoser[0].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName}</a><img alt='Champion' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName1}.png`}></img> ({statsAt15.laneResults.BOTTOM.laneLoser[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[0].cs} CS) and <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName}/${statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.BOTTOM.laneLoser[1].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName}</a><img alt='Champion' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName2}.png`}></img>({statsAt15.laneResults.BOTTOM.laneLoser[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[1].cs} CS) during laning phase.
                    </p>
                    <div style={{ height: '300px', width: '100%' }}>
                        <LineChart
                            xAxis={[{ data: xAxisData, label: 'Minutes' }]}
                            yAxis={[{ label: 'Total CS' }]}
                            series={[
                                {
                                    data: yAxisDataWinner1,
                                    color: statsAt15.laneResults.BOTTOM.laneWinner[0].teamId === 100
                                        ? (statsAt15.laneResults.BOTTOM.laneWinner[0].teamPosition === 'UTILITY' ? '#9EDCFF' : '#37B7FF')
                                        : (statsAt15.laneResults.BOTTOM.laneWinner[0].teamPosition === 'UTILITY' ? '#FF8B8B' : '#FF3F3F'),
                                    label: statsAt15.laneResults.BOTTOM.laneWinner[0]?.riotIdGameName,
                                },
                                {
                                    data: yAxisDataWinner2,
                                    color: statsAt15.laneResults.BOTTOM.laneWinner[1].teamId === 100
                                        ? (statsAt15.laneResults.BOTTOM.laneWinner[1].teamPosition === 'UTILITY' ? '#9EDCFF' : '#37B7FF')
                                        : (statsAt15.laneResults.BOTTOM.laneWinner[1].teamPosition === 'UTILITY' ? '#FF8B8B' : '#FF3F3F'),
                                    label: statsAt15.laneResults.BOTTOM.laneWinner[1]?.riotIdGameName,
                                },
                                {
                                    data: yAxisDataLoser1,
                                    color: statsAt15.laneResults.BOTTOM.laneLoser[0].teamId === 100
                                        ? (statsAt15.laneResults.BOTTOM.laneLoser[0].teamPosition === 'UTILITY' ? '#9EDCFF' : '#37B7FF')
                                        : (statsAt15.laneResults.BOTTOM.laneLoser[0].teamPosition === 'UTILITY' ? '#FF8B8B' : '#FF3F3F'),
                                    label: statsAt15.laneResults.BOTTOM.laneLoser[0]?.riotIdGameName,
                                },
                                {
                                    data: yAxisDataLoser2,
                                    color: statsAt15.laneResults.BOTTOM.laneLoser[1].teamId === 100
                                        ? (statsAt15.laneResults.BOTTOM.laneLoser[1].teamPosition === 'UTILITY' ? '#9EDCFF' : '#37B7FF')
                                        : (statsAt15.laneResults.BOTTOM.laneLoser[1].teamPosition === 'UTILITY' ? '#FF8B8B' : '#FF3F3F'),
                                    label: statsAt15.laneResults.BOTTOM.laneLoser[1]?.riotIdGameName,
                                }
                            ]}
                        // width={800}
                        // height={300}
                        />
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}

export default LanePhaseSummaryCardBot