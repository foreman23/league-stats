import React from 'react';
import { Button, Typography, Grid, Tooltip, LinearProgress, Box } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../FirebaseConfig';
import OverviewTable from '../components/OverviewTable';
import summonerSpells from '../jsonData/summonerSpells.json';

const ArenaDetails = () => {
    const [queues, setQueues] = useState(null);
    const [queueTitle, setQueueTitle] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [alternateRegion, setAlternateRegion] = useState(null);
    const [dataDragonVersion, setDataDragonVersion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [champsJSON, setChampsJSON] = useState(null);
    const [items, setItems] = useState(null);


    // Create summoner spells object
    const summonerSpellsObj = Object.values(summonerSpells.data);

    // Init navigate
    const navigate = useNavigate();

    // Get params from URL
    const { matchId, summonerName, riotId } = useParams();

    // Fetch Data Dragon version
    const getDataDragonVersion = useCallback(async () => {
        try {
            const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
            setDataDragonVersion(response.data[0]);
        } catch (error) {
            console.error('Error fetching Data Dragon version:', error);
        }
    }, []);

    // Get item JSON data from riot
    const getItemsJSON = useCallback(async () => {
        try {
            const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/data/en_US/item.json`);
            const data = await response.json();
            setItems(data);
        } catch (error) {
            // console.error('Error fetching item JSON data',);
        }
    }, [setItems, dataDragonVersion])


    // Get champion JSON data from riot
    const getChampsJSON = useCallback(async () => {
        try {
            const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/data/en_US/champion.json`);
            const data = await response.json();
            setChampsJSON(data);
        } catch (error) {
            // console.error('Error fetching champion JSON data');
        }
    }, [setChampsJSON, dataDragonVersion])

    // Determine alternate region based on matchId
    const findAltRegion = useCallback((selectedRegion) => {
        const americasServers = ['na1', 'br1', 'la1', 'la2'];
        const asiaServers = ['kr', 'jp1', 'oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'];
        const europeServers = ['eun1', 'euw1', 'tr1', 'ru'];

        let alternateRegion = null;
        if (americasServers.includes(selectedRegion)) {
            alternateRegion = 'americas';
        } else if (asiaServers.includes(selectedRegion)) {
            const seaServers = ['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'];
            alternateRegion = seaServers.includes(selectedRegion) ? 'sea' : 'asia';
        } else if (europeServers.includes(selectedRegion)) {
            alternateRegion = 'europe';
        }
        return alternateRegion;
    }, []);

    // Fetch game data from local storage or Firestore
    const fetchGameData = useCallback(async () => {
        // Try to get game data from local storage (set in SummonerProfile)
        const storedGameData = localStorage.getItem('gameData');
        if (storedGameData) {
            const parsedData = JSON.parse(storedGameData);
            if (parsedData.gameData.metadata.matchId === matchId) {
                setGameData(parsedData.gameData);
                setDataDragonVersion(parsedData.dataDragonVersion);
                setAlternateRegion(parsedData.alternateRegion);
                setIsLoading(false);
                return;
            }
        }

        // If not in local storage, fetch from Firestore
        const region = matchId.split('_')[0].toLowerCase();
        const docRef = doc(firestore, `${region}-matches`, matchId);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const altRegion = findAltRegion(region);
                setAlternateRegion(altRegion);
                setGameData(docSnap.data().matchData);
                if (!dataDragonVersion) await getDataDragonVersion();
                setIsLoading(false);
            } else {
                navigate('/*'); // Redirect to not-found page
            }
        } catch (error) {
            console.error('Error fetching game data from Firestore:', error);
            navigate('/*');
        }
    }, [matchId, navigate, findAltRegion, getDataDragonVersion, dataDragonVersion]);

    // Fetch queue JSON
    const getQueueJSON = async () => {
        try {
            const response = await fetch('https://static.developer.riotgames.com/docs/lol/queues.json');
            const data = await response.json();
            setQueues(data);
        } catch (error) {
            console.error('Error fetching queue data:', error);
        }
    };

    // Find queue info
    const findQueueInfo = useCallback(() => {
        if (queues && gameData) {
            return queues.find(queue => queue.queueId === gameData.info.queueId);
        }
        return null;
    }, [queues, gameData]);

    // Set queue title
    const findQueueTitle = useCallback(() => {
        const queue = findQueueInfo();
        if (queue) {
            let queueTitle = queue.description;
            if (queueTitle === '5v5 Ranked Solo games') setQueueTitle('Ranked Solo');
            else if (queueTitle === '5v5 Ranked Flex games') setQueueTitle('Ranked Flex');
            else if (queueTitle === '5v5 Draft Pick games') setQueueTitle('Normal');
            else if (queueTitle === '5v5 ARAM games') setQueueTitle('ARAM');
            else if (queueTitle === 'Arena') setQueueTitle('Arena');
            else setQueueTitle(queue.description);
        }
    }, [findQueueInfo]);

    // Handle section button click
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };


    // Initial data fetching
    useEffect(() => {
        fetchGameData();
        getQueueJSON();
        getItemsJSON();
        getChampsJSON();
    }, [fetchGameData]);

    // Set queue title when queues or gameData changes
    useEffect(() => {
        if (queues && gameData) {
            findQueueTitle();
        }
    }, [queues, gameData, findQueueTitle]);

    // Find player and teammate data, set game duration
    const [playerData, setPlayerData] = useState(null);
    const [teammateData, setTeammateData] = useState(null);
    const [gameStartDate, setGameStartDate] = useState(null);
    const [gameDuration, setGameDuration] = useState(null);

    useEffect(() => {
        if (gameData) {
            const player = gameData.info.participants.find(
                player => player.riotIdGameName.toLowerCase() === summonerName.toLowerCase() && player.riotIdTagline.toLowerCase() === riotId.toLowerCase()
            );
            if (!player) {
                navigate('/*'); // Redirect if player not found
                return;
            }
            setPlayerData(player);

            const teammate = gameData.info.participants.find(
                p => p.placement === player.placement && p.summonerId !== player.summonerId
            );
            setTeammateData(teammate);

            const startDate = new Date(gameData.info.gameCreation);
            setGameStartDate(startDate);

            let duration = gameData.info.gameDuration;
            if (duration >= 3600) {
                duration = `${(duration / 3600).toFixed(1)} hrs`;
                if (duration === '1.0 hrs') duration = '1 hr';
            } else {
                duration = `${Math.floor(duration / 60)} mins`;
            }
            setGameDuration(duration);
        }
    }, [gameData, summonerName, riotId, navigate]);

    // Generate placement suffix
    let placementSuffix = null;
    if (playerData) {
        if (playerData.placement === 1) placementSuffix = 'st';
        else if (playerData.placement === 2) placementSuffix = 'nd';
        else if (playerData.placement === 3) placementSuffix = 'rd';
        else placementSuffix = 'th';
    }

    if (isLoading || !gameData || !playerData || !teammateData || !dataDragonVersion || !champsJSON) {
        return (
            <Grid>
                <LinearProgress />
            </Grid>
        );
    }

    return (
        <div>
            <div id="SummaryAnchor" style={{ backgroundColor: 'white' }}>
                <Grid
                    className="GameDetailsContainer"
                    style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '20px' }}
                    container
                    rowSpacing={1}
                    columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                >
                    {/* Match Header */}
                    <Grid style={{ margin: 'auto' }} className='GameDetailsHeaderMainContainer' container>
                        <Box className='GameDetailsHeaderContainer'>
                            <Grid className='GameDetailsHeader' item xs={12} sm={12} md={5}>
                                {/* Player Win */}
                                {playerData.win ? (
                                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                                        <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                            <div style={{ border: `4px ${playerData.teamId === 100 ? '#568CFF' : '#FF3A54'} solid`, borderRadius: '50%', display: 'inline-flex' }}>
                                                <Typography className='displayGameChampLevel' style={{
                                                    fontSize: '0.875rem',
                                                    position: 'absolute',
                                                    backgroundColor: playerData.teamId === 100 ? '#568CFF' : '#FF3A54',
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
                                            <div style={{ border: `4px ${playerData.teamId === 100 ? '#568CFF' : '#FF3A54'} solid`, borderRadius: '50%', display: 'inline-flex' }}>
                                                <Typography className='displayGameChampLevel' style={{
                                                    fontSize: '0.875rem',
                                                    position: 'absolute',
                                                    backgroundColor: playerData.teamId === 100 ? '#568CFF' : '#FF3A54',
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
                                <img alt='' style={{ width: '30px', marginTop: '10px', opacity: '65%' }} src='/images/deal.png'></img>

                                {playerData.win ? (
                                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${teammateData.riotIdGameName}/${teammateData.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                                        <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${teammateData.riotIdGameName} #${teammateData.riotIdTagline}`}>
                                            <div style={{ border: `4px ${playerData.teamId === 100 ? '#568CFF' : '#FF3A54'} solid`, borderRadius: '50%', display: 'inline-flex' }}>
                                                <Typography className='displayGameChampLevel' style={{
                                                    fontSize: '0.875rem',
                                                    position: 'absolute',
                                                    backgroundColor: playerData.teamId === 100 ? '#568CFF' : '#FF3A54',
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
                                                >{teammateData.champLevel}
                                                </Typography>
                                                <img className='gameDetailsSummaryMainChampImg'
                                                    src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(teammateData.championId)).id}.png`} alt=''>
                                                </img>
                                            </div>
                                        </Tooltip>
                                        <Grid className='gameDetailsSummarySpells'>
                                            <Tooltip
                                                title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === teammateData.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === teammateData.summoner1Id.toString()).description}</span></>}
                                                disableInteractive
                                                arrow
                                            >
                                                <img style={{ width: '28px', borderRadius: '2px', filter: 'dropF-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === teammateData.summoner1Id.toString()).id}.png`}></img>
                                            </Tooltip>
                                            <Tooltip
                                                title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === teammateData.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === teammateData.summoner2Id.toString()).description}</span></>}
                                                disableInteractive
                                                arrow
                                            >
                                                <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === teammateData.summoner2Id.toString()).id}.png`}></img>
                                            </Tooltip>
                                        </Grid>
                                    </a>
                                ) : (
                                    // Player Lose
                                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${teammateData.riotIdGameName}/${teammateData.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                                        <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${teammateData.riotIdGameName} #${teammateData.riotIdTagline}`}>
                                            <div style={{ border: `4px ${playerData.teamId === 100 ? '#568CFF' : '#FF3A54'} solid`, borderRadius: '50%', display: 'inline-flex' }}>
                                                <Typography className='displayGameChampLevel' style={{
                                                    fontSize: '0.875rem',
                                                    position: 'absolute',
                                                    backgroundColor: playerData.teamId === 100 ? '#568CFF' : '#FF3A54',
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
                                                    style={{ filter: 'grayscale(100%)' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(teammateData.championId)).id}.png`} alt=''>
                                                </img>
                                            </div>
                                        </Tooltip>
                                        <Grid className='gameDetailsSummarySpells'>
                                            <Tooltip
                                                title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === teammateData.summoner1Id.toString()).description}</span></>}
                                                disableInteractive
                                                arrow
                                            >
                                                <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === teammateData.summoner1Id.toString()).id}.png`}></img>
                                            </Tooltip>
                                            <Tooltip
                                                title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === teammateData.summoner2Id.toString()).description}</span></>}
                                                disableInteractive
                                                arrow
                                            >
                                                <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === teammateData.summoner2Id.toString()).id}.png`}></img>
                                            </Tooltip>
                                        </Grid>
                                    </a>
                                )}

                            </Grid>
                            <Grid className='GameDetailsCatBtnMainContainer' item xs={12} sm={12} md={7}>
                                <Typography style={{ marginTop: '20px' }} className='GameDetailsMainSummaryHeader'>
                                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                                        <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} style={{ color: 'inherit' }}>
                                            {playerData.riotIdGameName}
                                        </a>
                                    </Tooltip>
                                    <span style={{ color: playerData.win ? '#17BA6C' : '#FF3F3F' }}> placed {playerData.placement}{placementSuffix}</span> playing {Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name} {playerData.teamPosition.toLowerCase()} alongside <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${teammateData.riotIdGameName} #${teammateData.riotIdTagline}`}><a style={{ color: 'inherit' }} href={`/profile/${gameData.info.platformId.toLowerCase()}/${teammateData.riotIdGameName}/${teammateData.riotIdTagline.toLowerCase()}`}>{teammateData.riotIdGameName}</a></Tooltip> finishing {playerData.kills}/{playerData.deaths}/{playerData.assists}.
                                </Typography>
                                {queueTitle !== null ? (
                                    <Typography className='GameDetailsMainSummarySubHeader'>{queueTitle} played on {gameStartDate.toLocaleDateString()} at {gameStartDate.toLocaleTimeString()} lasting for {gameDuration}</Typography>
                                ) : (
                                    <Typography className='GameDetailsMainSummarySubHeader'>Game played on {gameStartDate.toLocaleDateString()} at {gameStartDate.toLocaleTimeString()} lasting for {gameDuration}</Typography>
                                )
                                }
                                {/* <div className='GameDetailsCatBtnContainer'>
                                    <Button onClick={() => scrollToSection('TableAnchor')} className='GameDetailsCatBtn' variant='contained'>Table</Button>
                                    <Button onClick={() => scrollToSection('GraphsAnchor')} className='GameDetailsCatBtn' variant='contained'>Graphs</Button>
                                    <Button onClick={() => scrollToSection('TeamfightsAnchor')} className='GameDetailsCatBtn' variant='contained'>Battles</Button>
                                    <Button onClick={() => scrollToSection('BuildsAnchor')} className='GameDetailsCatBtn' variant='contained'>Builds</Button>
                                </div> */}
                            </Grid>
                        </Box>

                    </Grid>
                </Grid>
            </div>

            <div style={{ backgroundColor: '#f2f2f2', paddingBottom: '80px' }}>
                <Grid
                    className="GameDetailsContainerArena"
                    style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '40px', paddingTop: '40px' }}
                    container
                    rowSpacing={1}
                    columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                >
                    <OverviewTable placementIndex={1} items={items} playerData={playerData} summonerSpellsObj={summonerSpellsObj} gameMode="CHERRY" dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName} champsJSON={champsJSON} />
                    <OverviewTable placementIndex={2} items={items} playerData={playerData} summonerSpellsObj={summonerSpellsObj} gameMode="CHERRY" dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName} champsJSON={champsJSON} />
                    <OverviewTable placementIndex={3} items={items} playerData={playerData} summonerSpellsObj={summonerSpellsObj} gameMode="CHERRY" dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName} champsJSON={champsJSON} />
                    <OverviewTable placementIndex={4} items={items} playerData={playerData} summonerSpellsObj={summonerSpellsObj} gameMode="CHERRY" dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName} champsJSON={champsJSON} />
                    <OverviewTable placementIndex={5} items={items} playerData={playerData} summonerSpellsObj={summonerSpellsObj} gameMode="CHERRY" dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName} champsJSON={champsJSON} />
                    <OverviewTable placementIndex={6} items={items} playerData={playerData} summonerSpellsObj={summonerSpellsObj} gameMode="CHERRY" dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName} champsJSON={champsJSON} />
                    <OverviewTable placementIndex={7} items={items} playerData={playerData} summonerSpellsObj={summonerSpellsObj} gameMode="CHERRY" dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName} champsJSON={champsJSON} />
                    <OverviewTable placementIndex={8} items={items} playerData={playerData} summonerSpellsObj={summonerSpellsObj} gameMode="CHERRY" dataDragonVersion={dataDragonVersion} gameData={gameData} summonerName={summonerName} champsJSON={champsJSON} />
                </Grid>
            </div>
        </div>
    );
};

export default ArenaDetails;