import { Button, Typography, Box, Grid, Divider, LinearProgress, CircularProgress } from '@mui/material';
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
import TeamGoldDifGraph from '../components/TeamGoldDifGraph';
import generateGraphData from '../functions/GenerateGraphData';
import calculateOpScores from '../functions/CalculateOpScores';
import generateShortSummary from '../functions/GenerateShortSummary';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../FirebaseConfig';
import DamagePie from '../components/DamagePie';
import getBuildInfo from '../functions/GetBuildInfo';
import Standout from '../components/Standout';
import DetailsTable from '../components/DetailsTable';
import Builds from '../components/Builds';
import ScrollTopButton from '../components/ScrollTopButton';
import BubblesSummary from '../components/BubblesSummary';

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

  // graph colors
  let blueColors = [
    '#568CFF', // Lightest
    '#5081E8',
    '#4A76D2',
    '#456BBB',
    '#3F60A5' // Darkest
  ]

  let redColors = [
    '#A35BFF',  // Lightest
    '#9450E8',
    '#8546D2',
    '#763BBB',
    '#673189' // Darkest
  ]

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
  const [matchSummaryDesc, setMatchSummaryDesc] = useState(null);
  const [highestDamageDealt, setHighestDamageDealt] = useState(null);
  const [highestDamageTaken, setHighestDamageTaken] = useState(null);

  const [statsAt15, setStatsAt15] = useState(null);
  const [shortSummary, setShortSummary] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [buildData, setBuildData] = useState(null);
  useEffect(() => {

    if (gameData && alternateRegion && timelineData && playerData) {

      document.title = `${playerData.riotIdGameName}#${playerData.riotIdTagline} - ${new Date(gameData.info.gameCreation).toLocaleDateString()} @${new Date(gameData.info.gameCreation).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(/\s/g, '')}`
      const { highestDamageDealt, highestDamageTaken, playersWithScores } = calculateOpScores(gameData, playerData);
      setHighestDamageDealt(highestDamageDealt)
      setHighestDamageTaken(highestDamageTaken)
      setPlayersWithScore(playersWithScores)

      const fetch15Stats = async () => {
        if (timelineData && champsJSON) {
          // These three are independent of each other; run them concurrently
          const [graphData, stats15, buildData] = await Promise.all([
            generateGraphData(gameData, timelineData),
            getStatsAt15(alternateRegion, gameData.metadata.matchId, gameData, timelineData),
            getBuildInfo(gameData, timelineData, champsJSON, dataDragonVersion),
          ]);
          // generateShortSummary depends on stats15, so it runs after
          const shortSummaryRes = await generateShortSummary(gameData, playerData, timelineData, stats15, dataDragonVersion, champsJSON)
          setGraphData(graphData);
          setShortSummary(shortSummaryRes)
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
          teamLeadingSentence = (<><SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId}>{playerData.riotIdGameName}</SummonerName>'s team was <u>{playerTeamLeading ? 'winning' : 'losing'} most of the game</u> which had {graphData.leadChanges} lead change.</>)
        } else {
          teamLeadingSentence = (<><SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId}>{playerData.riotIdGameName}</SummonerName>'s team was <u>{playerTeamLeading ? 'winning' : 'losing'} most of the game</u> which had {graphData.leadChanges} lead changes.</>)
        }
      } if (blowout) {
        teamLeadingSentence = (<><SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId}>{playerData.riotIdGameName}</SummonerName>'s team was <u>{playerTeamLeading ? 'winning' : 'losing'} the whole game.</u></>)
      } else if (nearBlowout) {
        if (graphData.leadChanges > 1) {
          teamLeadingSentence = (<><SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId}>{playerData.riotIdGameName}</SummonerName>'s team was <u>{playerTeamLeading ? 'winning' : 'losing'} for almost the whole game</u> which had {graphData.leadChanges} lead changes.</>)
        } else {
          teamLeadingSentence = (<><SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId}>{playerData.riotIdGameName}</SummonerName>'s team was <u>{playerTeamLeading ? 'winning' : 'losing'} for almost the whole game</u> which had {graphData.leadChanges} lead change.</>)
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
        lastSentence = (<>Unfortunately the other team made a comeback and <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId}>{playerData.riotIdGameName}</SummonerName>'s team ended up losing the game.</>)
      }
      if (!playerData.win && playerTeamLeading === false && closeGame === true) {
        lastSentence = (<>Unfortunately, in the end, <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId}>{playerData.riotIdGameName}</SummonerName>'s team lost.</>)
      }
      if (!playerData.win && playerTeamLeading === false && closeGame === false) {
        lastSentence = `In the end that resulted in defeat.`
      }

      setMatchSummaryDesc(<>{teamLeadingSentence} {lastSentence}</>)
    }
  }, [graphData, playerData, gameData, dataDragonVersion])

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

  const [isLoading, setIsLoading] = useState(true);
  // Render page once data is loaded
  useEffect(() => {
    if (playersWithScores.length > 0 && matchSummaryDesc && summonerSpells && runes) {
      setIsLoading(false);
    }
  }, [playersWithScores, matchSummaryDesc, summonerSpells, runes])

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
                  <Typography className='GameDetailsMainSummaryHeader'>
                    <SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId} color="inherit">
                      {playerData.riotIdGameName}
                    </SummonerName>

                    <span style={{ color: playerData.win ? '#17BA6C' : '#FF3F3F' }}>{playerData.win ? ' won' : ' lost'}</span> playing {Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name} {playerData.teamPosition.toLowerCase()} for {playerData.teamId === 100 ? 'blue team' : 'purple team'} finishing {playerData.kills}/{playerData.deaths}/{playerData.assists} with {playerData.totalMinionsKilled + playerData.neutralMinionsKilled} CS.
                  </Typography>
                  <Typography className='GameDetailsMainSummarySubHeader'>{queueTitle} played on {gameStartDate.toLocaleDateString()} at {gameStartDate.toLocaleTimeString()} lasting for {gameDuration}</Typography>
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

                <Grid className='MatchSummaryGrid' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} item xs={12} sm={7} md={7} lg={6}>
                  {shortSummary !== null &&
                    <div>
                      <div className='gameSectionHeader' style={{ marginLeft: '16px', marginRight: '16px' }}>
                        <Typography className='gameSectionHeading'>Match Summary</Typography>
                      </div>
                      <ul className='gameDetailsMatchSummaryList'>
                        <li>{shortSummary}</li>
                        <li>{matchSummaryDesc}</li>
                        {gameData.info.participants[0].gameEndedInSurrender === true && playerData.win === false &&
                          <li><SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId}>{playerData.riotIdGameName}</SummonerName>'s team surrendered the game at {gameDuration}.</li>
                        }
                        {gameData.info.participants[0].gameEndedInSurrender === true && playerData.win === true &&
                          <li>The enemy team surrendered the game at {gameDuration}.</li>
                        }
                        {gameData.info.participants[0].gameEndedInSurrender === false && playerData.win === false &&
                          <li><SummonerName participant={playerData} version={dataDragonVersion} platformId={gameData.info.platformId}>{playerData.riotIdGameName}</SummonerName>'s nexus was destroyed at {gameDuration}.</li>
                        }
                        {gameData.info.participants[0].gameEndedInSurrender === false && playerData.win === true &&
                          <li>The enemy team's nexus was destroyed at {gameDuration}.</li>
                        }
                      </ul>
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

                  <BubblesSummary statsAt15={statsAt15} gameData={gameData}></BubblesSummary>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Divider width={'75%'} style={{ margin: 'auto', paddingTop: '20px', paddingBottom: '0px' }}></Divider>
                  </div>

                  {graphData ? (
                    <TeamGoldDifGraph width={400} teamId={playerData.teamId} height={250} hideTitle yAxisGold={graphData.yAxisGold} xAxisGold={graphData.xAxisGold}></TeamGoldDifGraph>
                  ) : (
                    <CircularProgress style={{ justifyContent: 'center', marginTop: '20px' }}></CircularProgress>
                  )}
                </Grid>
              </Box>
            </Grid>

            {/* Mobile Gold Dif Graph */}
            <Grid style={{ justifyContent: 'center', marginTop: '20px', width: '95%' }} className='hideDesktop' container>
              <Box style={{ flexDirection: 'column' }} className='GameDetailsBox'>
                <BubblesSummary statsAt15={statsAt15} gameData={gameData}></BubblesSummary>
                <div style={{ marginLeft: '50px', marginRight: '20px', overflow: 'hidden' }}>
                  <TeamGoldDifGraph hideTitle teamId={playerData.teamId} height={250} yAxisGold={graphData.yAxisGold} xAxisGold={graphData.xAxisGold}></TeamGoldDifGraph>
                </div>
              </Box>
            </Grid>

            {/* Standout Performances */}
            <Grid className='StandoutContainer' container>
              <Standout gameData={gameData} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion}></Standout>
            </Grid>

          </Grid>
        </div>

        <div style={{ backgroundColor: '#f2f2f2' }}>
          <Grid className='GameDetailsContainer' style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '20px' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            {/* Details */}
            <Grid id='DetailsAnchor' justifyContent={'center'} margin={'auto'} container marginTop={'20px'}>
              <div className='gameSectionHeader' style={{ marginRight: 'auto' }}>
                <Typography className='gameSectionHeading'>Match Details</Typography>
                <Typography className='gameSectionSubheading'>Results @ the end of game</Typography>
              </div>
              <MatchDetails
                  match={toMatchVM(gameData, champsJSON, dataDragonVersion)}
                />
              </Grid>

            {/* Table */}
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
                    lane={toLaneVM(laneDef, statsAt15, { gameData, champsJSON, dataDragonVersion, timelineData, viewerTeam: playerData?.teamId })}
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
          {statsAt15 && graphData ? (
            <Grid className='GameDetailsContainer' width={'65%'} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', textAlign: 'center' }}>

              <Divider color='#a6a6a6' width='65%'></Divider>


              {/* Damage Dealt */}
              <Box className='GraphSectionBox'>
                <div>
                  <Typography className='damageDealtGraphHeader'>DMG<br></br>DEALT</Typography>
                </div>
                <div className='GraphSectionDivContainer'>
                  {/* Purple Team */}
                  <Grid className='GraphSectionDivSubContainer' item order={playerData.teamId === 200 ? 1 : 2} xs={12} sm={6}>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      {gameData.info.participants.filter(players => players.teamId === 200).map((item, index) => (
                        <div key={`red_dealt_${index}`} className='matchDetailsObjectiveContainer'>
                          <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageDealtToChampions / 1000)}k</Typography>
                          <StyledTooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageDealtToChampions.toLocaleString()}<br />AP: {item.magicDamageDealtToChampions.toLocaleString()}<br />True: {item.trueDamageDealtToChampions.toLocaleString()}</>}>
                            <Box className='graphDamageBar' height={`${(item.totalDamageDealtToChampions / highestDamageDealt) * 200}px`} backgroundColor={redColors[index]}></Box>
                          </StyledTooltip>
                          <StyledTooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} disableInteractive title={<SummonerNameTip name={item.riotIdGameName} tag={item.riotIdTagline} iconUrl={profileIconImg(dataDragonVersion, item.profileIcon)} />}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                              <img alt='Champion Graph' className='graphChampIcon' src={championImg(dataDragonVersion, Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id)}></img>
                            </a>
                          </StyledTooltip>
                        </div>
                      ))}
                    </div>
                  </Grid>
                  {/* Blue Team */}
                  <Grid className='GraphSectionDivSubContainer' item order={playerData.teamId === 100 ? 1 : 2} xs={12} sm={6}>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      {gameData.info.participants.filter(players => players.teamId === 100).map((item, index) => (
                        <div key={`blue_dealt_${index}`} className='matchDetailsObjectiveContainer'>
                          <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageDealtToChampions / 1000)}k</Typography>
                          <StyledTooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageDealtToChampions.toLocaleString()}<br />AP: {item.magicDamageDealtToChampions.toLocaleString()}<br />True: {item.trueDamageDealtToChampions.toLocaleString()}</>}>
                            <Box className='graphDamageBar' height={`${(item.totalDamageDealtToChampions / highestDamageDealt) * 200}px`} backgroundColor={blueColors[index]}></Box>
                          </StyledTooltip>
                          <StyledTooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} disableInteractive title={<SummonerNameTip name={item.riotIdGameName} tag={item.riotIdTagline} iconUrl={profileIconImg(dataDragonVersion, item.profileIcon)} />}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                              <img alt='Champion Graph' className='graphChampIcon' src={championImg(dataDragonVersion, Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id)}></img>
                            </a>
                          </StyledTooltip>
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
                  {/* Purple Team */}
                  <Grid className='GraphSectionDivSubContainer' order={playerData.teamId === 200 ? 1 : 2}>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      {gameData.info.participants.filter(players => players.teamId === 200).map((item, index) => (
                        <div key={`red_taken_${index}`} className='matchDetailsObjectiveContainer'>
                          <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageTaken / 1000)}k</Typography>
                          <StyledTooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageTaken.toLocaleString()}<br />AP: {item.magicDamageTaken.toLocaleString()}<br />True: {item.trueDamageTaken.toLocaleString()}</>}>
                            <Box className='graphDamageBar' height={`${(item.totalDamageTaken / highestDamageTaken) * 200}px`} backgroundColor={redColors[index]}></Box>
                          </StyledTooltip>
                          <StyledTooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} disableInteractive title={<SummonerNameTip name={item.riotIdGameName} tag={item.riotIdTagline} iconUrl={profileIconImg(dataDragonVersion, item.profileIcon)} />}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                              <img alt='Champion Graph' className='graphChampIcon' src={championImg(dataDragonVersion, Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id)}></img>
                            </a>
                          </StyledTooltip>
                        </div>
                      ))}
                    </div>
                  </Grid>
                  {/* Blue Team */}
                  <Grid className='GraphSectionDivSubContainer' order={playerData.teamId === 100 ? 1 : 2}>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      {gameData.info.participants.filter(players => players.teamId === 100).map((item, index) => (
                        <div key={`blue_taken_${index}`} className='matchDetailsObjectiveContainer'>
                          <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageTaken / 1000)}k</Typography>
                          <StyledTooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageTaken.toLocaleString()}<br />AP: {item.magicDamageTaken.toLocaleString()}<br />True: {item.trueDamageTaken.toLocaleString()}</>}>
                            <Box className='graphDamageBar' height={`${(item.totalDamageTaken / highestDamageTaken) * 200}px`} backgroundColor={blueColors[index]}></Box>
                          </StyledTooltip>
                          <StyledTooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} disableInteractive title={<SummonerNameTip name={item.riotIdGameName} tag={item.riotIdTagline} iconUrl={profileIconImg(dataDragonVersion, item.profileIcon)} />}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                              <img alt='Champion Graph' className='graphChampIcon' src={championImg(dataDragonVersion, Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id)}></img>
                            </a>
                          </StyledTooltip>
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