import React from 'react';
import { useState } from 'react';
import { Grid, Typography, Box, Button, Tooltip } from '@mui/material';
import { LineChart } from '@mui/x-charts';

const LanePhaseSummaryCardJg = (props) => {

    const [lastButtonPressedJg, setLastButtonPressedJg] = useState('laneSumJg1');

    const handleLaneCard = (lane, btnName) => {
        setLastButtonPressedJg(btnName)

    }

    const { statsAt15, gameData, timelineData, champsJSON } = props;

    const participants = gameData.info.participants;

    // Graph information
    const frames = timelineData.info.frames;
    const xAxisData = frames.map((_, index) => index).slice(2, 16);
    const yAxisDataWinner = frames.map(frame => frame.participantFrames[statsAt15.laneResults.JUNGLE.laneWinner.participantId].minionsKilled + frame.participantFrames[statsAt15.laneResults.JUNGLE.laneWinner.participantId].jungleMinionsKilled).slice(2, 16);
    const yAxisDataLoser = frames.map(frame => frame.participantFrames[statsAt15.laneResults.JUNGLE.laneLoser.participantId].minionsKilled + frame.participantFrames[statsAt15.laneResults.JUNGLE.laneLoser.participantId].jungleMinionsKilled).slice(2, 16);

    // Isolate laning kills for jungle lane
    const jgLaneKillTimeline = statsAt15.laningKills.filter(event =>
        event.killerId.toString() === statsAt15.laneResults.JUNGLE.laneWinner.participantId
        || event.killerId.toString() === statsAt15.laneResults.JUNGLE.laneLoser.participantId
        || event.victimId.toString() === statsAt15.laneResults.JUNGLE.laneWinner.participantId
        || event.victimId.toString() === statsAt15.laneResults.JUNGLE.laneLoser.participantId
    )

    // Find champion names for laners
    let winnerChampName = Object.values(champsJSON.data).find(champ => champ.key === String(statsAt15.laneResults.JUNGLE.laneWinner.championId)).id
    let loserChampName = Object.values(champsJSON.data).find(champ => champ.key === String(statsAt15.laneResults.JUNGLE.laneLoser.championId)).id

    // Generate string for advantage description
    let advantageStr = null;
    if (statsAt15.laneResults.JUNGLE.goldDifference > 3000) {
        advantageStr = `almost guaranteeing ${statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'blue' : 'red'} team the victory`
    }
    else if (statsAt15.laneResults.JUNGLE.goldDifference > 2000) {
        advantageStr = `giving ${statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'blue' : 'red'} team a big lead entering the mid phase`
    }
    else if (statsAt15.laneResults.JUNGLE.goldDifference > 650) {
        advantageStr = `giving ${statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'blue' : 'red'} team an advantage entering the mid phase`
    }
    else if (statsAt15.laneResults.JUNGLE.goldDifference >= 150) {
        advantageStr = `giving ${statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'blue' : 'red'} team a small advantage entering the mid phase`
    }
    else if (statsAt15.laneResults.JUNGLE.goldDifference < 150) {
        advantageStr = `so we consider jungle to be a tie`
    }

    return (
        <div id='laningJgAnchor'>
            <Grid
                className={'LanePhaseSummaryCardActive'}
                style={{ marginBottom: '20px', marginTop: '250px' }}
            >
                <div className='LaningPhaseGridHeader'>
                    <div className='LaneOutcomeTitle'>
                        {statsAt15.laneResults.JUNGLE.resTag === 'draw' ? (
                            <Typography fontWeight={'bold'}>{`Jungle was a draw`}</Typography>
                        ) : (
                            <Typography fontWeight={'bold'}>{`${statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'Blue' : 'Red'} ${statsAt15.laneResults.JUNGLE.resTag} jungle`}</Typography>
                        )}
                    </div>
                    <div className='LaneBubbleContainer' xs={12} sm={6}>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 0 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#d1d1d1', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 1 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#d1d1d1', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 2 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#d1d1d1', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 3 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#d1d1d1', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                        <Box className='LanePhaseSummaryBubble' style={{ flex: '1', backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 4 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#d1d1d1', height: '40px', width: `40px`, borderRadius: '100%' }}></Box>
                    </div>
                    <div className='LaneButtonsContainer' style={{ display: 'flex' }}>
                        <Button
                            className={lastButtonPressedJg === 'laneSumJg1' ? 'LanePhaseSummaryBtnClicked' : 'LanePhaseSummaryBtn'}
                            onClick={() => handleLaneCard('jg', 'laneSumJg1')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            Summary
                        </Button>

                        <Button
                            className={lastButtonPressedJg === 'laneSumJg2' ? 'LanePhaseSummaryBtnClicked' : 'LanePhaseSummaryBtn'}
                            onClick={() => handleLaneCard('jg', 'laneSumJg2')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            Bloodshed
                        </Button>

                        <Button
                            className={lastButtonPressedJg === 'laneSumJg3' ? 'LanePhaseSummaryBtnClicked' : 'LanePhaseSummaryBtn'}
                            onClick={() => handleLaneCard('jg', 'laneSumJg3')}
                            style={{ marginRight: '20px', width: '125px', height: '50px' }}
                            color='grey'
                            size='small'
                            variant='contained'>
                            CS Graph
                        </Button>

                    </div>
                </div>
            </Grid>

            <Grid className={lastButtonPressedJg === 'laneSumJg1' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid item xs={12} sm={6}>
                    {statsAt15.laneResults.JUNGLE.resTag !== 'draw' ? (
                        <p>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.JUNGLE.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName}</a> ({statsAt15.laneResults.JUNGLE.laneWinner.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneWinner.cs} CS) in the jungle earned {statsAt15.laneResults.JUNGLE.goldDifference} more gold than <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.JUNGLE.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName}</a> ({statsAt15.laneResults.JUNGLE.laneLoser.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneLoser.cs} CS) at the end of {props.gameData.info.gameDuration < 900 ? props.gameDuration : '15 minutes'}, {advantageStr}.
                        </p>
                    ) : (
                        <p>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.JUNGLE.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName}</a> ({statsAt15.laneResults.JUNGLE.laneWinner.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneWinner.cs} CS) in the jungle only earned a small gold lead of {statsAt15.laneResults.JUNGLE.goldDifference} over <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.JUNGLE.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName}</a> ({statsAt15.laneResults.JUNGLE.laneLoser.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneLoser.cs} CS), so we consider jungle to be a draw.
                        </p>
                    )}
                </Grid>
                <Grid item style={{ display: 'inline-flex', justifyContent: 'center' }} xs={12} sm={6}>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -15] } }] } }} title={`${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName} #${statsAt15.laneResults.TOP.laneWinner?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.JUNGLE.laneWinner.teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <img alt='' className='lanePhaseSummarySwords' src='/images/swords.svg'></img>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -15] } }] } }} title={`${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName} #${statsAt15.laneResults.TOP.laneLoser?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.JUNGLE.laneLoser.teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <img alt='Lane' className='hideMobile hideTablet' style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src='/images/laneIcons/Jungle.png'></img>
                </Grid>
            </Grid>

            <Grid className={lastButtonPressedJg === 'laneSumJg2' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid item xs={12} sm={6}>
                    <p style={{ marginBottom: '15px' }}>
                        Results of the deaths and objectives involving <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.JUNGLE.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName}</a> ({statsAt15.laneResults.JUNGLE.laneWinner.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneWinner.cs} CS) and <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.JUNGLE.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName}</a> ({statsAt15.laneResults.JUNGLE.laneLoser.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneLoser.cs} CS) during laning phase.
                    </p>
                    <div style={{ marginBottom: '10px' }}>
                        {jgLaneKillTimeline.map((kill, index) => {
                            if (kill.victimId !== 0 && kill.killerId !== 0) {
                                return (
                                    <Typography key={`kill_${index}`}>{Math.round(kill.timestamp / 60000)}m - <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${participants.find(player => player.participantId === kill.killerId)?.riotIdGameName}/${participants.find(player => player.participantId === kill.killerId)?.riotIdTagline.toLowerCase()}`} style={{ color: participants.find(player => player.participantId === kill.killerId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>
                                        {participants.find(player => player.participantId === kill.killerId)?.riotIdGameName}</a>
                                        <img alt='Champion' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }}
                                            src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.killerId).championId)).id}.png`}>
                                        </img> killed <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${participants.find(player => player.participantId === kill.victimId)?.riotIdGameName}/${participants.find(player => player.participantId === kill.victimId)?.riotIdTagline.toLowerCase()}`} style={{ color: participants.find(player => player.participantId === kill.victimId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.victimId)?.riotIdGameName}</a>
                                        <img alt='Champion' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }}
                                            src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.victimId).championId)).id}.png`}>
                                        </img>
                                    </Typography>
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
                                    <Typography key={`kill_${index}`}>{Math.round(kill.timestamp / 60000)}m - <span style={{ fontWeight: 'bold', color: 'green' }}>Environment</span> killed <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${participants.find(player => player.participantId === kill.victimId)?.riotIdGameName}/${participants.find(player => player.participantId === kill.victimId)?.riotIdTagline.toLowerCase()}`} style={{ color: participants.find(player => player.participantId === kill.victimId).teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}>{participants.find(player => player.participantId === kill.victimId)?.riotIdGameName}</a><img alt='Victim' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px' }}
                                        src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participants.find(player => player.participantId === kill.victimId).championId)).id}.png`}></img></Typography>
                                )
                            }
                            return null;
                        })}
                    </div>
                </Grid>
                <Grid item style={{ display: 'inline-flex', justifyContent: 'center' }} xs={12} sm={6}>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -15] } }] } }} title={`${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName} #${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.JUNGLE.laneWinner.teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <img alt='' className='lanePhaseSummarySwords' src='/images/swords.svg'></img>
                    <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -15] } }] } }} title={`${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName} #${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdTagline}`}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdTagline.toLowerCase()}`}><img alt='Champion' style={{ border: statsAt15.laneResults.JUNGLE.laneLoser.teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='lanePhaseChampImgLarge' src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName}.png`}></img></a>
                        </div>
                    </Tooltip>
                    <img alt='Lane' className='hideMobile hideTablet' style={{ margin: '20px', maxWidth: '75px', maxHeight: '75px' }} src='/images/laneIcons/Jungle.png'></img>
                </Grid>
            </Grid>

            <Grid className={lastButtonPressedJg === 'laneSumJg3' ? 'LanePhaseSummaryDetailsActive' : 'LanePhaseSummaryDetailsInActive'} style={{ flexDirection: 'row', display: 'flex' }}>
                <Grid item xs={12}>
                    <p style={{ marginBottom: '15px' }}>
                        Graph of CS killed each minute by <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneWinner?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.JUNGLE.laneWinner.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName}</a><img alt='Champion' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${winnerChampName}.png`}></img> ({statsAt15.laneResults.JUNGLE.laneWinner.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneWinner.cs} CS) and <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName}/${statsAt15.laneResults.JUNGLE.laneLoser?.riotIdTagline.toLowerCase()}`} style={{ color: statsAt15.laneResults.JUNGLE.laneLoser.teamId === 100 ? '#0089D6' : '#FF1616', fontWeight: 'bold' }}> {statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName}</a><img alt='Champion' style={{ maxWidth: '20px', maxHeight: '20px', marginLeft: '5px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${props.dataDragonVersion}/img/champion/${loserChampName}.png`}></img> ({statsAt15.laneResults.JUNGLE.laneLoser.kdaAlt}, {statsAt15.laneResults.JUNGLE.laneLoser.cs} CS) during laning phase.
                    </p>
                    <div style={{ height: '300px', width: '100%' }}>
                        <LineChart
                            xAxis={[{ data: xAxisData, label: 'Minutes' }]}
                            yAxis={[{ label: 'Total CS' }]}
                            series={[
                                {
                                    data: yAxisDataWinner,
                                    color: statsAt15.laneResults.JUNGLE.laneWinner.teamId === 100 ? '#37B7FF' : '#FF3F3F',
                                    label: statsAt15.laneResults.JUNGLE.laneWinner?.riotIdGameName,
                                },
                                {
                                    data: yAxisDataLoser,
                                    color: statsAt15.laneResults.JUNGLE.laneLoser.teamId === 100 ? '#37B7FF' : '#FF3F3F',
                                    label: statsAt15.laneResults.JUNGLE.laneLoser?.riotIdGameName,
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

export default LanePhaseSummaryCardJg