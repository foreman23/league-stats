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
    const opposingPlayers = props.gameData.info.participants.filter(players => players.teamId !== participant.teamId)
    let opposingLaner = null;
    if (props.gameData.info.gameMode === "ARAM") {
        const teamPlayers = props.gameData.info.participants.filter(players => players.teamId === participant.teamId)
        let playerIndex = 0;
        for (let i = 0; i < teamPlayers.length; i++) {
            if (props.gameData.info.participants[i].riotIdGameName === participant.riotIdGameName) {
                playerIndex = i;
                break
            }
        }
        opposingLaner = opposingPlayers[playerIndex]
    }
    else {
        opposingLaner = props.gameData.info.participants.find(laner => laner.teamPosition === participant.teamPosition && laner.summonerId !== participant.summonerId)
    }
    if (opposingLaner === undefined) {
        opposingLaner = opposingPlayers[0]
    }

    let opposingSummonerSpell1 = null;
    let opposingSummonerSpell2 = null;
    if (opposingLaner) {
        opposingSummonerSpell1 = summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString());
        opposingSummonerSpell2 = summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString());
    }

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

        let queueTitle = queue?.description || null;
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
        else if (queueTitle === 'ARURF games') {
            setQueueTitle('ARURF')
        }
        else if (queueTitle === 'Arena') {
            setQueueTitle('Arena')
            setIsLaning(false);
        }
        // CHANGE THIS ONCE RIOT UPDATES THEIR QUEUES JSON
        else if (queueTitle === null) {
            setQueueTitle('Swiftplay')
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
            const opposingPlayers = props.gameData.info.participants.filter(players => players.teamId !== participant.teamId)
            const teamPlayers = props.gameData.info.participants.filter(players => players.teamId === participant.teamId)
            let playerIndex = 0;
            for (let i = 0; i < teamPlayers.length; i++) {
                if (props.gameData.info.participants[i].riotIdGameName === participant.riotIdGameName) {
                    playerIndex = i;
                    break
                }
            }
            opposingLaner = opposingPlayers[playerIndex]
            setOppScore(opposingLaner)
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
            <Grid className='displayGameMainContainer' container style={{
                backgroundColor: `${(props.gameData.info.gameDuration > 180) ? participant.win === true ? '#ECF2FF' : '#FFF1F3' : 'rgb(242, 242, 242)'}`,
                border: `2px ${(props.gameData.info.gameDuration > 180) ? participant.win === true ? '#DCE7FF' : '#FFE1E6' : 'rgb(224, 224, 224)'} solid`,
            }}>

                {/* Match Information */}
                <Grid className='displayGameMatchInfoContainer' display={'flex'} justifyContent={'center'} margin={'auto'} textAlign={'center'} flexDirection={'row'} alignItems={'center'}>
                    {props.gameData.info.gameDuration > 180 ? (
                        <div className='displayGameMatchInfo'>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography style={{ fontWeight: 'bold', fontSize: '20px', color: '#7E7E7E', marginRight: '12px' }} >{queueTitle}</Typography>
                                <Typography style={{ fontSize: '16px', color: '#7A7A7A' }}>{participant.win === true ? '(Victory)' : '(Defeat)'}</Typography>
                            </span>
                            <span>
                                <Divider style={{ width: '150px', color: '#ABABAB', marginTop: '6px' }}></Divider>
                            </span>
                        </div>
                    ) : (
                        <div className='displayGameMatchInfo'>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography style={{ fontWeight: 'bold', fontSize: '20px', color: '#7E7E7E', marginRight: '12px' }} >{queueTitle}</Typography>
                                <Typography style={{ fontSize: '16px', color: '#7A7A7A' }}>(Remake)</Typography>
                            </span>
                            <span>
                                <Divider style={{ width: '150px', color: '#ABABAB', marginTop: '6px' }}></Divider>
                            </span>
                        </div>
                    )
                    }
                    {/* <Divider style={{ margin: 'auto', marginTop: '3px', marginBottom: '3px' }} color={participant.win === true ? '#BED3FF' : '#FFC4CC'} width={'55%'}></Divider> */}
                    <Typography className='displayGameDurationHeader' style={{ fontSize: '12px' }}>Duration: {Math.floor(props.gameData.info.gameDuration / 60)}m</Typography>
                    <Typography className='displayGameTimeHeader' style={{ fontSize: '12px' }}>{timeSinceMatch}</Typography>
                </Grid>

                {/* Main Container */}
                <Grid style={{ display: 'flex', marginTop: '8px' }}>
                    {/* Summoner profile for game */}
                    <Grid className='displayGamePlayerProfileContainer' order={{ xs: 1 }} xs={5} sm={5} display={'flex'} flexDirection={'row'} margin={'auto'} textAlign={'center'}>
                        <Grid display={'flex'} flexDirection={'column'} alignSelf={'center'} marginRight={'10%'}>
                            <Typography className='displayGameRiotName'>{participant.riotIdGameName}</Typography>
                            <Typography className='displayGameSubheader' style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '3px', color: '#7E7E7E' }}>{Object.values(champsJSON.data).find(champ => champ.key === String(participant.championId)).name}</Typography>
                            <Typography className='displayGameSubheader' style={{ fontSize: '14px', color: '#7E7E7E' }}>{`${participant.kills}/${participant.deaths}/${participant.assists} (${participant.totalMinionsKilled + participant.neutralMinionsKilled} CS)`}</Typography>
                            <Grid style={{ marginTop: '10px'}}>
                                {participants.filter(player => player.teamId === participant.teamId && player.summonerId !== participant.summonerId).map((player, index) => (
                                    <Tooltip arrow title={`${player.riotIdGameName} #${player.riotIdTagline}`}>
                                        <a href={`/profile/${props.gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`} style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                                            <img className='displayGameTeamChamps' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).id}.png`}></img>
                                            <Box className='displayGameTeamChampsBox' style={{ backgroundColor: player.teamId === 100 ? '#568CFF' : '#FF3A54' }}></Box>
                                        </a>
                                    </Tooltip>
                                ))}
                            </Grid>
                        </Grid>
                        <Grid display={'flex'} flexDirection={'column'} position={'relative'}>
                            <Tooltip arrow placement='top' title={`${participant.riotIdGameName} #${participant.riotIdTagline}`}>
                                <a href={`/profile/${props.gameData.info.platformId.toLowerCase()}/${participant.riotIdGameName}/${participant.riotIdTagline.toLowerCase()}`} style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                                    <Typography className='displayGameChampLevel' style={{
                                        fontSize: '14px',
                                        position: 'absolute',
                                        backgroundColor: participant.teamId === 200 ? '#FF3A54' : '#568CFF',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: '100%',
                                        paddingLeft: '8px',
                                        paddingRight: '8px',
                                        paddingTop: '1px',
                                        paddingBottom: '1px',
                                        textAlign: 'center',
                                        right: '5px',
                                        bottom: 'auto',
                                        top: '-5px',
                                        left: 'auto',
                                        justifyContent: 'center'
                                    }}
                                    >{participant.champLevel}
                                    </Typography>
                                    <img className='displayGameMainChampImg' style={{ border: participant.teamId === 100 ? '3px #568CFF solid' : '3px #FF3A54 solid' }} alt='champion icon'
                                        src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(participant.championId)).id}.png`}>
                                    </img>
                                </a>
                            </Tooltip>
                            <Grid className='displayGameSummonerSpells'>
                                <Tooltip
                                    title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === participant.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === participant.summoner1Id.toString()).description}</span></>}
                                    disableInteractive
                                    arrow
                                >
                                    <img style={{ width: '23px', borderRadius: '2px' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpell1.id}.png`}></img>
                                </Tooltip>
                                <Tooltip
                                    title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === participant.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === participant.summoner2Id.toString()).description}</span></>}
                                    disableInteractive
                                    arrow
                                >
                                    <img style={{ width: '23px', borderRadius: '2px' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpell2.id}.png`}></img>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>
                    {/* OP Score Bars */}
                    <Grid order={{ xs: 2 }} className='displayGameGoldBarContainer' xs={2} sm={2}>
                        <div style={{ display: 'flex' }}>
                            <div style={{ marginRight: '-50px' }}>
                                <Tooltip className='displayGameGoldBar' title={`Overall: ${playerScore.score.toFixed(1)}`}>
                                    <LinearProgress className='displayGameOpScoreBar' variant='determinate' value={(playerScore.score * 10).toFixed(2)} sx={{ backgroundColor: participant.teamId === 100 ? '#BED3FF' : '#FFC3CC', '& .MuiLinearProgress-bar': { backgroundColor: participant.teamId === 100 ? '#568CFF' : '#FF3A54' } }}></LinearProgress>
                                </Tooltip>
                            </div>
                            <div style={{ marginLeft: '0px' }}>
                                <Tooltip className='displayGameGoldBar' title={`Overall: ${oppScore.score.toFixed(1)}`}>
                                    <LinearProgress className='displayGameOpScoreBar' variant='determinate' value={(oppScore.score * 10).toFixed(2)} sx={{ backgroundColor: participant.teamId === 100 ? '#FFC3CC' : '#BED3FF', '& .MuiLinearProgress-bar': { backgroundColor: participant.teamId === 100 ? '#FF3A54' : '#568CFF' } }}></LinearProgress>
                                </Tooltip>
                            </div>
                        </div>
                    </Grid>
                    {/* Opposing summoner profile */}
                    <Grid className='displayGameOpposingProfileContainer' order={{ xs: 3 }} xs={5} sm={5} display={'flex'} flexDirection={'row'} margin={'auto'} textAlign={'center'}>
                        <Grid display={'flex'} flexDirection={'column'} position={'relative'}>
                            <Tooltip arrow placement='top' title={`${opposingLaner.riotIdGameName} #${opposingLaner.riotIdTagline}`}>
                                <a href={`/profile/${props.gameData.info.platformId.toLowerCase()}/${opposingLaner.riotIdGameName}/${opposingLaner.riotIdTagline.toLowerCase()}`} style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                                    <Typography className='displayGameChampLevel' style={{
                                        fontSize: '14px',
                                        position: 'absolute',
                                        backgroundColor: participant.teamId === 100 ? '#FF3A54' : '#568CFF',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        borderRadius: '100%',
                                        paddingLeft: '8px',
                                        paddingRight: '8px',
                                        paddingTop: '1px',
                                        paddingBottom: '1px',
                                        textAlign: 'center',
                                        right: '5px',
                                        bottom: 'auto',
                                        top: '-5px',
                                        left: 'auto',
                                        justifyContent: 'center'
                                    }}
                                    >{opposingLaner.champLevel}
                                    </Typography>
                                    <img className='displayGameMainChampImg' style={{ border: participant.teamId === 100 ? '3px #FF3A54 solid' : '3px #568CFF solid' }} alt='champion icon'
                                        src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(opposingLaner.championId)).id}.png`}>
                                    </img>
                                </a>
                            </Tooltip>
                            <Grid className='displayGameSummonerSpells'>
                                <Tooltip
                                    title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).description}</span></>}
                                    disableInteractive
                                    arrow
                                >
                                    <img style={{ width: '23px', borderRadius: '2px' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${opposingSummonerSpell1.id}.png`}></img>
                                </Tooltip>
                                <Tooltip
                                    title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).description}</span></>}
                                    disableInteractive
                                    arrow
                                >
                                    <img style={{ width: '23px', borderRadius: '2px' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${opposingSummonerSpell2.id}.png`}></img>
                                </Tooltip>
                            </Grid>
                        </Grid>
                        <Grid display={'flex'} flexDirection={'column'} alignSelf={'center'} marginLeft={'10%'}>
                            <Typography className='displayGameRiotName'>{opposingLaner.riotIdGameName}</Typography>
                            <Typography className='displayGameSubheader' style={{ fontWeight: 'bold', marginBottom: '3px', color: '#7E7E7E' }}>{Object.values(champsJSON.data).find(champ => champ.key === String(opposingLaner.championId)).name}</Typography>
                            <Typography className='displayGameSubheader' style={{ color: '#7E7E7E' }}>{`${opposingLaner.kills}/${opposingLaner.deaths}/${opposingLaner.assists} (${opposingLaner.totalMinionsKilled + opposingLaner.neutralMinionsKilled} CS)`}</Typography>
                            <Grid style={{ marginTop: '10px' }}>
                                {participants.filter(player => player.teamId !== participant.teamId && player.summonerId !== opposingLaner.summonerId).map((player, index) => (
                                    <Tooltip arrow title={`${player.riotIdGameName} #${player.riotIdTagline}`}>
                                        <a href={`/profile/${props.gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`} style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                                            <img className='displayGameTeamChamps' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).id}.png`}></img>
                                            <Box className='displayGameTeamChampsBox' style={{ backgroundColor: player.teamId === 100 ? '#568CFF' : '#FF3A54' }}></Box>
                                        </a>
                                    </Tooltip>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        )
    }

}

export default DisplayGame