import React, { useEffect, useState } from 'react'
import { Typography, Grid, Divider, LinearProgress, Box, Tooltip } from '@mui/material'
// import queues from '../jsonData/queues.json'
import summonerSpells from '../jsonData/summonerSpells.json'
import calculateOpScores from '../functions/CalculateOpScores';
import calculateOpScoresAram from '../functions/CalculateOpScoresAram';

const DisplayGame = (props) => {

    const [isLaning, setIsLaning] = useState(true);
    const [queues, setQueues] = useState(null);
    const [queueTitle, setQueueTitle] = useState(null);

    const [timeSinceMatch, setTimeSinceMatch] = useState(null);
    const [matchType, setMatchType] = useState(null);

    const [champsJSON, setChampsJSON] = useState(null);

    // Find participant
    const participants = props.gameData.info.participants;
    const participant = props.gameData.info.participants.find(participant => participant.puuid === props.puuid);

    // Init datadragon version
    const dataDragonVersion = props.dataDragonVersion

    // Find summoner spells
    const summonerSpellsObj = Object.values(summonerSpells.data);
    const summonerSpell1 = summonerSpellsObj.find(spell => spell.key === participant.summoner1Id.toString());
    const summonerSpell2 = summonerSpellsObj.find(spell => spell.key === participant.summoner2Id.toString());

    // Find opposing laner
    const opposingLaner = props.gameData.info.participants.find(laner => laner.teamPosition === participant.teamPosition && laner.summonerId !== participant.summonerId)
    const opposingSummonerSpell1 = summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString());
    const opposingSummonerSpell2 = summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString());


    // Find highest gold earned
    const highestGold = props.gameData.info.participants.reduce((max, player) => Math.max(max, player.goldEarned), 0);

    // Find gold difference between opposing laner
    const participantGold = participant.goldEarned;
    let opposingGold = null
    let goldDifference = null
    if (opposingLaner) {
        opposingGold = opposingLaner.goldEarned;
        goldDifference = participantGold - opposingGold;
    }

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
    else if (goldDifference < 0) {
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

    const findQueueInfo = async () => {
        const queue = queues.find(queue => queue.queueId === props.gameData.info.queueId);
        return queue;
    }

    // Search JSON for relevant Queue data
    const findQueueTitle = async () => {

        let queue = await findQueueInfo();
        console.log(props.gameData.info)

        let queueTitle = queue.description;
        console.log(queueTitle)
        if (queueTitle === '5v5 Ranked Solo games') {
            setQueueTitle('Ranked Solo');
        }
        if (queueTitle === '5v5 Ranked Flex games') {
            setQueueTitle('Ranked Flex');
        }
        if (queueTitle === '5v5 Draft Pick games') {
            setQueueTitle('Normal');
        }
        else if (queueTitle === "Summoner's Rift Clash games") {
            setQueueTitle('SR Clash')
        }
        else if (queueTitle === '5v5 ARAM games') {
            setQueueTitle('ARAM')
            setIsLaning(false);
        }
        else if (queueTitle === 'ARAM Clash games') {
            setQueueTitle('ARAM Clash')
            setIsLaning(false);
        }
        else if (queueTitle === 'Arena') {
            setQueueTitle('Arena')
            setIsLaning(false);
        }
    }

    const getQueueJSON = async () => {
        try {
            const response = await fetch('https://static.developer.riotgames.com/docs/lol/queues.json');
            const data = await response.json();
            setQueues(data);
        } catch (error) {
            console.error('Error fetching queue data:', error);
        }
    }

    // Get champion JSON data from riot
    const getChampsJSON = async () => {
        try {
            const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/data/en_US/champion.json`);
            const data = await response.json();
            setChampsJSON(data);
            console.log(data)
        } catch (error) {
            console.error('Error fetching champion JSON data:', error);
        }
    }

    const [matchText, setMatchText] = useState(null);
    const [playersWithOpScores, setPlayersWithOpScores] = useState(null);
    const [playerScore, setPlayerScore] = useState(null);
    const [oppScore, setOppScore] = useState(null);
    useEffect(() => {
        // Fetch queue data JSON
        getQueueJSON();
        getChampsJSON();
        if (props.gameData.info.gameMode !== 'ARAM' && props.gameData.info.gameDuration > 180) {
            const { matchSummaryText, highestDamageDealt, playersWithScores } = calculateOpScores(props.gameData, participant)
            setMatchText(matchSummaryText)
            setPlayersWithOpScores(playersWithScores)

            setPlayerScore(playersWithScores.find(participant => participant.puuid === props.puuid))
            setOppScore(playersWithScores.find(laner => laner.teamPosition === participant.teamPosition && laner.summonerId !== participant.summonerId))
        }
        else if (props.gameData.info.gameMode === 'ARAM' || props.gameData.info.gameDuration < 180) {
            const { highestDamageDealt, playersWithScores } = calculateOpScoresAram(props.gameData, participant)
            setPlayersWithOpScores(playersWithScores)
            setPlayerScore(playersWithScores.find(participant => participant.puuid === props.puuid))
            setOppScore(playersWithScores.find(laner => laner.teamPosition === participant.teamPosition && laner.summonerId !== participant.summonerId))
        }

    }, [])


    // Set loading to false when data is loaded
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (playersWithOpScores !== null && playerScore !== null && oppScore !== null && champsJSON !== null) {
            setIsLoading(false)
        }

    }, [playersWithOpScores, playerScore, oppScore, champsJSON])

    useEffect(() => {

        if (queues) {
            // Call queue title function
            findQueueTitle();

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
        }

    }, [queues])

    if (isLoading) {
        return (
            <div></div>
        )
    }

    else {
        return (
            <Grid container style={{
                justifyContent: 'center',
                marginBottom: '5px',
                display: 'flex',
                backgroundColor: `${(props.gameData.info.gameDuration > 180) ? participant.win === true ? '#ECF2FF' : '#FFF1F3' : 'rgb(242, 242, 242)'}`,
                border: `2px ${(props.gameData.info.gameDuration > 180) ? participant.win === true ? '#DCE7FF' : '#FFE1E6' : 'rgb(224, 224, 224)'} solid`,
                padding: '10px',
                paddingTop: '35px',
                paddingBottom: '35px',
                borderRadius: '10px'
            }}>

                {/* Match Information */}
                <Grid xs={3} display={'flex'} justifyContent={'center'} flexDirection={'column'} margin={'auto'} textAlign={'center'}>
                    {props.gameData.info.gameDuration > 180 ? (
                        <div>
                            <Typography style={{ fontWeight: 'bold', fontSize: '18px', color: `${participant.win === true ? '#3374ff' : '#ff3352'}` }} >{queueTitle}</Typography>
                            <Typography style={{ fontSize: '14px' }}>{(participant.teamId === 100) ? '(Blue Team)' : '(Red Team)'}</Typography>
                            <Typography style={{ fontSize: '14px' }}>{participant.win === true ? 'Victory' : 'Defeat'}</Typography>
                        </div>
                    ) : (
                        <div>
                            <Typography style={{ fontWeight: 'bold', color: 'black' }} >{queueTitle}</Typography>
                            <Typography style={{ fontSize: '14px' }}>Remake</Typography>
                        </div>
                    )
                    }
                    <Divider style={{ margin: 'auto', marginTop: '3px', marginBottom: '3px' }} color={participant.win === true ? '#BED3FF' : '#FFC4CC'} width={'55%'}></Divider>
                    <Typography style={{ fontSize: '12px' }}>{timeSinceMatch}</Typography>
                </Grid>

                {/* Summoner profile for game */}
                <Grid xs={3} display={'flex'} flexDirection={'row'} margin={'auto'} textAlign={'center'}>
                    <Grid display={'flex'} flexDirection={'column'} position={'relative'}>
                        <Typography style={{
                            fontSize: '12px',
                            position: 'absolute',
                            backgroundColor: participant.teamId === 100 ? '#568CFF' : '#FF3A54',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '100%',
                            paddingLeft: '5px',
                            paddingRight: '5px',
                            paddingTop: '1px',
                            paddingBottom: '1px',
                            textAlign: 'center',
                            right: '0px',
                            bottom: 'auto',
                            top: '-5px',
                            left: 'auto',
                            justifyContent: 'center'
                        }}
                        >{participant.champLevel}
                        </Typography>
                        <img style={{ borderRadius: '100%', marginBottom: '3px', width: '58px', alignSelf: 'center', border: participant.teamId === 100 ? '3px #568CFF solid' : '3px #FF3A54 solid' }} alt='champion icon'
                            src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participant.championId)).id}.png`}>
                        </img>
                        <Grid flexDirection={'row'}>
                            <img style={{ width: '20px' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpell1.id}.png`}></img>
                            <img style={{ width: '20px' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpell2.id}.png`}></img>
                        </Grid>
                    </Grid>
                    <Grid display={'flex'} flexDirection={'column'} alignSelf={'center'} marginLeft={'10px'}>
                        <Typography style={{ fontSize: '14px', fontWeight: 'bold' }}>{Object.values(champsJSON.data).find(champ => champ.key === String(participant.championId)).name}</Typography>
                        <Typography style={{ fontSize: '13px' }}>{participant.kills}/{participant.deaths}/{participant.assists}</Typography>
                        <Box marginTop={'3px'} marginBottom={'3px'} alignSelf={'center'} width={'7px'} height={'7px'} borderRadius={'100%'} backgroundColor={'#BFBFBF'}></Box>
                        <Typography style={{ fontSize: '13px' }}>{participant.totalMinionsKilled + participant.neutralMinionsKilled} CS</Typography>
                    </Grid>
                </Grid>

                <Grid xs={1} display={'flex'} alignItems={'center'} flexDirection={'row'} textAlign={'center'} justifyContent={'center'}>
                    {/* <img style={{ width: '27px', opacity: '0.65' }} src='/images/swords.svg'></img> */}
                    <Divider orientation='vertical'></Divider>
                    {/* <Box style={{ width: '50px', height: '50px', backgroundColor: 'red' }}></Box> */}
                </Grid>

                {/* Opposing summoner profile */}
                <Grid xs={3} display={'flex'} flexDirection={'row'} margin={'auto'} textAlign={'center'}>
                    <Grid display={'flex'} flexDirection={'column'} position={'relative'}>
                        <Typography style={{
                            fontSize: '12px',
                            position: 'absolute',
                            backgroundColor: participant.teamId === 100 ? '#FF3A54' : '#568CFF',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '100%',
                            paddingLeft: '5px',
                            paddingRight: '5px',
                            paddingTop: '1px',
                            paddingBottom: '1px',
                            textAlign: 'center',
                            right: '0px',
                            bottom: 'auto',
                            top: '-5px',
                            left: 'auto',
                            justifyContent: 'center'
                        }}
                        >{opposingLaner.champLevel}
                        </Typography>
                        <img style={{ borderRadius: '100%', marginBottom: '3px', width: '58px', alignSelf: 'center', border: participant.teamId === 100 ? '3px #FF3A54 solid' : '3px #568CFF solid' }} alt='champion icon'
                            src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(opposingLaner.championId)).id}.png`}>
                        </img>
                        <Grid flexDirection={'row'}>
                            <img style={{ width: '20px' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${opposingSummonerSpell1.id}.png`}></img>
                            <img style={{ width: '20px' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${opposingSummonerSpell2.id}.png`}></img>
                        </Grid>
                    </Grid>
                    <Grid display={'flex'} flexDirection={'column'} alignSelf={'center'} marginLeft={'10px'}>
                        <Typography style={{ fontSize: '14px', fontWeight: 'bold' }}>{Object.values(champsJSON.data).find(champ => champ.key === String(opposingLaner.championId)).name}</Typography>
                        <Typography style={{ fontSize: '13px' }}>{opposingLaner.kills}/{opposingLaner.deaths}/{opposingLaner.assists}</Typography>
                        <Box marginTop={'3px'} marginBottom={'3px'} alignSelf={'center'} width={'7px'} height={'7px'} borderRadius={'100%'} backgroundColor={'#BFBFBF'}></Box>
                        <Typography style={{ fontSize: '13px' }}>{opposingLaner.totalMinionsKilled + opposingLaner.neutralMinionsKilled} CS</Typography>
                    </Grid>
                </Grid>

                <Grid xs={2} display={'flex'} flexDirection={'row'} margin={'auto'}>
                    <Grid xs={3}>
                        <Tooltip className='displayGameGoldBar' title={`Overall: ${playerScore.score.toFixed(1)}`}>
                            <LinearProgress variant='determinate' value={(playerScore.score * 10).toFixed(2)} sx={{ backgroundColor: participant.teamId === 100 ? '#BED3FF' : '#FFC3CC', '& .MuiLinearProgress-bar': { backgroundColor: participant.teamId === 100 ? '#568CFF' : '#FF3A54' } }} style={{ width: '64px', height: '14px', transform: 'rotate(270deg)', borderRadius: '5px' }}></LinearProgress>
                        </Tooltip>
                    </Grid>
                    <Grid xs={3}>
                        <Tooltip className='displayGameGoldBar' title={`Overall: ${oppScore.score.toFixed(1)}`}>
                            <LinearProgress variant='determinate' value={(oppScore.score * 10).toFixed(2)} sx={{ backgroundColor: participant.teamId === 100 ? '#FFC3CC' : '#BED3FF', '& .MuiLinearProgress-bar': { backgroundColor: participant.teamId === 100 ? '#FF3A54' : '#568CFF' } }} style={{ width: '64px', height: '14px', transform: 'rotate(270deg)', borderRadius: '5px' }}></LinearProgress>
                        </Tooltip>
                    </Grid>
                </Grid>

                {/* Laning Descriptor */}
                <Grid display={'flex'} justifyContent={'center'} flexDirection={'column'} margin={'auto'} textAlign={'start'}>
                    {/* {matchText} */}
                    {/* {isLaning &&
                        <Typography style={{ fontSize: '18px' }}>{`${differenceDesc} ${opposingLaner.championName} as ${participantLane} with gold difference of ${goldDifference.toLocaleString()}g at end of game.`}</Typography>
                    }
                    {!isLaning &&
                        <Typography style={{ fontSize: '18px' }}>{`${participant.win ? 'Won' : 'Lost'} ${queueTitle} with ${participantGold.toLocaleString()}g at end of game.`}</Typography>
                    } */}
                </Grid>


                {/* Champions that participated */}
                {/* <Grid display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'start'}>
                    {participants.filter(participant => participant.teamId === 100).map(player => (
                        <Grid display={'flex'}>
                            <img style={{ borderRadius: '0px', width: '24px', marginRight: '7px' }} alt='champion icon' src={`https://ddragon.leagueoflegends.com/cdn/${props.ddragonVersion}/img/champion/${player.championName}.png`}></img>
                            <p style={{ textDecoration: 'none', color: 'black' }} href={`/profile/na1/${player.riotIdGameName}/${player.riotIdTagline}`}><Typography style={{ fontSize: '14px' }}><b>{player.riotIdGameName}</b> #{player.riotIdTagline}</Typography></p>
                        </Grid>
                    ))}
                </Grid>
                <Grid display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'start'}>
                    {participants.filter(participant => participant.teamId === 200).map(player => (
                        <Grid display={'flex'}>
                            <img style={{ borderRadius: '0px', width: '24px', marginRight: '7px' }} alt='champion icon' src={`https://ddragon.leagueoflegends.com/cdn/${props.ddragonVersion}/img/champion/${player.championName}.png`}></img>
                            <p style={{ textDecoration: 'none', color: 'black' }} href={`/profile/na1/${player.riotIdGameName}/${player.riotIdTagline}`}><Typography style={{ fontSize: '14px' }}><b>{player.riotIdGameName}</b> #{player.riotIdTagline}</Typography></p>
                        </Grid>
                    ))}
                </Grid> */}

            </Grid>
        )
    }

}

export default DisplayGame