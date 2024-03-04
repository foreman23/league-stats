import React, { useEffect, useState } from 'react'
import { Typography, Grid, Box } from '@mui/material'
import queues from '../jsonData/queues.json'
import summonerSpells from '../jsonData/summonerSpells.json'

const DisplayGame = (props) => {

    const participants = props.gameData.info.participants;
    const participant = props.gameData.info.participants.find(participant => participant.puuid === props.puuid);

    const summonerSpellsObj = Object.values(summonerSpells.data)
    const summonerSpell1 = summonerSpellsObj.find(spell => spell.key === participant.summoner1Id.toString())
    const summonerSpell2 = summonerSpellsObj.find(spell => spell.key === participant.summoner2Id.toString())

    const queue = queues.find(queue => queue.queueId === props.gameData.info.queueId)


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

        // Set laning descriptor

        // // Set match type from json
        // const matchQuery = queues.find(queue => queue.queueId === props.gameData.info.queueId);
        // console.log(matchQuery)
        // setMatchType(matchQuery);
    }, [])

    return (
        <Grid container style={{ justifyContent: 'center', marginBottom: '5px', display: 'flex', backgroundColor: `${participant.win === true ? '#ECF2FF' : '#FFF1F3'}`, padding: '10px', borderRadius: '10px' }}>

            {/* Match Information */}
            <Grid xs={2} display={'flex'} justifyContent={'center'} flexDirection={'column'} margin={'auto'} textAlign={'center'}>
                <Typography style={{ fontWeight: 'bold', color: `${participant.win === true ? '#3374ff' : '#ff3352'}`}} >{queue.description === '5v5 Ranked Solo games' ? 'Ranked Solo' : queue.description === '5v5 ARAM games' ? 'ARAM' : 'Normal'}</Typography>
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
                <Typography style={{ fontSize: '18px' }}>{`${participant.win === true ? 'Won' : 'Lost'} vs Maokai as ${participant.teamPosition} lane with gold difference of xxxx`}</Typography>
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