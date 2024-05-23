import React, { useEffect, useState } from 'react'
import { Typography, Grid, Box } from '@mui/material'
import queues from '../jsonData/queues.json'
import summonerSpells from '../jsonData/summonerSpells.json'

const DisplayGame = (props) => {

    // Find participant
    const participants = props.gameData.info.participants;
    const participant = props.gameData.info.participants.find(participant => participant.puuid === props.puuid);

    // Find summoner spells
    const summonerSpellsObj = Object.values(summonerSpells.data);
    const summonerSpell1 = summonerSpellsObj.find(spell => spell.key === participant.summoner1Id.toString());
    const summonerSpell2 = summonerSpellsObj.find(spell => spell.key === participant.summoner2Id.toString());

    // Find opposing laner
    const opposingLaner = props.gameData.info.participants.find(laner => laner.teamPosition === participant.teamPosition && laner.summonerId !== participant.summonerId)

    // Find gold difference between opposing laner
    const participantGold = participant.goldEarned;
    const opposingGold = opposingLaner.goldEarned;
    const goldDifference = participantGold - opposingGold;

    // Generate gold difference descriptor
    let differenceDesc = null;

    if (goldDifference > 4000) {
        differenceDesc = "Obliterated"
    }
    else if (goldDifference > 3000) {
        differenceDesc = "Dominated"
    }
    else if (goldDifference > 0) {
        differenceDesc = "Won against"
    }
    else if (goldDifference == 0) {
        differenceDesc = "Tied"
    }
    else if (goldDifference < -4000) {
        differenceDesc = "Obliterated by"
    }
    else if (goldDifference < -3000) {
        differenceDesc = "Dominated by"
    }
    else if (goldDifference < 0 ) {
        differenceDesc = "Lost to"
    }

    // Set lane titles
    let participantLane = participant.teamPosition.toLowerCase()
    if (participantLane === 'utility') {
        participantLane = 'support'
    }
    if (participantLane === 'middle') {
        participantLane = 'mid'
    }

    // Find queue title
    const queue = queues.find(queue => queue.queueId === props.gameData.info.queueId)
    let queueTitle = queue.description;
    let isLaning = true; // set to false for non summoners rift modes
    if (queueTitle === '5v5 Ranked Solo games') {
        queueTitle = 'Ranked Solo';
    }
    if (queueTitle === '5v5 Ranked Flex games') {
        queueTitle = 'Ranked Flex'
    }
    if (queueTitle === '5v5 Draft Pick games') {
        queueTitle = 'Normal'
    }
    else if (queueTitle === '5v5 ARAM games') {
        queueTitle = 'ARAM';
        isLaning = false;
    }
    else if (queueTitle === 'Arena') {
        isLaning = false;
    }

    const [timeSinceMatch, setTimeSinceMatch] = useState(null);
    const [matchType, setMatchType] = useState(null);

    useEffect(() => {
    
        // props.ddragonVersion, props.gameData, props.puuid
        console.log(props)
        

        // Set time since match was played
        const timeMatchStarted = new Date(props.gameData.info.gameEndTimestamp);
        const now = new Date();
        const timeDifferenceInSeconds = Math.floor((now - timeMatchStarted) / 1000);

        if (timeDifferenceInSeconds < 60) {
            // Less than a minute
            setTimeSinceMatch(`${timeDifferenceInSeconds} seconds ago`);
        } else if (timeDifferenceInSeconds < 3600) {
            // Less than an hour
            const minutes = Math.floor(timeDifferenceInSeconds / 60);
            setTimeSinceMatch(`${minutes} minute${minutes !== 1 ? 's' : ''} ago`);
        } else if (timeDifferenceInSeconds < 86400) {
            // Less than a day
            const hours = Math.floor(timeDifferenceInSeconds / 3600);
            setTimeSinceMatch(`${hours} hour${hours !== 1 ? 's' : ''} ago`);
        } else {
            // More than a day
            const days = Math.floor(timeDifferenceInSeconds / 86400);
            setTimeSinceMatch(`${days} day${days !== 1 ? 's' : ''} ago`);
        }

    }, [])

    return (
        <Grid container style={{ justifyContent: 'center', marginBottom: '5px', display: 'flex', backgroundColor: `${participant.win === true ? '#ECF2FF' : '#FFF1F3'}`, padding: '10px', borderRadius: '10px' }}>

            {/* Match Information */}
            <Grid xs={2} display={'flex'} justifyContent={'center'} flexDirection={'column'} margin={'auto'} textAlign={'center'}>
                <Typography style={{ fontWeight: 'bold', color: `${participant.win === true ? '#3374ff' : '#ff3352'}`}} >{queueTitle}</Typography>
                <Typography style={{ fontSize: '14px' }}>{participant.win === true ? 'Victory' : 'Defeat'}</Typography>
                <Typography style={{ fontSize: '12px' }}>{timeSinceMatch}</Typography>
            </Grid>

            {/* Summoner profile for game */}
            <Grid xs={2} display={'flex'} justifyContent={'center'} flexDirection={'column'} margin={'auto'} textAlign={'center'}>
                <img style={{ borderRadius: '100%', width: '54px', alignSelf: 'center', border: '3px #cccaca solid' }} alt='champion icon'
                    src={`https://ddragon.leagueoflegends.com/cdn/${props.ddragonVersion}/img/champion/${participant.championName}.png`}>
                </img>
                <Grid style={{ flexDirection: 'row', marginTop: '3px' }}>
                    <img style={{ width: '20px' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpell1.id}.png`}></img>
                    <img style={{ width: '20px' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpell2.id}.png`}></img>
                </Grid>
                <Typography style={{ fontSize: '12px' }}>{participant.championName}</Typography>
                <Typography style={{ fontSize: '12px' }}>{participant.kills}/{participant.deaths}/{participant.assists}</Typography>
                <Typography style={{ fontSize: '12px' }}>{participant.totalMinionsKilled + participant.neutralMinionsKilled} CS</Typography>
            </Grid>

            {/* Laning Descriptor */}
            <Grid xs={6} display={'flex'} justifyContent={'center'} flexDirection={'column'} margin={'auto'} textAlign={'start'}>
                {isLaning && 
                    <Typography style={{ fontSize: '18px' }}>{`${differenceDesc} ${opposingLaner.championName} as ${participantLane} with gold difference of ${goldDifference.toLocaleString()}g at end of game.`}</Typography>
                }
                {!isLaning &&
                    <Typography style={{ fontSize: '18px' }}>{`${participant.win ? 'Won' : 'Lost'} ${queueTitle} with ${participantGold.toLocaleString()}g at end of game.`}</Typography>
                }
            </Grid>


            {/* Champions that participated */}
            {/* <Grid xs={4} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'start'}>
                {participants.filter(participant => participant.teamId === 100).map(player => (
                    <Grid display={'flex'}>
                        <img style={{ borderRadius: '0px', width: '24px', marginRight: '7px' }} alt='champion icon' src={`https://ddragon.leagueoflegends.com/cdn/${props.ddragonVersion}/img/champion/${player.championName}.png`}></img>
                        <a style={{ textDecoration: 'none', color: 'black' }} href={`/na1/${player.riotIdGameName}/${player.riotIdTagline}`}><Typography style={{ fontSize: '14px' }}><b>{player.riotIdGameName}</b> #{player.riotIdTagline}</Typography></a>
                    </Grid>
                ))}
            </Grid>
            <Grid xs={4} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'start'}>
                {participants.filter(participant => participant.teamId === 200).map(player => (
                    <Grid display={'flex'}>
                        <img style={{ borderRadius: '0px', width: '24px', marginRight: '7px' }} alt='champion icon' src={`https://ddragon.leagueoflegends.com/cdn/${props.ddragonVersion}/img/champion/${player.championName}.png`}></img>
                        <a style={{ textDecoration: 'none', color: 'black' }} href={`/na1/${player.riotIdGameName}/${player.riotIdTagline}`}><Typography style={{ fontSize: '14px' }}><b>{player.riotIdGameName}</b> #{player.riotIdTagline}</Typography></a>
                    </Grid>
                ))}
            </Grid> */}

        </Grid>
    )
}

export default DisplayGame