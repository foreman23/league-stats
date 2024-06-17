import React from 'react';
import { Grid, Typography, Box, Button, Tooltip } from '@mui/material';

const LanePhaseSummaryCardBot = (props) => {
    const { statsAt15, handleLaneCard, lastButtonPressedBot, botSummaryCardStatus } = props;
    console.log(props)

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
            <Grid className={botSummaryCardStatus ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
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
                        <img style={{ margin: '20px', width: '65px', height: 'auto', marginRight: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneWinner[0].championName}.png`}></img>
                    </Tooltip>
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneWinner[1].riotIdGameName}`}>
                        <img style={{ margin: '20px', width: '65px', height: 'auto', marginLeft: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneWinner[1].championName}.png`}></img>
                    </Tooltip>
                    <img style={{ width: '30px', height: 'auto', objectFit: 'contain' }} src='/images/swords.svg'></img>
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[0].riotIdGameName}`}>
                        <img style={{ margin: '20px', width: '65px', height: 'auto', marginRight: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneLoser[0].championName}.png`}></img>
                    </Tooltip>
                    <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.BOTTOM.laneLoser[1].riotIdGameName}`}>
                        <img style={{ margin: '20px', width: '65px', height: 'auto', marginLeft: '0px', objectFit: 'contain' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.BOTTOM.laneLoser[1].championName}.png`}></img>
                    </Tooltip>
                    <img style={{ margin: '20px', width: '65px', height: 'auto', objectFit: 'contain' }} src='/images/laneIcons/Bottom.png'></img>
                </Grid>
            </Grid>
        </div>
    )
}

export default LanePhaseSummaryCardBot