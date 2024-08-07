import { Typography, Grid, Table, TableContainer, Paper, TableHead, TableBody, TableCell, TableRow, Tooltip } from '@mui/material'
import React from 'react'

const Battles = (props) => {

    const timelineData = props.timelineData;
    const gameData = props.gameData;
    const participants = gameData.info.participants;
    // console.log(timelineData)
    console.log(gameData)

    // Isolate teamfights from timeline
    const frames = timelineData.info.frames;
    let teamfights = [];
    let lastKillTime = null;
    let currBattle = [];

    let blueKills = 0;
    let redKills = 0;

    let blueDragonKills = 0;
    let blueBaronKills = 0;
    let blueHordeKills = 0;

    let redDragonKills = 0;
    let redBaronKills = 0;
    let redHordeKills = 0;

    let blueTowerKills = 0;
    let blueInhibKills = 0;
    let redTowerKills = 0;
    let redInhibKills = 0;

    let blueTotalTowersKilled = 0;
    let blueTotalDragons = 0;
    let blueTotalBarons = 0;
    let redTotalTowersKilled = 0;
    let redTotalDragons = 0;
    let redTotalBarons = 0;

    let blueTotalFightsWon = 0;
    let redTotalFightsWon = 0;

    for (const index in frames) {
        const frame = frames[index]
        for (const event in frame.events) {
            const currEvent = frame.events[event];
            if (currEvent.type === "CHAMPION_KILL" || currEvent.type === "ELITE_MONSTER_KILL" || currEvent.type === "BUILDING_KILL") {
                // console.log(currEvent)
                if (lastKillTime === null) {
                    lastKillTime = currEvent.timestamp;
                    currBattle.push(currEvent);
                }
                else if (currEvent.timestamp - lastKillTime <= 20000) { // if kill occurred in last 20 seconds, it's part of fight
                    lastKillTime = currEvent.timestamp;
                    currBattle.push(currEvent);
                }
                // Push fight to master array and empty variables
                else {
                    // Determine Timespan
                    let timespan = null;
                    if (lastKillTime === currBattle[0].timestamp) {
                        let seconds = Math.floor(lastKillTime / 1000);
                        let minutes = Math.floor(seconds / 60);
                        seconds = seconds % 60;
                        timespan = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    }
                    else {
                        let seconds1 = Math.floor(currBattle[0].timestamp / 1000);
                        let minutes1 = Math.floor(seconds1 / 60);
                        seconds1 = seconds1 % 60;

                        let seconds2 = Math.floor(lastKillTime / 1000);
                        let minutes2 = Math.floor(seconds2 / 60);
                        seconds2 = seconds2 % 60;

                        timespan = `${minutes1}:${seconds1.toString().padStart(2, '0')} to ${minutes2}:${seconds2.toString().padStart(2, '0')}`;
                    }

                    // Determine Details
                    let detailsStr = '';
                    currBattle.forEach((kill) => {
                        if (kill.type === 'CHAMPION_KILL') {
                            const victim = participants.find(victim => victim.participantId === kill.victimId)
                            if (victim.teamId === 100) {
                                redKills += 1;
                            }
                            if (victim.teamId === 200) {
                                blueKills += 1;
                            }
                            detailsStr += `${victim.riotIdGameName} (${victim.championName}) died. `;
                        }
                        else if (kill.type === 'BUILDING_KILL') {
                            let buildingName = null;
                            // console.log(kill)
                            if (kill.buildingType === 'TOWER_BUILDING') {
                                if (kill.teamId === 100) {
                                    buildingName = 'blue tower'
                                    redTowerKills += 1;
                                    redTotalTowersKilled += 1;
                                }
                                if (kill.teamId === 200) {
                                    buildingName = 'red tower'
                                    blueTowerKills += 1;
                                    blueTotalTowersKilled += 1;
                                }
                            }
                            if (kill.buildingType === 'INHIBITOR_BUILDING') {
                                if (kill.teamId === 100) {
                                    buildingName = 'blue inhibitor'
                                    redInhibKills += 1;
                                }
                                if (kill.teamId === 200) {
                                    buildingName = 'red inhibitor'
                                    blueInhibKills += 1;
                                }
                            }
                            detailsStr += `${buildingName} destroyed. `;
                        }
                        else {
                            if (kill.monsterSubType) {
                                if (kill.monsterType === 'DRAGON') {
                                    if (kill.killerTeamId === 100) {
                                        blueDragonKills += 1;
                                        blueTotalDragons += 1;
                                    }
                                    else {
                                        redDragonKills += 1;
                                        redTotalDragons += 1;
                                    }
                                }
                                detailsStr += `${kill.monsterSubType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'red team'}. `;
                            }
                            else {
                                if (kill.monsterType === 'BARON_NASHOR') {
                                    if (kill.killerTeamId === 100) {
                                        blueBaronKills += 1;
                                        blueTotalBarons += 1;
                                    }
                                    else {
                                        redBaronKills += 1;
                                        redTotalBarons += 1;
                                    }
                                }
                                if (kill.monsterType === 'HORDE') {
                                    if (kill.killerTeamId === 100) {
                                        blueHordeKills += 1;
                                    }
                                    else {
                                        redHordeKills += 1;
                                    }
                                }
                                detailsStr += `${kill.monsterType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'red team'}. `;
                            }
                        }

                    })

                    // Determine Outcome
                    let outcome = null;
                    if (blueKills > redKills) {
                        outcome = `Blue wins ${blueKills} - ${redKills}`;
                        blueTotalFightsWon += 1;
                    }
                    else if (redKills > blueKills) {
                        outcome = `Red wins ${redKills} - ${blueKills}`;
                        redTotalFightsWon += 1;
                    }
                    else {
                        outcome = `Even trade ${blueKills} - ${redKills}`;
                    }

                    const battlePayload = {
                        outcome: outcome,
                        timespan: timespan,
                        details: detailsStr,
                        blueObjectives: {
                            hordeKills: blueHordeKills,
                            dragonKills: blueDragonKills,
                            baronKills: blueBaronKills,
                            towerKills: blueTowerKills,
                            inhibKills: blueInhibKills,
                        },
                        redObjectives: {
                            hordeKills: redHordeKills,
                            dragonKills: redDragonKills,
                            baronKills: redBaronKills,
                            towerKills: redTowerKills,
                            inhibKills: redInhibKills,
                        }
                    }
                    teamfights.push(battlePayload);
                    lastKillTime = null;
                    currBattle = [];
                    blueKills = 0;
                    redKills = 0;
                    blueDragonKills = 0;
                    blueBaronKills = 0;
                    blueHordeKills = 0;
                    blueTowerKills = 0;
                    blueInhibKills = 0;
                    redDragonKills = 0;
                    redBaronKills = 0;
                    redHordeKills = 0;
                    redTowerKills = 0;
                    redInhibKills = 0;
                    currBattle.push(currEvent)
                }
            }
        }
    }

    // After processing all events, check if there's a remaining battle to push
    if (currBattle.length > 0) {
        // Determine Timespan
        let timespan = null;
        if (lastKillTime === currBattle[0].timestamp) {
            let seconds = Math.floor(lastKillTime / 1000);
            let minutes = Math.floor(seconds / 60);
            seconds = seconds % 60;
            timespan = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        else {
            let seconds1 = Math.floor(currBattle[0].timestamp / 1000);
            let minutes1 = Math.floor(seconds1 / 60);
            seconds1 = seconds1 % 60;

            let seconds2 = Math.floor(lastKillTime / 1000);
            let minutes2 = Math.floor(seconds2 / 60);
            seconds2 = seconds2 % 60;

            timespan = `${minutes1}:${seconds1.toString().padStart(2, '0')} to ${minutes2}:${seconds2.toString().padStart(2, '0')}`;
        }

        let detailsStr = '';
        currBattle.forEach((kill) => {
            if (kill.type === 'CHAMPION_KILL') {
                const victim = participants.find(victim => victim.participantId === kill.victimId)
                if (victim.teamId === 100) {
                    redKills += 1;
                }
                if (victim.teamId === 200) {
                    blueKills += 1;
                }
                detailsStr += `${victim.riotIdGameName} (${victim.championName}) died. `;
            }
            else if (kill.type === 'BUILDING_KILL') {
                let buildingName = null;
                // console.log(kill)
                if (kill.buildingType === 'TOWER_BUILDING') {
                    if (kill.teamId === 100) {
                        buildingName = 'blue tower'
                        redTowerKills += 1;
                        redTotalTowersKilled += 1;
                    }
                    if (kill.teamId === 200) {
                        buildingName = 'red tower'
                        blueTowerKills += 1;
                        blueTotalTowersKilled += 1;
                    }
                }
                if (kill.buildingType === 'INHIBITOR_BUILDING') {
                    if (kill.teamId === 100) {
                        buildingName = 'blue inhibitor'
                        redInhibKills += 1;
                    }
                    if (kill.teamId === 200) {
                        buildingName = 'red inhibitor'
                        blueInhibKills += 1;
                    }
                }
                detailsStr += `${buildingName} destroyed. `;
            }
            else {
                if (kill.monsterSubType) {
                    if (kill.monsterType === 'DRAGON') {
                        if (kill.killerTeamId === 100) {
                            blueDragonKills += 1;
                            blueTotalDragons += 1;
                        }
                        else {
                            redDragonKills += 1;
                            redTotalDragons += 1;
                        }
                    }
                    detailsStr += `${kill.monsterSubType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'red team'}. `;
                }
                else {
                    if (kill.monsterType === 'BARON_NASHOR') {
                        if (kill.killerTeamId === 100) {
                            blueBaronKills += 1;
                            blueTotalBarons += 1;
                        }
                        else {
                            redBaronKills += 1;
                            redTotalBarons += 1;
                        }
                    }
                    if (kill.monsterType === 'HORDE') {
                        if (kill.killerTeamId === 100) {
                            blueHordeKills += 1;
                        }
                        else {
                            redHordeKills += 1;
                        }
                    }
                    detailsStr += `${kill.monsterType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'red team'}. `;
                }
            }

        })

        // Determine Outcome
        let outcome = null;
        if (blueKills > redKills) {
            outcome = `Blue wins ${blueKills} - ${redKills}`;
            blueTotalFightsWon += 1;
        } else if (redKills > blueKills) {
            outcome = `Red wins ${redKills} - ${blueKills}`;
            redTotalFightsWon += 1;
        } else {
            outcome = `Even trade ${blueKills} - ${redKills}`;
        }

        const battlePayload = {
            outcome: outcome,
            timespan: timespan,
            details: detailsStr,
            blueObjectives: {
                hordeKills: blueHordeKills,
                dragonKills: blueDragonKills,
                baronKills: blueBaronKills,
                towerKills: blueTowerKills,
                inhibKills: blueInhibKills
            },
            redObjectives: {
                hordeKills: redHordeKills,
                dragonKills: redDragonKills,
                baronKills: redBaronKills,
                towerKills: redTowerKills,
                inhibKills: redInhibKills
            }
        }
        teamfights.push(battlePayload);
    }

    // console.log(teamfights)

    return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0' }}>
            <Grid container>
                <Grid style={{ paddingLeft: '55px' }} xs={6}>
                    <Typography fontSize={20} fontWeight={600}>Timeline</Typography>
                    <Typography marginBottom={'20px'}>Battles that occurred during the match</Typography>
                </Grid>
                <Grid style={{ textAlign: 'end', paddingRight: '60px' }} xs={6}>
                    <Typography style={{ marginTop: '4px' }} fontSize={16} fontWeight={600}>Fights Won:</Typography>
                    <Typography marginBottom={'20px'}><span style={{ color: '#3374FF', marginRight: '10px', fontWeight: 'bold' }}>{`Blue: ${blueTotalFightsWon} `}</span><span style={{ color: '#FF3F3F', fontWeight: 'bold' }}>{`Red: ${redTotalFightsWon}`}</span></Typography>
                </Grid>
                <TableContainer sx={{ maxWidth: '90%', backgroundColor: '#f2f2f2', margin: 'auto' }} component={Paper}>
                    <Table size='small' aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontSize: '16px', padding: '15px' }}><b>Outcome</b></TableCell>
                                <TableCell style={{ fontSize: '16px', padding: '10px' }}><b>Time</b></TableCell>
                                <TableCell style={{ fontSize: '16px', padding: '10px' }}><b>Details</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teamfights.map((fight, fightIndex) => (
                                <TableRow key={fightIndex}>
                                    <TableCell width={'150px'} style={{ color: fight.outcome[0] === 'E' ? '#404040' : fight.outcome[0] === 'B' ? '#3374FF' : '#FF3F3F' }}>
                                        <Typography style={{ fontWeight: 'bold' }}>{fight.outcome}</Typography>
                                        <div style={{ display: 'flex' }}>
                                            {fight.blueObjectives.hordeKills > 0 ? (
                                                <div>
                                                    {Array.from({ length: fight.blueObjectives.hordeKills }).map((_, index) => (
                                                        <Tooltip disableInteractive title='Blue team killed a void grub'>
                                                            <img key={index} width={'20px'} src='/images/objIcons/vilemaw-100.webp' alt={`Horde Kill ${index + 1}`} />
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div></div>
                                            )}
                                            {fight.blueObjectives.dragonKills > 0 ? (
                                                <div>
                                                    {Array.from({ length: fight.blueObjectives.dragonKills }).map((_, index) => (
                                                        <Tooltip disableInteractive title='Blue team killed a dragon'>
                                                            <img key={index} width={'20px'} src='/images/objIcons/dragon-100.webp' alt={`Dragon Kill ${index + 1}`} />
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div></div>
                                            )}
                                            {fight.blueObjectives.baronKills > 0 ? (
                                                <div>
                                                    {Array.from({ length: fight.blueObjectives.baronKills }).map((_, index) => (
                                                        <Tooltip disableInteractive title='Blue team killed baron'>
                                                            <img key={index} width={'20px'} src='/images/objIcons/baron-100.webp' alt={`Baron Kill ${index + 1}`} />
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div></div>
                                            )}
                                            <div>
                                                {fight.blueObjectives.towerKills > 0 ? (
                                                    <div>
                                                        {Array.from({ length: fight.blueObjectives.towerKills }).map((_, index) => (
                                                            <Tooltip disableInteractive title='Red tower destroyed'>
                                                                <img key={index} width={'20px'} src='/images/objIcons/tower-200.webp' alt={`Tower Kill ${index + 1}`} />
                                                            </Tooltip>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div></div>
                                                )}
                                                {fight.blueObjectives.inhibKills > 0 ? (
                                                    <div>
                                                        {Array.from({ length: fight.blueObjectives.inhibKills }).map((_, index) => (
                                                            <Tooltip disableInteractive title='Red inhibitor destroyed'>
                                                                <img key={index} width={'20px'} src='/images/objIcons/inhibitor-200.webp' alt={`Inhib Kill ${index + 1}`} />
                                                            </Tooltip>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div></div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            {fight.redObjectives.hordeKills > 0 ? (
                                                <div>
                                                    {Array.from({ length: fight.redObjectives.hordeKills }).map((_, index) => (
                                                        <Tooltip disableInteractive title='Red team killed a void grub'>
                                                            <img key={index} width={'20px'} src='/images/objIcons/vilemaw-200.webp' alt={`Horde Kill ${index + 1}`} />
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div></div>
                                            )}
                                            {fight.redObjectives.dragonKills > 0 ? (
                                                <div>
                                                    {Array.from({ length: fight.redObjectives.dragonKills }).map((_, index) => (
                                                        <Tooltip disableInteractive title='Red team killed a dragon'>
                                                            <img key={index} width={'20px'} src='/images/objIcons/dragon-200.webp' alt={`Dragon Kill ${index + 1}`} />
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div></div>
                                            )}
                                            {fight.redObjectives.baronKills > 0 ? (
                                                <div>
                                                    {Array.from({ length: fight.redObjectives.baronKills }).map((_, index) => (
                                                        <Tooltip disableInteractive title='Red team killed baron'>
                                                            <img key={index} width={'20px'} src='/images/objIcons/baron-200.webp' alt={`Baron Kill ${index + 1}`} />
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div></div>
                                            )}
                                            <div>
                                                {fight.redObjectives.towerKills > 0 ? (
                                                    <div>
                                                        {Array.from({ length: fight.redObjectives.towerKills }).map((_, index) => (
                                                            <Tooltip disableInteractive title='Blue tower destroyed'>
                                                                <img key={index} width={'20px'} src='/images/objIcons/tower-100.webp' alt={`Tower Kill ${index + 1}`} />
                                                            </Tooltip>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div></div>
                                                )}
                                                {fight.redObjectives.inhibKills > 0 ? (
                                                    <div>
                                                        {Array.from({ length: fight.redObjectives.inhibKills }).map((_, index) => (
                                                            <Tooltip disableInteractive title='Blue inhibitor destroyed'>
                                                                <img key={index} width={'20px'} src='/images/objIcons/inhibitor-100.webp' alt={`Inhib Kill ${index + 1}`} />
                                                            </Tooltip>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div></div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell width={'150px'}>{fight.timespan}</TableCell>
                                    <TableCell style={{ fontSize: '13px' }}>{fight.details}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </div>
    )
}

export default Battles