import React from 'react';
import { Grid, Typography, Box, Button, Tooltip } from '@mui/material';
import { LineChart } from '@mui/x-charts';

const LanePhaseSummaryCardBot = (props) => {
    const { statsAt15, handleLaneCard, lastButtonPressedBot, botSummaryCardStatus, gameData, timelineData, dataDragonVersion, champsJSON } = props;

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

    return (
        <div>
            <Grid className={botSummaryCardStatus ? 'LanePhaseSummaryCardActive' : 'LanePhaseSummaryCardInActive'} container style={{ flexDirection: 'row', display: 'inline-flex', alignItems: 'center' }}>
                <Grid item xs={12} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Grid style={{ marginRight: '35px' }} xs={6}>
                        {statsAt15.laneResults.BOTTOM.resTag === 'draw' ? (
                            <Typography fontWeight={'bold'}>{`Bottom was a draw`}</Typography>
                        ) : (
                            <Typography fontWeight={'bold'}>{`${statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'Blue' : 'Red'} ${statsAt15.laneResults.BOTTOM.resTag} bottom lane`}</Typography>
                        )}
                    </Grid>

                    <Grid xs={6} style={{ flexDirection: 'row', display: 'inline-flex', marginRight: '50px' }}>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 0 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 1 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 2 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 3 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 4 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                    </Grid>
                    <Grid xs={6} style={{ flexDirection: 'row', display: 'inline-flex' }}>
                        <Button
                            className={lastButtonPressedBot === 'laneSumBot1'
                                ? (statsAt15.laneResults.BOTTOM.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                                : (statsAt15.laneResults.BOTTOM.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                            onClick={() => handleLaneCard('bot', 'laneSumBot1')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            Summary
                        </Button>

                        <Button
                            className={lastButtonPressedBot === 'laneSumBot2'
                                ? (statsAt15.laneResults.BOTTOM.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                                : (statsAt15.laneResults.BOTTOM.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                            onClick={() => handleLaneCard('bot', 'laneSumBot2')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            Bloodshed
                        </Button>

                        <Button
                            className={lastButtonPressedBot === 'laneSumBot3'
                                ? (statsAt15.laneResults.BOTTOM.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                                : (statsAt15.laneResults.BOTTOM.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                            onClick={() => handleLaneCard('bot', 'laneSumBot3')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            CS Graph
                        </Button>

                    </Grid>
                </Grid>
            </Grid>

            <Grid className={botSummaryCardStatus && lastButtonPressedBot === 'laneSumBot1' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid xs={6}>
                    <Typography>
                        <span style={{ color: statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>
                            {statsAt15.laneResults.BOTTOM.laneWinner[0].riotIdGameName}</span> ({statsAt15.laneResults.BOTTOM.laneWinner[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[0].cs} CS) and <span style={{ color: statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>
                            {statsAt15.laneResults.BOTTOM.laneWinner[1].riotIdGameName}</span> ({statsAt15.laneResults.BOTTOM.laneWinner[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[1].cs} CS) in the bottom lane earned {statsAt15.laneResults.BOTTOM.goldDifference} more gold than
                        <span style={{ color: statsAt15.laneResults.BOTTOM.teamWonLane !== 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser[0].riotIdGameName}</span> ({statsAt15.laneResults.BOTTOM.laneLoser[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[0].cs} CS) and <span style={{ color: statsAt15.laneResults.BOTTOM.teamWonLane !== 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{statsAt15.laneResults.BOTTOM.laneLoser[1].riotIdGameName}</span> ({statsAt15.laneResults.BOTTOM.laneLoser[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[1].cs} CS) at the end of 15 minutes, giving {statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'blue' : 'red'} team an advantage entering the mid phase.
                    </Typography>
                </Grid>
                <Grid style={{ display: 'inline-flex', justifyContent: 'center' }} xs={6}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 42] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[0].riotIdGameName}`}>
                            <img style={{ margin: '20px', marginBottom: '0px', maxWidth: '65px', maxHeight: '65px', marginRight: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName1}.png`}></img>
                            <Box style={{ position: 'absolute', marginTop: '-4px', marginLeft: '10px', left: '50%', transform: 'translateX(-50%)', width: '65px', height: '8px', backgroundColor: statsAt15.laneResults.BOTTOM.laneWinner[0].teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '0px' }}></Box>
                        </Tooltip>
                    </div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 42] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[1].riotIdGameName}`}>
                            <img style={{ margin: '20px', marginBottom: '0px', maxWidth: '65px', maxHeight: '65px', marginLeft: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName2}.png`}></img>
                            <Box style={{ position: 'absolute', marginTop: '-4px', marginLeft: '-10px', left: '50%', transform: 'translateX(-50%)', width: '65px', height: '8px', backgroundColor: statsAt15.laneResults.BOTTOM.laneWinner[1].teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '0px', borderBottomRightRadius: '3px' }}></Box>
                        </Tooltip>
                    </div>
                    <img style={{ maxWidth: '30px', maxHeight: '115px' }} src='/images/swords.svg'></img>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 42] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[0].riotIdGameName}`}>
                            <img style={{ margin: '20px', marginBottom: '0px', maxWidth: '65px', maxHeight: '65px', marginRight: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName1}.png`}></img>
                            <Box style={{ position: 'absolute', marginTop: '-4px', marginLeft: '10px', left: '50%', transform: 'translateX(-50%)', width: '65px', height: '8px', backgroundColor: statsAt15.laneResults.BOTTOM.laneLoser[0].teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '0px' }}></Box>
                        </Tooltip>
                    </div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 42] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[1].riotIdGameName}`}>
                            <img style={{ margin: '20px', marginBottom: '0px', maxWidth: '65px', maxHeight: '65px', marginLeft: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName2}.png`}></img>
                            <Box style={{ position: 'absolute', marginTop: '-4px', marginLeft: '-10px', left: '50%', transform: 'translateX(-50%)', width: '65px', height: '8px', backgroundColor: statsAt15.laneResults.BOTTOM.laneLoser[1].teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '0px', borderBottomRightRadius: '3px' }}></Box>
                        </Tooltip>
                    </div>
                    <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', objectFit: 'contain' }} src='/images/laneIcons/Bottom.png'></img>
                </Grid>
            </Grid>

            <Grid className={botSummaryCardStatus && lastButtonPressedBot === 'laneSumBot2' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid xs={6}>
                    <Typography style={{ marginBottom: '15px' }}>
                        Results of the deaths and objectives affecting
                        <span style={{ color: statsAt15.laneResults.BOTTOM.laneWinner[0].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneWinner[0].riotIdGameName} </span>
                        ({statsAt15.laneResults.BOTTOM.laneWinner[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[0].cs} CS),
                        <span style={{ color: statsAt15.laneResults.BOTTOM.laneWinner[1].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneWinner[1].riotIdGameName} </span>
                        ({statsAt15.laneResults.BOTTOM.laneWinner[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[1].cs} CS),
                        <span style={{ color: statsAt15.laneResults.BOTTOM.laneLoser[0].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser[0].riotIdGameName} </span>
                        ({statsAt15.laneResults.BOTTOM.laneLoser[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[0].cs} CS) and
                        <span style={{ color: statsAt15.laneResults.BOTTOM.laneLoser[1].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser[1].riotIdGameName} </span>
                        ({statsAt15.laneResults.BOTTOM.laneLoser[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[1].cs} CS) during laning phase.
                    </Typography>
                    <Typography style={{ marginBottom: '10px' }}>
                        {botLaneKillTimeline.map((kill, index) => {
                            if (kill.victimId !== 0 && kill.killerId !== 0) {
                                return (
                                    <Typography>{Math.round(kill.timestamp / 60000)}m - <span style={{ color: participants.find(player => player.participantId === kill.killerId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.killerId).riotIdGameName}</span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} 
                                    src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.killerId).championId)).id}.png`}></img> killed <span style={{ color: participants.find(player => player.participantId === kill.victimId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.victimId).riotIdGameName}</span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.victimId).championId)).id}.png`}></img></Typography>
                                )
                            }
                            if (kill.victimId === 0) {
                                return (
                                    <Typography>{Math.round(kill.timestamp / 60000)}m - <span style={{ color: participants.find(player => player.participantId === kill.killerId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.killerId).riotIdGameName}</span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} 
                                    src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.killerId).championId)).id}.png`}></img> killed <span style={{ color: '#6A00AB', fontWeight: 'bold' }}>{kill.monsterType.toLowerCase()}</span></Typography>
                                )
                            }
                            if (kill.killerId === 0) {
                                return (
                                    <Typography>{Math.round(kill.timestamp / 60000)}m - <span style={{ fontWeight: 'bold', color: 'green' }}>Environment</span> killed <span style={{ color: participants.find(player => player.participantId === kill.victimId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.victimId).riotIdGameName}</span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} 
                                    src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.victimId).championId)).id}.png`}></img></Typography>
                                )
                            }
                        })}
                    </Typography>
                </Grid>
                <Grid style={{ display: 'inline-flex', justifyContent: 'center' }} xs={6}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Tooltip
                            arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 42] } }] } }}
                            title={`${statsAt15.laneResults.BOTTOM.laneWinner[0].riotIdGameName}`}>
                            <img style={{ margin: '20px', marginBottom: '0px', maxWidth: '65px', maxHeight: '65px', marginRight: '0px', objectFit: 'contain' }}
                                src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName1}.png`}>
                            </img>
                            <Box style={{ position: 'absolute', marginTop: '-4px', marginLeft: '10px', left: '50%', transform: 'translateX(-50%)', width: '65px', height: '8px', backgroundColor: statsAt15.laneResults.BOTTOM.laneWinner[0].teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '0px' }}></Box>
                        </Tooltip>
                    </div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 42] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[1].riotIdGameName}`}>
                            <img style={{ margin: '20px', marginBottom: '0px', maxWidth: '65px', maxHeight: '65px', marginLeft: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName2}.png`}></img>
                            <Box style={{ position: 'absolute', marginTop: '-4px', marginLeft: '-10px', left: '50%', transform: 'translateX(-50%)', width: '65px', height: '8px', backgroundColor: statsAt15.laneResults.BOTTOM.laneWinner[1].teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '0px', borderBottomRightRadius: '3px' }}></Box>
                        </Tooltip>
                    </div>
                    <img style={{ maxWidth: '30px', maxHeight: '115px' }} src='/images/swords.svg'></img>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 42] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[0].riotIdGameName}`}>
                            <img style={{ margin: '20px', marginBottom: '0px', maxWidth: '65px', maxHeight: '65px', marginRight: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName1}.png`}></img>
                            <Box style={{ position: 'absolute', marginTop: '-4px', marginLeft: '10px', left: '50%', transform: 'translateX(-50%)', width: '65px', height: '8px', backgroundColor: statsAt15.laneResults.BOTTOM.laneLoser[0].teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '0px' }}></Box>
                        </Tooltip>
                    </div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 42] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[1].riotIdGameName}`}>
                            <img style={{ margin: '20px', marginBottom: '0px', maxWidth: '65px', maxHeight: '65px', marginLeft: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName2}.png`}></img>
                            <Box style={{ position: 'absolute', marginTop: '-4px', marginLeft: '-10px', left: '50%', transform: 'translateX(-50%)', width: '65px', height: '8px', backgroundColor: statsAt15.laneResults.BOTTOM.laneLoser[1].teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '0px', borderBottomRightRadius: '3px' }}></Box>
                        </Tooltip>
                    </div>
                    <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', objectFit: 'contain' }} src='/images/laneIcons/Bottom.png'></img>
                </Grid>
            </Grid>

            <Grid className={botSummaryCardStatus && lastButtonPressedBot === 'laneSumBot3' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid xs={12}>
                    <Typography style={{ marginBottom: '15px' }}>
                        Graph of CS killed each minute by
                        <span style={{ color: statsAt15.laneResults.BOTTOM.laneWinner[0].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneWinner[0].riotIdGameName} </span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName1}.png`}></img>
                        ({statsAt15.laneResults.BOTTOM.laneWinner[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[0].cs} CS),
                        <span style={{ color: statsAt15.laneResults.BOTTOM.laneWinner[1].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneWinner[1].riotIdGameName} </span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName2}.png`}></img>
                        ({statsAt15.laneResults.BOTTOM.laneWinner[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner[1].cs} CS),
                        <span style={{ color: statsAt15.laneResults.BOTTOM.laneLoser[0].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser[0].riotIdGameName} </span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName1}.png`}></img>
                        ({statsAt15.laneResults.BOTTOM.laneLoser[0].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[0].cs} CS) and
                        <span style={{ color: statsAt15.laneResults.BOTTOM.laneLoser[1].teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser[1].riotIdGameName} </span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName2}.png`}></img>
                        ({statsAt15.laneResults.BOTTOM.laneLoser[1].kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser[1].cs} CS) during laning phase.
                    </Typography>
                    <LineChart
                        xAxis={[{ data: xAxisData, label: 'Minutes' }]}
                        yAxis={[{ label: 'Total CS' }]}
                        series={[
                            {
                                data: yAxisDataWinner1,
                                color: statsAt15.laneResults.BOTTOM.laneWinner[0].teamId === 100
                                    ? (statsAt15.laneResults.BOTTOM.laneWinner[0].teamPosition === 'UTILITY' ? '#9EDCFF' : '#37B7FF')
                                    : (statsAt15.laneResults.BOTTOM.laneWinner[0].teamPosition === 'UTILITY' ? '#FF8B8B' : '#FF3F3F'),
                                label: statsAt15.laneResults.BOTTOM.laneWinner[0].riotIdGameName,
                            },
                            {
                                data: yAxisDataWinner2,
                                color: statsAt15.laneResults.BOTTOM.laneWinner[1].teamId === 100
                                    ? (statsAt15.laneResults.BOTTOM.laneWinner[1].teamPosition === 'UTILITY' ? '#9EDCFF' : '#37B7FF')
                                    : (statsAt15.laneResults.BOTTOM.laneWinner[1].teamPosition === 'UTILITY' ? '#FF8B8B' : '#FF3F3F'),
                                label: statsAt15.laneResults.BOTTOM.laneWinner[1].riotIdGameName,
                            },
                            {
                                data: yAxisDataLoser1,
                                color: statsAt15.laneResults.BOTTOM.laneLoser[0].teamId === 100
                                    ? (statsAt15.laneResults.BOTTOM.laneLoser[0].teamPosition === 'UTILITY' ? '#9EDCFF' : '#37B7FF')
                                    : (statsAt15.laneResults.BOTTOM.laneLoser[0].teamPosition === 'UTILITY' ? '#FF8B8B' : '#FF3F3F'),
                                label: statsAt15.laneResults.BOTTOM.laneLoser[0].riotIdGameName,
                            },
                            {
                                data: yAxisDataLoser2,
                                color: statsAt15.laneResults.BOTTOM.laneLoser[1].teamId === 100
                                    ? (statsAt15.laneResults.BOTTOM.laneLoser[1].teamPosition === 'UTILITY' ? '#9EDCFF' : '#37B7FF')
                                    : (statsAt15.laneResults.BOTTOM.laneLoser[1].teamPosition === 'UTILITY' ? '#FF8B8B' : '#FF3F3F'),
                                label: statsAt15.laneResults.BOTTOM.laneLoser[1].riotIdGameName,
                            }
                        ]}
                        width={800}
                        height={300}
                    />
                </Grid>
            </Grid>
        </div>
    )
}

export default LanePhaseSummaryCardBot