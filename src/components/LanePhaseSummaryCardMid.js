import React from 'react';
import { Grid, Typography, Box, Button, Tooltip } from '@mui/material';

const LanePhaseSummaryCardMid = (props) => {
    const { statsAt15, handleLaneCard, lastButtonPressedMid, midSummaryCardStatus } = props;

    return (
        <div>
            <Grid className={midSummaryCardStatus ? 'LanePhaseSummaryCardActive' : 'LanePhaseSummaryCardInActive'} container style={{ flexDirection: 'row', display: 'inline-flex', alignItems: 'center' }}>
                <Grid item xs={12} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Grid style={{ marginRight: '35px' }} xs={6}>
                        {statsAt15.laneResults.MIDDLE.resTag === 'draw' ? (
                            <Typography fontWeight={'bold'}>{`Mid lane was a draw`}</Typography>
                        ) : (
                            <Typography fontWeight={'bold'}>{`${statsAt15.laneResults.MIDDLE.teamWonLane === 100 ? 'Blue' : 'Red'} ${statsAt15.laneResults.MIDDLE.resTag} mid lane`}</Typography>
                        )}
                    </Grid>
                    <Grid xs={6} style={{ flexDirection: 'row', display: 'inline-flex', marginRight: '50px' }}>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.MIDDLE.bubbleCount > 0 ? statsAt15.laneResults.MIDDLE.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.MIDDLE.bubbleCount > 1 ? statsAt15.laneResults.MIDDLE.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.MIDDLE.bubbleCount > 2 ? statsAt15.laneResults.MIDDLE.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.MIDDLE.bubbleCount > 3 ? statsAt15.laneResults.MIDDLE.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.MIDDLE.bubbleCount > 4 ? statsAt15.laneResults.MIDDLE.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                    </Grid>
                    <Grid xs={6} style={{ flexDirection: 'row', display: 'inline-flex' }}>

                        <Button
                            className={lastButtonPressedMid === 'laneSumMid1'
                                ? (statsAt15.laneResults.MIDDLE.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.MIDDLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                                : (statsAt15.laneResults.MIDDLE.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.MIDDLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                            onClick={() => handleLaneCard('mid', 'laneSumMid1')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            Summary
                        </Button>

                        <Button
                            className={lastButtonPressedMid === 'laneSumMid2'
                                ? (statsAt15.laneResults.MIDDLE.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.MIDDLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                                : (statsAt15.laneResults.MIDDLE.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.MIDDLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                            onClick={() => handleLaneCard('mid', 'laneSumMid2')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            Bloodshed
                        </Button>

                        <Button
                            className={lastButtonPressedMid === 'laneSumMid3'
                                ? (statsAt15.laneResults.MIDDLE.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.MIDDLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                                : (statsAt15.laneResults.MIDDLE.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.MIDDLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                            onClick={() => handleLaneCard('mid', 'laneSumMid3')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            CS Graph
                        </Button>

                    </Grid>
                </Grid>
            </Grid>
            <Grid className={midSummaryCardStatus ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid xs={6}>
                    {statsAt15.laneResults.MIDDLE.resTag !== 'draw' ? (
                        <Typography>
                            <span style={{ color: statsAt15.laneResults.MIDDLE.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{statsAt15.laneResults.MIDDLE.laneWinner.riotIdGameName} </span>
                            ({statsAt15.laneResults.MIDDLE.laneWinner.kdaAlt}, {statsAt15.laneResults.MIDDLE.laneWinner.cs} CS) in the mid lane earned {statsAt15.laneResults.MIDDLE.goldDifference} more gold than
                            <span style={{ color: statsAt15.laneResults.MIDDLE.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.MIDDLE.laneLoser.riotIdGameName} </span>
                            ({statsAt15.laneResults.MIDDLE.laneLoser.kdaAlt}, {statsAt15.laneResults.MIDDLE.laneLoser.cs} CS) at the end of 15 minutes, giving {statsAt15.laneResults.MIDDLE.teamWonLane === 100 ? "blue" : "red"} team an advantage entering the mid phase.
                        </Typography>
                    ) : (
                        <Typography>
                            <span style={{ color: statsAt15.laneResults.MIDDLE.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{statsAt15.laneResults.MIDDLE.laneWinner.riotIdGameName} </span>
                            ({statsAt15.laneResults.MIDDLE.laneWinner.kdaAlt}, {statsAt15.laneResults.MIDDLE.laneWinner.cs} CS) in the mid lane only earned a small gold lead of {statsAt15.laneResults.MIDDLE.goldDifference} over
                            <span style={{ color: statsAt15.laneResults.MIDDLE.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.MIDDLE.laneLoser.riotIdGameName} </span>
                            ({statsAt15.laneResults.MIDDLE.laneLoser.kdaAlt}, {statsAt15.laneResults.MIDDLE.laneLoser.cs} CS), so we consider mid lane to be a draw.
                        </Typography>
                    )}
                </Grid>
                <Grid style={{ display: 'inline-flex', justifyContent: 'center' }} xs={6}>
                    <Tooltip open={true} slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.MIDDLE.laneWinner.riotIdGameName}`}>
                        <img style={{ margin: '20px', width: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.MIDDLE.laneWinner.championName}.png`}></img>
                    </Tooltip>
                    <img style={{ width: '30px' }} src='/images/swords.svg'></img>
                    <Tooltip open={true} slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.MIDDLE.laneLoser.riotIdGameName}`}>
                        <img style={{ margin: '20px', width: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.MIDDLE.laneLoser.championName}.png`}></img>
                    </Tooltip>
                    <img style={{ margin: '20px', width: '75px' }} src='/images/laneIcons/Middle.png'></img>
                </Grid>
            </Grid>
        </div>
    )
}

export default LanePhaseSummaryCardMid