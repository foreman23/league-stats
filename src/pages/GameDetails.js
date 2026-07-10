import { Button, Typography, Box, Grid, LinearProgress, CircularProgress } from '@mui/material';
import { championImg, getChampions, getItems, getQueues, getRunes, getSummonerSpells, getVersion, profileIconImg, spellImg } from '../api/ddragon';
import { getMatchCluster, isSeaServer } from '../utils/regions';
import { queueTitle as getQueueTitle } from '../utils/queues';
import React from 'react'
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom';
import getStatsAt15 from '../functions/LaneAnalysis';
import { getMatchTimeline as fetchMatchTimeline } from '../api/proxy';
import LaneCard from '../components/lanePhase/LaneCard';
import { LANES, toLaneVM } from '../components/lanePhase/laneAdapter';
import SummonerName from '../components/SummonerName';
import MatchDetails from '../components/matchDetailsPhase/MatchDetails';
import { toMatchVM } from '../components/matchDetailsPhase/matchAdapter';
import SummonerNameTip from '../components/SummonerNameTip';
import Battles from '../components/Battles';
import StyledTooltip from '../components/StyledTooltip';
import generateGraphData from '../functions/GenerateGraphData';
import calculateOpScores from '../functions/CalculateOpScores';
import generateMatchStory, { MOMENT_ICONS } from '../functions/GenerateMatchStory';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../FirebaseConfig';
import PlayerStatsCard from '../components/graphsPhase/PlayerStatsCard';
import LaneSlopeChart from '../components/graphsPhase/LaneSlopeChart';
import getBuildInfo from '../functions/GetBuildInfo';
import Standout from '../components/Standout';
import DetailsTable from '../components/DetailsTable';
import Builds from '../components/Builds';
import ScrollTopButton from '../components/ScrollTopButton';
import MatchStoryGraph from '../components/MatchStoryGraph';
import { setMatchNavContext, clearMatchNavContext } from '../hooks/useMatchNavContext';
import { focusBattleAt } from '../hooks/useBattleFocus';

