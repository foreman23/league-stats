import React from 'react'
import { Button, Typography, Box, Grid, Divider, LinearProgress, CircularProgress, Tooltip } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom';
import runes from '../jsonData/runes.json';
import summonerSpells from '../jsonData/summonerSpells.json';
import Battles from '../components/Battles';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../FirebaseConfig';
import generateGraphData from '../functions/GenerateGraphData';
import TeamGoldDifGraph from '../components/TeamGoldDifGraph';
import Standout from '../components/Standout';
import DamagePie from '../components/DamagePie';
import getBuildInfo from '../functions/GetBuildInfo';
import DetailsTable from '../components/DetailsTable';
import Builds from '../components/Builds';
import ScrollTopButton from '../components/ScrollTopButton';

const AramDetails = () => {

    // Init navigate
    const navigate = useNavigate();

    // Init state
    const { matchId, summonerName } = useParams();
    const [gameData, setGameData] = useState(null);
    const [alternateRegion, setAlternateRegion] = useState(null);
    const [dataDragonVersion, setDataDragonVersion] = useState(null);
    const [playerData, setPlayerData] = useState(null);
    const [gameStartDate, setGameStartDate] = useState(null);
    const [gameDuration, setGameDuration] = useState(null);
    const [items, setItems] = useState(null);

    const [matchSummaryDesc, setMatchSummaryDesc] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [buildData, setBuildData] = useState(null);
    const [champsJSON, setChampsJSON] = useState(null);

    // graph colors
    let blueColors = [
        '#568CFF', // Lightest
        '#5081E8',
        '#4A76D2',
        '#456BBB',
        '#3F60A5' // Darkest
    ]

    let redColors = [
        '#FF3F3F',  // Lightest
        '#E83B3B',
        '#D23838',
        '#BB3535',
        '#A53131' // Darkest
    ]

    // Timeline data
    const [timelineData, setTimelineData] = useState(null);

    // Calculate individual player scores
    const [playersWithScores, setPlayersWithScore] = useState([]);
    const [highestDamageDealt, setHighestDamageDealt] = useState(null);
    const [highestDamageTaken, setHighestDamageTaken] = useState(null);

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
                return `https://ddragon.canisback.com/img/${keystone.icon}`;
            } else {
                // console.error(`Keystone with ID ${keystoneId} not found in style ${styleId}`);
                return '';
            }
        } else {
            // console.error(`Style with ID ${styleId} not found`);
            return '';
        }
    };

    const calculateOpScores = useCallback(() => {
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

        const minScore = Math.min(...normalizedPlayers.map(p => p.score));
        const maxScore = Math.max(...normalizedPlayers.map(p => p.score));

        const playersWithOpScores = normalizedPlayers.map(player => ({
            ...player,
            opScore: ((player.score - minScore) / (maxScore - minScore)) * 10
        }));

        // Sort players by score
        let sortedPlayers = playersWithOpScores.sort((a, b) => b.opScore - a.opScore);

        // Assign game standing and find highest damage dealt
        let highestDamageDealt = 0;
        let highestDamageTaken = 0;
        sortedPlayers.forEach((player, index) => {
            if (player.totalDamageDealtToChampions > highestDamageDealt) {
                highestDamageDealt = player.totalDamageDealtToChampions;
            }

            if (player.totalDamageTaken > highestDamageTaken) {
                highestDamageTaken = player.totalDamageTaken;
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
        setHighestDamageTaken(highestDamageTaken)
        setPlayersWithScore(updatedGameData.info.participants)
    }, [gameData]);

    // Get item JSON data from riot
    const getItemsJSON = useCallback(async () => {
        try {
            const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/data/en_US/item.json`);
            const data = await response.json();
            setItems(data);
        } catch (error) {
            // console.error('Error fetching item JSON data:');
        }
    }, [setItems, dataDragonVersion])

    // Get champion JSON data from riot
    const getChampsJSON = useCallback(async () => {
        try {
            const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/data/en_US/champion.json`);
            const data = await response.json();
            setChampsJSON(data);
        } catch (error) {
            // console.error('Error fetching champion JSON data:');
        }
    }, [setChampsJSON, dataDragonVersion])

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
                const currentVersion = response.data[0];
                setDataDragonVersion(currentVersion);
            })
            .catch(function (response) {
                // console.log('Error: Error fetching datadragon version')
            })
    }

    const fetchGameData = useCallback(async () => {
        let region = matchId.split('_')[0].toLowerCase()
        const docRef = doc(firestore, `${region}-matches`, matchId)
        // console.log('Reading from firestore (checking match exists)')
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
    }, [matchId, navigate])

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
    }, [fetchGameData, matchId])

    // Get JSON after dataDragonVersion populates
    useEffect(() => {
        if (dataDragonVersion !== null) {
            getItemsJSON();
            getChampsJSON();
        }
    }, [dataDragonVersion, getChampsJSON, getItemsJSON])

    useEffect(() => {
        const fetch15Stats = async () => {
            if (gameData && alternateRegion && timelineData && playerData) {
                document.title = `${playerData.riotIdGameName}#${playerData.riotIdTagline} - ${new Date(gameData.info.gameCreation).toLocaleDateString()} @${new Date(gameData.info.gameCreation).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(/\s/g, '')}`
                calculateOpScores();
                const buildData = await getBuildInfo(gameData, timelineData, champsJSON, dataDragonVersion);
                const graphData = await generateGraphData(gameData, timelineData);
                setGraphData(graphData);
                setBuildData(buildData);
            }
        }

        fetch15Stats()

    }, [gameData, alternateRegion, timelineData, playerData, champsJSON, dataDragonVersion, calculateOpScores]);

    // Get match timeline
    useEffect(() => {
        if (gameData && alternateRegion) {
            const getMatchTimeline = async (alternateRegion, matchId) => {
                // console.log('CALLING RIOT API');
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
    }, [gameData, summonerName])

    useEffect(() => {
        if (graphData) {
            let playerTeamLeading = null;
            let closeGame = false;
            let blowout = false;
            let nearBlowout = false;

            // Determine which team was winning most of the match
            let gameLength = graphData.blueLeadingTime + graphData.redLeadingTime;
            let blueLeadingPercentage = graphData.blueLeadingTime / gameLength;
            let redLeadingPercentage = graphData.redLeadingTime / gameLength

            // Blue has more time winning
            if (graphData.blueLeadingTime > graphData.redLeadingTime) {
                if (blueLeadingPercentage - redLeadingPercentage < 0.25) {
                    closeGame = true;
                }
                if (graphData.redLeadingTime <= 1) {
                    blowout = true;
                }
                if (graphData.redLeadingTime < 3) {
                    nearBlowout = true;
                }
                if (playerData.teamId === 100) {
                    playerTeamLeading = true;
                }
                else if (playerData.teamId === 200) {
                    playerTeamLeading = false;
                }
            }
            // Red has more time winning
            if (graphData.blueLeadingTime < graphData.redLeadingTime) {
                if (redLeadingPercentage - blueLeadingPercentage < 0.25) {
                    closeGame = true;
                }
                if (graphData.blueLeadingTime <= 1) {
                    blowout = true;
                }
                if (graphData.blueLeadingTime < 3) {
                    nearBlowout = true;
                }
                if (playerData.teamId === 100) {
                    playerTeamLeading = false;
                }
                else if (playerData.teamId === 200) {
                    playerTeamLeading = true;
                }
            }

            else if (graphData.blueLeadingTime === graphData.redLeadingTime) {
                playerTeamLeading = false;
                closeGame = true;
            }

            if (closeGame === true) {
                playerTeamLeading = false;
            }

            // Determine team leading most of game
            let teamLeadingSentence = '';
            if (!closeGame && !blowout) {
                if (graphData.leadChanges === 1) {
                    teamLeadingSentence = (<>{playerData.riotIdGameName}'s team was <u>{playerTeamLeading ? 'winning' : 'losing'} most of the game</u> which had {graphData.leadChanges} lead change.</>)
                } else {
                    teamLeadingSentence = (<>{playerData.riotIdGameName}'s team was <u>{playerTeamLeading ? 'winning' : 'losing'} most of the game</u> which had {graphData.leadChanges} lead changes.</>)
                }
            } if (blowout) {
                teamLeadingSentence = (<>{playerData.riotIdGameName}'s team was <u>{playerTeamLeading ? 'winning' : 'losing'} the whole game.</u></>)
            } else if (nearBlowout) {
                if (graphData.leadChanges > 1) {
                    teamLeadingSentence = (<>{playerData.riotIdGameName}'s team was <u>{playerTeamLeading ? 'winning' : 'losing'} for almost the whole game</u> which had {graphData.leadChanges} lead changes.</>)
                } else {
                    teamLeadingSentence = (<>{playerData.riotIdGameName}'s team was <u>{playerTeamLeading ? 'winning' : 'losing'} for almost the whole game</u> which had {graphData.leadChanges} lead change.</>)
                }
            }
            else if (closeGame) {
                teamLeadingSentence = (<><u>The game was evenly matched</u>, with both teams fighting hard.</>)
            }

            // Determine closing sentence
            let lastSentence = '';
            // Player's team won
            if (playerData.win && playerTeamLeading === false && closeGame === true) {
                lastSentence = 'Luckily, their team ended up winning the game.'
            }
            if (playerData.win && playerTeamLeading === false && closeGame === false) {
                lastSentence = 'Despite of that, their team made a comeback and ended up winning the game.'
            }
            if (playerData.win && playerTeamLeading === true) {
                lastSentence = `In the end that resulted in victory.`
            }
            // Player's team lost
            if (!playerData.win && playerTeamLeading === true) {
                lastSentence = `Unfortunately the other team made a comeback and ${playerData.riotIdGameName}'s team ended up losing the game.`
            }
            if (!playerData.win && playerTeamLeading === false && closeGame === true) {
                lastSentence = `Unfortunately, in the end, ${playerData.riotIdGameName}'s team lost.`
            }
            if (!playerData.win && playerTeamLeading === false && closeGame === false) {
                lastSentence = `In the end that resulted in defeat.`
            }

            setMatchSummaryDesc(<>{teamLeadingSentence} {lastSentence}</>)
        }
    }, [graphData, playerData])

    const [isLoading, setIsLoading] = useState(true);
    // Render page once data is loaded
    useEffect(() => {
        if (playersWithScores.length > 0) {
            setIsLoading(false);
        }
    }, [playersWithScores])

    if (isLoading) {
        return (
            <Box>
                <LinearProgress></LinearProgress>
            </Box>
        )
    }

    return (
        <div>
            <div id={'SummaryAnchor'} style={{ backgroundColor: 'white' }}>

                <Grid className='GameDetailsContainer' style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '20px' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

                    {/* Match Header */}
                    <Grid className='GameDetailsHeaderMainContainer' container>
                        <Box className='GameDetailsHeaderContainer'>
                            <Grid className='GameDetailsHeader' item xs={12} sm={12} md={5}>
                                {/* Player Win */}
                                {playerData.win ? (
                                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                                        <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                            <div style={{ border: playerData.teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', borderRadius: '50%', display: 'inline-flex' }}>
                                                <Typography className='displayGameChampLevel' style={{
                                                    fontSize: '0.875rem',
                                                    position: 'absolute',
                                                    backgroundColor: playerData.teamId === 200 ? '#FF3A54' : '#568CFF',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    borderRadius: '100%',
                                                    paddingLeft: '8px',
                                                    paddingRight: '8px',
                                                    paddingTop: '1px',
                                                    paddingBottom: '1px',
                                                    textAlign: 'center',
                                                    right: '10px',
                                                    bottom: 'auto',
                                                    top: '-5px',
                                                    left: 'auto',
                                                    justifyContent: 'center',
                                                    zIndex: 1
                                                }}
                                                >{playerData.champLevel}
                                                </Typography>
                                                <img className='gameDetailsSummaryMainChampImg'
                                                    src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).id}.png`} alt=''>
                                                </img>
                                            </div>
                                        </Tooltip>
                                        <Grid className='gameDetailsSummarySpells'>
                                            <Tooltip
                                                title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).description}</span></>}
                                                disableInteractive
                                                arrow
                                            >
                                                <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).id}.png`}></img>
                                            </Tooltip>
                                            <Tooltip
                                                title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).description}</span></>}
                                                disableInteractive
                                                arrow
                                            >
                                                <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).id}.png`}></img>
                                            </Tooltip>
                                        </Grid>
                                    </a>
                                ) : (
                                    // Player Lose
                                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                                        <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                            <div style={{ border: playerData.teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', borderRadius: '50%', display: 'inline-flex' }}>
                                                <Typography className='displayGameChampLevel' style={{
                                                    fontSize: '0.875rem',
                                                    position: 'absolute',
                                                    backgroundColor: playerData.teamId === 200 ? '#FF3A54' : '#568CFF',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    borderRadius: '100%',
                                                    paddingLeft: '8px',
                                                    paddingRight: '8px',
                                                    paddingTop: '1px',
                                                    paddingBottom: '1px',
                                                    textAlign: 'center',
                                                    right: '10px',
                                                    bottom: 'auto',
                                                    top: '-5px',
                                                    left: 'auto',
                                                    justifyContent: 'center',
                                                    zIndex: 1
                                                }}
                                                >{playerData.champLevel}
                                                </Typography>
                                                <img className='gameDetailsSummaryMainChampImg'
                                                    style={{ filter: 'grayscale(100%)' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).id}.png`} alt=''>
                                                </img>
                                            </div>
                                        </Tooltip>
                                        <Grid className='gameDetailsSummarySpells'>
                                            <Tooltip
                                                title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).description}</span></>}
                                                disableInteractive
                                                arrow
                                            >
                                                <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).id}.png`}></img>
                                            </Tooltip>
                                            <Tooltip
                                                title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).description}</span></>}
                                                disableInteractive
                                                arrow
                                            >
                                                <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).id}.png`}></img>
                                            </Tooltip>
                                        </Grid>
                                    </a>
                                )}
                                <img alt='' style={{ width: '30px', marginTop: '10px', opacity: '65%' }} src='/images/swords.svg'></img>

                                <img alt='Aram Map' style={{ marginLeft: '15px', border: '4px solid black', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} className='gameDetailsSummaryMainChampImg' src='/images/Howling_Abyss_Minimap.webp'></img>


                            </Grid>
                            <Grid className='GameDetailsCatBtnMainContainer' item xs={12} sm={12} md={7}>
                                <Typography className='GameDetailsMainSummaryHeader'>
                                    <span style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {playerData.riotIdGameName}
                                    </span>
                                    <span style={{ color: playerData.win ? '#17BA6C' : '#FF3F3F' }}>{playerData.win ? ' won' : ' lost'}</span> playing {Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name} {playerData.teamPosition.toLowerCase()} for {playerData.teamId === 100 ? 'blue team' : 'red team'} finishing {playerData.kills}/{playerData.deaths}/{playerData.assists} with {playerData.totalMinionsKilled + playerData.neutralMinionsKilled} CS.
                                </Typography>
                                <Typography className='GameDetailsMainSummarySubHeader'>ARAM played on {gameStartDate.toLocaleDateString()} at {gameStartDate.toLocaleTimeString()} lasting for {gameDuration}</Typography>
                                <div className='GameDetailsCatBtnContainer'>
                                    <Button onClick={() => scrollToSection('TableAnchor')} className='GameDetailsCatBtn' variant='contained'>Table</Button>
                                    <Button onClick={() => scrollToSection('GraphsAnchor')} className='GameDetailsCatBtn' variant='contained'>Graphs</Button>
                                    <Button onClick={() => scrollToSection('TeamfightsAnchor')} className='GameDetailsCatBtn' variant='contained'>Battles</Button>
                                    <Button onClick={() => scrollToSection('BuildsAnchor')} className='GameDetailsCatBtn' variant='contained'>Builds</Button>
                                </div>
                            </Grid>
                        </Box>

                    </Grid>

                    {/* Match Summary */}
                    <Grid className='GameDetailsSubContainer' container >
                        <Box className='GameDetailsBox'>
                            <Grid className='MatchSummaryGrid' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} item xs={12} sm={8} md={7} lg={6}>
                                {matchSummaryDesc !== null &&
                                    <div>
                                        <Typography className='MatchSummaryText' marginLeft={'15px'} fontSize={'1.25rem'} fontWeight={'bold'}>Match Summary</Typography>
                                        <ul className='gameDetailsMatchSummaryList'>
                                            <li>{matchSummaryDesc}</li>
                                            {gameData.info.participants[0].gameEndedInSurrender === true && playerData.win === false &&
                                                <li style={{ marginTop: '20px' }}>{playerData.riotIdGameName}'s team surrendered the game at {gameDuration}.</li>
                                            }
                                            {gameData.info.participants[0].gameEndedInSurrender === true && playerData.win === true &&
                                                <li style={{ marginTop: '20px' }}>The enemy team surrendered the game at {gameDuration}.</li>
                                            }
                                            {gameData.info.participants[0].gameEndedInSurrender === false && playerData.win === false &&
                                                <li style={{ marginTop: '20px' }}>{playerData.riotIdGameName}'s nexus was destroyed at {gameDuration}.</li>
                                            }
                                            {gameData.info.participants[0].gameEndedInSurrender === false && playerData.win === true &&
                                                <li style={{ marginTop: '20px' }}>The enemy team's nexus was destroyed at {gameDuration}.</li>
                                            }
                                        </ul>
                                    </div>
                                }
                            </Grid>
                            <Grid className='gameDetailsMatchSummaryGraph hideMobile' style={{ borderRadius: '10px', marginLeft: '30px' }} backgroundColor='white' item xs={12} sm={4} md={5} lg={6}>
                                {graphData ? (
                                    <TeamGoldDifGraph width={400} teamId={playerData.teamId} height={250} hideTitle yAxisGold={graphData.yAxisGold} xAxisGold={graphData.xAxisGold}></TeamGoldDifGraph>
                                ) : (
                                    <CircularProgress style={{ justifyContent: 'center', marginTop: '20px' }}></CircularProgress>
                                )}
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Standout Performances */}
                    <Grid className='StandoutContainer' container>
                        <Standout gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion}></Standout>
                    </Grid>
                </Grid>
            </div>

            {/* Table */}
            <div id='TableAnchor' style={{ backgroundColor: '#f2f2f2' }}>
                <Grid className='GameDetailsContainer' style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '20px' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <DetailsTable
                        gameData={gameData}
                        playerData={playerData}
                        champsJSON={champsJSON}
                        dataDragonVersion={dataDragonVersion}
                        summonerSpellsObj={summonerSpellsObj}
                        summonerName={summonerName}
                        playersWithScores={playersWithScores}
                        getKeystoneIconUrl={getKeystoneIconUrl}
                        runesObj={runesObj}
                        highestDamageDealt={highestDamageDealt}
                        items={items}
                        aram
                    >
                    </DetailsTable>
                </Grid>
            </div>

            {/* Graphs */}
            <div id='GraphsAnchor' style={{ backgroundColor: '#f2f2f2' }}>
                <Grid className='GameDetailsContainer' width={'65%'} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', paddingTop: '30px', textAlign: 'flex-start' }}>
                    <Box className='GraphSectionHeaderBox'>
                        <Typography style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Graphs</Typography>
                        <Typography style={{ fontSize: '1.25rem', marginBottom: '20px', color: '#4B4B4B' }}>Match Data Visualized</Typography>
                    </Box>
                </Grid>
                {graphData ? (
                    <Grid className='GameDetailsContainer' width={'65%'} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', textAlign: 'center' }}>

                        <Divider color='#a6a6a6' width='65%'></Divider>


                        {/* Damage Dealt */}
                        <Box className='GraphSectionBox'>
                            <div>
                                <Typography className='damageDealtGraphHeader'>DMG<br></br>DEALT</Typography>
                            </div>
                            <div className='GraphSectionDivContainer'>
                                {/* Red Team */}
                                <Grid className='GraphSectionDivSubContainer' item order={playerData.teamId === 200 ? 1 : 2} xs={12} sm={6}>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        {gameData.info.participants.filter(players => players.teamId === 200).map((item, index) => (
                                            <div key={`dealt_red_${index}`} className='matchDetailsObjectiveContainer'>
                                                <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageDealtToChampions / 1000)}k</Typography>
                                                <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageDealtToChampions.toLocaleString()}<br />AP: {item.magicDamageDealtToChampions.toLocaleString()}<br />True: {item.trueDamageDealtToChampions.toLocaleString()}</>}>
                                                    <Box className='graphDamageBar' height={`${(item.totalDamageDealtToChampions / highestDamageDealt) * 200}px`} backgroundColor={redColors[index]}></Box>
                                                </Tooltip>
                                                <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} title={`${item.riotIdGameName} #${item.riotIdTagline}`}>
                                                    <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                                                        <img alt='Champion Graph' className='graphChampIcon' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                                                    </a>
                                                </Tooltip>
                                            </div>
                                        ))}
                                    </div>
                                </Grid>
                                {/* Blue Team */}
                                <Grid className='GraphSectionDivSubContainer' item order={playerData.teamId === 100 ? 1 : 2} xs={12} sm={6}>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        {gameData.info.participants.filter(players => players.teamId === 100).map((item, index) => (
                                            <div key={`dealt_blue_${index}`} className='matchDetailsObjectiveContainer'>
                                                <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageDealtToChampions / 1000)}k</Typography>
                                                <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageDealtToChampions.toLocaleString()}<br />AP: {item.magicDamageDealtToChampions.toLocaleString()}<br />True: {item.trueDamageDealtToChampions.toLocaleString()}</>}>
                                                    <Box className='graphDamageBar' height={`${(item.totalDamageDealtToChampions / highestDamageDealt) * 200}px`} backgroundColor={blueColors[index]}></Box>
                                                </Tooltip>
                                                <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} title={`${item.riotIdGameName} #${item.riotIdTagline}`}>
                                                    <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                                                        <img alt='Champion Graph' className='graphChampIcon' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                                                    </a>
                                                </Tooltip>
                                            </div>
                                        ))}
                                    </div>
                                </Grid>
                            </div>
                            <Grid className='hideMobile hideKindle' order={3}>
                                <DamagePie type={'given'} participants={gameData.info.participants}></DamagePie>
                            </Grid>
                        </Box>

                        <Divider color='#a6a6a6' width='65%'></Divider>

                        {/* Damage Taken */}
                        <Box className='GraphSectionBox'>
                            <div>
                                <Typography className='damageDealtGraphHeader'>DMG<br></br>TAKEN</Typography>
                            </div>
                            <div className='GraphSectionDivContainer'>
                                {/* Red Team */}
                                <Grid className='GraphSectionDivSubContainer' order={playerData.teamId === 200 ? 1 : 2}>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        {gameData.info.participants.filter(players => players.teamId === 200).map((item, index) => (
                                            <div key={`taken_red_${index}`} className='matchDetailsObjectiveContainer'>
                                                <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageTaken / 1000)}k</Typography>
                                                <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageTaken.toLocaleString()}<br />AP: {item.magicDamageTaken.toLocaleString()}<br />True: {item.trueDamageTaken.toLocaleString()}</>}>
                                                    <Box className='graphDamageBar' height={`${(item.totalDamageTaken / highestDamageTaken) * 200}px`} backgroundColor={redColors[index]}></Box>
                                                </Tooltip>
                                                <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} title={`${item.riotIdGameName} #${item.riotIdTagline}`}>
                                                    <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                                                        <img alt='Champion Graph' className='graphChampIcon' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                                                    </a>
                                                </Tooltip>
                                            </div>
                                        ))}
                                    </div>
                                </Grid>
                                {/* Blue Team */}
                                <Grid className='GraphSectionDivSubContainer' order={playerData.teamId === 100 ? 1 : 2}>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        {gameData.info.participants.filter(players => players.teamId === 100).map((item, index) => (
                                            <div key={`taken_blue_${index}`} className='matchDetailsObjectiveContainer'>
                                                <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageTaken / 1000)}k</Typography>
                                                <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageTaken.toLocaleString()}<br />AP: {item.magicDamageTaken.toLocaleString()}<br />True: {item.trueDamageTaken.toLocaleString()}</>}>
                                                    <Box className='graphDamageBar' height={`${(item.totalDamageTaken / highestDamageTaken) * 200}px`} backgroundColor={blueColors[index]}></Box>
                                                </Tooltip>
                                                <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} title={`${item.riotIdGameName} #${item.riotIdTagline}`}>
                                                    <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                                                        <img alt='Champion Graph' className='graphChampIcon' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                                                    </a>
                                                </Tooltip>
                                            </div>
                                        ))}
                                    </div>
                                </Grid>
                            </div>
                            <Grid className='hideMobile hideKindle' order={3}>
                                <DamagePie type={'taken'} participants={gameData.info.participants}></DamagePie>
                            </Grid>
                        </Box>

                        <Divider color='#a6a6a6' width='65%'></Divider>

                        {/* Gold Advantage */}
                        <Box className='GraphSectionGoldAdvantage'>
                            {graphData ? (
                                <TeamGoldDifGraph teamId={playerData.teamId} height={300} yAxisGold={graphData.yAxisGold} xAxisGold={graphData.xAxisGold}></TeamGoldDifGraph>
                            ) : (
                                <CircularProgress style={{ justifyContent: 'center', marginTop: '20px' }}></CircularProgress>
                            )}
                        </Box>

                        <Divider color='#a6a6a6' style={{ marginBottom: '30px' }} width='65%'></Divider>

                    </Grid>
                ) : (
                    <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
                        <CircularProgress />
                    </Box>
                )}
            </div>

            {/* Battles */}
            <div id='TeamfightsAnchor'>
                {timelineData && graphData === null ? (
                    <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid className='GameDetailsContainer' width={'65%'} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', paddingTop: '30px', textAlign: 'flex-start' }}>
                        <Grid className='TimelineSubContainer'>
                            <Battles aram dataDragonVersion={dataDragonVersion} gameData={gameData} playerData={playerData} graphData={graphData} champsJSON={champsJSON} timelineData={timelineData}></Battles>
                        </Grid>
                    </Grid>
                )}
            </div>

            {/* Builds */}
            <div id='BuildsAnchor' style={{ backgroundColor: '#f2f2f2', paddingBottom: '120px' }}>
                {buildData === null && gameData !== null ? (
                    <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Builds
                        playerData={playerData}
                        gameData={gameData}
                        dataDragonVersion={dataDragonVersion}
                        champsJSON={champsJSON}
                        items={items}
                        buildData={buildData}
                    >
                    </Builds>
                )}
            </div>

            <ScrollTopButton></ScrollTopButton>

        </div>
    )
}

export default AramDetails