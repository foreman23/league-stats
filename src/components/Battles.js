import { Typography, Grid, Table, TableContainer, Paper, TableHead, TableBody, TableCell, TableRow, Tooltip, Button, Box, List, ListItem } from '@mui/material'
import React from 'react'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Battles = (props) => {

    const timelineData = props.timelineData;
    const gameData = props.gameData;
    const participants = gameData.info.participants;
    const champsJSON = props.champsJSON;
    const dataDragonVersion = props.dataDragonVersion;
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

    let blueFirstBlood = 0;
    let redFirstBlood = 0;

    let blueTotalTowersKilled = 0;
    let blueTotalDragons = 0;
    let blueTotalBarons = 0;
    let redTotalTowersKilled = 0;
    let redTotalDragons = 0;
    let redTotalBarons = 0;

    let blueTotalFightsWon = 0;
    let redTotalFightsWon = 0;

    console.log(frames)

    for (const index in frames) {
        const frame = frames[index]
        for (const event in frame.events) {
            const currEvent = frame.events[event];
            if (currEvent.type === "CHAMPION_KILL" || currEvent.type === "ELITE_MONSTER_KILL" || currEvent.type === "BUILDING_KILL" || currEvent.type === "CHAMPION_SPECIAL_KILL") {
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
                    let detailsArr = [];
                    currBattle.forEach((kill) => {
                        if (kill.type === 'CHAMPION_KILL') {
                            const victim = participants.find(victim => victim.participantId === kill.victimId)
                            const killer = participants.find(killer => killer.participantId === kill.killerId)
                            if (victim.teamId === 100) {
                                redKills += 1;
                            }
                            if (victim.teamId === 200) {
                                blueKills += 1;
                            }
                            let eventObj = {
                                eventType: 'CHAMPION_KILL',
                                position: kill.position,
                                timestamp: kill.timestamp,
                                victim: victim,
                                killer: killer
                            }
                            detailsArr.push(eventObj)
                            // detailsStr += `${victim.riotIdGameName} (${Object.values(champsJSON.data).find(champ => champ.key === String(victim.championId)).name}) died. `;
                        }
                        else if (kill.type === 'CHAMPION_SPECIAL_KILL') {
                            const killer = participants.find(killer => killer.participantId === kill.killerId)
                            if (kill.killType === 'KILL_FIRST_BLOOD') {
                                console.log(killer.teamId)
                                if (killer.teamId === 100) {
                                    blueFirstBlood = 1;
                                }
                                if (killer.teamId === 200) {
                                    redFirstBlood = 1;
                                }
                            }
                        }
                        else if (kill.type === 'BUILDING_KILL') {
                            let buildingName = null;
                            const killer = participants.find(killer => killer.participantId === kill.killerId)
                            let towerType = null;
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
                                towerType = kill.towerType;
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
                            let eventObj = {
                                redFirstBlood: redFirstBlood,
                                blueFirstBlood: blueFirstBlood,
                                eventType: 'BUILDING_DESTROY',
                                position: kill.position,
                                timestamp: kill.timestamp,
                                teamId: kill.teamId,
                                lane: kill.laneType,
                                buildingType: kill.buildingType,
                                towerType: towerType,
                                killer: killer
                            }
                            detailsArr.push(eventObj)
                            // detailsStr += `${buildingName} destroyed. `;
                        }
                        else {
                            const killer = participants.find(killer => killer.participantId === kill.killerId)
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
                                let eventObj = {
                                    eventType: 'MONSTER_KILL',
                                    position: kill.position,
                                    timestamp: kill.timestamp,
                                    teamId: kill.killerTeamId,
                                    killer: killer,
                                    monsterType: kill.monsterSubType,
                                }
                                detailsArr.push(eventObj)
                                // detailsStr += `${kill.monsterSubType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'red team'}. `;
                            }
                            else {
                                let monsterName = kill.monsterType
                                if (monsterName === 'BARON_NASHOR') {
                                    if (kill.killerTeamId === 100) {
                                        blueBaronKills += 1;
                                        blueTotalBarons += 1;
                                    }
                                    else {
                                        redBaronKills += 1;
                                        redTotalBarons += 1;
                                    }
                                }
                                if (monsterName === 'HORDE') {
                                    monsterName = 'VOID_GRUB'
                                    if (kill.killerTeamId === 100) {
                                        blueHordeKills += 1;
                                    }
                                    else {
                                        redHordeKills += 1;
                                    }
                                }
                                let eventObj = {
                                    eventType: 'MONSTER_KILL',
                                    position: kill.position,
                                    timestamp: kill.timestamp,
                                    teamId: kill.killerTeamId,
                                    killer: killer,
                                    monsterType: monsterName
                                }
                                detailsArr.push(eventObj)
                                // detailsStr += `${kill.monsterType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'red team'}. `;
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

                    // Find locations where events occurred
                    let locationCount = {
                        top: 0,
                        other: 0,
                        jg: 0,
                        mid: 0,
                        bot: 0,
                        blueBase: 0,
                        redBase: 0
                    }
                    for (let i = 0; i < detailsArr.length; i++) {
                        let currPos = detailsArr[i].position
                        let x = currPos.x;
                        let y = currPos.y;
                        // Top lane (x between 0 and 5000, y between 5000 and 16000, including the base area)
                        if (x >= 0 && x <= 5000 && y >= 5000 && y <= 16000) {
                            locationCount.top++; // Top lane
                        }

                        // Bot lane (x between 5000 and 16000, y between 0 and 5000, including the base area)
                        if (x >= 5000 && x <= 16000 && y >= 0 && y <= 5000) {
                            locationCount.bot++; // Bot lane
                        }

                        // Mid lane (x between 5000 and 10000, y between 5000 and 10000)
                        if ((x >= 6000 && x <= 9000) && (y >= 6000 && y <= 10000)) {
                            locationCount.mid++; // Mid lane
                        }

                        // Jungle (x and y between 4000 and 11000, excluding lanes and bases)
                        if (
                            ((x > 4000 && x < 12000) && (y > 5000 && y < 11000)) && // Central area
                            !((x >= 6800 && x <= 8500) && (y >= 6800 && y <= 9200)) && // Exclude mid lane
                            !(x >= 0 && x <= 5000 && y >= 5000 && y <= 16000) && // Exclude top lane
                            !(x >= 5000 && x <= 16000 && y >= 0 && y <= 5000) // Exclude bot lane
                        ) {
                            locationCount.jg++;
                        }

                        // Blue base (x < 5000, y < 5000)
                        if (x < 5000 && y < 5000) {
                            locationCount.blueBase++; // Blue base
                        }

                        // Red base (x > 11000, y > 11000)
                        if ((x > 11000 && y > 11000)) {
                            locationCount.redBase++; // Red base
                        }
                    }
                    let countArr = Object.values(locationCount)
                    let maxCount = Math.max(...countArr);

                    let location = Object.keys(locationCount).reduce((a, b) => locationCount[a] > locationCount[b] ? a : b, '');

                    if (maxCount === 0) {
                        location = 'jg'
                    }

                    // Map location keys to human-readable names
                    const locationNames = {
                        top: ' Top',
                        jg: ' Jungle',
                        mid: ' Mid',
                        bot: ' Bottom',
                        blueBase: ' Blue Base',
                        redBase: ' Red Base'
                    };

                    // Determine Battle Feats
                    let locationPayload = locationNames[location]
                    let battleSpecial = ''

                    let maxValue = -Infinity
                    let maxKey = null;
                    for (const key in locationCount) {
                        if (locationCount[key] > maxValue) {
                            maxValue = locationCount[key];
                            maxKey = key
                        }
                    }

                    //console.log(locationCount, outcome)
                    // If multiple fights in different locations
                    for (const key in locationCount) {
                        if (key === maxKey || locationCount[key] === 0) continue;
                        if (Math.abs(maxValue - locationCount[key]) < 1) {
                            if (locationCount['jg'] === locationCount[key]) {
                                if (key !== 'mid') {
                                    locationPayload = ' Jungle'
                                } else {
                                    locationPayload = ' Mid'
                                }
                            }
                            else {
                                battleSpecial = 'Global fighting';
                            }
                            break;
                        }
                    }

                    if (blueFirstBlood > 0 || redFirstBlood > 0) {
                        battleSpecial = `${blueFirstBlood > 0 ? 'Blue' : 'Red'} draws first blood`
                    }

                    if (blueHordeKills > 0 || redHordeKills > 0) {
                        battleSpecial = 'Fight for Void Grubs'
                    }
                    if ((blueDragonKills > 0 || redDragonKills > 0) && location === 'jg') {
                        locationPayload = ' bot Jungle'
                    }
                    if ((blueBaronKills > 0 || redBaronKills > 0) && location === 'jg') {
                        locationPayload = ' top Jungle'
                    }

                    // Set Battle Name
                    let battlePrefix = 'Battle in';
                    let battleLocation = locationPayload
                    if ((blueKills + redKills) <= 2) {
                        battlePrefix = 'Skirmish in'
                    }
                    if (blueTowerKills + blueInhibKills > 1 || redTowerKills + redInhibKills > 1 && battleLocation !== ' Jungle') {
                        if (blueTowerKills + blueInhibKills > redTowerKills + redInhibKills) {
                            battlePrefix = 'Blue push into'
                        }
                        if (blueTowerKills + blueInhibKills < redTowerKills + redInhibKills) {
                            battlePrefix = 'Red push into'
                        }
                        else if (blueTowerKills + blueInhibKills == redTowerKills + redInhibKills) {
                            battleSpecial = 'Mutual base destruction'
                        }
                    }

                    let battleName = null;
                    if (battleSpecial.length > 0) {
                        battleName = battleSpecial
                    }
                    else {
                        battleName = battlePrefix + battleLocation
                    }

                    const battlePayload = {
                        battleName: battleName,
                        outcome: outcome,
                        timespan: timespan,
                        details: detailsArr,
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
                    blueFirstBlood = 0;
                    redFirstBlood = 0;
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
        let detailsArr = [];
        currBattle.forEach((kill) => {
            if (kill.type === 'CHAMPION_KILL') {
                const victim = participants.find(victim => victim.participantId === kill.victimId)
                const killer = participants.find(killer => killer.participantId === kill.killerId)
                if (victim.teamId === 100) {
                    redKills += 1;
                }
                if (victim.teamId === 200) {
                    blueKills += 1;
                }
                let eventObj = {
                    eventType: 'CHAMPION_KILL',
                    position: kill.position,
                    timestamp: kill.timestamp,
                    victim: victim,
                    killer: killer
                }
                detailsArr.push(eventObj)
                // detailsStr += `${victim.riotIdGameName} (${Object.values(champsJSON.data).find(champ => champ.key === String(victim.championId)).name}) died. `;
            }
            else if (kill.type === 'BUILDING_KILL') {
                let buildingName = null;
                // console.log(kill)
                const killer = participants.find(killer => killer.participantId === kill.killerId)
                let towerType = null;
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
                    towerType = kill.towerType;
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
                let eventObj = {
                    eventType: 'BUILDING_DESTROY',
                    position: kill.position,
                    timestamp: kill.timestamp,
                    teamId: kill.teamId,
                    lane: kill.laneType,
                    buildingType: kill.buildingType,
                    towerType: towerType,
                    killer: killer
                }
                detailsArr.push(eventObj)
                // detailsStr += `${buildingName} destroyed. `;
            }
            else {
                const killer = participants.find(killer => killer.participantId === kill.killerId)
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
                    let eventObj = {
                        eventType: 'MONSTER_KILL',
                        position: kill.position,
                        timestamp: kill.timestamp,
                        teamId: kill.killerTeamId,
                        killer: killer,
                        monsterType: kill.monsterSubType,
                    }
                    detailsArr.push(eventObj)
                    // detailsStr += `${kill.monsterSubType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'red team'}. `;
                }
                else {
                    let monsterName = kill.monsterType
                    if (monsterName === 'BARON_NASHOR') {
                        if (kill.killerTeamId === 100) {
                            blueBaronKills += 1;
                            blueTotalBarons += 1;
                        }
                        else {
                            redBaronKills += 1;
                            redTotalBarons += 1;
                        }
                    }
                    if (monsterName === 'HORDE') {
                        monsterName = 'VOID_GRUB'
                        if (kill.killerTeamId === 100) {
                            blueHordeKills += 1;
                        }
                        else {
                            redHordeKills += 1;
                        }
                    }
                    let eventObj = {
                        eventType: 'MONSTER_KILL',
                        position: kill.position,
                        timestamp: kill.timestamp,
                        teamId: kill.killerTeamId,
                        killer: killer,
                        monsterType: monsterName
                    }
                    detailsArr.push(eventObj)
                    // detailsStr += `${kill.monsterType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'red team'}. `;
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

        // Determine Battle Name
        let battleName = 'PLACEHOLDER';

        const battlePayload = {
            battleName: battleName,
            outcome: outcome,
            timespan: timespan,
            details: detailsArr,
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

    console.log(teamfights)

    return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0' }}>
            <Grid container>
                <Grid xs={6}>
                    <div style={{ position: 'relative', width: '140px' }}>
                        <Typography fontSize={20} fontWeight={600}>Battles</Typography>
                        <Typography style={{ position: 'absolute', top: '0px', right: '0px', left: 'auto' }}><span style={{ backgroundColor: 'purple', color: 'white', padding: '10px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', filter: 'drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.25))' }}>BETA*</span></Typography>
                    </div>
                    <Typography style={{ fontSize: '14px', marginTop: '12px', marginBottom: '7px', color: 'rgb(133, 133, 133)' }}>*Information presented below may not be 100% accurate!</Typography>
                    <Typography style={{ fontSize: '20px', color: 'rgb(75, 75, 75)' }} marginBottom={'20px'}>Fights that occurred during the match</Typography>
                </Grid>
                <Grid style={{ textAlign: 'end' }} xs={6}>
                    {/* <Typography style={{ marginTop: '4px' }} fontSize={16} fontWeight={600}>Fights Won:</Typography>
                    <Typography marginBottom={'20px'}><span style={{ color: '#3374FF', marginRight: '10px', fontWeight: 'bold' }}>{`Blue: ${blueTotalFightsWon} `}</span><span style={{ color: '#FF3F3F', fontWeight: 'bold' }}>{`Red: ${redTotalFightsWon}`}</span></Typography> */}
                    <Button variant='contained' style={{ textTransform: 'none', color: 'white', backgroundColor: '#8B8B8B', marginTop: '15px' }}>Collapse All</Button>
                </Grid>

                {teamfights.map((fight, fightIndex) => (
                    <Box style={{ width: '100%', border: '0px solid black' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: '#EDEDED', padding: '20px' }}>
                            <div style={{ marginRight: '45px' }}><Typography style={{ color: fight.outcome[0] === 'E' ? '#404040' : fight.outcome[0] === 'B' ? '#3374FF' : '#FF3F3F', fontWeight: 'bold', fontSize: '20px' }}>{fight.outcome}</Typography></div>
                            <div style={{ marginRight: '75px' }}><Typography style={{ color: '#4B4B4B', fontWeight: 'bold', fontSize: '16px' }}>{`(${fight.timespan})`}</Typography></div>
                            <div><Typography style={{ color: '#000000', fontWeight: 'bold', fontSize: '16px' }}>{fight.battleName}</Typography></div>
                            <ArrowDropDownIcon style={{ marginRight: '0px', marginLeft: 'auto' }}></ArrowDropDownIcon>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ paddingTop: '0px', width: '35%', marginRight: '100px' }} >
                                <Typography marginTop={'30px'} marginLeft={'20px'} fontSize={'14px'}>Red team secured first blood and got 3 kills in the top lane to start off the game while they only gave 1 death.</Typography>
                                <img style={{ width: '32px', marginTop: '20px', marginLeft: '15px' }} src='/images/objIcons/tower-100.webp'></img>
                            </div>
                            <div style={{ paddingTop: '0px', padding: '0px', width: '65%' }}>
                                <ul style={{ display: 'flex', flexDirection: 'column', padding: '0px' }}>
                                    {fight.details.map((details, detailsIndex) => (
                                        <li key={detailsIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Typography style={{ fontSize: '14px', marginRight: '10px' }}>
                                                    {String(Math.floor(details.timestamp / 60000)).padStart(2, '0')}:
                                                    {String(Math.floor((details.timestamp % 60000) / 1000)).padStart(2, '0')}
                                                </Typography>
                                                {details.eventType === 'CHAMPION_KILL' && (
                                                    <>
                                                        {details.killer?.championId ? (
                                                            <img
                                                                style={{
                                                                    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                                                                    borderRadius: '50%',
                                                                    width: '28px',
                                                                    border: details.killer.teamId === 100
                                                                        ? '3px #568CFF solid'
                                                                        : '3px #FF3A54 solid',
                                                                }}
                                                                src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(
                                                                    champ => champ.key === String(details.killer?.championId)
                                                                )?.id}.png`}
                                                                alt="Killer Champion"
                                                            />
                                                        ) : (
                                                            <img
                                                                style={{
                                                                    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                                                                    borderRadius: '50%',
                                                                    width: '28px',
                                                                    border: details.victim.teamId === 200
                                                                        ? '3px #568CFF solid'
                                                                        : '3px #FF3A54 solid',
                                                                }}
                                                                src={`/images/monsterIcons/${details.victim.teamId === 200 ? 'blue' : 'red'}Minion.webp`}
                                                                alt="Minion"
                                                            />
                                                        )}
                                                        <img style={{ width: '20px', opacity: '65%' }} src='/images/swords.svg'></img>
                                                        <img
                                                            style={{
                                                                filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                                                                borderRadius: '50%',
                                                                width: '28px',
                                                                border: details.victim.teamId === 100
                                                                    ? '3px #568CFF solid'
                                                                    : '3px #FF3A54 solid',
                                                            }}
                                                            src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(
                                                                champ => champ.key === String(details.victim?.championId)
                                                            )?.id}.png`}
                                                            alt="Killer Champion"
                                                        />
                                                        {details.killer?.riotIdGameName ? (
                                                            <Typography style={{ fontSize: '14px', marginLeft: '10px' }}>
                                                                {<><a href={`/profile/${gameData.info.platformId.toLowerCase()}/${details.killer?.riotIdGameName}/${details.killer?.riotIdTagline.toLowerCase()}`} style={{ color: details.killer.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold', textDecoration: 'none' }}>{details.killer?.riotIdGameName || 'Minion'}</a> killed <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${details.victim?.riotIdGameName}/${details.victim?.riotIdTagline.toLowerCase()}`} style={{ color: details.victim.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold', textDecoration: 'none' }}>{details.victim?.riotIdGameName}</a></>}
                                                            </Typography>
                                                        ) : (
                                                            <Typography style={{ fontSize: '14px', marginLeft: '10px' }}>
                                                                {<><span style={{ color: details.victim.teamId === 200 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.killer?.riotIdGameName || 'Minion'}</span> killed <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${details.victim?.riotIdGameName}/${details.victim?.riotIdTagline.toLowerCase()}`} style={{ color: details.victim.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold', textDecoration: 'none' }}>{details.victim?.riotIdGameName}</a></>}
                                                            </Typography>
                                                        )}
                                                    </>
                                                )}

                                                {details.eventType === 'BUILDING_DESTROY' && (
                                                    <>
                                                        {details.killer?.championId ? (
                                                            <img
                                                                style={{
                                                                    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                                                                    borderRadius: '50%',
                                                                    width: '28px',
                                                                    border: details.teamId === 200
                                                                        ? '3px #568CFF solid'
                                                                        : '3px #FF3A54 solid',
                                                                }}
                                                                src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(
                                                                    champ => champ.key === String(details.killer?.championId)
                                                                )?.id}.png`}
                                                                alt="Killer Champion"
                                                            />
                                                        ) : (
                                                            <img
                                                                style={{
                                                                    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                                                                    borderRadius: '50%',
                                                                    width: '28px',
                                                                    border: details.teamId === 200
                                                                        ? '3px #568CFF solid'
                                                                        : '3px #FF3A54 solid',
                                                                }}
                                                                src={`/images/monsterIcons/${details.teamId === 200 ? 'blue' : 'red'}Minion.webp`}
                                                                alt="Minion"
                                                            />
                                                        )}
                                                        <img style={{ width: '20px', opacity: '45%' }} src='/images/hammer.svg' alt="Swords" />
                                                        <img
                                                            style={{
                                                                filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                                                                width: '28px',
                                                                border: '3px solid #E5E5E5',
                                                            }}
                                                            src={`/images/monsterIcons/${details.buildingType === 'TOWER_BUILDING' ? 'turret' : 'inhibitor'}_${details.teamId === 100 ? 'blue' : 'red'
                                                                }_square.webp`}
                                                            alt={details.buildingType === 'TOWER_BUILDING' ? 'Tower' : 'Inhibitor'}
                                                        />
                                                        {details.killer?.riotIdGameName ? (
                                                            <Typography style={{ fontSize: '14px', marginLeft: '10px' }}>
                                                                {<><a href={`/profile/${gameData.info.platformId.toLowerCase()}/${details.killer?.riotIdGameName}/${details.killer?.riotIdTagline.toLowerCase()}`} style={{ color: details.teamId === 200 ? '#568CFF' : '#FF3A54', fontWeight: 'bold', textDecoration: 'none' }}>{details.killer?.riotIdGameName || 'Minions'}</a> destroyed <span style={{ color: details.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.buildingType === 'TOWER_BUILDING' ? 'a tower' : 'an inhibitor'}</span></>}
                                                            </Typography>
                                                        ) : (
                                                            <Typography style={{ fontSize: '14px', marginLeft: '10px' }}>
                                                                {<><span style={{ color: details.teamId === 200 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.killer?.riotIdGameName || 'Minions'}</span> destroyed <span style={{ color: details.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.buildingType === 'TOWER_BUILDING' ? 'a tower' : 'an inhibitor'}</span></>}
                                                            </Typography>
                                                        )}

                                                    </>
                                                )}

                                                {details.eventType === 'MONSTER_KILL' && (
                                                    <>
                                                        {details.killer?.championId ? (
                                                            <img
                                                                style={{
                                                                    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                                                                    borderRadius: '50%',
                                                                    width: '28px',
                                                                    border: details.killer.teamId === 100
                                                                        ? '3px #568CFF solid'
                                                                        : '3px #FF3A54 solid',
                                                                }}
                                                                src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(
                                                                    champ => champ.key === String(details.killer?.championId)
                                                                )?.id}.png`}
                                                                alt="Killer Champion"
                                                            />
                                                        ) : (
                                                            <img
                                                                style={{
                                                                    filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                                                                    borderRadius: '50%',
                                                                    width: '28px',
                                                                    border: '3px black solid'
                                                                }}
                                                                src={`/images/monsterIcons/neutralMinion.webp`}
                                                                alt="Minion"
                                                            />
                                                        )}
                                                        <img style={{ width: '20px', opacity: '65%', transform: 'rotate(25deg)' }} src='/images/bow.svg' alt="Swords" />
                                                        <img
                                                            style={{
                                                                filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                                                                borderRadius: '50%',
                                                                width: '28px',
                                                                border: '3px solid #EF00D3',
                                                            }}
                                                            src={`/images/monsterIcons/${details.monsterType}.webp`}
                                                            alt={details.monsterType}
                                                        />
                                                        {details.killer?.riotIdGameName ? (
                                                            <Typography style={{ fontSize: '14px', marginLeft: '10px' }}>
                                                                {<><a href={`/profile/${gameData.info.platformId.toLowerCase()}/${details.killer?.riotIdGameName}/${details.killer?.riotIdTagline.toLowerCase()}`} style={{ color: details.killer.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold', textDecoration: 'none' }}>{details.killer?.riotIdGameName || 'Minion'}</a> killed <span style={{ color: '#EF00D3', fontWeight: 'bold' }}>{details.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</span></>}
                                                            </Typography>
                                                        ) : (
                                                            <Typography style={{ fontSize: '14px', marginLeft: '10px' }}>
                                                                {<><span style={{ color: 'black', fontWeight: 'bold', textDecoration: 'none' }}>{details.killer?.riotIdGameName || 'Minion'}</span> killed <span style={{ color: '#EF00D3', fontWeight: 'bold' }}>{details.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</span></>}
                                                            </Typography>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </Box>
                ))}
            </Grid>
        </div>
    )
}

export default Battles