function GameDetails() {

  const [queues, setQueues] = useState(null);
  const [queueTitle, setQueueTitle] = useState(null);


  // Init state
  const { matchId, summonerName } = useParams();
  const [gameData, setGameData] = useState(null);
  const [alternateRegion, setAlternateRegion] = useState(null);
  const [dataDragonVersion, setDataDragonVersion] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [opposingLaner, setOpposingLaner] = useState(null);
  const [gameStartDate, setGameStartDate] = useState(null);
  const [gameDuration, setGameDuration] = useState(null);
  const [items, setItems] = useState(null);

  const [champsJSON, setChampsJSON] = useState(null);

  // Init navigate
  const navigate = useNavigate();

  // Timeline data
  const [timelineData, setTimelineData] = useState(null);

  // DataDragon static data (fetched live + cached; see effect below)
  const [summonerSpells, setSummonerSpells] = useState(null);
  const [runes, setRunes] = useState(null);

  // Create summoner spells object
  const summonerSpellsObj = summonerSpells ? Object.values(summonerSpells.data) : [];

  // Create runes object
  const runesObj = runes ? Object.values(runes) : [];

  // Returns keystone url
  const getKeystoneIconUrl = (player, runesObj) => {
    const styleId = player.perks.styles[0].style;
    const keystoneId = player.perks.styles[0].selections[0].perk;

    const style = runesObj.find(rune => rune.id === styleId);
    if (style) {
      const keystone = style.slots[0].runes.find(rune => rune.id === keystoneId);
      if (keystone) {
        return `https://ddragon.leagueoflegends.com/cdn/img/${keystone.icon}`;
      } else {
        return '';
      }
    } else {
      return '';
    }
  };

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

  // Calculate individual player scores
  const [playersWithScores, setPlayersWithScore] = useState([]);
  const [highestDamageDealt, setHighestDamageDealt] = useState(null);

  const [statsAt15, setStatsAt15] = useState(null);
  const [matchStory, setMatchStory] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [buildData, setBuildData] = useState(null);
  useEffect(() => {

    if (gameData && alternateRegion && timelineData && playerData) {

      document.title = `${playerData.riotIdGameName}#${playerData.riotIdTagline} - ${new Date(gameData.info.gameCreation).toLocaleDateString()} @${new Date(gameData.info.gameCreation).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(/\s/g, '')}`
      const { highestDamageDealt, playersWithScores } = calculateOpScores(gameData, playerData);
      setHighestDamageDealt(highestDamageDealt)
      setPlayersWithScore(playersWithScores)

      const fetch15Stats = async () => {
        if (timelineData && champsJSON) {
          // These three are independent of each other; run them concurrently
          const [graphData, stats15, buildData] = await Promise.all([
            generateGraphData(gameData, timelineData),
            getStatsAt15(alternateRegion, gameData.metadata.matchId, gameData, timelineData),
            getBuildInfo(gameData, timelineData, champsJSON, dataDragonVersion),
          ]);
          // The match story needs both stats15 and graphData, so it runs after
          const story = generateMatchStory(gameData, playerData, stats15, graphData, dataDragonVersion, champsJSON, timelineData);
          setGraphData(graphData);
          setMatchStory(story);
          setStatsAt15(stats15);
          setBuildData(buildData);
        }
      }

      fetch15Stats();
    }

  }, [gameData, alternateRegion, timelineData, playerData, champsJSON, dataDragonVersion]);

  const findQueueInfo = useCallback(async () => {
    const queue = queues.find(queue => queue.queueId === gameData.info.queueId);
    return queue;
  }, [queues, gameData])

  // Search JSON for relevant Queue data
  const findQueueTitle = useCallback(async () => {

    let queue = await findQueueInfo();
    setQueueTitle(getQueueTitle(queue?.description, 'Game'));
  }, [findQueueInfo])

  // Get queue JSON data from riot
  const getQueueJSON = async () => {
    try {
      const data = await getQueues();
      setQueues(data);
    } catch (error) {
    }
  }

  // Get item JSON data from riot
  const getItemsJSON = useCallback(async () => {
    try {
      const data = await getItems(dataDragonVersion);
      setItems(data);
    } catch (error) {
    }
  }, [setItems, dataDragonVersion])

  // Get champion JSON data from riot
  const getChampsJSON = useCallback(async () => {
    try {
      const data = await getChampions(dataDragonVersion);
      setChampsJSON(data);
    } catch (error) {
    }
  }, [setChampsJSON, dataDragonVersion])

  const findAltRegion = (selectedRegion) => getMatchCluster(selectedRegion);

  // Set the current ddragon version
  const getDataDragonVersion = async () => {
    try {
      const currentVersion = await getVersion();
      setDataDragonVersion(currentVersion);
    } catch (error) {
    }
  }

  const fetchGameData = useCallback(async () => {
    let region = matchId.split('_')[0].toLowerCase()
    const docRef = doc(firestore, `${region}-matches`, matchId)
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
      if (isSeaServer(payload.gameData.metadata.matchId.split('_')[0].toLowerCase())) {
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
      getQueueJSON();
      getItemsJSON();
      getChampsJSON();
      getSummonerSpells(dataDragonVersion).then(setSummonerSpells).catch(() => {});
      getRunes(dataDragonVersion).then(setRunes).catch(() => {});
    }
  }, [dataDragonVersion, getChampsJSON, getItemsJSON])

  // Set player data and game duration
  useEffect(() => {
    if (gameData) {
      // Find player data
      setPlayerData(gameData.info.participants.find(player => player.riotIdGameName === summonerName))
      // Find duration and date of game start
      setGameStartDate(new Date(gameData.info.gameCreation));
      let gameDuration = gameData.info.gameDuration;
      if (gameDuration >= 3600) {
        gameDuration = `${(gameDuration / 3600).toFixed(1)} hours`
        if (gameDuration === '1.0 hours') {
          gameDuration = '1 hour';
        }
      }
      else {
        gameDuration = `${Math.floor((gameDuration / 60))} minutes`
      }
      setGameDuration(gameDuration)
    }
  }, [gameData, summonerName])

  // Set data that depends on player data
  useEffect(() => {
    if (playerData) {
      // Find opposing laner
      setOpposingLaner(gameData.info.participants.find(laner => laner.teamPosition === playerData.teamPosition && laner.summonerId !== playerData.summonerId))
    }
  }, [playerData, gameData])

  useEffect(() => {
    if (queues && gameData) {
      // Call queue title function
      findQueueTitle();
    }

  }, [queues, gameData, findQueueTitle])

  useEffect(() => {
    if (gameData && alternateRegion) {
      const getMatchTimeline = async (alternateRegion, matchId) => {
        const timelineResponse = await fetchMatchTimeline(alternateRegion, matchId);
        const timelineData = timelineResponse.data;
        setTimelineData(timelineData);
      };

      getMatchTimeline(alternateRegion, gameData.metadata.matchId);
    }

  }, [gameData, alternateRegion]);

  // Publish the match context so the site navbar morphs into the match
  // context bar once the header scrolls away; cleared on leaving the page.
  useEffect(() => {
    if (!playerData || !champsJSON || !gameData || !dataDragonVersion) return undefined;
    const entry = Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId));
    setMatchNavContext({
      player: playerData,
      platformId: gameData.info.platformId,
      version: dataDragonVersion,
      champImg: championImg(dataDragonVersion, entry?.id),
      teamId: playerData.teamId,
      win: playerData.win,
    });
    return () => clearMatchNavContext();
  }, [playerData, champsJSON, gameData, dataDragonVersion]);

  const [isLoading, setIsLoading] = useState(true);
  // Render page once data is loaded
  useEffect(() => {
    if (playersWithScores.length > 0 && matchStory && summonerSpells && runes) {
      setIsLoading(false);
    }
  }, [playersWithScores, matchStory, summonerSpells, runes])

  if (isLoading) {
    return (
      <Box>
        <LinearProgress></LinearProgress>
      </Box>
    )
  }

  else {
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
                      <StyledTooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} disableInteractive title={<SummonerNameTip name={playerData.riotIdGameName} tag={playerData.riotIdTagline} iconUrl={profileIconImg(dataDragonVersion, playerData.profileIcon)} />}>
                        <div style={{ border: playerData.teamId === 100 ? '4px #568CFF solid' : '4px #A35BFF solid', borderRadius: '50%', display: 'inline-flex' }}>
                          <Typography className='displayGameChampLevel' style={{
                            fontSize: '0.875rem',
                            position: 'absolute',
                            backgroundColor: playerData.teamId === 200 ? '#A35BFF' : '#568CFF',
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
                            src={championImg(dataDragonVersion, Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).id)} alt=''>
                          </img>
                        </div>
                      </StyledTooltip>
                      <Grid className='gameDetailsSummarySpells'>
                        <StyledTooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 1' src={spellImg(dataDragonVersion, summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).id)}></img>
                        </StyledTooltip>
                        <StyledTooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 2' src={spellImg(dataDragonVersion, summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).id)}></img>
                        </StyledTooltip>
                      </Grid>
                    </a>
                  ) : (
                    // Player Lose
                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                      <StyledTooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} disableInteractive title={<SummonerNameTip name={playerData.riotIdGameName} tag={playerData.riotIdTagline} iconUrl={profileIconImg(dataDragonVersion, playerData.profileIcon)} />}>
                        <div style={{ border: playerData.teamId === 100 ? '4px #568CFF solid' : '4px #A35BFF solid', borderRadius: '50%', display: 'inline-flex' }}>
                          <Typography className='displayGameChampLevel' style={{
                            fontSize: '0.875rem',
                            position: 'absolute',
                            backgroundColor: playerData.teamId === 200 ? '#A35BFF' : '#568CFF',
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
                            style={{ filter: 'grayscale(100%)' }} src={championImg(dataDragonVersion, Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).id)} alt=''>
                          </img>
                        </div>
                      </StyledTooltip>
                      <Grid className='gameDetailsSummarySpells'>
                        <StyledTooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 1' src={spellImg(dataDragonVersion, summonerSpellsObj.find(spell => spell.key === playerData.summoner1Id.toString()).id)}></img>
                        </StyledTooltip>
                        <StyledTooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 2' src={spellImg(dataDragonVersion, summonerSpellsObj.find(spell => spell.key === playerData.summoner2Id.toString()).id)}></img>
                        </StyledTooltip>
                      </Grid>
                    </a>
                  )}
                  <img alt='' style={{ width: '30px', marginTop: '10px', opacity: '65%' }} src='/images/swords.svg'></img>
                  {/* Player Win */}
                  {playerData.win ? (
                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${opposingLaner.riotIdGameName}/${opposingLaner.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                      <StyledTooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} disableInteractive title={<SummonerNameTip name={opposingLaner.riotIdGameName} tag={opposingLaner.riotIdTagline} iconUrl={profileIconImg(dataDragonVersion, opposingLaner.profileIcon)} />}>
                        <div style={{ border: playerData.teamId === 200 ? '4px #568CFF solid' : '4px #A35BFF solid', borderRadius: '50%', display: 'inline-flex' }}>
                          <Typography className='displayGameChampLevel' style={{
                            fontSize: '0.875rem',
                            position: 'absolute',
                            backgroundColor: opposingLaner.teamId === 200 ? '#A35BFF' : '#568CFF',
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
                          >{opposingLaner.champLevel}
                          </Typography>
                          <img className='gameDetailsSummaryMainChampImg'
                            style={{ filter: 'grayscale(100%)' }} src={championImg(dataDragonVersion, Object.values(champsJSON.data).find(champ => champ.key === String(opposingLaner.championId)).id)} alt=''>
                          </img>
                        </div>
                      </StyledTooltip>
                      <Grid className='gameDetailsSummarySpells'>
                        <StyledTooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 1' src={spellImg(dataDragonVersion, summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).id)}></img>
                        </StyledTooltip>
                        <StyledTooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 2' src={spellImg(dataDragonVersion, summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).id)}></img>
                        </StyledTooltip>
                      </Grid>
                    </a>
                  ) : (
                    // Player Lose
                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${opposingLaner.riotIdGameName}/${opposingLaner.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', color: opposingLaner.teamId === 200 ? '#A35BFF' : '#568CFF', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                      <StyledTooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} disableInteractive title={<SummonerNameTip name={opposingLaner.riotIdGameName} tag={opposingLaner.riotIdTagline} iconUrl={profileIconImg(dataDragonVersion, opposingLaner.profileIcon)} />}>
                        <div style={{ border: playerData.teamId === 200 ? '4px #568CFF solid' : '4px #A35BFF solid', borderRadius: '50%', display: 'inline-flex' }}>
                          <Typography className='displayGameChampLevel' style={{
                            fontSize: '0.875rem',
                            position: 'absolute',
                            backgroundColor: opposingLaner.teamId === 200 ? '#A35BFF' : '#568CFF',
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
                          >{opposingLaner.champLevel}
                          </Typography>
                          <img className='gameDetailsSummaryMainChampImg'
                            src={championImg(dataDragonVersion, Object.values(champsJSON.data).find(champ => champ.key === String(opposingLaner.championId)).id)} alt=''>
                          </img>
                        </div>
                      </StyledTooltip>
                      <Grid className='gameDetailsSummarySpells'>
                        <StyledTooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 1' src={spellImg(dataDragonVersion, summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).id)}></img>
                        </StyledTooltip>
                        <StyledTooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 2' src={spellImg(dataDragonVersion, summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).id)}></img>
                        </StyledTooltip>
                      </Grid>
                    </a>
                  )}
                </Grid>
                <Grid className='GameDetailsCatBtnMainContainer' item xs={12} sm={12} md={7}>
                  <div className='hd-top'>
                    <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} className='hd-name'>
                      {playerData.riotIdGameName}
                    </SummonerName>
                    <span className={'hd-vpill ' + (playerData.win ? 'hd-win' : 'hd-loss')}>
                      {playerData.win && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                      {playerData.win ? 'Victory' : 'Defeat'}
                    </span>
                  </div>
                  <div className='hd-subline'>
                    <b>{Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name}</b>
                    {' · '}{playerData.teamPosition === 'UTILITY' ? 'Support' : playerData.teamPosition.charAt(0) + playerData.teamPosition.slice(1).toLowerCase()}
                    {' · '}<span className={playerData.teamId === 100 ? 'hd-t-blue' : 'hd-t-purple'}>{playerData.teamId === 100 ? 'Blue' : 'Purple'} Team</span>
                  </div>
                  <div className='hd-chips'>
                    <span className={'hd-chip ' + (playerData.win ? 'hd-acc-win' : 'hd-acc-loss')}>
                      {(((playerData.kills + playerData.assists) / Math.max(1, playerData.deaths))).toFixed(1)}<span className='hd-cl'>KDA</span>
                    </span>
                    <span className='hd-chip'>
                      {playerData.kills}<span className='hd-sl'>/</span>{playerData.deaths}<span className='hd-sl'>/</span>{playerData.assists}<span className='hd-cl'>K/D/A</span>
                    </span>
                    <span className='hd-chip'>
                      {playerData.totalMinionsKilled + playerData.neutralMinionsKilled}<span className='hd-cl'>CS</span>
                    </span>
                    <span className='hd-chip'>
                      {Math.round(((playerData.kills + playerData.assists) / Math.max(1, gameData.info.participants.filter(p => p.teamId === playerData.teamId).reduce((t, p) => t + p.kills, 0))) * 100)}%<span className='hd-cl'>KP</span>
                    </span>
                  </div>
                  <Typography className='GameDetailsMainSummarySubHeader'>{queueTitle} · {gameStartDate.toLocaleDateString()}, {gameStartDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {gameDuration}</Typography>
                  <div className='GameDetailsCatBtnContainer'>
                    <Button onClick={() => scrollToSection('DetailsAnchor')} className='GameDetailsCatBtn' variant='contained'>Details</Button>
                    <Button onClick={() => scrollToSection('LaningAnchor')} className='GameDetailsCatBtn' variant='contained'>Laning</Button>
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

                <Grid className='MatchSummaryGrid' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }} item xs={12} sm={7} md={7} lg={6}>
                  {matchStory !== null &&
                    <div>
                      <div className='gameSectionHeader' style={{ marginLeft: '16px', marginRight: '16px' }}>
                        <Typography className='gameSectionHeading'>Match Summary</Typography>
                      </div>
                      <div className='ms-story'>
                        <h2 className='ms-headline'>{matchStory.headline}</h2>
                        <p className='ms-lede'>{matchStory.lede}</p>
                        <div className='ms-chips'>{matchStory.chips}</div>
                        {matchStory.moments.length > 0 &&
                          <div className='ms-moments'>
                            <div className='ms-mhead'>Key Moments</div>
                            <div className='ms-mgrid'>
                              {matchStory.moments.map((m, i) => (
                                <div
                                  key={i}
                                  className='ms-mtile ms-mtile-click'
                                  role='button'
                                  tabIndex={0}
                                  title='Jump to this battle'
                                  onClick={() => focusBattleAt(m.at)}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusBattleAt(m.at); } }}
                                >
                                  <span className={'ms-mic ms-m' + m.side}>{MOMENT_ICONS[m.icon]}</span>
                                  <span className='ms-mbody'>
                                    <span className='ms-mtitle'>{m.title}</span>
                                    <span className='ms-msub'>{m.sub}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                    // ) : (
                    //   // Skeleton Loader Matching Summary Layout
                    //   <div style={{ marginTop: '0px', marginRight: '12px', marginLeft: '10px' }}>
                    //     {/* Heading */}
                    //     <Skeleton animation="wave" variant="text" width={150} height={50} style={{ marginBottom: '10px' }} />
                    //     <ul className="gameDetailsMatchSummaryList">
                    //       {/* Simulated bullet points */}
                    //       <li style={{ marginBottom: '10px' }}>
                    //         <Skeleton animation="wave" variant="text" width="80%" height={40} />
                    //         <Skeleton animation="wave" variant="text" width="60%" height={40} />
                    //       </li>
                    //       <li style={{ marginBottom: '10px' }}>
                    //         <Skeleton animation="wave" variant="text" width="90%" height={40} />
                    //         <Skeleton animation="wave" variant="text" width="50%" height={40} />
                    //       </li>
                    //       <li style={{ marginBottom: '10px' }}>
                    //         <Skeleton animation="wave" variant="text" width="70%" height={40} />
                    //       </li>
                    //     </ul>
                    //   </div>
                    // )
                  }
                </Grid>
                <Grid className='gameDetailsMatchSummaryGraph hideMobile' style={{ borderRadius: '10px', marginLeft: '30px', marginTop: '20px' }} backgroundColor='white' item xs={12} sm={5} md={5} lg={6}>
                  {graphData && matchStory ? (
                    <MatchStoryGraph graphData={graphData} moments={matchStory.moments} viewerTeam={playerData.teamId} />
                  ) : (
                    <CircularProgress style={{ justifyContent: 'center', marginTop: '20px' }}></CircularProgress>
                  )}
                </Grid>
              </Box>
            </Grid>

            {/* Mobile Gold Dif Graph */}
            <Grid style={{ justifyContent: 'center', marginTop: '20px', width: '95%' }} className='hideDesktop' container>
              <Box style={{ flexDirection: 'column' }} className='GameDetailsBox'>
                <MatchStoryGraph graphData={graphData} moments={matchStory ? matchStory.moments : []} viewerTeam={playerData.teamId} />
              </Box>
            </Grid>

          </Grid>
        </div>

        <div style={{ backgroundColor: '#f2f2f2' }}>
          <Grid className='GameDetailsContainer' style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '20px' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

            {/* One header for the whole full-time section; each card group
                below carries its own small caps title */}
            <Grid id='DetailsAnchor' justifyContent={'center'} margin={'auto'} container marginTop={'20px'}>
              <div className='gameSectionHeader' style={{ marginRight: 'auto' }}>
                <Typography className='gameSectionHeading'>Match Details</Typography>
                <Typography className='gameSectionSubheading'>The endgame numbers — scoreboard, objectives, bans & standouts</Typography>
              </div>
            </Grid>

            {/* Scoreboard — right below the Match Summary */}
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
            >
            </DetailsTable>

            {/* Team objectives + bans — same responsive width as the anchor grid */}
            <Grid className='mdSectionGrid' justifyContent={'center'} margin={'auto'} container marginTop={'6px'}>
              <MatchDetails
                  match={toMatchVM(gameData, champsJSON, dataDragonVersion)}
                  viewerTeam={playerData.teamId}
                />
              </Grid>

            {/* Standout Performances — under the bans card */}
            <Grid className='StandoutContainer' container>
              <Standout gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} playerData={playerData}></Standout>
            </Grid>

          </Grid>
        </div>

        {/* Laning */}
        <div id='LaningAnchor' style={{ backgroundColor: 'white' }}>
          {statsAt15 === null ? (
            <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid className='LaningGridContainer' container >
              <Grid className='LaningGridSubContainer'>
                <div className='gameSectionHeader' style={{ marginLeft: '15px' }}>
                  <Typography className='gameSectionHeading'>Laning Phase Results</Typography>
                  {gameData.info.gameDuration > 900 ? (
                    <Typography className='gameSectionSubheading'>How each lane was performing @ 15 minutes</Typography>
                  ) : (
                    <Typography className='gameSectionSubheading'>{`How each lane was performing @ ${gameDuration} (game ended early)`}</Typography>
                  )
                  }
                </div>
                {LANES.map((laneDef) => (
                  <LaneCard
                    key={laneDef.data}
                    lane={toLaneVM(laneDef, statsAt15, { gameData, champsJSON, dataDragonVersion, timelineData, viewerTeam: playerData?.teamId, viewerParticipantId: playerData?.participantId })}
                  />
                ))}
              </Grid>
            </Grid>

          )}
        </div>

        {/* Graphs */}
        <div id='GraphsAnchor' style={{ backgroundColor: '#f2f2f2' }}>
          <Grid className='GameDetailsContainer' width={'65%'} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', paddingTop: '30px', textAlign: 'flex-start' }}>
            <Box className='GraphSectionHeaderBox gameSectionHeader'>
              <Typography className='gameSectionHeading'>Graphs</Typography>
              <Typography className='gameSectionSubheading'>Match Data Visualized</Typography>
            </Box>
          </Grid>
          {graphData ? (
            <Grid className='GameDetailsContainer' width={'65%'} container style={{ margin: 'auto', paddingBottom: '34px' }}>
              <div className='gp-grid'>
                <PlayerStatsCard gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} viewerTeam={playerData.teamId} viewerPuuid={playerData.puuid} />
                <LaneSlopeChart gameData={gameData} timelineData={timelineData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} viewerTeam={playerData.teamId} viewerPuuid={playerData.puuid} />
                <div className='gp-card gp-gold'>
                  <div className='gp-head'>
                    <h2>
                      Gold Advantage
                      <span className='gp-hic' style={{ color: '#C9A227' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1 1.8 3 2 3 1 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5" /></svg>
                      </span>
                    </h2>
                    <p className='gp-sub'>Team gold lead over the course of the game</p>
                  </div>
                  <MatchStoryGraph hideHead graphData={graphData} moments={matchStory ? matchStory.moments : []} viewerTeam={playerData.teamId} />
                </div>
              </div>
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
              <CircularProgress />
            </Box>
          )}
        </div>

        {/* Battles */}
        <div id='TeamfightsAnchor'>
          {statsAt15 === null ? (
            <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid className='GameDetailsContainer' width={'65%'} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', paddingTop: '30px', textAlign: 'flex-start' }}>
              <Grid className='TimelineSubContainer'>
                <Battles dataDragonVersion={dataDragonVersion} gameData={gameData} playerData={playerData} graphData={graphData} champsJSON={champsJSON} timelineData={timelineData}></Battles>
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

}

export default GameDetails