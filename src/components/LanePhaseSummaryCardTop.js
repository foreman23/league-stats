import React from 'react';
import { Grid, Typography, Box, Button, Tooltip } from '@mui/material';

const LanePhaseSummaryCardTop = (props) => {
    const { statsAt15, handleLaneCard, lastButtonPressedTop, topSummaryCardStatus } = props;

    return (
        <div>
             <Grid
                  className={topSummaryCardStatus ? 'LanePhaseSummaryCardActive' : 'LanePhaseSummaryCardInActive'}
                  container
                  style={{ marginBottom: '20px', marginTop: '250px' }}
                >
                  <Grid item xs={12} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Grid item style={{ marginRight: '35px' }} xs={6}>
                      {statsAt15.laneResults.TOP.resTag === 'draw' ? (
                        <Typography fontWeight={'bold'}>{`Top lane was a draw`}</Typography>
                      ) : (
                        <Typography fontWeight={'bold'}>{`${statsAt15.laneResults.TOP.teamWonLane === 100 ? 'Blue' : 'Red'} ${statsAt15.laneResults.TOP.resTag} top lane`}</Typography>
                      )}
                    </Grid>
                    <Grid xs={6} style={{ flexDirection: 'row', display: 'inline-flex', marginRight: '50px' }}>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.TOP.bubbleCount > 0 ? statsAt15.laneResults.TOP.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.TOP.bubbleCount > 1 ? statsAt15.laneResults.TOP.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.TOP.bubbleCount > 2 ? statsAt15.laneResults.TOP.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.TOP.bubbleCount > 3 ? statsAt15.laneResults.TOP.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.TOP.bubbleCount > 4 ? statsAt15.laneResults.TOP.bubbleColor : '#D9D9D9', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                    </Grid>
                    <Grid item xs={6} style={{ display: 'inline-flex' }}>

                      <Button className={lastButtonPressedTop === 'laneSumTop1'
                        ? (statsAt15.laneResults.TOP.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.TOP.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                        : (statsAt15.laneResults.TOP.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.TOP.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                        onClick={() => handleLaneCard('top', 'laneSumTop1')}
                        style={{ marginRight: '20px', width: '125px', height: '50px' }}
                        color='grey'
                        size='small'
                        variant='contained'>
                        Summary
                      </Button>

                      <Button
                        className={lastButtonPressedTop === 'laneSumTop2'
                          ? (statsAt15.laneResults.TOP.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.TOP.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                          : (statsAt15.laneResults.TOP.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.TOP.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                        onClick={() => handleLaneCard('top', 'laneSumTop2')}
                        style={{ marginRight: '20px', width: '125px', height: '50px' }}
                        color='grey'
                        size='small'
                        variant='contained'>
                        Bloodshed
                      </Button>

                      <Button
                        className={lastButtonPressedTop === 'laneSumTop3'
                          ? (statsAt15.laneResults.TOP.resTag === 'draw' ? 'LanePhaseSummaryBtnClickedDraw' : (statsAt15.laneResults.TOP.teamWonLane === 100 ? 'LanePhaseSummaryBtnClickedBlue' : 'LanePhaseSummaryBtnClicked'))
                          : (statsAt15.laneResults.TOP.resTag === 'draw' ? 'LanePhaseSummaryBtnDraw' : (statsAt15.laneResults.TOP.teamWonLane === 100 ? 'LanePhaseSummaryBtnBlue' : 'LanePhaseSummaryBtn'))}
                        onClick={() => handleLaneCard('top', 'laneSumTop3')}
                        style={{ marginRight: '20px', width: '125px', height: '50px' }}
                        color='grey'
                        size='small'
                        variant='contained'>
                        CS Graph
                      </Button>

                    </Grid>
                  </Grid>
                </Grid>
                <Grid className={topSummaryCardStatus ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                  <Grid xs={6}>
                    {statsAt15.laneResults.TOP.resTag !== 'draw' ? (
                      <Typography>
                        <span style={{ color: statsAt15.laneResults.TOP.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{statsAt15.laneResults.TOP.laneWinner.riotIdGameName} </span>
                        ({statsAt15.laneResults.TOP.laneWinner.kdaAlt}, {statsAt15.laneResults.TOP.laneWinner.cs} CS) in the top lane earned {statsAt15.laneResults.TOP.goldDifference} more gold than
                        <span style={{ color: statsAt15.laneResults.TOP.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.TOP.laneLoser.riotIdGameName} </span>
                        ({statsAt15.laneResults.TOP.laneLoser.kdaAlt}, {statsAt15.laneResults.TOP.laneLoser.cs} CS) at the end of 15 minutes, giving {statsAt15.laneResults.TOP.teamWonLane === 100 ? "blue" : "red"} team an advantage entering the mid phase.
                      </Typography>
                    ) : (
                      <Typography>
                        <span style={{ color: statsAt15.laneResults.TOP.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{statsAt15.laneResults.TOP.laneWinner.riotIdGameName} </span>
                        ({statsAt15.laneResults.TOP.laneWinner.kdaAlt}, {statsAt15.laneResults.TOP.laneWinner.cs} CS) in the top lane only earned a small gold lead of {statsAt15.laneResults.TOP.goldDifference} over
                        <span style={{ color: statsAt15.laneResults.TOP.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.TOP.laneLoser.riotIdGameName} </span>
                        ({statsAt15.laneResults.TOP.laneLoser.kdaAlt}, {statsAt15.laneResults.TOP.laneLoser.cs} CS), so we consider top lane to be a draw.
                      </Typography>
                    )}
                  </Grid>
                  <Grid style={{ display: 'inline-flex', justifyContent: 'center' }} xs={6}>
                    <Tooltip open={true} slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.TOP.laneWinner.riotIdGameName}`}>
                      <img style={{ margin: '20px', width: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.TOP.laneWinner.championName}.png`}></img>
                    </Tooltip>
                    <img style={{ width: '30px' }} src='/images/swords.svg'></img>
                    <Tooltip open={true} slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.TOP.laneLoser.riotIdGameName}`}>
                      <img style={{ margin: '20px', width: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.TOP.laneLoser.championName}.png`}></img>
                    </Tooltip>
                    <img style={{ margin: '20px', width: '75px' }} src='/images/laneIcons/TopLane.png'></img>
                  </Grid>
                </Grid>
        </div>
    )
}

export default LanePhaseSummaryCardTop;
