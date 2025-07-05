import { Typography, Grid, Tooltip, Box } from '@mui/material'
import React from 'react'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import TeamGoldDifGraph from './TeamGoldDifGraph';

const Battles = (props) => {

    const timelineData = props.timelineData;
    const gameData = props.gameData;
    const participants = gameData.info.participants;
    const champsJSON = props.champsJSON;
    const dataDragonVersion = props.dataDragonVersion;
    // console.log(timelineData)

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
    let blueHeraldKills = 0;
    let redDragonKills = 0;
    let redBaronKills = 0;
    let redHordeKills = 0;
    let redHeraldKills = 0;
    let blueTowerKills = 0;
    let blueInhibKills = 0;
    let redTowerKills = 0;
    let redInhibKills = 0;
    let blueFirstBlood = 0;
    let redFirstBlood = 0;
    // let blueTotalFightsWon = 0;
    // let redTotalFightsWon = 0;

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
                    let detailsArr = [];
                    for (let i = 0; i < currBattle.length; i++) {
                        let kill = currBattle[i]
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
                                if (killer.teamId === 100) {
                                    blueFirstBlood = 1;
                                }
                                if (killer.teamId === 200) {
                                    redFirstBlood = 1;
                                }
                            }
                        }
                        else if (kill.type === 'BUILDING_KILL') {
                            const killer = participants.find(killer => killer.participantId === kill.killerId)
                            let towerType = null;
                            if (kill.buildingType === 'TOWER_BUILDING') {
                                if (kill.teamId === 100) {
                                    redTowerKills += 1;
                                }
                                if (kill.teamId === 200) {
                                    blueTowerKills += 1;
                                }
                                towerType = kill.towerType;
                            }
                            if (kill.buildingType === 'INHIBITOR_BUILDING') {
                                if (kill.teamId === 100) {
                                    redInhibKills += 1;
                                }
                                if (kill.teamId === 200) {
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
                        }
                        else {
                            const killer = participants.find(killer => killer.participantId === kill.killerId)
                            if (kill.monsterSubType) {
                                if (kill.monsterType === 'DRAGON') {
                                    if (kill.killerTeamId === 100) {
                                        blueDragonKills += 1;
                                    }
                                    else {
                                        redDragonKills += 1;
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
                                    }
                                    else {
                                        redBaronKills += 1;
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
                                if (kill.monsterType === 'RIFTHERALD') {
                                    if (kill.killerTeamId === 100) {
                                        blueHeraldKills += 1;
                                    }
                                    else {
                                        redHeraldKills += 1;
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
                    }

                    // Determine Outcome
                    let outcome = null;
                    if (blueKills > redKills) {
                        outcome = `Blue wins ${blueKills} - ${redKills}`;
                        // blueTotalFightsWon += 1;
                    }
                    else if (redKills > blueKills) {
                        outcome = `Red wins ${redKills} - ${blueKills}`;
                        // redTotalFightsWon += 1;
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
                        battleSpecial = `${blueFirstBlood > 0 ? 'Blue' : 'Red'} draws first blood in ${locationNames[location]}`
                    }

                    if ((blueHordeKills > 0 || redHordeKills > 0) && (blueDragonKills === 0 && blueBaronKills === 0 && redDragonKills === 0 && redDragonKills === 0)) {
                        if (location !== 'jg') {
                            battleSpecial = 'Global fighting'
                        }
                        if ((blueKills + redKills > 0) || (blueHordeKills > 0 && redHordeKills > 0)) {
                            battleSpecial = 'Battle for Void Grubs'
                        } else {
                            battleSpecial = `${blueHordeKills > 0 ? 'Blue secures void grubs' : 'Red secures void grubs'}`
                        }
                    }
                    if ((blueHeraldKills > 0 || redHeraldKills > 0) && (blueDragonKills === 0 && blueBaronKills === 0 && redDragonKills === 0 && redDragonKills === 0)) {
                        if (location !== 'jg') {
                            battleSpecial = 'Global fighting'
                        }
                        if ((blueKills + redKills > 0) || (blueHeraldKills > 0 && redHeraldKills > 0)) {
                            battleSpecial = 'Battle for herald'
                        } else {
                            battleSpecial = `${blueHeraldKills > 0 ? 'Blue secures herald' : 'Red secures herald'}`
                        }
                    }
                    if ((blueDragonKills > 0 || redDragonKills > 0)) {
                        if ((blueKills + redKills > 0) || (blueDragonKills > 0 && redDragonKills > 0)) {
                            battleSpecial = 'Battle for dragon'
                        } else {
                            battleSpecial = `${blueDragonKills > 0 ? 'Blue secures a dragon' : 'Red secures a dragon'}`
                        }
                    }
                    if ((blueBaronKills > 0 || redBaronKills > 0)) {
                        if ((blueKills + redKills > 0) || (blueBaronKills > 0 && redBaronKills > 0)) {
                            battleSpecial = 'Battle for baron'
                        } else {
                            battleSpecial = `${blueBaronKills > 0 ? 'Blue secures baron' : 'Red secures baron'}`
                        }
                    }

                    // Set Battle Name
                    let battlePrefix = 'Fight in';
                    let battleLocation = locationPayload
                    if ((blueKills + redKills) <= 2) {
                        battlePrefix = 'Skirmish in'
                    }
                    if ((blueKills >= 5 && redKills <= 1) || (redKills >= 5 && blueKills <= 1)) {
                        battlePrefix = 'Slaughter in'
                    }

                    // No kills, only objectives
                    if (blueKills + redKills === 0 && (blueBaronKills > 0 || blueDragonKills > 0) && (redBaronKills === 0 && redDragonKills === 0)) {
                        battleSpecial = 'Blue secures jungle objectives'
                    }
                    if (blueKills + redKills === 0 && (redBaronKills > 0 || redDragonKills > 0) && (blueBaronKills === 0 && blueDragonKills === 0)) {
                        battleSpecial = 'Red secures jungle objectives'
                    }
                    if (blueKills + redKills === 0 && (redBaronKills > 0 || redDragonKills > 0 || redHordeKills > 0) && (blueBaronKills > 0 || blueDragonKills > 0 || blueHordeKills > 0)) {
                        battleSpecial = 'Both teams secure jungle objectives'
                    }

                    // Building destruction outweighs kills
                    else if (((blueTowerKills + blueInhibKills) >= (blueKills + redKills) && (blueTowerKills + blueInhibKills) >= 3) || (blueTowerKills + blueInhibKills) >= 5) {
                        battleSpecial = 'Blue demolishes red base'
                    }
                    else if (((redTowerKills + redInhibKills) >= (blueKills + redKills) && (redTowerKills + redInhibKills) >= 3) || (redTowerKills + redInhibKills) >= 5) {
                        battleSpecial = 'Red demolishes blue base'
                    }

                    // Push into
                    if ((blueTowerKills + blueInhibKills > 1 || redTowerKills + redInhibKills > 1) && battleLocation !== ' Jungle') {
                        if (blueTowerKills + blueInhibKills > redTowerKills + redInhibKills) {
                            battlePrefix = 'Blue push into'
                        }
                        if (blueTowerKills + blueInhibKills < redTowerKills + redInhibKills) {
                            battlePrefix = 'Red push into'
                        }
                        else if (((blueTowerKills + blueInhibKills) - (redTowerKills + redInhibKills) >= 0 && (blueTowerKills + blueInhibKills) - (redTowerKills + redInhibKills) <= 1) || ((redTowerKills + redInhibKills) - (blueTowerKills + blueInhibKills) >= 0 && (redTowerKills + redInhibKills) - (blueTowerKills + blueInhibKills) <= 1)) {
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

                    // Determine description string for battle
                    let battleDesc = ''

                    // First blood
                    let fbFlag = '';
                    if (battleName.includes('Blue draws first blood') || battleName.includes('Red draws first blood')) {
                        let fbIndex = 0
                        if (battleName[0] === 'B') {
                            for (let i = 0; i < detailsArr.length; i++) {
                                if (detailsArr[i].eventType !== 'CHAMPION_KILL') {
                                    fbIndex++;
                                }
                                else {
                                    break;
                                }
                            }
                            battleDesc = `Blue team drew first blood when ${detailsArr[fbIndex]?.killer?.championName || 'a minion'} (${detailsArr[fbIndex]?.killer?.riotIdGameName || 'minion'}) killed ${detailsArr[fbIndex]?.victim?.championName} (${detailsArr[fbIndex]?.victim?.riotIdGameName}) in${battleLocation}.`
                            fbFlag = 'blue';
                        } else if (battleName[0] === 'R') {
                            for (let i = 0; i < detailsArr.length; i++) {
                                if (detailsArr[i].eventType !== 'CHAMPION_KILL') {
                                    fbIndex++;
                                }
                                else {
                                    break;
                                }
                            }
                            battleDesc = `Red team drew first blood when ${detailsArr[0]?.killer?.championName || 'a minion'} (${detailsArr[0]?.killer?.riotIdGameName || 'minion'}) killed ${detailsArr[0]?.victim?.championName} (${detailsArr[0]?.victim?.riotIdGameName}) in${battleLocation}.`
                            fbFlag = 'red';
                        }
                    }

                    // Fight for jungle objectives
                    if (battleName === 'Blue secures void grubs' || battleName === 'Red secures void grubs') {
                        if (battleName[0] === 'B') {
                            battleDesc = `Blue team was able to kill ${blueHordeKills} void grubs without conflict.`
                        }
                        if (battleName[0] === 'R') {
                            battleDesc = `Red team was able to kill ${redHordeKills} void grubs without conflict.`
                        }
                    }

                    if (battleName === 'Battle for dragon') {
                        let dragonEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("DRAGON"))
                        battleDesc = `The ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} was slain by ${dragonEvent?.killer?.championName || 'a minion'} (${dragonEvent?.killer?.riotIdGameName || 'a minion'}) for the ${dragonEvent?.teamId === 100 ? 'blue' : 'red'} team.`
                    }

                    if (battleName === 'Red secures jungle objectives' || battleName === 'Blue secures jungle objectives') {
                        battleDesc = `${battleName[0] === 'B' ? 'Blue team' : 'Red team'} killed jungle monsters.`
                    }

                    if (battleName === 'Battle for baron') {
                        let baronEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("BARON_NASHOR"))
                        battleDesc = `Baron was slain by ${baronEvent.killer?.championName || 'a minion'} (${baronEvent.killer?.riotIdGameName || 'a minion'}) for the ${baronEvent.teamId === 100 ? 'blue' : 'red'} team.`
                    }

                    if (battleName === 'Battle for herald') {
                        let heraldEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("HERALD"))
                        battleDesc = `The riftherald was slain by ${heraldEvent.killer?.championName || 'a minion'} (${heraldEvent.killer?.riotIdGameName || 'a minion'}) for the ${heraldEvent.teamId === 100 ? 'blue' : 'red'} team.`
                    }

                    // Grub Kills
                    if ((blueHordeKills > 0 || redHordeKills > 0) && (battleName !== 'Blue secures void grubs' || battleName === 'Red secures void grubs')) {
                        if (blueHordeKills > 0) {
                            if (battleDesc.length > 0 && battleName !== 'Blue secures void grubs') {
                                battleDesc += ` Meanwhile, blue team secured ${blueHordeKills} void grubs.`
                            }
                            else {
                                battleDesc = `Blue team secured ${blueHordeKills} void grubs.`
                            }
                        }
                        else if (redHordeKills > 0) {
                            if (battleDesc.length > 0 && battleName !== 'Red secures void grubs') {
                                battleDesc += ` Meanwhile, red team secured ${redHordeKills} void grubs.`
                            }
                            else {
                                battleDesc = `Red team secured ${redHordeKills} void grubs.`
                            }
                        }
                    }

                    // Dragon Kills
                    if ((blueDragonKills > 0 || redDragonKills > 0) && (battleName !== 'Battle for dragon')) {
                        let dragonEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("DRAGON"))
                        if (blueDragonKills > 0) {
                            if (battleDesc.length > 0 && battleName !== 'Blue slayed a dragon') {
                                battleDesc += ` Meanwhile, blue team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                            }
                            else {
                                battleDesc = `Blue team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                            }
                        }
                        else if (redDragonKills > 0) {
                            if (battleDesc.length > 0 && battleName !== 'Red slayed a dragon') {
                                battleDesc += ` Meanwhile, red team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                            }
                            else {
                                battleDesc = `Red team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                            }
                        }
                    }

                    // Herald Kills
                    if ((blueHeraldKills > 0 || redHeraldKills > 0) && (battleName !== 'Battle for herald')) {
                        let heraldEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("RIFTHERALD"))
                        if (blueHeraldKills > 0) {
                            if (battleDesc.length > 0 && battleName !== 'Blue slayed a dragon') {
                                battleDesc += ` Meanwhile, blue team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                            }
                            else {
                                battleDesc = `Blue team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                            }
                        }
                        else if (redHeraldKills > 0) {
                            if (battleDesc.length > 0 && battleName !== 'Red slayed a dragon') {
                                battleDesc += ` Meanwhile, red team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                            }
                            else {
                                battleDesc = `Red team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                            }
                        }
                    }

                    // Tower destruction
                    if (blueTowerKills > 0 || redTowerKills > 0) {
                        if (blueTowerKills > 0) {
                            if (battleDesc.length > 0 && !battleDesc.includes('tower')) {
                                battleDesc += ` Meanwhile, blue team was able to destroy ${blueTowerKills} tower${blueTowerKills > 1 ? 's' : ''}.`
                            } else {
                                battleDesc = `Blue team destroyed ${blueTowerKills} tower${blueTowerKills > 1 ? 's' : ''}.`
                            }
                        }
                        if (redTowerKills > 0) {
                            if (battleDesc.length > 0 && !battleDesc.includes('tower')) {
                                battleDesc += ` Meanwhile, red team was able to destroy ${redTowerKills} tower${redTowerKills > 1 ? 's' : ''}.`
                            } else {
                                battleDesc = `Red team destroyed ${redTowerKills} tower${redTowerKills > 1 ? 's' : ''}.`
                            }
                        }
                    }

                    // Inhib destruction
                    if (blueInhibKills > 0 || redInhibKills > 0) {
                        if (blueInhibKills > 0) {
                            if (battleDesc.length > 0 && !battleDesc.includes('inhib')) {
                                battleDesc += ` At the same time, blue team was able to take down ${blueInhibKills} inhib${blueInhibKills > 1 ? 's' : ''}.`
                            } else {
                                battleDesc = `Blue team destroyed ${blueInhibKills} inhib${blueInhibKills > 1 ? 's' : ''}.`
                            }
                        }
                        if (redInhibKills > 0) {
                            if (battleDesc.length > 0 && !battleDesc.includes('inhib')) {
                                battleDesc += ` At the same time, red team was able to take down ${redInhibKills} inhib${redInhibKills > 1 ? 's' : ''}.`
                            } else {
                                battleDesc = `Red team destroyed ${redInhibKills} inhib${redInhibKills > 1 ? 's' : ''}.`
                            }
                        }
                    }

                    // Additional kills
                    let descKillsStr = ''
                    let evenTrade = false;
                    if ((blueKills === redKills) && (blueKills + redKills) > 0) {
                        descKillsStr += `The fight in ${battleLocation} was an even trade, with both sides getting ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                        evenTrade = true;
                    }
                    if (blueKills > 0 || redKills > 0) {
                        if (blueKills > 0 && fbFlag !== 'blue') {
                            if (fbFlag === 'red' && outcome[0] === 'B') {
                                descKillsStr += `Despite of that, blue team was able to win the fight, securing ${blueKills} kills while only losing ${redKills}.`
                            } else if (evenTrade === false) {
                                if (battleDesc.length > 0) {
                                    descKillsStr = `During the fight, blue team ${battleDesc.toLowerCase().includes('blue') ? 'also' : ''} got ${blueKills} kill${blueKills > 1 ? 's' : ''}.`
                                    if (redKills > 0) {
                                        descKillsStr = `During the fight, blue team ${battleDesc.toLowerCase().includes('blue') ? 'also' : ''} got ${blueKills} kill${blueKills > 1 ? 's' : ''}, while red team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                                    }
                                }
                                else {
                                    descKillsStr = `During a ${battlePrefix} ${battleLocation}, blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                                    if (redKills > 0) {
                                        descKillsStr = `During a ${battlePrefix} ${battleLocation}, blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}, while red team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                                    }
                                }
                            }
                        }
                        else if (redKills > 0 && fbFlag !== 'red') {
                            if (fbFlag === 'red' && outcome[0] === 'B') {
                                descKillsStr += `Despite of that, red team was able to win the fight, securing ${redKills} kills while only losing ${blueKills}.`
                            } else if (evenTrade === false) {
                                if (battleDesc.length > 0) {
                                    descKillsStr = `During the fight, red team ${battleDesc.toLowerCase().includes('red') ? 'also' : ''} got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                                    if (blueKills > 0) {
                                        descKillsStr = `During the fight, red team ${battleDesc.toLowerCase().includes('red') ? 'also' : ''} got ${redKills} kill${redKills > 1 ? 's' : ''}, while blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                                    }
                                }
                                else {
                                    descKillsStr = `During a ${battlePrefix} ${battleLocation}, red team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                                    if (blueKills > 0) {
                                        descKillsStr = `During a ${battlePrefix} ${battleLocation}, red team got ${redKills} kill${redKills > 1 ? 's' : ''}, while blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                                    }
                                }
                            }
                        }
                    }

                    // Assemble final description str
                    battleDesc = battleDesc + ' ' + descKillsStr

                    const battlePayload = {
                        battleName: battleName,
                        battleDesc: battleDesc,
                        battleLocation: battleLocation,
                        blueKills: blueKills,
                        redKills: redKills,
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
                    blueHeraldKills = 0;
                    blueTowerKills = 0;
                    blueInhibKills = 0;
                    redDragonKills = 0;
                    redBaronKills = 0;
                    redHordeKills = 0;
                    redHeraldKills = 0;
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
                    if (killer.teamId === 100) {
                        blueFirstBlood = 1;
                    }
                    if (killer.teamId === 200) {
                        redFirstBlood = 1;
                    }
                }
            }
            else if (kill.type === 'BUILDING_KILL') {
                const killer = participants.find(killer => killer.participantId === kill.killerId)
                let towerType = null;
                if (kill.buildingType === 'TOWER_BUILDING') {
                    if (kill.teamId === 100) {
                        redTowerKills += 1;
                    }
                    if (kill.teamId === 200) {
                        blueTowerKills += 1;
                    }
                    towerType = kill.towerType;
                }
                if (kill.buildingType === 'INHIBITOR_BUILDING') {
                    if (kill.teamId === 100) {
                        redInhibKills += 1;
                    }
                    if (kill.teamId === 200) {
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
            }
            else {
                const killer = participants.find(killer => killer.participantId === kill.killerId)
                if (kill.monsterSubType) {
                    if (kill.monsterType === 'DRAGON') {
                        if (kill.killerTeamId === 100) {
                            blueDragonKills += 1;
                        }
                        else {
                            redDragonKills += 1;
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
                        }
                        else {
                            redBaronKills += 1;
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
                    if (kill.monsterType === 'RIFTHERALD') {
                        if (kill.killerTeamId === 100) {
                            blueHeraldKills += 1;
                        }
                        else {
                            redHeraldKills += 1;
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
            // blueTotalFightsWon += 1;
        } else if (redKills > blueKills) {
            outcome = `Red wins ${redKills} - ${blueKills}`;
            // redTotalFightsWon += 1;
        } else {
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

        if ((blueHordeKills > 0 || redHordeKills > 0) && (blueDragonKills === 0 && blueBaronKills === 0 && redDragonKills === 0 && redDragonKills === 0)) {
            if (location !== 'jg') {
                battleSpecial = 'Global fighting'
            }
            if ((blueKills + redKills > 0) || (blueHordeKills > 0 && redHordeKills > 0)) {
                battleSpecial = 'Battle for Void Grubs'
            } else {
                battleSpecial = `${blueHordeKills > 0 ? 'Blue secures void grubs' : 'Red secures void grubs'}`
            }
        }
        if ((blueHeraldKills > 0 || redHeraldKills > 0) && (blueDragonKills === 0 && blueBaronKills === 0 && redDragonKills === 0 && redDragonKills === 0)) {
            if (location !== 'jg') {
                battleSpecial = 'Global fighting'
            }
            if ((blueKills + redKills > 0) || (blueHeraldKills > 0 && redHeraldKills > 0)) {
                battleSpecial = 'Battle for herald'
            } else {
                battleSpecial = `${blueHeraldKills > 0 ? 'Blue secures herald' : 'Red secures herald'}`
            }
        }
        if ((blueDragonKills > 0 || redDragonKills > 0)) {
            if ((blueKills + redKills > 0) || (blueDragonKills > 0 && redDragonKills > 0)) {
                battleSpecial = 'Battle for dragon'
            } else {
                battleSpecial = `${blueDragonKills > 0 ? 'Blue secures a dragon' : 'Red secures a dragon'}`
            }
        }
        if ((blueBaronKills > 0 || redBaronKills > 0)) {
            if ((blueKills + redKills > 0) || (blueBaronKills > 0 && redBaronKills > 0)) {
                battleSpecial = 'Battle for baron'
            } else {
                battleSpecial = `${blueBaronKills > 0 ? 'Blue secures baron' : 'Red secures baron'}`
            }
        }

        // Set Battle Name
        let battlePrefix = 'Fight in';
        let battleLocation = locationPayload
        if ((blueKills + redKills) <= 2) {
            battlePrefix = 'Skirmish in'
        }
        if ((blueKills >= 5 && redKills <= 1) || (redKills >= 5 && blueKills <= 1)) {
            battlePrefix = 'Slaughter in'
        }

        // No kills, only objectives
        if (blueKills + redKills === 0 && (blueBaronKills > 0 || blueDragonKills > 0) && (redBaronKills === 0 && redDragonKills === 0)) {
            battleSpecial = 'Blue secures jungle objectives'
        }
        if (blueKills + redKills === 0 && (redBaronKills > 0 || redDragonKills > 0) && (blueBaronKills === 0 && blueDragonKills === 0)) {
            battleSpecial = 'Red secures jungle objectives'
        }
        if (blueKills + redKills === 0 && (redBaronKills > 0 || redDragonKills > 0 || redHordeKills > 0) && (blueBaronKills > 0 || blueDragonKills > 0 || blueHordeKills > 0)) {
            battleSpecial = 'Both teams secure jungle objectives'
        }

        // Building destruction outweighs kills
        else if (((blueTowerKills + blueInhibKills) >= (blueKills + redKills) && (blueTowerKills + blueInhibKills) >= 3) || (blueTowerKills + blueInhibKills) >= 5) {
            battleSpecial = 'Blue demolishes red base'
        }
        else if (((redTowerKills + redInhibKills) >= (blueKills + redKills) && (redTowerKills + redInhibKills) >= 3) || (redTowerKills + redInhibKills) >= 5) {
            battleSpecial = 'Red demolishes blue base'
        }

        // Push into
        if ((blueTowerKills + blueInhibKills > 1 || redTowerKills + redInhibKills > 1) && battleLocation !== ' Jungle') {
            if (blueTowerKills + blueInhibKills > redTowerKills + redInhibKills) {
                battlePrefix = 'Blue push into'
            }
            if (blueTowerKills + blueInhibKills < redTowerKills + redInhibKills) {
                battlePrefix = 'Red push into'
            }
            else if (((blueTowerKills + blueInhibKills) - (redTowerKills + redInhibKills) >= 0 && (blueTowerKills + blueInhibKills) - (redTowerKills + redInhibKills) <= 1) || ((redTowerKills + redInhibKills) - (blueTowerKills + blueInhibKills) >= 0 && (redTowerKills + redInhibKills) - (blueTowerKills + blueInhibKills) <= 1)) {
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

        // Determine description string for battle
        let battleDesc = ''

        // First blood
        let fbFlag = '';
        if (battleName === 'Blue draws first blood' || battleName === 'Red draws first blood') {
            let fbIndex = 0;
            if (battleName[0] === 'B') {
                for (let i = 0; i < detailsArr.length; i++) {
                    if (detailsArr[i].eventType !== 'CHAMPION_KILL') {
                        fbIndex++;
                    }
                    else {
                        break;
                    }
                }
                battleDesc = `Blue team drew first blood when ${detailsArr[fbIndex]?.killer?.championName || 'a minion'} (${detailsArr[fbIndex]?.killer?.riotIdGameName || 'minion'}) killed ${detailsArr[fbIndex]?.victim?.championName} (${detailsArr[fbIndex]?.victim?.riotIdGameName}) in${battleLocation}.`
                fbFlag = 'blue';
            } else if (battleName[0] === 'R') {
                for (let i = 0; i < detailsArr.length; i++) {
                    if (detailsArr[i].eventType !== 'CHAMPION_KILL') {
                        fbIndex++;
                    }
                    else {
                        break;
                    }
                }
                battleDesc = `Red team drew first blood when ${detailsArr[0]?.killer?.championName || 'a minion'} (${detailsArr[0]?.killer?.riotIdGameName || 'minion'}) killed ${detailsArr[0]?.victim?.championName} (${detailsArr[0]?.victim?.riotIdGameName}) in${battleLocation}.`
                fbFlag = 'red';
            }
        }

        // Base destruction
        if (battleName === 'Blue demolishes red base' || battleName === 'Red demolishes blue base') {
            if (battleName[0] === 'B') {
                battleDesc = `Blue team ravaged red's base, `
                if (blueTowerKills > 0) {
                    battleDesc += `destroying ${blueTowerKills} tower${blueTowerKills > 1 ? 's' : ''}${blueInhibKills > 0 ? ` and ${blueInhibKills} inhibitor${blueInhibKills > 1 ? 's' : ''}` : ''}.`
                }
            }
            if (battleName[0] === 'R') {
                battleDesc = `Red team ravaged blue's base, `
                if (blueTowerKills > 0) {
                    battleDesc += `destroying ${redTowerKills} tower${redTowerKills > 1 ? 's' : ''}${redInhibKills > 0 ? ` and ${redInhibKills} inhibitor${redInhibKills > 1 ? 's' : ''}` : ''}.`
                }
            }
        }

        // Fight for jungle objectives
        if (battleName === 'Blue secures void grubs' || battleName === 'Red secures void grubs') {
            if (battleName[0] === 'B') {
                battleDesc = `Blue team was able to kill ${blueHordeKills} void grubs without conflict.`
            }
            if (battleName[0] === 'R') {
                battleDesc = `Red team was able to kill ${redHordeKills} void grubs without conflict.`
            }
        }

        if (battleName === 'Battle for dragon') {
            let dragonEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("DRAGON"))
            battleDesc = `The ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} was slain by ${dragonEvent?.killer.championName || 'a minion'} (${dragonEvent?.killer.riotIdGameName || 'a minion'}) for the ${dragonEvent?.teamId === 100 ? 'blue' : 'red'} team.`
        }

        if (battleName === 'Red secures jungle objectives' || battleName === 'Blue secures jungle objectives') {
            battleDesc = `${battleName[0] === 'B' ? 'Blue team' : 'Red team'} killed jungle monsters.`
        }

        if (battleName === 'Battle for baron') {
            let baronEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("BARON_NASHOR"))
            battleDesc = `Baron was slain by ${baronEvent.killer?.championName || 'a minion'} (${baronEvent.killer?.riotIdGameName || 'a minion'}) for the ${baronEvent.teamId === 100 ? 'blue' : 'red'} team.`
        }

        if (battleName === 'Battle for herald') {
            let heraldEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("HERALD"))
            battleDesc = `The riftherald was slain by ${heraldEvent.killer?.championName || 'a minion'} (${heraldEvent.killer?.riotIdGameName || 'a minion'}) for the ${heraldEvent.teamId === 100 ? 'blue' : 'red'} team.`
        }

        // Grub Kills
        if ((blueHordeKills > 0 || redHordeKills > 0) && (battleName !== 'Blue secures void grubs' || battleName === 'Red secures void grubs')) {
            if (blueHordeKills > 0) {
                if (battleDesc.length > 0 && battleName !== 'Blue secures void grubs') {
                    battleDesc += ` Meanwhile, blue team secured ${blueHordeKills} void grubs.`
                }
                else {
                    battleDesc = `Blue team secured ${blueHordeKills} void grubs.`
                }
            }
            else if (redHordeKills > 0) {
                if (battleDesc.length > 0 && battleName !== 'Red secures void grubs') {
                    battleDesc += ` Meanwhile, red team secured ${redHordeKills} void grubs.`
                }
                else {
                    battleDesc = `Red team secured ${redHordeKills} void grubs.`
                }
            }
        }

        // Dragon Kills
        if ((blueDragonKills > 0 || redDragonKills > 0) && (battleName !== 'Battle for dragon')) {
            let dragonEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("DRAGON"))
            if (blueDragonKills > 0) {
                if (battleDesc.length > 0 && battleName !== 'Blue slayed a dragon') {
                    battleDesc += ` Meanwhile, blue team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
                else {
                    battleDesc = `Blue team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
            }
            else if (redDragonKills > 0) {
                if (battleDesc.length > 0 && battleName !== 'Red slayed a dragon') {
                    battleDesc += ` Meanwhile, red team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
                else {
                    battleDesc = `Red team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
            }
        }

        // Herald Kills
        if ((blueHeraldKills > 0 || redHeraldKills > 0) && (battleName !== 'Battle for herald')) {
            let heraldEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("RIFTHERALD"))
            if (blueHeraldKills > 0) {
                if (battleDesc.length > 0 && battleName !== 'Blue slayed a dragon') {
                    battleDesc += ` Meanwhile, blue team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
                else {
                    battleDesc = `Blue team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
            }
            else if (redHeraldKills > 0) {
                if (battleDesc.length > 0 && battleName !== 'Red slayed a dragon') {
                    battleDesc += ` Meanwhile, red team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
                else {
                    battleDesc = `Red team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
            }
        }

        // Tower destruction
        if ((blueTowerKills > 0 || redTowerKills > 0) && (battleName !== 'Blue demolishes red base' && battleName !== 'Red demolishes blue base')) {
            if (blueTowerKills > 0) {
                if (battleDesc.length > 0 && !battleDesc.includes('tower')) {
                    battleDesc += ` Meanwhile, blue team was able to destroy ${blueTowerKills} tower${blueTowerKills > 1 ? 's' : ''}.`
                } else {
                    battleDesc = `Blue team destroyed ${blueTowerKills} tower${blueTowerKills > 1 ? 's' : ''}.`
                }
            }
            if (redTowerKills > 0) {
                if (battleDesc.length > 0 && !battleDesc.includes('tower')) {
                    battleDesc += ` Meanwhile, blue team was able to destroy ${redTowerKills} tower${redTowerKills > 1 ? 's' : ''}.`
                } else {
                    battleDesc = `Red team destroyed ${redTowerKills} tower${redTowerKills > 1 ? 's' : ''}.`
                }
            }
        }

        // Inhib destruction
        if ((blueInhibKills > 0 || redInhibKills > 0) && (battleName !== 'Blue demolishes red base' && battleName !== 'Red demolishes blue base')) {
            if (blueInhibKills > 0) {
                if (battleDesc.length > 0 && !battleDesc.includes('inhib')) {
                    battleDesc += ` At the same time, blue team was able to take down ${blueInhibKills} inhib${blueInhibKills > 1 ? 's' : ''}.`
                } else {
                    battleDesc = `Blue team destroyed ${blueInhibKills} inhib${blueInhibKills > 1 ? 's' : ''}.`
                }
            }
            if (redInhibKills > 0) {
                if (battleDesc.length > 0 && !battleDesc.includes('inhib')) {
                    battleDesc += ` At the same time, red team was able to take down ${redInhibKills} inhib${redInhibKills > 1 ? 's' : ''}.`
                } else {
                    battleDesc = `Red team destroyed ${redInhibKills} inhib${redInhibKills > 1 ? 's' : ''}.`
                }
            }
        }

        // Additional kills
        let descKillsStr = ''
        let evenTrade = false;
        if ((blueKills === redKills) && (blueKills + redKills) > 0) {
            descKillsStr += `The fight in ${battleLocation} was an even trade, with both sides getting ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
            evenTrade = true;
        }
        if (blueKills > 0 || redKills > 0) {
            if (blueKills > 0 && fbFlag !== 'blue') {
                if (fbFlag === 'red' && outcome[0] === 'B') {
                    descKillsStr += `Despite of that, blue team was able to win the fight, securing ${blueKills} kills while only losing ${redKills}.`
                } else if (evenTrade === false) {
                    if (battleDesc.length > 0) {
                        descKillsStr = `During the fight, blue team ${battleDesc.toLowerCase().includes('blue') ? 'also' : ''} got ${blueKills} kill${blueKills > 1 ? 's' : ''}.`
                        if (redKills > 0) {
                            descKillsStr = `During the fight, blue team ${battleDesc.toLowerCase().includes('blue') ? 'also' : ''} got ${blueKills} kill${blueKills > 1 ? 's' : ''}, while red team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                        }
                    }
                    else {
                        descKillsStr = `During a ${battlePrefix} ${battleLocation}, blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                        if (redKills > 0) {
                            descKillsStr = `During a ${battlePrefix} ${battleLocation}, blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}, while red team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                        }
                    }
                }
            }
            else if (redKills > 0 && fbFlag !== 'red') {
                if (fbFlag === 'red' && outcome[0] === 'B') {
                    descKillsStr += `Despite of that, red team was able to win the fight, securing ${redKills} kills while only losing ${blueKills}.`
                } else if (evenTrade === false) {
                    if (battleDesc.length > 0) {
                        descKillsStr = `During the fight, red team ${battleDesc.toLowerCase().includes('red') ? 'also' : ''} got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                        if (blueKills > 0) {
                            descKillsStr = `During the fight, red team ${battleDesc.toLowerCase().includes('red') ? 'also' : ''} got ${redKills} kill${redKills > 1 ? 's' : ''}, while blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                        }
                    }
                    else {
                        descKillsStr = `During a ${battlePrefix} ${battleLocation}, red team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                        if (blueKills > 0) {
                            descKillsStr = `During a ${battlePrefix} ${battleLocation}, red team got ${redKills} kill${redKills > 1 ? 's' : ''}, while blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                        }
                    }
                }
            }
        }

        // Assemble final description str
        battleDesc = battleDesc + ' ' + descKillsStr

        const battlePayload = {
            battleName: battleName,
            battleDesc: battleDesc,
            blueKills: blueKills,
            redKills: redKills,
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

    const handleCollapseFight = (index) => {
        const fight = document.getElementById(`battle_${index}`)
        // show fight
        if (fight.classList.contains('hide')) {
            const downIcon = document.getElementById(`down_icon_${index}`)
            const upIcon = document.getElementById(`up_icon_${index}`)
            downIcon.classList.remove('hide')
            upIcon.classList.add('hide')
            fight.classList.remove('hide')
        }
        // collapse fight
        else {
            const downIcon = document.getElementById(`down_icon_${index}`)
            const upIcon = document.getElementById(`up_icon_${index}`)
            downIcon.classList.add('hide')
            upIcon.classList.remove('hide')
            fight.classList.add('hide')
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0' }}>
            <Grid container>
                <Grid item xs={12} sm={12} md={6}>
                    <div style={{ position: 'relative', width: '140px' }}>
                        <Typography fontSize={'1.25rem'} fontWeight={600}>Battles</Typography>
                        <Typography style={{ position: 'absolute', top: '0px', right: '0px', left: 'auto' }}><span style={{ backgroundColor: 'purple', color: 'white', padding: '10px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 'bold', filter: 'drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.25))' }}>BETA*</span></Typography>
                    </div>
                    <Typography style={{ fontSize: '14px', marginTop: '12px', marginBottom: '7px', color: 'rgb(133, 133, 133)' }}>*Descriptions provided below may not be 100% accurate</Typography>
                    <Typography style={{ fontSize: '20px', color: 'rgb(75, 75, 75)' }} marginBottom={'20px'}>Fights that occurred during the match</Typography>
                </Grid>
                <Grid item className='BattlesCollapseBtnContainer' xs={12} sm={12} md={6}>
                    {/* <Typography style={{ marginTop: '4px' }} fontSize={16} fontWeight={600}>Fights Won:</Typography>
                    <Typography marginBottom={'20px'}><span style={{ color: '#3374FF', marginRight: '10px', fontWeight: 'bold' }}>{`Blue: ${blueTotalFightsWon} `}</span><span style={{ color: '#FF3F3F', fontWeight: 'bold' }}>{`Red: ${redTotalFightsWon}`}</span></Typography> */}
                </Grid>

                {teamfights.map((fight, fightIndex) => (
                    <Box key={fightIndex} style={{ width: '100%', border: '0px solid black', boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
                        <div onClick={() => handleCollapseFight(fightIndex)} className='BattlesHeaderContainer'>
                            {fight.outcome[0] === 'E' && fight.blueKills === 0 && fight.redKills === 0 ? (
                                <div className='BattlesHeader'><Typography style={{ color: '#404040', fontWeight: 'bold', fontSize: '1rem' }}>No Contest 0 - 0</Typography></div>
                            ) : (
                                <div className='BattlesHeader'><Typography style={{ color: fight.outcome[0] === 'E' ? '#404040' : fight.outcome[0] === 'B' ? '#3374FF' : '#FF3F3F', fontWeight: 'bold', fontSize: '1rem' }}>{fight.outcome}</Typography></div>
                            )
                            }
                            <div className='BattlesHeader2'><Typography style={{ color: '#4B4B4B', fontWeight: 'bold', fontSize: '0.875rem' }}>{`(${fight.timespan})`}</Typography></div>
                            {!props.aram &&
                                <div><Typography style={{ color: '#000000', fontWeight: 'bold', fontSize: '0.875rem' }}>{fight.battleName}</Typography></div>
                            }
                            <ArrowDropDownIcon id={`down_icon_${fightIndex}`} className='hideMobile hide' style={{ marginRight: '0px', marginLeft: 'auto' }}></ArrowDropDownIcon>
                            <ArrowRightIcon id={`up_icon_${fightIndex}`} className='hideMobile' style={{ marginRight: '0px', marginLeft: 'auto' }}></ArrowRightIcon>
                        </div>
                        <div id={`battle_${fightIndex}`} className='BattlesBodyContainer hide'>
                            <div className='BattlesBodySubContainer1'>
                                {!props.aram &&
                                    <Typography marginTop={'30px'} marginLeft={'20px'} color={'#404040'} fontSize={'0.875rem'}>{fight.battleDesc}</Typography>
                                }
                                <div style={{ marginTop: '20px', marginLeft: '25px', marginBottom: '15px' }}>
                                    <TeamGoldDifGraph arrow max={Math.round((fight.details[fight.details.length - 1].timestamp) / 60000) - 1} width={400} height={180} teamId={props.playerData.teamId} hideTitle yAxisGold={props.graphData.yAxisGold} xAxisGold={props.graphData.xAxisGold}></TeamGoldDifGraph>
                                </div>
                            </div>

                            <div style={{ paddingTop: '0px', padding: '0px', width: '65%' }}>
                                <ul style={{ display: 'flex', flexDirection: 'column', padding: '0px' }}>
                                    {fight.details.map((details, detailsIndex) => (
                                        <li key={detailsIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Typography style={{ fontSize: '0.875', marginRight: '10px', width: '40px', minWidth: '40px' }}>
                                                    {String(Math.floor(details.timestamp / 60000)).padStart(2, '0')}:
                                                    {String(Math.floor((details.timestamp % 60000) / 1000)).padStart(2, '0')}
                                                </Typography>
                                                {details.eventType === 'CHAMPION_KILL' && (
                                                    <>
                                                        {details.killer?.championId ? (
                                                            <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -5] } }] } }} disableInteractive arrow placement='top' title={<>{details.killer?.riotIdGameName} ({details.killer?.championName})</>}>
                                                                <a href={`/profile/${props.gameData.info.platformId.toLowerCase()}/${details.killer?.riotIdGameName}/${details.killer?.riotIdTagline.toLowerCase()}`}>
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
                                                                </a>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -5] } }] } }} disableInteractive arrow placement='top' title={<>{details.teamId === 200 ? 'Blue Minion' : 'Red Minion'}</>}>
                                                                <span>
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
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                        <img alt='' style={{ width: '20px', opacity: '65%' }} src='/images/swords.svg'></img>
                                                        <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -5] } }] } }} disableInteractive arrow placement='top' title={<>{details.victim?.riotIdGameName} ({details.victim?.championName})</>}>
                                                            <a href={`/profile/${props.gameData.info.platformId.toLowerCase()}/${details.victim?.riotIdGameName}/${details.victim?.riotIdTagline.toLowerCase()}`}>
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
                                                            </a>
                                                        </Tooltip>
                                                        {details.killer?.riotIdGameName ? (
                                                            <Typography style={{ fontSize: '0.875rem', marginLeft: '10px', overflow: 'hidden' }}>
                                                                {<><a href={`/profile/${gameData.info.platformId.toLowerCase()}/${details.killer?.riotIdGameName}/${details.killer?.riotIdTagline.toLowerCase()}`} style={{ color: details.killer.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.killer?.riotIdGameName || 'Minion'}</a> killed <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${details.victim?.riotIdGameName}/${details.victim?.riotIdTagline.toLowerCase()}`} style={{ color: details.victim.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.victim?.riotIdGameName}</a></>}
                                                            </Typography>
                                                        ) : (
                                                            <Typography style={{ fontSize: '0.875rem', marginLeft: '10px', overflow: 'hidden' }}>
                                                                {<><span style={{ color: details.victim.teamId === 200 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.killer?.riotIdGameName || 'Minion'}</span> killed <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${details.victim?.riotIdGameName}/${details.victim?.riotIdTagline.toLowerCase()}`} style={{ color: details.victim.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.victim?.riotIdGameName}</a></>}
                                                            </Typography>
                                                        )}
                                                    </>
                                                )}

                                                {details.eventType === 'BUILDING_DESTROY' && (
                                                    <>
                                                        {details.killer?.championId ? (
                                                            <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -5] } }] } }} disableInteractive arrow placement='top' title={<>{details.killer?.riotIdGameName} ({details.killer?.championName})</>}>
                                                                <a href={`/profile/${props.gameData.info.platformId.toLowerCase()}/${details.killer?.riotIdGameName}/${details.killer?.riotIdTagline.toLowerCase()}`}>
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
                                                                </a>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -5] } }] } }} disableInteractive arrow placement='top' title={<>{details.teamId === 200 ? 'Blue Minion' : 'Red Minion'}</>}>
                                                                <span>
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
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                        <img style={{ width: '20px', opacity: '45%' }} src='/images/hammer.svg' alt="Swords" />
                                                        <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -5] } }] } }} disableInteractive arrow placement='top' title={<>{details.teamId === 100 ? 'Blue ' : 'Red '} {details.buildingType === 'TOWER_BUILDING' ? 'Tower' : 'Inhibitor'}</>}>
                                                            <span>
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
                                                            </span>
                                                        </Tooltip>
                                                        {details.killer?.riotIdGameName ? (
                                                            <Typography style={{ fontSize: '0.875rem', marginLeft: '10px', overflow: 'hidden' }}>
                                                                {<><a href={`/profile/${gameData.info.platformId.toLowerCase()}/${details.killer?.riotIdGameName}/${details.killer?.riotIdTagline.toLowerCase()}`} style={{ color: details.teamId === 200 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.killer?.riotIdGameName || 'Minions'}</a> destroyed <span style={{ color: details.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.buildingType === 'TOWER_BUILDING' ? 'a tower' : 'an inhibitor'}</span></>}
                                                            </Typography>
                                                        ) : (
                                                            <Typography style={{ fontSize: '0.875rem', marginLeft: '10px', overflow: 'hidden' }}>
                                                                {<><span style={{ color: details.teamId === 200 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.killer?.riotIdGameName || 'Minions'}</span> destroyed <span style={{ color: details.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.buildingType === 'TOWER_BUILDING' ? 'a tower' : 'an inhibitor'}</span></>}
                                                            </Typography>
                                                        )}

                                                    </>
                                                )}

                                                {details.eventType === 'MONSTER_KILL' && (
                                                    <>
                                                        {details.killer?.championId ? (
                                                            <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -5] } }] } }} disableInteractive arrow placement='top' title={<>{details.killer?.riotIdGameName} ({details.killer?.championName})</>}>
                                                                <a href={`/profile/${props.gameData.info.platformId.toLowerCase()}/${details.killer?.riotIdGameName}/${details.killer?.riotIdTagline.toLowerCase()}`}>
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
                                                                </a>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -5] } }] } }} disableInteractive arrow placement='top' title={<>{'A Minion'}</>}>
                                                                <span>
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
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                        <img style={{ width: '20px', opacity: '65%', transform: 'rotate(25deg)' }} src='/images/bow.svg' alt="Swords" />
                                                        <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -5] } }] } }} disableInteractive arrow placement='top' title={<>{details.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</>}>
                                                            <span>
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
                                                            </span>
                                                        </Tooltip>
                                                        {details.killer?.riotIdGameName ? (
                                                            <Typography style={{ fontSize: '0.875rem', marginLeft: '10px', overflow: 'hidden' }}>
                                                                {<><a href={`/profile/${gameData.info.platformId.toLowerCase()}/${details.killer?.riotIdGameName}/${details.killer?.riotIdTagline?.toLowerCase()}`} style={{ color: details.killer?.teamId === 100 ? '#568CFF' : '#FF3A54', fontWeight: 'bold' }}>{details.killer?.riotIdGameName || 'Minion'}</a> killed <span style={{ color: '#EF00D3', fontWeight: 'bold' }}>{details.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</span></>}
                                                            </Typography>
                                                        ) : (
                                                            <Typography style={{ fontSize: '0.875rem', marginLeft: '10px', overflow: 'hidden' }}>
                                                                {<><span style={{ color: 'black', fontWeight: 'bold' }}>{details.killer?.riotIdGameName || 'Minion'}</span> killed <span style={{ color: '#EF00D3', fontWeight: 'bold' }}>{details.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</span></>}
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