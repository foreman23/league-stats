import React from 'react';
import { Grid, Typography, Box, Button, Tooltip } from '@mui/material';
import { LineChart } from '@mui/x-charts';

const LanePhaseSummaryCardMid = (props) => {
    const { statsAt15, handleLaneCard, lastButtonPressedMid, midSummaryCardStatus, gameData, timelineData, dataDragonVersion, champsJSON } = props;

    const participants = gameData.info.participants;

    // Graph information
    const frames = timelineData.info.frames;
    const xAxisData = frames.map((_, index) => index).slice(2, 16);
    const yAxisDataWinner = frames.map(frame => frame.participantFrames[statsAt15.laneResults.MIDDLE.laneWinner.participantId].minionsKilled + frame.participantFrames[statsAt15.laneResults.MIDDLE.laneWinner.participantId].jungleMinionsKilled).slice(2, 16);
    const yAxisDataLoser = frames.map(frame => frame.participantFrames[statsAt15.laneResults.MIDDLE.laneLoser.participantId].minionsKilled + frame.participantFrames[statsAt15.laneResults.MIDDLE.laneLoser.participantId].jungleMinionsKilled).slice(2, 16);

    // Isolate laning kills for mid lane
    const midLaneKillTimeline = statsAt15.laningKills.filter(event =>
        event.killerId.toString() === statsAt15.laneResults.MIDDLE.laneWinner.participantId
        || event.killerId.toString() === statsAt15.laneResults.MIDDLE.laneLoser.participantId
        || event.victimId.toString() === statsAt15.laneResults.MIDDLE.laneWinner.participantId
        || event.victimId.toString() === statsAt15.laneResults.MIDDLE.laneLoser.participantId
    )

    // Find champion names for laners
    let winnerChampName = Object.values(champsJSON.data).find(champ => champ.key === String(statsAt15.laneResults.MIDDLE.laneWinner.championId)).id
    let loserChampName = Object.values(champsJSON.data).find(champ => champ.key === String(statsAt15.laneResults.MIDDLE.laneLoser.championId)).id

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

            <Grid className={midSummaryCardStatus && lastButtonPressedMid === 'laneSumMid1' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
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
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -25] } }] } }} title={`${statsAt15.laneResults.MIDDLE.laneWinner.riotIdGameName}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName}.png`}></img>
                            <Box style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', width: '75px', height: '8px', backgroundColor: statsAt15.laneResults.MIDDLE.laneWinner.teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                        </div>
                    </Tooltip>
                    <img style={{ maxWidth: '30px', maxHeight: '115px' }} src='/images/swords.svg'></img>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -25] } }] } }} title={`${statsAt15.laneResults.MIDDLE.laneLoser.riotIdGameName}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName}.png`}></img>
                            <Box style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', width: '75px', height: '8px', backgroundColor: statsAt15.laneResults.MIDDLE.laneLoser.teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                        </div>                    </Tooltip>
                    <img style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src='/images/laneIcons/Middle.png'></img>
                </Grid>
            </Grid>

            <Grid className={midSummaryCardStatus && lastButtonPressedMid === 'laneSumMid2' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid xs={6}>
                    <Typography style={{ marginBottom: '15px' }}>
                        Results of the deaths and objectives affecting
                        <span style={{ color: statsAt15.laneResults.MIDDLE.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.MIDDLE.laneWinner.riotIdGameName} </span>
                        ({statsAt15.laneResults.MIDDLE.laneWinner.kdaAlt}, {statsAt15.laneResults.MIDDLE.laneWinner.cs} CS) and
                        <span style={{ color: statsAt15.laneResults.MIDDLE.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.MIDDLE.laneLoser.riotIdGameName} </span>
                        ({statsAt15.laneResults.MIDDLE.laneLoser.kdaAlt}, {statsAt15.laneResults.MIDDLE.laneLoser.cs} CS) during laning phase.
                    </Typography>
                    <Typography style={{ marginBottom: '10px' }}>
                        {midLaneKillTimeline.map((kill, index) => {
                            if (kill.victimId !== 0 && kill.killerId !== 0) {
                                return (
                                    <Typography>{Math.round(kill.timestamp / 60000)}m - <span style={{ color: participants.find(player => player.participantId === kill.killerId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.killerId).riotIdGameName}</span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }}
                                    src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.killerId).championId)).id}.png`}></img> killed <span style={{ color: participants.find(player => player.participantId === kill.victimId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.victimId).riotIdGameName}</span>
                                    <img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.victimId).championId)).id}.png`}></img></Typography>
                                )
                            }
                            if (kill.victimId === 0) {
                                return (
                                    <Typography>{Math.round(kill.timestamp / 60000)}m - <span style={{ color: participants.find(player => player.participantId === kill.killerId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.killerId).riotIdGameName}</span>
                                    <img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.killerId).championId)).id}.png`}></img> killed <span style={{ color: '#6A00AB', fontWeight: 'bold' }}>{kill.monsterType.toLowerCase()}</span></Typography>
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
                        <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 52] } }] } }} title={`${statsAt15.laneResults.MIDDLE.laneWinner.riotIdGameName}`}>
                            <img style={{ margin: '20px', marginBottom: '0px', maxWidth: '75px', maxHeight: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName}.png`}></img>
                            <Box style={{ position: 'absolute', marginTop: '-4px', left: '50%', transform: 'translateX(-50%)', width: '75px', height: '8px', backgroundColor: statsAt15.laneResults.MIDDLE.laneWinner.teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                        </Tooltip>
                    </div>
                    <img style={{ maxWidth: '30px', maxHeight: '115px' }} src='/images/swords.svg'></img>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 52] } }] } }} title={`${statsAt15.laneResults.MIDDLE.laneLoser.riotIdGameName}`}>
                            <img style={{ margin: '20px', marginBottom: '0px', maxWidth: '75px', maxHeight: '75px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName}.png`}></img>
                            <Box style={{ position: 'absolute', marginTop: '-4px', left: '50%', transform: 'translateX(-50%)', width: '75px', height: '8px', backgroundColor: statsAt15.laneResults.MIDDLE.laneLoser.teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                        </Tooltip>
                    </div>
                    <img style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src='/images/laneIcons/Middle.png'></img>
                </Grid>
            </Grid>

            <Grid className={midSummaryCardStatus && lastButtonPressedMid === 'laneSumMid3' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid xs={12}>
                    <Typography style={{ marginBottom: '15px' }}>
                        Graph of CS killed each minute by
                        <span style={{ color: statsAt15.laneResults.MIDDLE.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.MIDDLE.laneWinner.riotIdGameName} </span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName}.png`}></img>
                        ({statsAt15.laneResults.MIDDLE.laneWinner.kdaAlt}, {statsAt15.laneResults.MIDDLE.laneWinner.cs} CS) and
                        <span style={{ color: statsAt15.laneResults.MIDDLE.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.MIDDLE.laneLoser.riotIdGameName} </span><img style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName}.png`}></img>
                        ({statsAt15.laneResults.MIDDLE.laneLoser.kdaAlt}, {statsAt15.laneResults.MIDDLE.laneLoser.cs} CS) during laning phase.
                    </Typography>
                    <LineChart
                        xAxis={[{ data: xAxisData, label: 'Minutes' }]}
                        yAxis={[{ label: 'Total CS' }]}
                        series={[
                            {
                                data: yAxisDataWinner,
                                color: statsAt15.laneResults.MIDDLE.laneWinner.teamId === 100 ? '#37B7FF' : '#FF3F3F',
                                label: statsAt15.laneResults.MIDDLE.laneWinner.riotIdGameName,
                            },
                            {
                                data: yAxisDataLoser,
                                color: statsAt15.laneResults.MIDDLE.laneLoser.teamId === 100 ? '#37B7FF' : '#FF3F3F',
                                label: statsAt15.laneResults.MIDDLE.laneLoser.riotIdGameName,
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

export default LanePhaseSummaryCardMid