import React from 'react';
import { Grid, Typography, Box, Button, Tooltip } from '@mui/material';

const LanePhaseSummaryCardJg = (props) => {
    const { statsAt15, handleLaneCard, lastButtonPressedJg, jgSummaryCardStatus } = props;

    return (
        <div>
            <Grid
                className={jgSummaryCardStatus ? 'LanePhaseSummaryCardActive' : 'LanePhaseSummaryCardInActive'}
                container
                style={{ marginBottom: '20px', marginTop: '250px' }}
            >
                <Grid item xs={12} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Grid style={{ marginRight: '35px' }} xs={6}>
                        {statsAt15.laneResults.JUNGLE.resTag === 'draw' ? (
                            <Typography fontWeight={'bold'}>{`Jungle was a draw`}</Typography>
                        ) : (
                            <Typography fontWeight={'bold'}>{`${statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'Blue' : 'Red'} ${statsAt15.laneResults.JUNGLE.resTag} jungle`}</Typography>
                        )}
                    </Grid>
                    <Grid xs={6} style={{ flexDirection: 'row', display: 'inline-flex', marginRight: '50px' }}>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 0 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 1 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 2 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 3 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 4 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                    </Grid>
                    <Grid xs={6} style={{ flexDirection: 'row', display: 'inline-flex' }}>

                        <Button
                            className={lastButtonPressedJg === 'laneSumJg1'
                                ? (statsAt15.laneResults.JUNGLE.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                                : (statsAt15.laneResults.JUNGLE.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                            onClick={() => handleLaneCard('jg', 'laneSumJg1')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            Summary
                        </Button>

                        <Button
                            className={lastButtonPressedJg === 'laneSumJg2'
                                ? (statsAt15.laneResults.JUNGLE.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                                : (statsAt15.laneResults.JUNGLE.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                            onClick={() => handleLaneCard('jg', 'laneSumJg2')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            Bloodshed
                        </Button>

                        <Button
                            className={lastButtonPressedJg === 'laneSumJg3'
                                ? (statsAt15.laneResults.JUNGLE.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                                : (statsAt15.laneResults.JUNGLE.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                            onClick={() => handleLaneCard('jg', 'laneSumJg3')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            CS Graph
                        </Button>

                    </Grid>
                </Grid>
            </Grid>
            <Grid className={jgSummaryCardStatus ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid xs={6}>
                    {statsAt15.laneResults.JUNGLE.resTag !== 'draw' ? (
                        <Typography>
                            <span style={{ color: statsAt15.laneResults.JUNGLE.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{statsAt15.laneResults.JUNGLE.laneWinner.riotIdGameName} </span>
                            ({statsAt15.laneResults.JUNGLE.laneWinner.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneWinner.cs} CS) in the jungle earned {statsAt15.laneResults.JUNGLE.goldDifference} more gold than
                            <span style={{ color: statsAt15.laneResults.JUNGLE.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.JUNGLE.laneLoser.riotIdGameName} </span>
                            ({statsAt15.laneResults.JUNGLE.laneLoser.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneLoser.cs} CS) at the end of 15 minutes, giving {statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? "blue" : "red"} team an advantage entering the mid phase.
                        </Typography>
                    ) : (
                        <Typography>
                            <span style={{ color: statsAt15.laneResults.JUNGLE.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{statsAt15.laneResults.JUNGLE.laneWinner.riotIdGameName} </span>
                            ({statsAt15.laneResults.JUNGLE.laneWinner.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneWinner.cs} CS) in the jungle only earned a small gold lead of {statsAt15.laneResults.JUNGLE.goldDifference} over
                            <span style={{ color: statsAt15.laneResults.JUNGLE.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.JUNGLE.laneLoser.riotIdGameName} </span>
                            ({statsAt15.laneResults.JUNGLE.laneLoser.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneLoser.cs} CS), so we consider jungle to be a draw.
                        </Typography>
                    )}
                </Grid>
                <Grid style={{ display: 'inline-flex', justifyContent: 'center' }} xs={6}>
                    <Tooltip open={true} slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.JUNGLE.laneWinner.riotIdGameName}`}>
                        <img style={{ margin: '20px', width: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.JUNGLE.laneWinner.championName}.png`}></img>
                    </Tooltip>
                    <img style={{ width: '30px' }} src='/images/swords.svg'></img>
                    <Tooltip open={true} slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.JUNGLE.laneLoser.riotIdGameName}`}>
                        <img style={{ margin: '20px', width: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.JUNGLE.laneLoser.championName}.png`}></img>
                    </Tooltip>
                    <img style={{ margin: '20px', width: '75px' }} src='/images/laneIcons/Jungle.png'></img>
                </Grid>
            </Grid>
        </div>
    )
}

export default LanePhaseSummaryCardJg