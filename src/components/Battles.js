import { Typography, Grid } from '@mui/material'
import React from 'react'
import BattleCard from './battlesPhase/BattleCard';
import { toBattleVM } from './battlesPhase/battleAdapter';

const Battles = (props) => {

    const timelineData = props.timelineData;
    const gameData = props.gameData;
    const participants = gameData.info.participants;
    const champsJSON = props.champsJSON;
    const dataDragonVersion = props.dataDragonVersion;

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
                                // detailsStr += `${kill.monsterSubType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'purple team'}. `;
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
                                // detailsStr += `${kill.monsterType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'purple team'}. `;
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
                        outcome = `Purple wins ${redKills} - ${blueKills}`;
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
                        redBase: ' Purple Base'
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
                        battleSpecial = `${blueFirstBlood > 0 ? 'Blue' : 'Purple'} draws first blood in ${locationNames[location]}`
                    }

                    if ((blueHordeKills > 0 || redHordeKills > 0) && (blueDragonKills === 0 && blueBaronKills === 0 && redDragonKills === 0 && redDragonKills === 0)) {
                        if (location !== 'jg') {
                            battleSpecial = 'Global fighting'
                        }
                        if ((blueKills + redKills > 0) || (blueHordeKills > 0 && redHordeKills > 0)) {
                            battleSpecial = 'Battle for Void Grubs'
                        } else {
                            battleSpecial = `${blueHordeKills > 0 ? 'Blue secures void grubs' : 'Purple secures void grubs'}`
                        }
                    }
                    if ((blueHeraldKills > 0 || redHeraldKills > 0) && (blueDragonKills === 0 && blueBaronKills === 0 && redDragonKills === 0 && redDragonKills === 0)) {
                        if (location !== 'jg') {
                            battleSpecial = 'Global fighting'
                        }
                        if ((blueKills + redKills > 0) || (blueHeraldKills > 0 && redHeraldKills > 0)) {
                            battleSpecial = 'Battle for herald'
                        } else {
                            battleSpecial = `${blueHeraldKills > 0 ? 'Blue secures herald' : 'Purple secures herald'}`
                        }
                    }
                    if ((blueDragonKills > 0 || redDragonKills > 0)) {
                        if ((blueKills + redKills > 0) || (blueDragonKills > 0 && redDragonKills > 0)) {
                            battleSpecial = 'Battle for dragon'
                        } else {
                            battleSpecial = `${blueDragonKills > 0 ? 'Blue secures a dragon' : 'Purple secures a dragon'}`
                        }
                    }
                    if ((blueBaronKills > 0 || redBaronKills > 0)) {
                        if ((blueKills + redKills > 0) || (blueBaronKills > 0 && redBaronKills > 0)) {
                            battleSpecial = 'Battle for baron'
                        } else {
                            battleSpecial = `${blueBaronKills > 0 ? 'Blue secures baron' : 'Purple secures baron'}`
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
                        battleSpecial = 'Purple secures jungle objectives'
                    }
                    if (blueKills + redKills === 0 && (redBaronKills > 0 || redDragonKills > 0 || redHordeKills > 0) && (blueBaronKills > 0 || blueDragonKills > 0 || blueHordeKills > 0)) {
                        battleSpecial = 'Both teams secure jungle objectives'
                    }

                    // Building destruction outweighs kills
                    else if (((blueTowerKills + blueInhibKills) >= (blueKills + redKills) && (blueTowerKills + blueInhibKills) >= 3) || (blueTowerKills + blueInhibKills) >= 5) {
                        battleSpecial = 'Blue demolishes purple base'
                    }
                    else if (((redTowerKills + redInhibKills) >= (blueKills + redKills) && (redTowerKills + redInhibKills) >= 3) || (redTowerKills + redInhibKills) >= 5) {
                        battleSpecial = 'Purple demolishes blue base'
                    }

                    // Push into
                    if ((blueTowerKills + blueInhibKills > 1 || redTowerKills + redInhibKills > 1) && battleLocation !== ' Jungle') {
                        if (blueTowerKills + blueInhibKills > redTowerKills + redInhibKills) {
                            battlePrefix = 'Blue push into'
                        }
                        if (blueTowerKills + blueInhibKills < redTowerKills + redInhibKills) {
                            battlePrefix = 'Purple push into'
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
                    if (battleName.includes('Blue draws first blood') || battleName.includes('Purple draws first blood')) {
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
                        } else if (battleName[0] === 'P') {
                            for (let i = 0; i < detailsArr.length; i++) {
                                if (detailsArr[i].eventType !== 'CHAMPION_KILL') {
                                    fbIndex++;
                                }
                                else {
                                    break;
                                }
                            }
                            battleDesc = `Purple team drew first blood when ${detailsArr[0]?.killer?.championName || 'a minion'} (${detailsArr[0]?.killer?.riotIdGameName || 'minion'}) killed ${detailsArr[0]?.victim?.championName} (${detailsArr[0]?.victim?.riotIdGameName}) in${battleLocation}.`
                            fbFlag = 'red';
                        }
                    }

                    // Fight for jungle objectives
                    if (battleName === 'Blue secures void grubs' || battleName === 'Purple secures void grubs') {
                        if (battleName[0] === 'B') {
                            battleDesc = `Blue team was able to kill ${blueHordeKills} void grubs without conflict.`
                        }
                        if (battleName[0] === 'P') {
                            battleDesc = `Purple team was able to kill ${redHordeKills} void grubs without conflict.`
                        }
                    }

                    if (battleName === 'Battle for dragon') {
                        let dragonEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("DRAGON"))
                        battleDesc = `The ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} was slain by ${dragonEvent?.killer?.championName || 'a minion'} (${dragonEvent?.killer?.riotIdGameName || 'a minion'}) for the ${dragonEvent?.teamId === 100 ? 'blue' : 'purple'} team.`
                    }

                    if (battleName === 'Purple secures jungle objectives' || battleName === 'Blue secures jungle objectives') {
                        battleDesc = `${battleName[0] === 'B' ? 'Blue team' : 'Purple team'} killed jungle monsters.`
                    }

                    if (battleName === 'Battle for baron') {
                        let baronEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("BARON_NASHOR"))
                        battleDesc = `Baron was slain by ${baronEvent.killer?.championName || 'a minion'} (${baronEvent.killer?.riotIdGameName || 'a minion'}) for the ${baronEvent.teamId === 100 ? 'blue' : 'purple'} team.`
                    }

                    if (battleName === 'Battle for herald') {
                        let heraldEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("HERALD"))
                        battleDesc = `The riftherald was slain by ${heraldEvent.killer?.championName || 'a minion'} (${heraldEvent.killer?.riotIdGameName || 'a minion'}) for the ${heraldEvent.teamId === 100 ? 'blue' : 'purple'} team.`
                    }

                    // Grub Kills
                    if ((blueHordeKills > 0 || redHordeKills > 0) && (battleName !== 'Blue secures void grubs' || battleName === 'Purple secures void grubs')) {
                        if (blueHordeKills > 0) {
                            if (battleDesc.length > 0 && battleName !== 'Blue secures void grubs') {
                                battleDesc += ` Meanwhile, blue team secured ${blueHordeKills} void grubs.`
                            }
                            else {
                                battleDesc = `Blue team secured ${blueHordeKills} void grubs.`
                            }
                        }
                        else if (redHordeKills > 0) {
                            if (battleDesc.length > 0 && battleName !== 'Purple secures void grubs') {
                                battleDesc += ` Meanwhile, purple team secured ${redHordeKills} void grubs.`
                            }
                            else {
                                battleDesc = `Purple team secured ${redHordeKills} void grubs.`
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
                            if (battleDesc.length > 0 && battleName !== 'Purple slayed a dragon') {
                                battleDesc += ` Meanwhile, purple team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                            }
                            else {
                                battleDesc = `Purple team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
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
                            if (battleDesc.length > 0 && battleName !== 'Purple slayed a dragon') {
                                battleDesc += ` Meanwhile, purple team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                            }
                            else {
                                battleDesc = `Purple team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
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
                                battleDesc += ` Meanwhile, purple team was able to destroy ${redTowerKills} tower${redTowerKills > 1 ? 's' : ''}.`
                            } else {
                                battleDesc = `Purple team destroyed ${redTowerKills} tower${redTowerKills > 1 ? 's' : ''}.`
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
                                battleDesc += ` At the same time, purple team was able to take down ${redInhibKills} inhib${redInhibKills > 1 ? 's' : ''}.`
                            } else {
                                battleDesc = `Purple team destroyed ${redInhibKills} inhib${redInhibKills > 1 ? 's' : ''}.`
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
                                        descKillsStr = `During the fight, blue team ${battleDesc.toLowerCase().includes('blue') ? 'also' : ''} got ${blueKills} kill${blueKills > 1 ? 's' : ''}, while purple team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                                    }
                                }
                                else {
                                    descKillsStr = `During a ${battlePrefix} ${battleLocation}, blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                                    if (redKills > 0) {
                                        descKillsStr = `During a ${battlePrefix} ${battleLocation}, blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}, while purple team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                                    }
                                }
                            }
                        }
                        else if (redKills > 0 && fbFlag !== 'red') {
                            if (fbFlag === 'red' && outcome[0] === 'B') {
                                descKillsStr += `Despite of that, purple team was able to win the fight, securing ${redKills} kills while only losing ${blueKills}.`
                            } else if (evenTrade === false) {
                                if (battleDesc.length > 0) {
                                    descKillsStr = `During the fight, purple team ${battleDesc.toLowerCase().includes('purple') ? 'also' : ''} got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                                    if (blueKills > 0) {
                                        descKillsStr = `During the fight, purple team ${battleDesc.toLowerCase().includes('purple') ? 'also' : ''} got ${redKills} kill${redKills > 1 ? 's' : ''}, while blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                                    }
                                }
                                else {
                                    descKillsStr = `During a ${battlePrefix} ${battleLocation}, purple team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                                    if (blueKills > 0) {
                                        descKillsStr = `During a ${battlePrefix} ${battleLocation}, purple team got ${redKills} kill${redKills > 1 ? 's' : ''}, while blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
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
                    // detailsStr += `${kill.monsterSubType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'purple team'}. `;
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
                    // detailsStr += `${kill.monsterType} killed by ${kill.killerTeamId === 100 ? 'blue team' : 'purple team'}. `;
                }
            }

        })

        // Determine Outcome
        let outcome = null;
        if (blueKills > redKills) {
            outcome = `Blue wins ${blueKills} - ${redKills}`;
            // blueTotalFightsWon += 1;
        } else if (redKills > blueKills) {
            outcome = `Purple wins ${redKills} - ${blueKills}`;
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
            redBase: ' Purple Base'
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
            battleSpecial = `${blueFirstBlood > 0 ? 'Blue' : 'Purple'} draws first blood`
        }

        if ((blueHordeKills > 0 || redHordeKills > 0) && (blueDragonKills === 0 && blueBaronKills === 0 && redDragonKills === 0 && redDragonKills === 0)) {
            if (location !== 'jg') {
                battleSpecial = 'Global fighting'
            }
            if ((blueKills + redKills > 0) || (blueHordeKills > 0 && redHordeKills > 0)) {
                battleSpecial = 'Battle for Void Grubs'
            } else {
                battleSpecial = `${blueHordeKills > 0 ? 'Blue secures void grubs' : 'Purple secures void grubs'}`
            }
        }
        if ((blueHeraldKills > 0 || redHeraldKills > 0) && (blueDragonKills === 0 && blueBaronKills === 0 && redDragonKills === 0 && redDragonKills === 0)) {
            if (location !== 'jg') {
                battleSpecial = 'Global fighting'
            }
            if ((blueKills + redKills > 0) || (blueHeraldKills > 0 && redHeraldKills > 0)) {
                battleSpecial = 'Battle for herald'
            } else {
                battleSpecial = `${blueHeraldKills > 0 ? 'Blue secures herald' : 'Purple secures herald'}`
            }
        }
        if ((blueDragonKills > 0 || redDragonKills > 0)) {
            if ((blueKills + redKills > 0) || (blueDragonKills > 0 && redDragonKills > 0)) {
                battleSpecial = 'Battle for dragon'
            } else {
                battleSpecial = `${blueDragonKills > 0 ? 'Blue secures a dragon' : 'Purple secures a dragon'}`
            }
        }
        if ((blueBaronKills > 0 || redBaronKills > 0)) {
            if ((blueKills + redKills > 0) || (blueBaronKills > 0 && redBaronKills > 0)) {
                battleSpecial = 'Battle for baron'
            } else {
                battleSpecial = `${blueBaronKills > 0 ? 'Blue secures baron' : 'Purple secures baron'}`
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
            battleSpecial = 'Purple secures jungle objectives'
        }
        if (blueKills + redKills === 0 && (redBaronKills > 0 || redDragonKills > 0 || redHordeKills > 0) && (blueBaronKills > 0 || blueDragonKills > 0 || blueHordeKills > 0)) {
            battleSpecial = 'Both teams secure jungle objectives'
        }

        // Building destruction outweighs kills
        else if (((blueTowerKills + blueInhibKills) >= (blueKills + redKills) && (blueTowerKills + blueInhibKills) >= 3) || (blueTowerKills + blueInhibKills) >= 5) {
            battleSpecial = 'Blue demolishes purple base'
        }
        else if (((redTowerKills + redInhibKills) >= (blueKills + redKills) && (redTowerKills + redInhibKills) >= 3) || (redTowerKills + redInhibKills) >= 5) {
            battleSpecial = 'Purple demolishes blue base'
        }

        // Push into
        if ((blueTowerKills + blueInhibKills > 1 || redTowerKills + redInhibKills > 1) && battleLocation !== ' Jungle') {
            if (blueTowerKills + blueInhibKills > redTowerKills + redInhibKills) {
                battlePrefix = 'Blue push into'
            }
            if (blueTowerKills + blueInhibKills < redTowerKills + redInhibKills) {
                battlePrefix = 'Purple push into'
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
        if (battleName === 'Blue draws first blood' || battleName === 'Purple draws first blood') {
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
            } else if (battleName[0] === 'P') {
                for (let i = 0; i < detailsArr.length; i++) {
                    if (detailsArr[i].eventType !== 'CHAMPION_KILL') {
                        fbIndex++;
                    }
                    else {
                        break;
                    }
                }
                battleDesc = `Purple team drew first blood when ${detailsArr[0]?.killer?.championName || 'a minion'} (${detailsArr[0]?.killer?.riotIdGameName || 'minion'}) killed ${detailsArr[0]?.victim?.championName} (${detailsArr[0]?.victim?.riotIdGameName}) in${battleLocation}.`
                fbFlag = 'red';
            }
        }

        // Base destruction
        if (battleName === 'Blue demolishes purple base' || battleName === 'Purple demolishes blue base') {
            if (battleName[0] === 'B') {
                battleDesc = `Blue team ravaged purple's base, `
                if (blueTowerKills > 0) {
                    battleDesc += `destroying ${blueTowerKills} tower${blueTowerKills > 1 ? 's' : ''}${blueInhibKills > 0 ? ` and ${blueInhibKills} inhibitor${blueInhibKills > 1 ? 's' : ''}` : ''}.`
                }
            }
            if (battleName[0] === 'P') {
                battleDesc = `Purple team ravaged blue's base, `
                if (blueTowerKills > 0) {
                    battleDesc += `destroying ${redTowerKills} tower${redTowerKills > 1 ? 's' : ''}${redInhibKills > 0 ? ` and ${redInhibKills} inhibitor${redInhibKills > 1 ? 's' : ''}` : ''}.`
                }
            }
        }

        // Fight for jungle objectives
        if (battleName === 'Blue secures void grubs' || battleName === 'Purple secures void grubs') {
            if (battleName[0] === 'B') {
                battleDesc = `Blue team was able to kill ${blueHordeKills} void grubs without conflict.`
            }
            if (battleName[0] === 'P') {
                battleDesc = `Purple team was able to kill ${redHordeKills} void grubs without conflict.`
            }
        }

        if (battleName === 'Battle for dragon') {
            let dragonEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("DRAGON"))
            battleDesc = `The ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} was slain by ${dragonEvent?.killer.championName || 'a minion'} (${dragonEvent?.killer.riotIdGameName || 'a minion'}) for the ${dragonEvent?.teamId === 100 ? 'blue' : 'purple'} team.`
        }

        if (battleName === 'Purple secures jungle objectives' || battleName === 'Blue secures jungle objectives') {
            battleDesc = `${battleName[0] === 'B' ? 'Blue team' : 'Purple team'} killed jungle monsters.`
        }

        if (battleName === 'Battle for baron') {
            let baronEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("BARON_NASHOR"))
            battleDesc = `Baron was slain by ${baronEvent.killer?.championName || 'a minion'} (${baronEvent.killer?.riotIdGameName || 'a minion'}) for the ${baronEvent.teamId === 100 ? 'blue' : 'purple'} team.`
        }

        if (battleName === 'Battle for herald') {
            let heraldEvent = detailsArr.find(event => event.eventType === "MONSTER_KILL" && event.monsterType?.includes("HERALD"))
            battleDesc = `The riftherald was slain by ${heraldEvent.killer?.championName || 'a minion'} (${heraldEvent.killer?.riotIdGameName || 'a minion'}) for the ${heraldEvent.teamId === 100 ? 'blue' : 'purple'} team.`
        }

        // Grub Kills
        if ((blueHordeKills > 0 || redHordeKills > 0) && (battleName !== 'Blue secures void grubs' || battleName === 'Purple secures void grubs')) {
            if (blueHordeKills > 0) {
                if (battleDesc.length > 0 && battleName !== 'Blue secures void grubs') {
                    battleDesc += ` Meanwhile, blue team secured ${blueHordeKills} void grubs.`
                }
                else {
                    battleDesc = `Blue team secured ${blueHordeKills} void grubs.`
                }
            }
            else if (redHordeKills > 0) {
                if (battleDesc.length > 0 && battleName !== 'Purple secures void grubs') {
                    battleDesc += ` Meanwhile, purple team secured ${redHordeKills} void grubs.`
                }
                else {
                    battleDesc = `Purple team secured ${redHordeKills} void grubs.`
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
                if (battleDesc.length > 0 && battleName !== 'Purple slayed a dragon') {
                    battleDesc += ` Meanwhile, purple team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
                else {
                    battleDesc = `Purple team slayed a ${dragonEvent?.monsterType?.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
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
                if (battleDesc.length > 0 && battleName !== 'Purple slayed a dragon') {
                    battleDesc += ` Meanwhile, purple team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
                else {
                    battleDesc = `Purple team slayed the ${heraldEvent.monsterType.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}.`
                }
            }
        }

        // Tower destruction
        if ((blueTowerKills > 0 || redTowerKills > 0) && (battleName !== 'Blue demolishes purple base' && battleName !== 'Purple demolishes blue base')) {
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
                    battleDesc = `Purple team destroyed ${redTowerKills} tower${redTowerKills > 1 ? 's' : ''}.`
                }
            }
        }

        // Inhib destruction
        if ((blueInhibKills > 0 || redInhibKills > 0) && (battleName !== 'Blue demolishes purple base' && battleName !== 'Purple demolishes blue base')) {
            if (blueInhibKills > 0) {
                if (battleDesc.length > 0 && !battleDesc.includes('inhib')) {
                    battleDesc += ` At the same time, blue team was able to take down ${blueInhibKills} inhib${blueInhibKills > 1 ? 's' : ''}.`
                } else {
                    battleDesc = `Blue team destroyed ${blueInhibKills} inhib${blueInhibKills > 1 ? 's' : ''}.`
                }
            }
            if (redInhibKills > 0) {
                if (battleDesc.length > 0 && !battleDesc.includes('inhib')) {
                    battleDesc += ` At the same time, purple team was able to take down ${redInhibKills} inhib${redInhibKills > 1 ? 's' : ''}.`
                } else {
                    battleDesc = `Purple team destroyed ${redInhibKills} inhib${redInhibKills > 1 ? 's' : ''}.`
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
                            descKillsStr = `During the fight, blue team ${battleDesc.toLowerCase().includes('blue') ? 'also' : ''} got ${blueKills} kill${blueKills > 1 ? 's' : ''}, while purple team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                        }
                    }
                    else {
                        descKillsStr = `During a ${battlePrefix} ${battleLocation}, blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                        if (redKills > 0) {
                            descKillsStr = `During a ${battlePrefix} ${battleLocation}, blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}, while purple team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                        }
                    }
                }
            }
            else if (redKills > 0 && fbFlag !== 'red') {
                if (fbFlag === 'red' && outcome[0] === 'B') {
                    descKillsStr += `Despite of that, purple team was able to win the fight, securing ${redKills} kills while only losing ${blueKills}.`
                } else if (evenTrade === false) {
                    if (battleDesc.length > 0) {
                        descKillsStr = `During the fight, purple team ${battleDesc.toLowerCase().includes('purple') ? 'also' : ''} got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                        if (blueKills > 0) {
                            descKillsStr = `During the fight, purple team ${battleDesc.toLowerCase().includes('purple') ? 'also' : ''} got ${redKills} kill${redKills > 1 ? 's' : ''}, while blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
                        }
                    }
                    else {
                        descKillsStr = `During a ${battlePrefix} ${battleLocation}, purple team got ${redKills} kill${redKills > 1 ? 's' : ''}. `
                        if (blueKills > 0) {
                            descKillsStr = `During a ${battlePrefix} ${battleLocation}, purple team got ${redKills} kill${redKills > 1 ? 's' : ''}, while blue team got ${blueKills} kill${blueKills > 1 ? 's' : ''}. `
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

    return (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0' }}>
            <Grid container className='gameSectionHeader'>
                <Grid item xs={12} sm={12} md={6}>
                    <div style={{ position: 'relative', width: '140px' }}>
                        <Typography className='gameSectionHeading'>Battles</Typography>
                        <Typography style={{ position: 'absolute', top: '0px', right: '0px', left: 'auto' }}><span style={{ backgroundColor: 'purple', color: 'white', padding: '10px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 'bold', filter: 'drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.25))' }}>BETA*</span></Typography>
                    </div>
                    <Typography style={{ fontSize: '14px', marginTop: '12px', marginBottom: '7px', color: '#6B7280' }}>*Descriptions provided below may not be 100% accurate</Typography>
                    <Typography className='gameSectionSubheading'>Fights that occurred during the match</Typography>
                </Grid>
                <Grid item className='BattlesCollapseBtnContainer' xs={12} sm={12} md={6}>
                    {/* <Typography style={{ marginTop: '4px' }} fontSize={16} fontWeight={600}>Fights Won:</Typography>
                    <Typography marginBottom={'20px'}><span style={{ color: '#3374FF', marginRight: '10px', fontWeight: 'bold' }}>{`Blue: ${blueTotalFightsWon} `}</span><span style={{ color: '#FF3F3F', fontWeight: 'bold' }}>{`Red: ${redTotalFightsWon}`}</span></Typography> */}
                </Grid>

                <Grid item xs={12} style={{ width: '100%', marginTop: '18px' }}>
                    {teamfights.map((fight, fightIndex) => (
                        <BattleCard
                            key={fightIndex}
                            battle={toBattleVM(fight, fightIndex, props.graphData)}
                            ctx={{ champsJSON, dataDragonVersion, platformId: gameData.info.platformId }}
                            defaultOpen={fightIndex === 0}
                        />
                    ))}
                </Grid>
                            </Grid>
        </div>
    )
}

export default Battles