import React from 'react';
import { Grid, Typography, Box, Button, Tooltip } from '@mui/material';

const LanePhaseSummaryCardBot = (props) => {
    const { statsAt15, handleLaneCard, lastButtonPressedBot, botSummaryCardStatus, gameData } = props;
    console.log(props)
    const participants = gameData.info.participants;

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
    console.log(botLaneKillTimeline)

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
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[0].riotIdGameName}`}>
                        <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', marginRight: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneWinner[0].championName}.png`}></img>
                    </Tooltip>
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[1].riotIdGameName}`}>
                        <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', marginLeft: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneWinner[1].championName}.png`}></img>
                    </Tooltip>
                    <img style={{ maxWidth: '30px', maxHeight: '115px', objectFit: 'contain' }} src='/images/swords.svg'></img>
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[0].riotIdGameName}`}>
                        <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', marginRight: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneLoser[0].championName}.png`}></img>
                    </Tooltip>
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[1].riotIdGameName}`}>
                        <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', marginLeft: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneLoser[1].championName}.png`}></img>
                    </Tooltip>
                    <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', objectFit: 'contain' }} src='/images/laneIcons/Bottom.png'></img>
                </Grid>
            </Grid>

            <Grid className={botSummaryCardStatus && lastButtonPressedBot === 'laneSumBot2' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid xs={6}>
                    <Typography style={{ marginBottom: '15px' }}>
                        Results of the deaths and objectives affecting
                        <span style={{ color: statsAt15.laneResults.BOTTOM.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneWinner.riotIdGameName} </span>
                        ({statsAt15.laneResults.BOTTOM.laneWinner.kdaAlt}, {statsAt15.laneResults.BOTTOM.laneWinner.cs} CS) and
                        <span style={{ color: statsAt15.laneResults.BOTTOM.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.BOTTOM.laneLoser.riotIdGameName} </span>
                        ({statsAt15.laneResults.BOTTOM.laneLoser.kdaAlt}, {statsAt15.laneResults.BOTTOM.laneLoser.cs} CS) during laning phase.
                    </Typography>
                    <Typography style={{ marginBottom: '10px' }}>
                        {botLaneKillTimeline.map((kill, index) => (
                            <Typography>{Math.round(kill.timestamp / 60000)}m - <span style={{ color: participants.find(player => player.participantId === kill.killerId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.killerId).riotIdGameName}</span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${participants.find(player => player.participantId === kill.killerId).championName}.png`}></img> killed <span style={{ color: participants.find(player => player.participantId === kill.victimId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.victimId).riotIdGameName}</span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${participants.find(player => player.participantId === kill.victimId).championName}.png`}></img></Typography>
                        ))}
                    </Typography>
                </Grid>
                <Grid style={{ display: 'inline-flex', justifyContent: 'center' }} xs={6}>
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[0].riotIdGameName}`}>
                        <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', marginRight: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneWinner[0].championName}.png`}></img>
                    </Tooltip>
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[1].riotIdGameName}`}>
                        <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', marginLeft: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneWinner[1].championName}.png`}></img>
                    </Tooltip>
                        <img style={{ maxWidth: '30px', maxHeight: '115px', objectFit: 'contain' }} src='/images/swords.svg'></img>
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[0].riotIdGameName}`}>
                        <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', marginRight: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneLoser[0].championName}.png`}></img>
                    </Tooltip>
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[1].riotIdGameName}`}>
                        <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px', marginLeft: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneLoser[1].championName}.png`}></img>
                    </Tooltip>
                    <img style={{ margin: '20px', maxWidth: '65px', maxHeight: '65px' }} src='/images/laneIcons/Bottom.png'></img>
                </Grid>
            </Grid>
        </div>
    )
}

export default LanePhaseSummaryCardBot