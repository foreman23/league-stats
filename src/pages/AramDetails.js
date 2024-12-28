import React from 'react'
import { Button, Typography, Box, Grid, ButtonGroup, Container, ListItem, List, TableContainer, Table, TableHead, TableRow, TableCell, LinearProgress, CircularProgress, Tooltip } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import { useParams, useLocation } from 'react-router-dom';
import runes from '../jsonData/runes.json';
import summonerSpells from '../jsonData/summonerSpells.json';
import Battles from '../components/Battles';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../FirebaseConfig';

const AramDetails = () => {

    // Init navigate
    const navigate = useNavigate();

    // Init state
    const location = useLocation();
    const { matchId, summonerName } = useParams();
    const [gameData, setGameData] = useState(null);
    const [alternateRegion, setAlternateRegion] = useState(null);
    const [dataDragonVersion, setDataDragonVersion] = useState(null);
    const [playerData, setPlayerData] = useState(null);
    const [opposingLaner, setOpposingLaner] = useState(null);
    const [participantGold, setParticipantGold] = useState(null);
    const [opposingGold, setOpposingGold] = useState(null);
    const [gameStartDate, setGameStartDate] = useState(null);
    const [gameDuration, setGameDuration] = useState(null);
    const [items, setItems] = useState(null);

    const [champsJSON, setChampsJSON] = useState(null);

    // Timeline data
    const [timelineData, setTimelineData] = useState(null);

    // Calculate individual player scores
    const [playersWithScores, setPlayersWithScore] = useState([]);
    const [highestDamageDealt, setHighestDamageDealt] = useState(null);

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

            const score = (
                normalized.kills * weights.kills +
                normalized.deaths * weights.deaths +
                normalized.assists * weights.assists +
                normalized.damage * weights.damage +
                normalized.gold * weights.gold +
                normalized.cs * weights.cs +
                normalized.killParticipation * weights.killParticipation
            );

            return { ...player, score: score + (index * 0.001) }; // Adjust for uniqueness
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

    // Get item JSON data from riot
    const getItemsJSON = async () => {
        try {
            const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.24.1/data/en_US/item.json');
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('Error fetching item JSON data:', error);
        }
    }

    // Get champion JSON data from riot
    const getChampsJSON = async () => {
        try {
            const response = await fetch('https://ddragon.leagueoflegends.com/cdn/14.24.1/data/en_US/champion.json');
            const data = await response.json();
            setChampsJSON(data);
            console.log(data)
        } catch (error) {
            console.error('Error fetching champion JSON data:', error);
        }
    }

    const findAltRegion = (selectedRegion) => {
        // set alternate routing value
        const americasServers = ['na1', 'br1', 'la1', 'la2'];
        const asiaServers = ['kr', 'jp1', 'oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'];
        const europeServer = ['eun1', 'euw1', 'tr1', 'ru'];

        let alternateRegion = null

        if (americasServers.includes(selectedRegion)) {
            alternateRegion = 'americas'
        }
        if (asiaServers.includes(selectedRegion)) {
            const seaServer = ['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2']
            if (seaServer.includes(selectedRegion)) {
                alternateRegion = 'sea'
            }
            else {
                alternateRegion = 'asia'
            }
        }
        if (europeServer.includes(selectedRegion)) {
            alternateRegion = 'europe'
        }
        return alternateRegion
    }

    // Set the current ddragon version
    const getDataDragonVersion = async () => {
        axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
            .then(function (response) {
                // console.log(response.data[0])
                const currentVersion = response.data[0];
                setDataDragonVersion(currentVersion);
            })
            .catch(function (response) {
                console.log('Error: Error fetching datadragon version')
            })
    }

    const fetchGameData = async () => {
        let riotApiCallCount = 0;
        let region = matchId.split('_')[0].toLowerCase()
        console.log(region)
        const docRef = doc(firestore, `${region}-matches`, matchId)
        console.log('Reading from firestore (checking match exists)')
        const docSnap = await getDoc(docRef);
        // If match exists
        if (docSnap.exists()) {
            let altRegion = findAltRegion(region)
            setAlternateRegion(altRegion)
            setGameData(docSnap.data().matchData)
            getDataDragonVersion()
        }
        // Else match not found (bad link)
        else {
            navigate('/*')
        }
    }

    // On initial page load
    useEffect(() => {
        let payload = JSON.parse(localStorage.getItem('gameData'));
        // Match ID mistmatch on follow external link
        if (payload === null || payload.gameData.metadata.matchId !== matchId) {
            fetchGameData()
        }
        else if (payload !== null) {
            // Special edge case for special Oceania
            const seaServer = ['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2']
            if (seaServer.includes(payload.gameData.metadata.matchId.split('_')[0].toLowerCase())) {
                setAlternateRegion('sea')
            } else {
                setAlternateRegion(payload.alternateRegion);
            }
            setGameData(payload.gameData);
            setDataDragonVersion(payload.dataDragonVersion);
        }
        getItemsJSON();
        getChampsJSON();
    }, [])

    useEffect(() => {

        if (gameData && alternateRegion && timelineData && playerData) {
            document.title = `${playerData.riotIdGameName}#${playerData.riotIdTagline} - ${new Date(gameData.info.gameCreation).toLocaleDateString()} @${new Date(gameData.info.gameCreation).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(/\s/g, '')}`
            calculateOpScores();

        }

    }, [gameData, alternateRegion, timelineData, playerData]);

    // Get match timeline
    useEffect(() => {
        if (gameData && alternateRegion) {
            const getMatchTimeline = async (alternateRegion, matchId) => {
                console.log('CALLING RIOT API');
                const timelineResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/matchtimeline?alternateRegion=${alternateRegion}&matchId=${matchId}`);
                const timelineData = timelineResponse.data;
                setTimelineData(timelineData);
            };

            getMatchTimeline(alternateRegion, gameData.metadata.matchId);
        }

    }, [gameData, alternateRegion]);

    // Set player data and game duration
    useEffect(() => {
        if (gameData) {
            // Find player data
            setPlayerData(gameData.info.participants.find(player => player.riotIdGameName === summonerName))
            // Find duration and date of game start
            setGameStartDate(new Date(gameData.info.gameCreation));
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
            setGameDuration(gameDuration)
        }
    }, [gameData])

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
                    <Grid container display={'flex'} flexDirection={'column'} marginTop={'2%'} maxWidth={'100%'}>
                        <Grid style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 'auto' }} item xs={7}>
                            <Grid>
                                {playerData.win ? (
                                    <div className='clickableChampImageAram' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`)} style={{ position: 'relative', display: 'inline-block' }}>
                                        <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                            <img style={{ margin: '20px', width: '125px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).id}.png`} alt=''></img>
                                        </Tooltip>
                                        <img style={{ position: 'absolute', top: '8px', right: '8px', width: '36px' }} src='/images/accept.png' alt='Crown'></img>
                                        <Box style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '125px', height: '10px', backgroundColor: playerData.teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                                    </div>
                                ) : (
                                    <div className='clickableChampImageAram' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`)} style={{ position: 'relative', display: 'inline-block' }}>
                                        <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                            <img style={{ margin: '20px', width: '125px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px', filter: 'grayscale(80%)' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).id}.png`} alt=''></img>
                                        </Tooltip>
                                        <img style={{ position: 'absolute', top: '8px', right: '8px', width: '36px' }} src='/images/close.png' alt='Crown'></img>
                                        <Box style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '125px', height: '10px', backgroundColor: playerData.teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                                    </div>
                                )}
                            </Grid>
                            <Grid>
                                <Typography style={{ paddingTop: '10px' }} fontSize={26} fontWeight={600}>
                                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                        <a className='clickableName' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`)}>
                                            {playerData.riotIdGameName}
                                        </a>
                                    </Tooltip>
                                    <span style={{ color: playerData.win ? '#17BA6C' : '#FF3F3F' }}>{playerData.win ? ' won' : ' lost'}</span> playing {Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name} {playerData.teamPosition.toLowerCase()} for <span style={{ color: playerData.teamId === 100 ? '#3374FF' : '#FF3F3F' }}>{playerData.teamId === 100 ? 'blue team' : 'red team'}</span> finishing {playerData.kills}/{playerData.deaths}/{playerData.assists} with {playerData.totalMinionsKilled + playerData.neutralMinionsKilled} CS.
                                </Typography>
                                <Typography style={{ paddingTop: '10px', paddingBottom: '10px' }} fontSize={14}>ARAM played on {gameStartDate.toLocaleDateString()} at {gameStartDate.toLocaleTimeString()} lasting for {gameDuration}</Typography>
                                <span style={{ textAlign: 'start' }}>
                                    <Button sx={{ fontWeight: 'bold' }} onClick={() => scrollToSection('SummaryAnchor')} className='GameDetailsCatBtn' color='grey' variant='contained'>Summary</Button>
                                    <Button sx={{ fontWeight: 'bold' }} onClick={() => scrollToSection('TeamfightsAnchor')} className='GameDetailsCatBtn' color='grey' variant='contained'>Timeline</Button>
                                </span>
                            </Grid>
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
                                        <TableCell align='center' style={{ fontWeight: '600' }}>KDA</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Damage</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Gold</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>CS</TableCell>
                                        <TableCell align='left' style={{ fontWeight: '600' }}>Build</TableCell>
                                    </TableRow>
                                </TableHead>
                                {gameData.info.participants.filter(player => player.teamId === 100).map((player, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <Tooltip title={Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).name} disableInteractive placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <Typography style={{
                                                            fontSize: '11px',
                                                            position: 'absolute',
                                                            backgroundColor: player.teamId === 100 ? '#568CFF' : '#FF3A54',
                                                            color: 'white',
                                                            borderRadius: '100%',
                                                            paddingLeft: '4px',
                                                            paddingRight: '4px',
                                                            paddingTop: '1px',
                                                            paddingBottom: '1px',
                                                            textAlign: 'center',
                                                            right: 'auto',
                                                            bottom: 'auto',
                                                            top: '-5px',
                                                            left: '0px',
                                                            justifyContent: 'center'
                                                        }}>{player.champLevel}
                                                        </Typography>
                                                        <img style={{
                                                            width: '38px',
                                                            borderRadius: '100%',
                                                            marginRight: '3px',
                                                            border: player.teamId === 100 ? '3px #568CFF solid' : '3px #FF3A54 solid'
                                                        }}
                                                            src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).id}.png`}>
                                                        </img>
                                                    </div>
                                                </Tooltip>

                                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '3px' }}>
                                                    <Tooltip
                                                        title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).description}</span></>}
                                                        disableInteractive
                                                        placement='top'
                                                        arrow
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                        <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).id}.png`}></img>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).description}</span></>}
                                                        disableInteractive
                                                        placement='top'
                                                        arrow
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                        <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).id}.png`}></img>
                                                    </Tooltip>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px' }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={getKeystoneIconUrl(player, runesObj)} alt="Keystone"></img>
                                                    <Tooltip
                                                        title={<>{runesObj.find(keystone => keystone.id === player.perks.styles[0].style).key}</>}
                                                        disableInteractive
                                                        placement='top'
                                                        arrow
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                        <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.canisback.com/img/${runesObj.find(keystone => keystone.id === player.perks.styles[0].style).icon}`}></img>
                                                    </Tooltip>
                                                </div>
                                                <Tooltip disableInteractive slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} arrow placement='top' title={<div>{`${player.riotIdGameName} #${player.riotIdTagline}`}</div>}>
                                                    <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}><a style={{ textDecoration: 'none', color: 'inherit' }} href={`/profile/${gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`}><Typography className='summonerNameTable' fontSize={'12px'}>{player.riotIdGameName}</Typography></a>
                                                        <span className={
                                                            (playersWithScores.find(participant => participant.puuid === player.puuid)?.standing === '1st' ?
                                                                'TableStandingMVP' :
                                                                'TableStanding')
                                                        }>{(playersWithScores.find(participant => participant.puuid === player.puuid)).standing}
                                                        </span> {player.score.toFixed(1)}
                                                    </Typography>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
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
                                        </TableCell>
                                        <TableCell align='center'>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                    {player?.item0 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item0]?.name}</span><br />
                                                                <span>{items.data[player.item0]?.plaintext || items.data[player.item0]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                                alt="Item1">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                            alt="Item1">
                                                        </img>
                                                    )
                                                    }
                                                    {player?.item1 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item1]?.name}</span><br />
                                                                <span>{items.data[player.item1]?.plaintext || items.data[player.item1]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                                                alt="Item2">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                                            alt="Item2">
                                                        </img>
                                                    )
                                                    }
                                                    {player?.item2 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item2]?.name}</span><br />
                                                                <span>{items.data[player.item2]?.plaintext || items.data[player.item2]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                                                alt="Item3">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                                            alt="Item3">
                                                        </img>
                                                    )
                                                    }
                                                    {player?.item6 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item6]?.name}</span><br />
                                                                <span>{items.data[player.item6]?.plaintext || items.data[player.item6]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                                                alt="Ward">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                                            alt="Ward">
                                                        </img>
                                                    )
                                                    }
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                    {player?.item3 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item3]?.name}</span><br />
                                                                <span>{items.data[player.item3]?.plaintext || items.data[player.item3]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                                                alt="Item4">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                                            alt="Item4">
                                                        </img>
                                                    )
                                                    }
                                                    {player?.item4 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item4]?.name}</span><br />
                                                                <span>{items.data[player.item4]?.plaintext || items.data[player.item4]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                                                alt="Item5">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                                            alt="Item5">
                                                        </img>
                                                    )
                                                    }
                                                    {player?.item5 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item5]?.name}</span><br />
                                                                <span>{items.data[player.item5]?.plaintext || items.data[player.item5]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                                                alt="Item6">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                                            alt="Item6">
                                                        </img>
                                                    )
                                                    }
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
                                        <TableCell align='center' style={{ fontWeight: '600' }}>KDA</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Damage</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>Gold</TableCell>
                                        <TableCell align='center' style={{ fontWeight: '600' }}>CS</TableCell>
                                        <TableCell align='left' style={{ fontWeight: '600' }}>Build</TableCell>
                                    </TableRow>
                                </TableHead>
                                {gameData.info.participants.filter(player => player.teamId === 200).map((player, index) => (
                                    <TableRow key={index}>
                                        <TableCell style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <Tooltip title={Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).name} disableInteractive placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <Typography style={{
                                                            fontSize: '11px',
                                                            position: 'absolute',
                                                            backgroundColor: player.teamId === 100 ? '#568CFF' : '#FF3A54',
                                                            color: 'white',
                                                            borderRadius: '100%',
                                                            paddingLeft: '4px',
                                                            paddingRight: '4px',
                                                            paddingTop: '1px',
                                                            paddingBottom: '1px',
                                                            textAlign: 'center',
                                                            right: 'auto',
                                                            bottom: 'auto',
                                                            top: '-5px',
                                                            left: '0px',
                                                            justifyContent: 'center'
                                                        }}>{player.champLevel}
                                                        </Typography>
                                                        <img style={{
                                                            width: '38px',
                                                            borderRadius: '100%',
                                                            marginRight: '3px',
                                                            border: player.teamId === 100 ? '3px #568CFF solid' : '3px #FF3A54 solid'
                                                        }}
                                                            src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).id}.png`}>
                                                        </img>
                                                    </div>
                                                </Tooltip>
                                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '3px' }}>
                                                    <Tooltip
                                                        title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).description}</span></>}
                                                        disableInteractive
                                                        placement='top'
                                                        arrow
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                        <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).id}.png`}></img>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).description}</span></>}
                                                        disableInteractive
                                                        placement='top'
                                                        arrow
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                        <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).id}.png`}></img>
                                                    </Tooltip>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px' }}>
                                                    <img style={{ width: '19px', borderRadius: '2px' }} src={getKeystoneIconUrl(player, runesObj)} alt="Keystone"></img>
                                                    <Tooltip
                                                        title={<>{runesObj.find(keystone => keystone.id === player.perks.styles[0].style).key}</>}
                                                        disableInteractive
                                                        placement='top'
                                                        arrow
                                                        slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                                        <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.canisback.com/img/${runesObj.find(keystone => keystone.id === player.perks.styles[0].style).icon}`}></img>
                                                    </Tooltip>
                                                </div>
                                                <Tooltip disableInteractive slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} arrow placement='top' title={<div>{`${player.riotIdGameName} #${player.riotIdTagline}`}</div>}>
                                                    <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}><a style={{ textDecoration: 'none', color: 'inherit' }} href={`/profile/${gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`}><Typography className='summonerNameTable' fontSize={'12px'}>{player.riotIdGameName}</Typography></a>
                                                        <span className={
                                                            (playersWithScores.find(participant => participant.puuid === player.puuid)?.standing === '1st' ?
                                                                'TableStandingMVP' :
                                                                'TableStanding')
                                                        }>{(playersWithScores.find(participant => participant.puuid === player.puuid)).standing}
                                                        </span> {player.score.toFixed(1)}
                                                    </Typography>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
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
                                        <TableCell align='center'>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                    {player?.item0 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item0]?.name}</span><br />
                                                                <span>{items.data[player.item0]?.plaintext || items.data[player.item0]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                                alt="Item1">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item0 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item0}.png`}
                                                            alt="Item1">
                                                        </img>
                                                    )
                                                    }
                                                    {player?.item1 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item1]?.name}</span><br />
                                                                <span>{items.data[player.item1]?.plaintext || items.data[player.item1]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                                                alt="Item2">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item1 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item1}.png`}
                                                            alt="Item2">
                                                        </img>
                                                    )
                                                    }
                                                    {player?.item2 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item2]?.name}</span><br />
                                                                <span>{items.data[player.item2]?.plaintext || items.data[player.item2]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                                                alt="Item3">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item2 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item2}.png`}
                                                            alt="Item3">
                                                        </img>
                                                    )
                                                    }
                                                    {player?.item6 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item6]?.name}</span><br />
                                                                <span>{items.data[player.item6]?.plaintext || items.data[player.item6]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                                                alt="Ward">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item6 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item6}.png`}
                                                            alt="Ward">
                                                        </img>
                                                    )
                                                    }
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                    {player?.item3 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item3]?.name}</span><br />
                                                                <span>{items.data[player.item3]?.plaintext || items.data[player.item3]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                                                alt="Item4">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item3 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item3}.png`}
                                                            alt="Item4">
                                                        </img>
                                                    )
                                                    }
                                                    {player?.item4 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item4]?.name}</span><br />
                                                                <span>{items.data[player.item4]?.plaintext || items.data[player.item4]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                                                alt="Item5">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item4 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item4}.png`}
                                                            alt="Item5">
                                                        </img>
                                                    )
                                                    }
                                                    {player?.item5 ? (
                                                        <Tooltip
                                                            arrow
                                                            disableInteractive
                                                            slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                                                            placement='top'
                                                            title={<><span style={{ textDecoration: 'underline' }}>
                                                                {items.data[player.item5]?.name}</span><br />
                                                                <span>{items.data[player.item5]?.plaintext || items.data[player.item5]?.tags[0]}</span><br />
                                                            </>}>
                                                            <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                                src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                                                alt="Item6">
                                                            </img>
                                                        </Tooltip>
                                                    ) : (
                                                        <img style={{ width: '24px', borderRadius: '2px', marginBottom: '2px', marginRight: '1px' }}
                                                            src={player.item5 === 0 ? '/images/blankItem.webp' : `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${player.item5}.png`}
                                                            alt="Item6">
                                                        </img>
                                                    )
                                                    }
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

            {/* Section 3 */}
            <div id='TeamfightsAnchor'>
                {timelineData === null ? (
                    <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid xs={12} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', paddingTop: '45px', textAlign: 'center', marginBottom: '150px' }}>
                        <Grid style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', maxWidth: '1000px' }}>
                            <Grid style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', maxWidth: '1000px' }}>
                                <Battles gameData={gameData} champsJSON={champsJSON} timelineData={timelineData}></Battles>
                            </Grid>
                        </Grid>
                    </Grid>
                )}
            </div>

        </div>
    )
}

export default AramDetails