import React from 'react'
import { Button, Typography, Box, Grid, ButtonGroup, Container, ListItem, List, TableContainer, Table, TableHead, TableRow, TableCell, LinearProgress, CircularProgress, Tooltip } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import { useParams, useLocation } from 'react-router-dom';
import runes from '../jsonData/runes.json';
import summonerSpells from '../jsonData/summonerSpells.json';

const GenericDetails = () => {

    // Init navigate
    const navigate = useNavigate();

    const [isLaning, setIsLaning] = useState(true);
    const [queueTitle, setQueueTitle] = useState(null);
    const [queues, setQueues] = useState(null);

    const findQueueInfo = async () => {
        const queue = queues.find(queue => queue.queueId === gameData.info.queueId);
        return queue;
    }

    // Search JSON for relevant Queue data
    const findQueueTitle = async () => {

        let queue = await findQueueInfo();
        console.log(gameData.info)

        let queueTitle = queue.description;
        console.log(queueTitle)
        // let isLaning = true; // set to false for non summoners rift modes
        if (queueTitle === '5v5 Ranked Solo games') {
            setQueueTitle('Ranked Solo');
        }
        if (queueTitle === '5v5 Ranked Flex games') {
            setQueueTitle('Ranked Flex');
        }
        if (queueTitle === '5v5 Draft Pick games') {
            // queueTitle = 'Normal'
            setQueueTitle('Normal');
        }
        else if (queueTitle === '5v5 ARAM games') {
            // queueTitle = 'ARAM';
            setQueueTitle('ARAM')
            setIsLaning(false);
            // isLaning = false;
        }
        else if (queueTitle === 'Arena') {
            setQueueTitle('Arena')
            setIsLaning(false);
            // isLaning = false;
        }
    }

    const getQueueJSON = async () => {
        try {
            const response = await fetch('https://static.developer.riotgames.com/docs/lol/queues.json');
            console.log(response)
            const data = await response.json();
            setQueues(data);
        } catch (error) {
            console.error('Error fetching queue data:', error);
        }
    }

    useEffect(() => {
        // Fetch queue data JSON
        getQueueJSON();
    }, [])

    useEffect(() => {
        if (queues) {
            // Call queue title function
            findQueueTitle();
        }

    }, [queues])

    // Get props
    const location = useLocation();
    const { gameId, summonerName, riotId } = useParams();
    const { gameData } = location.state;
    const { alternateRegion } = location.state;
    const { dataDragonVersion } = location.state;

    // Calculate individual player scores
    const [playersWithScores, setPlayersWithScore] = useState([]);
    const [highestDamageDealt, setHighestDamageDealt] = useState(null);

    // Find player data
    const playerData = gameData.info.participants.find(player => player.riotIdGameName === summonerName)
    console.log(playerData)

    // Find duration and date of game start
    let gameStartDate = new Date(gameData.info.gameCreation);
    // console.log(gameStartDate)
    let gameDuration = gameData.info.gameDuration;
    if (gameDuration >= 3600) {
        gameDuration = `${(gameDuration / 3600).toFixed(1)} hrs`
        if (gameDuration === '1.0 hrs') {
            gameDuration = '1 hr';
        }
    }
    else {
        gameDuration = `${Math.floor((gameDuration / 60))} mins`
    }

    // Handle section button click
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        }
    }

    // Generate placement suffix
    let placementSuffix = null;
    if (playerData.placement === 1) {
        placementSuffix = "st";
    }
    else if (playerData.placement === 2) {
        placementSuffix = "nd";
    }
    else if (playerData.placement === 3) {
        placementSuffix = "rd";
    }
    else {
        placementSuffix = "th";
    }

    // Create summoner spells object
    const summonerSpellsObj = Object.values(summonerSpells.data);

    // Create runes object
    const runesObj = Object.values(runes);

    // Returns keystone url
    const getKeystoneIconUrl = (player, runesObj) => {
        const styleId = player.perks.styles[0].style;
        const keystoneId = player.perks.styles[0].selections[0].perk;

        const style = runesObj.find(rune => rune.id === styleId);
        if (style) {
            const keystone = style.slots[0].runes.find(rune => rune.id === keystoneId);
            if (keystone) {
                // console.log(keystone.icon)
                return `https://ddragon.canisback.com/img/${keystone.icon}`;
            } else {
                console.error(`Keystone with ID ${keystoneId} not found in style ${styleId}`);
                return '';
            }
        } else {
            console.error(`Style with ID ${styleId} not found`);
            return '';
        }
    };

    const calculateOpScores = () => {
        const players = gameData.info.participants;

        // Calculate total kills for each team
        const teamKills = players.reduce((acc, player) => {
            if (!acc[player.teamId]) {
                acc[player.teamId] = 0;
            }
            acc[player.teamId] += player.kills;
            return acc;
        }, {});

        const maxValues = {
            kills: Math.max(...players.map(p => p.kills)),
            deaths: Math.max(...players.map(p => p.deaths)),
            assists: Math.max(...players.map(p => p.assists)),
            damage: Math.max(...players.map(p => p.totalDamageDealtToChampions)),
            gold: Math.max(...players.map(p => p.goldEarned)),
            cs: Math.max(...players.map(p => p.totalMinionsKilled + p.neutralMinionsKilled)),
            killParticipation: Math.max(...players.map(p => (p.kills + p.assists) / teamKills[p.teamId]))
        };

        const normalizedPlayers = players.map((player, index) => {
            const killParticipation = (player.kills + player.assists) / teamKills[player.teamId];

            const normalized = {
                kills: player.kills / maxValues.kills,
                deaths: 1 - (player.deaths / maxValues.deaths),
                assists: player.assists / maxValues.assists,
                damage: player.totalDamageDealtToChampions / maxValues.damage,
                gold: player.goldEarned / maxValues.gold,
                cs: (player.totalMinionsKilled + player.neutralMinionsKilled) / maxValues.cs,
                killParticipation: killParticipation / maxValues.killParticipation
            };

            const weights = {
                kills: 1.5,
                deaths: 1.5,
                assists: 1.2,
                damage: 1.3,
                gold: 1.1,
                cs: 1.0,
                killParticipation: 1.4
            };

            let score = (
                normalized.kills * weights.kills +
                normalized.deaths * weights.deaths +
                normalized.assists * weights.assists +
                normalized.damage * weights.damage +
                normalized.gold * weights.gold +
                normalized.cs * weights.cs +
                normalized.killParticipation * weights.killParticipation
            );

            if (Number.isNaN(score)) {
                return { ...player, score: 0 }
            } else {
                return { ...player, score: score + (index * 0.001) }; // Adjust for uniqueness
            }
        });

        console.log(normalizedPlayers)

        const minScore = Math.min(...normalizedPlayers.map(p => p.score));
        const maxScore = Math.max(...normalizedPlayers.map(p => p.score));

        const playersWithOpScores = normalizedPlayers.map(player => ({
            ...player,
            opScore: ((player.score - minScore) / (maxScore - minScore)) * 10
        }));

        console.log(playersWithOpScores)

        // Sort players by score
        let sortedPlayers = playersWithOpScores.sort((a, b) => b.opScore - a.opScore);

        // Assign game standing and find highest damage dealt
        let highestDamageDealt = 0;
        sortedPlayers.forEach((player, index) => {
            if (player.totalDamageDealtToChampions > highestDamageDealt) {
                highestDamageDealt = player.totalDamageDealtToChampions;
            }

            let standing = index + 1;
            if (standing === 1) {
                player.standing = '1st'
            }
            else if (standing === 2) {
                player.standing = '2nd'
            }
            else if (standing === 3) {
                player.standing = '3rd'
            }
            else {
                player.standing = `${standing}th`
            }
        });

        // Update the gameData object with the new opScores
        const updatedGameData = { ...gameData };
        updatedGameData.info.participants = sortedPlayers;
        setHighestDamageDealt(highestDamageDealt)
        setPlayersWithScore(updatedGameData.info.participants)
    };

    useEffect(() => {
        document.title = `${playerData.riotIdGameName}#${playerData.riotIdTagline} - ${new Date(gameData.info.gameCreation).toLocaleDateString()} @${new Date(gameData.info.gameCreation).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(/\s/g, '')}`
        calculateOpScores();

    }, [gameData, alternateRegion]);

    const opposingLaner = gameData.info.participants.find(laner => laner.teamPosition === playerData.teamPosition && laner.summonerId !== playerData.summonerId)

    const [isLoading, setIsLoading] = useState(true);
    // Render page once data is loaded
    useEffect(() => {
        console.log(playersWithScores)
        if (playersWithScores.length > 0) {
            setIsLoading(false);
        }
    }, [playersWithScores])

    if (isLoading) {
        return (
            <Box>
                <Navbar></Navbar>
                <LinearProgress></LinearProgress>
            </Box>
        )
    }

    return (
        <div>
            <div id={'SummaryAnchor'} style={{ backgroundColor: 'white' }}>
                <Navbar></Navbar>

                <Grid className='GameDetailsContainer' style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '20px' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

                    {/* Section 1 */}
                    <Grid container marginLeft={'2%'} marginRight={'2%'} marginTop={'2%'} maxWidth={'90%'}>
                        <Grid style={{ textAlign: 'center', display: 'flex', alignItems: 'center' }} justifyContent={'center'} item xs={5}>
                            {playerData.win ? (
                                <div className='clickableName' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`)} style={{ position: 'relative', display: 'inline-block' }}>
                                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                        <img
                                            style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${playerData.championName}.png`} alt=''>
                                        </img>
                                    </Tooltip>
                                    <img style={{ position: 'absolute', top: '8px', right: '8px', width: '36px' }} src='/images/accept.png' alt='Crown'></img>
                                    <Box style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '10px', backgroundColor: playerData.teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                                </div>
                            ) : (
                                <div className='clickableName' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`)} style={{ position: 'relative', display: 'inline-block' }}>
                                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                        <img
                                            style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px', filter: 'grayscale(80%)' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${playerData.championName}.png`} alt=''>
                                        </img>
                                    </Tooltip>
                                    <img style={{ position: 'absolute', top: '8px', right: '8px', width: '36px' }} src='/images/close.png' alt='Crown'></img>
                                    <Box style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '10px', backgroundColor: playerData.teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                                </div>
                            )}
                            <img style={{ width: '55px' }} src='/images/swords.svg'></img>
                            {playerData.win ? (
                                <div className='clickableName' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${opposingLaner.riotIdGameName}/${opposingLaner.riotIdTagline.toLowerCase()}`)} style={{ position: 'relative', display: 'inline-block' }}>
                                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${opposingLaner.riotIdGameName} #${opposingLaner.riotIdTagline}`}>
                                        <img
                                            style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px', filter: 'grayscale(80%)' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${opposingLaner.championName}.png`} alt=''>
                                        </img>
                                    </Tooltip>
                                    <Box style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '10px', backgroundColor: playerData.teamId !== 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                                </div>
                            ) : (
                                <div className='clickableName' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${opposingLaner.riotIdGameName}/${opposingLaner.riotIdTagline.toLowerCase()}`)} style={{ position: 'relative', display: 'inline-block' }}>
                                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${opposingLaner.riotIdGameName} #${opposingLaner.riotIdTagline}`}>
                                        <img
                                            style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px', }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${opposingLaner.championName}.png`} alt=''>
                                        </img>
                                    </Tooltip>
                                    <Box style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '10px', backgroundColor: playerData.teamId !== 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                                </div>
                            )}
                        </Grid>
                        <Grid justifyContent={'center'} item xs={7}>
                            <Typography style={{ paddingTop: '10px' }} fontSize={26} fontWeight={600}>
                                <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                    <a className='clickableName' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`)}>
                                        {playerData.riotIdGameName}
                                    </a>
                                </Tooltip>
                                <span style={{ color: playerData.win ? '#17BA6C' : '#FF3F3F' }}>{playerData.win ? ' won' : ' lost'}</span> playing {playerData.championName} {playerData.teamPosition.toLowerCase()} for <span style={{ color: playerData.teamId === 100 ? '#3374FF' : '#FF3F3F' }}>{playerData.teamId === 100 ? 'blue team' : 'red team'}</span> finishing {playerData.kills}/{playerData.deaths}/{playerData.assists} with {playerData.totalMinionsKilled + playerData.neutralMinionsKilled} CS.
                            </Typography>
                            <Typography style={{ paddingTop: '10px', paddingBottom: '10px' }} fontSize={14}>{queueTitle} played on {gameStartDate.toLocaleDateString()} at {gameStartDate.toLocaleTimeString()} lasting for {gameDuration}</Typography>
                            <span style={{ textAlign: 'start' }}>
                                <Button sx={{ fontWeight: 'bold' }} onClick={() => scrollToSection('SummaryAnchor')} className='GameDetailsCatBtn' color='grey' variant='contained'>Summary</Button>
                                <Button sx={{ fontWeight: 'bold' }} onClick={() => scrollToSection('LaningAnchor')} className='GameDetailsCatBtn' color='grey' variant='contained'>Laning</Button>
                                <Button sx={{ fontWeight: 'bold' }} onClick={() => scrollToSection('GraphsAnchor')} className='GameDetailsCatBtn' color='grey' variant='contained'>Graphs</Button>
                                <Button sx={{ fontWeight: 'bold' }} onClick={() => scrollToSection('TeamfightsAnchor')} className='GameDetailsCatBtn' color='grey' variant='contained'>Timeline</Button>
                                {/* <Button className='GameDetailsCatBtn' color='grey' variant='contained'>Builds</Button> */}
                            </span>
                            {/* <Button onClick={() => determineFeatsFails(gameData, playerData.teamId, timelineData)}>Debug feats and fails</Button> */}
                        </Grid>
                    </Grid>
                </Grid>
            </div>

            {/* Section 2 */}
            <div style={{ backgroundColor: '#f2f2f2' }}>
                <Grid className='GameDetailsContainer' style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '40px', paddingTop: '40px' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid className='GameOverviewTable' style={{ display: 'flex', justifyContent: 'center', margin: 'auto', textAlign: 'center' }} justifyContent={'center'} backgroundColor='#EDF8FF' boxShadow={'rgba(100, 100, 111, 0.1) 0px 7px 29px 0px'} item xs={12}>
                        <TableContainer justifyContent='center'>
                            <Table size='small'>
                                <TableHead>
                                    <TableRow style={{ alignItems: 'center' }}>
                                        <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <Typography color={gameData.info.teams[0].win ? '#3374FF' : '#FF3F3F'} fontWeight={'bold'} fontSize={'18px'}>{gameData.info.teams[0].win ? "Victory" : "Defeat"}</Typography>
                                                <Typography style={{ marginLeft: '10px', fontWeight: '600' }} fontSize={'14px'}>(Blue Team)</Typography>
                                            </div>
                                        </TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Role</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>KDA</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Damage</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Gold</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>CS</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Wards</TableCell>
                                        <TableCell align='left' style={{ fontWeight: '600' }}>Build</TableCell>
                                    </TableRow>
                                </TableHead>
                                {gameData.info.participants.filter(player => player.teamId === 100).map((player, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <img style={{ width: '38px', borderRadius: '100%', marginRight: '3px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${player.championName}.png`}></img>
                                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '3px' }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).id}.png`}></img>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).id}.png`}></img>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px' }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={getKeystoneIconUrl(player, runesObj)} alt="Keystone"></img>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.canisback.com/img/${runesObj.find(keystone => keystone.id === player.perks.styles[0].style).icon}`}></img>
                                                </div>
                                                <Tooltip disableInteractive slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} arrow placement='top' title={<div>{`${player.riotIdGameName} #${player.riotIdTagline}`}</div>}>
                                                    <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}><Typography className='summonerNameTable' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`)} fontSize={'12px'}>{player.riotIdGameName}</Typography><span className={
                                                        (playersWithScores.find(participant => participant.puuid === player.puuid)?.standing === '1st' ?
                                                            'TableStandingMVP' :
                                                            'TableStanding')
                                                    }>{(playersWithScores.find(participant => participant.puuid === player.puuid)).standing}</span> {player.score.toFixed(1)} </Typography>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.teamPosition.toLowerCase().charAt(0).toUpperCase() + player.teamPosition.toLowerCase().slice(1)}</Typography></TableCell>
                                        <TableCell align='center'>
                                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.kills}/{player.deaths}/{player.assists}</Typography>
                                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{(player.kills / player.deaths).toFixed(1)}</Typography>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalDamageDealtToChampions.toLocaleString()}</Typography>
                                            <Tooltip disableInteractive title={<div>{`Physical: ${player.physicalDamageDealtToChampions.toLocaleString()}`} <br></br>  {`Magical: ${player.magicDamageDealtToChampions.toLocaleString()}`} <br></br> {`True: ${player.trueDamageDealtToChampions.toLocaleString()}`} </div>}>
                                                <LinearProgress variant='determinate' value={(player.totalDamageDealtToChampions / highestDamageDealt) * 100} sx={{ margin: 'auto', marginTop: '2px', backgroundColor: '#D9D9D9', '& .MuiLinearProgress-bar': { backgroundColor: '#37B7FF' }, width: '50%', height: '10px' }}></LinearProgress>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.goldEarned.toLocaleString()}g</Typography></TableCell>
                                        <TableCell align='center'>
                                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalMinionsKilled + player.neutralMinionsKilled}</Typography>
                                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{((player.totalMinionsKilled + player.neutralMinionsKilled) / (gameData.info.gameDuration / 60)).toFixed(1)}/m</Typography>
                                        </TableCell>                    <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.wardsPlaced}</Typography></TableCell>
                                        <TableCell align='center'>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                    <Tooltip arrow title={`${player.item0}`}>
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                            alt="Item1">
                                                        </img>
                                                    </Tooltip>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                                        alt="Item2"></img>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                                        alt="Item3"></img>
                                                    <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                                        alt="Item4"></img>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginRight: '1px' }}
                                                        src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                                        alt="Item5"></img>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginRight: '1px' }}
                                                        src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                                        alt="Item6"></img>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginRight: '1px' }}
                                                        src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                                        alt="Item7"></img>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </Table>
                        </TableContainer>
                    </Grid>
                    <Grid className='GameOverviewTable' style={{ display: 'flex', justifyContent: 'center', margin: 'auto', marginLeft: '0%', marginRight: '0%', marginTop: '20px' }} marginLeft={'10%'} marginRight={'10%'} marginTop={'10px'} backgroundColor='#FFF1F3' boxShadow={'rgba(100, 100, 111, 0.1) 0px 7px 29px 0px'} item xs={12}>
                        <TableContainer justifyContent='center'>
                            <Table size='small'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <Typography color={gameData.info.teams[1].win ? '#3374FF' : '#FF3F3F'} fontWeight={'bold'} fontSize={'18px'}>{gameData.info.teams[1].win ? "Victory" : "Defeat"}</Typography>
                                                <Typography style={{ marginLeft: '10px', fontWeight: '600' }} fontSize={'14px'}>(Red Team)</Typography>
                                            </div>
                                        </TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Role</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>KDA</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Damage</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Gold</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>CS</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Wards</TableCell>
                                        <TableCell align='left' style={{ fontWeight: '600' }}>Build</TableCell>
                                    </TableRow>
                                </TableHead>
                                {gameData.info.participants.filter(player => player.teamId === 200).map((player, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <img style={{ width: '38px', borderRadius: '100%', marginRight: '3px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${player.championName}.png`}></img>
                                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '3px' }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).id}.png`}></img>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).id}.png`}></img>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px' }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={getKeystoneIconUrl(player, runesObj)} alt="Keystone"></img>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.canisback.com/img/${runesObj.find(keystone => keystone.id === player.perks.styles[0].style).icon}`}></img>
                                                </div>
                                                <Tooltip disabledInteractive slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} arrow placement='top' title={<div>{`${player.riotIdGameName} #${player.riotIdTagline}`}</div>}>
                                                    <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}><Typography className='summonerNameTable' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`)} fontSize={'12px'}>{player.riotIdGameName}</Typography><span className={
                                                        (playersWithScores.find(participant => participant.puuid === player.puuid)?.standing === '1st' ?
                                                            'TableStandingMVP' :
                                                            'TableStanding')
                                                    }>{(playersWithScores.find(participant => participant.puuid === player.puuid)).standing}</span> {player.score.toFixed(1)} </Typography>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.teamPosition.toLowerCase().charAt(0).toUpperCase() + player.teamPosition.toLowerCase().slice(1)}</Typography></TableCell>
                                        <TableCell align='center'>
                                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.kills}/{player.deaths}/{player.assists}</Typography>
                                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{(player.kills / player.deaths).toFixed(1)}</Typography>
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalDamageDealtToChampions.toLocaleString()}</Typography>
                                            <Tooltip disabledInteractive title={<div>{`Physical: ${player.physicalDamageDealtToChampions.toLocaleString()}`} <br></br>  {`Magical: ${player.magicDamageDealtToChampions.toLocaleString()}`} <br></br> {`True: ${player.trueDamageDealtToChampions.toLocaleString()}`} </div>}>
                                                <LinearProgress variant='determinate' value={(player.totalDamageDealtToChampions / highestDamageDealt) * 100} sx={{ margin: 'auto', marginTop: '2px', backgroundColor: '#D9D9D9', '& .MuiLinearProgress-bar': { backgroundColor: '#FF3F3F' }, width: '50%', height: '10px' }}></LinearProgress>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.goldEarned.toLocaleString()}g</Typography></TableCell>
                                        <TableCell align='center'>
                                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalMinionsKilled + player.neutralMinionsKilled}</Typography>
                                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{((player.totalMinionsKilled + player.neutralMinionsKilled) / (gameData.info.gameDuration / 60)).toFixed(1)}/m</Typography>
                                        </TableCell>
                                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.wardsPlaced}</Typography></TableCell>
                                        <TableCell align='center'>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                        alt="Item1"></img>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                                        alt="Item2"></img>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                                        alt="Item3"></img>
                                                    <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
                                                        src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                                        alt="Item4"></img>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginRight: '1px' }}
                                                        src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                                        alt="Item5"></img>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginRight: '1px' }}
                                                        src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                                        alt="Item6"></img>
                                                    <img style={{ width: '24px', borderRadius: '2px', marginRight: '1px' }}
                                                        src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                                        alt="Item7"></img>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </div>
        </div>
    )
}

export default GenericDetails