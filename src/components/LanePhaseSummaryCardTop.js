import React from 'react';
import { Grid, Typography, Box, Button, Tooltip } from '@mui/material';
import { LineChart } from '@mui/x-charts';

const LanePhaseSummaryCardTop = (props) => {
  const { statsAt15, handleLaneCard, lastButtonPressedTop, topSummaryCardStatus, gameData, timelineData } = props;
  console.log(statsAt15, handleLaneCard, lastButtonPressedTop, topSummaryCardStatus, gameData, timelineData)

  const participants = gameData.info.participants;

  // Graph information
  const frames = timelineData.info.frames;
  const xAxisData = frames.map((_, index) => index).slice(2, 16);
  console.log(xAxisData)
  const yAxisDataWinner = frames.map(frame => frame.participantFrames[statsAt15.laneResults.TOP.laneWinner.participantId].minionsKilled + frame.participantFrames[statsAt15.laneResults.TOP.laneWinner.participantId].jungleMinionsKilled).slice(2, 16);
  const yAxisDataLoser = frames.map(frame => frame.participantFrames[statsAt15.laneResults.TOP.laneLoser.participantId].minionsKilled + frame.participantFrames[statsAt15.laneResults.TOP.laneLoser.participantId].jungleMinionsKilled).slice(2, 16);

  // Isolate laning kills for top lane
  const topLaneKillTimeline = statsAt15.laningKills.filter(event =>
    event.killerId.toString() === statsAt15.laneResults.TOP.laneWinner.participantId
    || event.killerId.toString() === statsAt15.laneResults.TOP.laneLoser.participantId
    || event.victimId.toString() === statsAt15.laneResults.TOP.laneWinner.participantId
    || event.victimId.toString() === statsAt15.laneResults.TOP.laneLoser.participantId
  )
  console.log(topLaneKillTimeline)

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

      <Grid className={topSummaryCardStatus && lastButtonPressedTop === 'laneSumTop1' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
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
            <img style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.TOP.laneWinner.championName}.png`}></img>
          </Tooltip>
          <img style={{ maxWidth: '30px', maxHeight: '115px' }} src='/images/swords.svg'></img>
          <Tooltip open={true} slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.TOP.laneLoser.riotIdGameName}`}>
            <img style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.TOP.laneLoser.championName}.png`}></img>
          </Tooltip>
          <img style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src='/images/laneIcons/TopLane.png'></img>
        </Grid>
      </Grid>

      <Grid className={topSummaryCardStatus && lastButtonPressedTop === 'laneSumTop2' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
        <Grid xs={6}>
          <Typography style={{ marginBottom: '15px' }}>
            Results of the deaths and objectives affecting
            <span style={{ color: statsAt15.laneResults.TOP.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.TOP.laneWinner.riotIdGameName} </span>
            ({statsAt15.laneResults.TOP.laneWinner.kdaAlt}, {statsAt15.laneResults.TOP.laneWinner.cs} CS) and
            <span style={{ color: statsAt15.laneResults.TOP.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.TOP.laneLoser.riotIdGameName} </span>
            ({statsAt15.laneResults.TOP.laneLoser.kdaAlt}, {statsAt15.laneResults.TOP.laneLoser.cs} CS) during laning phase.
          </Typography>
          <Typography style={{ marginBottom: '10px' }}>
            {topLaneKillTimeline.map((kill, index) => (
              kill.victimId !== 0 ? (
                <Typography>{Math.round(kill.timestamp / 60000)}m - <span style={{ color: participants.find(player => player.participantId === kill.killerId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.killerId).riotIdGameName}</span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${participants.find(player => player.participantId === kill.killerId).championName}.png`}></img> killed <span style={{ color: participants.find(player => player.participantId === kill.victimId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.victimId).riotIdGameName}</span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${participants.find(player => player.participantId === kill.victimId).championName}.png`}></img></Typography>
              ) : (
                <Typography>{Math.round(kill.timestamp / 60000)}m - <span style={{ color: participants.find(player => player.participantId === kill.killerId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.killerId).riotIdGameName}</span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${participants.find(player => player.participantId === kill.killerId).championName}.png`}></img> killed <span style={{ color: '#6A00AB', fontWeight: 'bold' }}>{kill.monsterType.toLowerCase()}</span></Typography>
              )
            ))}
          </Typography>
        </Grid>
        <Grid style={{ display: 'inline-flex', justifyContent: 'center' }} xs={6}>
          <Tooltip open={true} slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.TOP.laneWinner.riotIdGameName}`}>
            <img style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.TOP.laneWinner.championName}.png`}></img>
          </Tooltip>
          <img style={{ maxWidth: '30px', maxHeight: '115px' }} src='/images/swords.svg'></img>
          <Tooltip open={true} slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [20, -100] } }] } }} title={`${statsAt15.laneResults.TOP.laneLoser.riotIdGameName}`}>
            <img style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.TOP.laneLoser.championName}.png`}></img>
          </Tooltip>
          <img style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src='/images/laneIcons/TopLane.png'></img>
        </Grid>
      </Grid>

      <Grid className={topSummaryCardStatus && lastButtonPressedTop === 'laneSumTop3' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
        <Grid xs={12}>
          <Typography style={{ marginBottom: '15px' }}>
            Graph of CS killed each minute by
            <span style={{ color: statsAt15.laneResults.TOP.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.TOP.laneWinner.riotIdGameName} </span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.TOP.laneWinner.championName}.png`}></img>
            ({statsAt15.laneResults.TOP.laneWinner.kdaAlt}, {statsAt15.laneResults.TOP.laneWinner.cs} CS) and
            <span style={{ color: statsAt15.laneResults.TOP.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.TOP.laneLoser.riotIdGameName} </span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${statsAt15.laneResults.TOP.laneLoser.championName}.png`}></img>
            ({statsAt15.laneResults.TOP.laneLoser.kdaAlt}, {statsAt15.laneResults.TOP.laneLoser.cs} CS) during laning phase.
          </Typography>
          <LineChart
            xAxis={[{ data: xAxisData, label: 'Minutes' }]}
            yAxis={[{ label: 'Total CS' }]}
            series={[
              {
                data: yAxisDataWinner,
                color: statsAt15.laneResults.TOP.laneWinner.teamId === 100 ? '#37B7FF' : '#FF3F3F',
                label: statsAt15.laneResults.TOP.laneWinner.riotIdGameName,
              },
              {
                data: yAxisDataLoser,
                color: statsAt15.laneResults.TOP.laneLoser.teamId === 100 ? '#37B7FF' : '#FF3F3F',
                label: statsAt15.laneResults.TOP.laneLoser.riotIdGameName,
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

export default LanePhaseSummaryCardTop;
