import { Button, Typography, Box, Grid, Paper, Container, TableBody, Divider, TableContainer, Table, TableHead, TableRow, TableCell, LinearProgress, CircularProgress, Tooltip, styled } from '@mui/material';
import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import { useParams, useLocation } from 'react-router-dom';
// import queues from '../jsonData/queues.json'
import summonerSpells from '../jsonData/summonerSpells.json';
import runes from '../jsonData/runes.json';
import Footer from '../components/Footer';
import getStatsAt15 from '../functions/LaneAnalysis';
import axios from 'axios';
import determineFeatsFails from '../functions/GenerateFeats';
import LanePhaseSummaryCardTop from '../components/LanePhaseSummaryCardTop';
import LanePhaseSummaryCardJg from '../components/LanePhaseSummaryCardJg';
import LanePhaseSummaryCardMid from '../components/LanePhaseSummaryCardMid';
import LanePhaseSummaryCardBot from '../components/LanePhaseSummaryCardBot';
import Graphs from '../components/Graphs';
import Battles from '../components/Battles';
import DisplayFeats from '../components/DisplayFeats';
import TeamGoldDifGraph from '../components/TeamGoldDifGraph';
import generateGraphData from '../functions/GenerateGraphData';
import calculateOpScores from '../functions/CalculateOpScores';
import generateShortSummary from '../functions/GenerateShortSummary';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../FirebaseConfig';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import DamagePie from '../components/DamagePie';
import getBuildInfo from '../functions/GetBuildInfo';
import Standout from '../components/Standout';
import DetailsTable from '../components/DetailsTable';
import Builds from '../components/Builds';

function GameDetails() {

  const [isLaning, setIsLaning] = useState(true);
  const [queues, setQueues] = useState(null);
  const [queueTitle, setQueueTitle] = useState(null);


  // Init state
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

  // Card states (lane summaries)
  const [jgSummaryCardStatus, setJgSummaryCardStatus] = useState(true);
  const [midSummaryCardStatus, setMidSummaryCardStatus] = useState(true);
  const [botSummaryCardStatus, setBotSummaryCardStatus] = useState(true);

  // Timeline data
  const [timelineData, setTimelineData] = useState(null);

  // Find gold difference between opposing laner
  // const goldDifference = participantGold - opposingGold;

  // Create summoner spells object
  const summonerSpellsObj = Object.values(summonerSpells.data);

  // Create runes object
  const runesObj = Object.values(runes);

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
        console.error(`Keystone with ID ${keystoneId} not found in style ${styleId}`);
        return '';
      }
    } else {
      console.error(`Style with ID ${styleId} not found`);
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
  const [totalTeamGoldBlue, setTotalTeamGoldBlue] = useState(null);
  const [totalTeamGoldRed, setTotalTeamGoldRed] = useState(null);
  const [totalDamageBothTeams, setTotalDamageBothTeams] = useState(null);
  useEffect(() => {

    if (gameData && alternateRegion && timelineData && playerData) {

      let blueGoldSum = 0;
      let redGoldSum = 0;
      let blueDmgSum = 0;
      let redDmgSum = 0;
      let bluePlayers = gameData.info.participants.filter(players => players.teamId === 100)
      for (let i = 0; i < bluePlayers.length; i++) {
        let curr = bluePlayers[i]
        blueGoldSum += curr.goldEarned
        blueDmgSum += curr.totalDamageDealtToChampions
      }

      let redPlayers = gameData.info.participants.filter(players => players.teamId === 200)
      for (let i = 0; i < redPlayers.length; i++) {
        let curr = redPlayers[i]
        redGoldSum += curr.goldEarned
        redDmgSum += curr.totalDamageDealtToChampions
      }



      setTotalTeamGoldBlue(blueGoldSum);
      setTotalTeamGoldRed(redGoldSum);
      setTotalDamageBothTeams(blueDmgSum + redDmgSum);


      document.title = `${playerData.riotIdGameName}#${playerData.riotIdTagline} - ${new Date(gameData.info.gameCreation).toLocaleDateString()} @${new Date(gameData.info.gameCreation).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(/\s/g, '')}`
      const { highestDamageDealt, highestDamageTaken, playersWithScores } = calculateOpScores(gameData, playerData);
      setHighestDamageDealt(highestDamageDealt)
      setHighestDamageTaken(highestDamageTaken)
      setPlayersWithScore(playersWithScores)

      console.log(timelineData)
      const fetch15Stats = async () => {
        if (timelineData && champsJSON) {
          const graphData = await generateGraphData(gameData, timelineData);
          const stats15 = await getStatsAt15(alternateRegion, gameData.metadata.matchId, gameData, timelineData);
          const buildData = await getBuildInfo(gameData, timelineData, champsJSON, dataDragonVersion);
          console.log(stats15)
          console.log(buildData)
          setGraphData(graphData);
          const shortSummaryRes = await generateShortSummary(gameData, playerData, timelineData, stats15, dataDragonVersion, champsJSON)
          setShortSummary(shortSummaryRes)
          setStatsAt15(stats15);
          setBuildData(buildData);
        }
      }

      fetch15Stats();
    }

  }, [gameData, alternateRegion, timelineData, playerData, champsJSON]);

  const findQueueInfo = async () => {
    const queue = queues.find(queue => queue.queueId === gameData.info.queueId);
    return queue;
  }

  // Search JSON for relevant Queue data
  const findQueueTitle = async () => {

    let queue = await findQueueInfo();

    let queueTitle = queue?.description;
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
    else {
      setQueueTitle('Game')
    }
  }

  // Get queue JSON data from riot
  const getQueueJSON = async () => {
    try {
      const response = await fetch(`https://static.developer.riotgames.com/docs/lol/queues.json`);
      const data = await response.json();
      setQueues(data);
    } catch (error) {
      console.error('Error fetching queue JSON data:', error);
    }
  }

  // Get item JSON data from riot
  const getItemsJSON = async () => {
    try {
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/data/en_US/item.json`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching item JSON data:', error);
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
  }, [])

  // Get JSON after dataDragonVersion populates
  useEffect(() => {
    if (dataDragonVersion !== null) {
      getQueueJSON();
      getItemsJSON();
      getChampsJSON();
    }
  }, [dataDragonVersion])

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
  }, [gameData])

  // Set data that depends on player data
  useEffect(() => {
    if (playerData) {
      // Find opposing laner
      setOpposingLaner(gameData.info.participants.find(laner => laner.teamPosition === playerData.teamPosition && laner.summonerId !== playerData.summonerId))
    }
  }, [playerData])

  // Set gold data
  useEffect(() => {
    if (playerData && opposingLaner) {
      setParticipantGold(playerData.goldEarned);
      setOpposingGold(opposingLaner.goldEarned)
    }
  }, [playerData, opposingLaner])

  useEffect(() => {
    if (queues && gameData) {
      // Call queue title function
      findQueueTitle();
    }

  }, [queues, gameData])

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
  }, [graphData])

  useEffect(() => {
    if (gameData && alternateRegion) {
      const getMatchTimeline = async (alternateRegion, matchId) => {
        console.log('CALLING RIOT API');
        console.log(gameData)
        console.log(`${process.env.REACT_APP_REST_URL}/matchtimeline?alternateRegion=${alternateRegion}&matchId=${matchId}`)
        const timelineResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/matchtimeline?alternateRegion=${alternateRegion}&matchId=${matchId}`);
        const timelineData = timelineResponse.data;
        setTimelineData(timelineData);
      };

      getMatchTimeline(alternateRegion, gameData.metadata.matchId);
    }

  }, [gameData, alternateRegion]);

  // Init navigate
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  // Render page once data is loaded
  useEffect(() => {
    if (playersWithScores.length > 0 && matchSummaryDesc) {
      setIsLoading(false);
    }
  }, [playersWithScores, matchSummaryDesc])

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
                <Grid className='GameDetailsHeader' item xs={12} sm={5}>
                  {/* Player Win */}
                  {playerData.win ? (
                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                      <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                        <div style={{ border: playerData.teamId === 100 ? '4px #568CFF solid' : '4px #FF3A54 solid', borderRadius: '50%', display: 'inline-flex' }}>
                          <Typography className='displayGameChampLevel' style={{
                            fontSize: '14px',
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
                            fontSize: '14px',
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
                  <img style={{ width: '30px', marginTop: '10px', opacity: '65%' }} src='/images/swords.svg'></img>
                  {/* Player Win */}
                  {playerData.win ? (
                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${opposingLaner.riotIdGameName}/${opposingLaner.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                      <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${opposingLaner.riotIdGameName} #${opposingLaner.riotIdTagline}`}>
                        <div style={{ border: playerData.teamId === 200 ? '4px #568CFF solid' : '4px #FF3A54 solid', borderRadius: '50%', display: 'inline-flex' }}>
                          <Typography className='displayGameChampLevel' style={{
                            fontSize: '14px',
                            position: 'absolute',
                            backgroundColor: opposingLaner.teamId === 200 ? '#FF3A54' : '#568CFF',
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
                            style={{ filter: 'grayscale(100%)' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(opposingLaner.championId)).id}.png`} alt=''>
                          </img>
                        </div>
                      </Tooltip>
                      <Grid className='gameDetailsSummarySpells'>
                        <Tooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).id}.png`}></img>
                        </Tooltip>
                        <Tooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).id}.png`}></img>
                        </Tooltip>
                      </Grid>
                    </a>
                  ) : (
                    // Player Lose
                    <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${opposingLaner.riotIdGameName}/${opposingLaner.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', color: 'red', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', margin: '15px' }}>
                      <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${opposingLaner.riotIdGameName} #${opposingLaner.riotIdTagline}`}>
                        <div style={{ border: playerData.teamId === 200 ? '4px #568CFF solid' : '4px #FF3A54 solid', borderRadius: '50%', display: 'inline-flex' }}>
                          <Typography className='displayGameChampLevel' style={{
                            fontSize: '14px',
                            position: 'absolute',
                            backgroundColor: opposingLaner.teamId === 200 ? '#FF3A54' : '#568CFF',
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
                            src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(opposingLaner.championId)).id}.png`} alt=''>
                          </img>
                        </div>
                      </Tooltip>
                      <Grid className='gameDetailsSummarySpells'>
                        <Tooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 1' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner1Id.toString()).id}.png`}></img>
                        </Tooltip>
                        <Tooltip
                          title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).description}</span></>}
                          disableInteractive
                          arrow
                        >
                          <img style={{ width: '28px', borderRadius: '2px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} alt='summoner spell 2' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === opposingLaner.summoner2Id.toString()).id}.png`}></img>
                        </Tooltip>
                      </Grid>
                    </a>
                  )}
                </Grid>
                <Grid className='GameDetailsCatBtnMainContainer' item xs={12} sm={7}>
                  <Typography style={{ paddingTop: '10px', lineHeight: '1.4' }} fontSize={23} fontWeight={600} maxWidth={'460px'}>
                    <a style={{ textDecoration: 'none', color: 'inherit' }}>
                      {playerData.riotIdGameName}
                    </a>
                    <span style={{ color: playerData.win ? '#17BA6C' : '#FF3F3F' }}>{playerData.win ? ' won' : ' lost'}</span> playing {Object.values(champsJSON.data).find(champ => champ.key === String(playerData.championId)).name} {playerData.teamPosition.toLowerCase()} for {playerData.teamId === 100 ? 'blue team' : 'red team'} finishing {playerData.kills}/{playerData.deaths}/{playerData.assists} with {playerData.totalMinionsKilled + playerData.neutralMinionsKilled} CS.
                  </Typography>
                  <Typography style={{ paddingTop: '10px', paddingBottom: '10px', fontWeight: 'bold', color: '#7E7E7E', marginBottom: '5px' }} fontSize={14}>{queueTitle} played on {gameStartDate.toLocaleDateString()} at {gameStartDate.toLocaleTimeString()} lasting for {gameDuration}</Typography>
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
                <Grid className='MatchSummaryGrid' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} item xs={12} sm={8} md={7} lg={6}>
                  <Typography className='MatchSummaryText' marginLeft={'15px'} fontSize={20} fontWeight={'bold'}>Match Summary</Typography>
                  <ul className='gameDetailsMatchSummaryList'>
                    <li style={{ marginBottom: '20px' }}>{shortSummary}</li>
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

        <div style={{ backgroundColor: '#f2f2f2' }}>
          <Grid className='GameDetailsContainer' style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '20px' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            {/* Details */}
            <Grid id='DetailsAnchor' justifyContent={'center'} margin={'auto'} container marginTop={'20px'}>
              <div style={{ display: 'flex', marginLeft: '0', marginRight: 'auto', flexDirection: 'column' }}>
                <Typography style={{ fontWeight: 'bold', fontSize: '20px', marginRight: '30px' }}>Match Details</Typography>
                <Typography style={{ fontSize: '20px', marginBottom: '20px', color: '#4B4B4B' }}>Results @ the end of game</Typography>
              </div>
              <Box className='MatchDetailsGraphBox' minWidth={'100%'} maxWidth={'100%'} style={{ display: 'flex', backgroundColor: 'white', padding: '20px', boxShadow: '0px 6px 24px 0px rgba(0, 0, 0, 0.25)' }} border={'1px solid #BBBBBB'} borderRadius={'10px'}>
                {/* Red Team */}
                <Grid order={playerData.teamId === 100 ? 2 : 1} xs={12} sm={6}>
                  <Typography style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Red Team</Typography>

                  <div style={{ display: 'flex' }}>
                    <Typography fontWeight={'bold'} fontSize={'18px'} marginRight={'50px'} color={'#FF3F3F'}>{gameData.info.teams[1].objectives.champion.kills} kills</Typography>
                    <Typography fontWeight={'bold'} fontSize={'18px'} color={'#FF3F3F'}>{totalTeamGoldRed.toLocaleString()}g</Typography>
                  </div>

                  <Grid container style={{ display: 'flex', alignItems: 'flex-end', height: '180px' }}>

                    <Grid className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[1].objectives.horde.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 5) * gameData.info.teams[1].objectives.horde.kills}px`} backgroundColor={'#FF3F3F'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Grubs</Typography>
                    </Grid>

                    <Grid style={{ textAlign: 'center' }} className='matchDetailsObjectiveContainer'>
                      {gameData.info.teams[1].objectives.riftHerald.kills >= 1 ? (
                        <CheckIcon style={{ fontSize: '40px', color: '#17BA6C' }}></CheckIcon>
                      ) : (
                        <CloseIcon style={{ fontSize: '40px', color: '#777777' }}></CloseIcon>
                      )}
                      <Typography className='matchDetailsObjectiveText'>Herald</Typography>
                    </Grid>

                    <Grid className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[1].objectives.dragon.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 4) * gameData.info.teams[1].objectives.dragon.kills}px`} backgroundColor={'#FF3F3F'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Dragons</Typography>
                    </Grid>

                    <Grid style={{ textAlign: 'center' }} className='matchDetailsObjectiveContainer'>
                      {gameData.info.teams[1].objectives.atakhan.kills >= 1 ? (
                        <CheckIcon style={{ fontSize: '40px', color: '#17BA6C' }}></CheckIcon>
                      ) : (
                        <CloseIcon style={{ fontSize: '40px', color: '#777777' }}></CloseIcon>
                      )}
                      <Typography className='matchDetailsObjectiveText'>Atakhan</Typography>
                    </Grid>

                    <Grid className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[1].objectives.baron.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 2) * gameData.info.teams[1].objectives.baron.kills}px`} backgroundColor={'#FF3F3F'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Barons</Typography>
                    </Grid>

                    <Grid className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[1].objectives.tower.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 10) * gameData.info.teams[1].objectives.tower.kills}px`} backgroundColor={'#FF3F3F'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Towers</Typography>
                    </Grid>

                    <Grid className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[1].objectives.inhibitor.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 3) * gameData.info.teams[1].objectives.inhibitor.kills}px`} backgroundColor={'#FF3F3F'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Inhibs.</Typography>
                    </Grid>

                  </Grid>
                </Grid>
                {/* Blue Team */}
                <Grid order={playerData.teamId === 100 ? 1 : 2} xs={12} sm={6}>
                  <Typography className='matchDetailsTeamNameText' style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Blue Team</Typography>
                  <div style={{ display: 'flex' }}>
                    <Typography fontWeight={'bold'} fontSize={'18px'} marginRight={'50px'} color={'#568CFF'}>{gameData.info.teams[0].objectives.champion.kills} kills</Typography>
                    <Typography fontWeight={'bold'} fontSize={'18px'} color={'#568CFF'}>{totalTeamGoldBlue.toLocaleString()}g</Typography>
                  </div>
                  <Grid container style={{ display: 'flex', alignItems: 'flex-end', height: '180px' }}>

                    <Grid className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[0].objectives.horde.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 5) * gameData.info.teams[0].objectives.horde.kills}px`} backgroundColor={'#568CFF'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Grubs</Typography>
                    </Grid>

                    <Grid style={{ textAlign: 'center' }} className='matchDetailsObjectiveContainer'>
                      {gameData.info.teams[0].objectives.riftHerald.kills >= 1 ? (
                        <CheckIcon style={{ fontSize: '40px', color: '#17BA6C' }}></CheckIcon>
                      ) : (
                        <CloseIcon style={{ fontSize: '40px', color: '#777777' }}></CloseIcon>
                      )}
                      <Typography className='matchDetailsObjectiveText'>Herald</Typography>
                    </Grid>

                    <Grid className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[0].objectives.dragon.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 4) * gameData.info.teams[0].objectives.dragon.kills}px`} backgroundColor={'#568CFF'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Dragons</Typography>
                    </Grid>

                    <Grid style={{ textAlign: 'center' }} className='matchDetailsObjectiveContainer'>
                      {gameData.info.teams[0].objectives.atakhan.kills >= 1 ? (
                        <CheckIcon style={{ fontSize: '40px', color: '#17BA6C' }}></CheckIcon>
                      ) : (
                        <CloseIcon style={{ fontSize: '40px', color: '#777777' }}></CloseIcon>
                      )}
                      <Typography className='matchDetailsObjectiveText'>Atakhan</Typography>
                    </Grid>

                    <Grid className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[0].objectives.baron.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 1.5) * gameData.info.teams[0].objectives.baron.kills}px`} backgroundColor={'#568CFF'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Barons</Typography>
                    </Grid>

                    <Grid className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[0].objectives.tower.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 10) * gameData.info.teams[0].objectives.tower.kills}px`} backgroundColor={'#568CFF'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Towers</Typography>
                    </Grid>
                    <Grid className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[0].objectives.inhibitor.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 3) * gameData.info.teams[0].objectives.inhibitor.kills}px`} backgroundColor={'#568CFF'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Inhibs.</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            {/* Bans */}
            {gameData.info.teams[0].bans.length > 0 && gameData.info.teams[1].bans.length > 0 ? (
              <Grid container className='BansGridContainer'>
                <Box className='BansBox'>
                  <Typography className='hideDesktop' style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>Bans</Typography>
                  {/* Blue team */}
                  <Grid className='BansTeamContainer' order={{ xs: playerData.teamId === 100 ? 1 : 3 }} style={{ display: 'flex', justifyContent: playerData.teamId === 100 ? 'flex-end' : 'flex-start' }} xs={12} sm={6}>
                    {playerData.teamId === 100 &&
                      <div className='hideMobile' style={{ alignSelf: 'center', marginRight: '25px' }}>
                        <Typography style={{ fontWeight: 'bold', fontSize: '20px' }}>Bans</Typography>
                      </div>
                    }
                    {gameData.info.teams[0].bans.map((item, index) => {
                      if (item.championId === -1) {
                        return (
                          <img 
                          className='BannedChampImg'
                          style={{
                            borderRadius: '100%',
                            marginRight: '1.5px',
                            marginLeft: '1.5px',
                            border: '3px #568CFF solid',
                            filter: 'brightness(1.2) saturate(0.6) hue-rotate(180deg)'
                          }}
                            src={`/images/novalue.webp`}>
                          </img>
                        )
                      }
                      else {
                        return (
                          item.championId !== -1 &&
                          <Tooltip disableInteractive arrow placement='top'
                            title={<>{Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).name} banned by blue</>}>
                            <div style={{ border: '3px #568CFF solid', marginRight: '1.5px', marginLeft: '1.5px', borderRadius: '100%', display: 'inline-flex', filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.25))' }}>
                              <img
                                className='BannedChampImg'
                                style={{
                                  borderRadius: '100%',
                                  filter: 'brightness(.8) invert(5%) sepia(97%) hue-rotate(202deg) brightness(101%) contrast(101%)'
                                }}
                                src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}>
                              </img>
                            </div>
                          </Tooltip>
                        )
                      }
                    })}
                  </Grid>
                  <Grid className='hideMobile' style={{ alignSelf: 'center' }} order={{ xs: 2 }}>
                    <Box marginBottom={'3px'} marginLeft={'20px'} marginRight={'20px'} width={'10px'} height={'10px'} borderRadius={'100%'} backgroundColor={'#C3C3C3'}></Box>
                  </Grid>
                  {/* Red team */}
                  <Grid className='BansTeamContainer' order={{ xs: playerData.teamId === 200 ? 1 : 3 }} style={{ display: 'flex', justifyContent: playerData.teamId === 200 ? 'flex-end' : 'flex-start' }} xs={12} sm={6}>
                    {playerData.teamId === 200 &&
                      <div className='hideMobile' style={{ alignSelf: 'center', marginRight: '25px' }}>
                        <Typography style={{ fontWeight: 'bold', fontSize: '20px' }}>Bans</Typography>
                      </div>
                    }
                    {gameData.info.teams[1].bans.map((item, index) => {
                      if (item.championId === -1) {
                        return (
                          <img
                            className='BannedChampImg'
                            style={{
                              borderRadius: '100%',
                              marginRight: '1.5px',
                              marginLeft: '1.5px',
                              border: '3px #FF3F3F solid'
                            }}
                            src={`/images/novalue.webp`}>
                          </img>
                        )
                      }
                      else {
                        return (
                          item.championId !== -1 &&
                          <Tooltip disableInteractive arrow placement='top'
                            title={<>{Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).name} banned by red</>}>
                            <div style={{ border: '3px #FF3F3F solid', marginRight: '1.5px', marginLeft: '1.5px', borderRadius: '100%', display: 'inline-flex', filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.25))' }}>
                              <img
                                className='BannedChampImg'
                                style={{
                                  borderRadius: '100%',
                                  filter: 'brightness(.8) invert(5%) sepia(97%) hue-rotate(328deg) brightness(101%) contrast(101%)'
                                }}
                                src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}>
                              </img>
                            </div>
                          </Tooltip>
                        )
                      }
                    })}
                  </Grid>
                </Box>
              </Grid>
            ) : (
              <div></div>
            )}

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
            <Grid className='LaningGridContainer' xs={12} container >
              <Grid className='LaningGridSubContainer'>
                <div style={{ marginLeft: '15px', marginBottom: '20px', }}>
                  <Typography fontSize={20} fontWeight={600}>Laning Phase Results</Typography>
                  {gameData.info.gameDuration > 900 ? (
                    <Typography style={{ fontSize: '20px', color: '#4B4B4B' }}>How each lane was performing @ 15 minutes</Typography>
                  ) : (
                    <Typography style={{ fontSize: '20px', color: '#4B4B4B' }}>{`How each lane was performing @ ${gameDuration} (game ended early)`}</Typography>
                  )
                  }
                </div>
                <LanePhaseSummaryCardTop gameData={gameData} gameDuration={gameDuration} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15}></LanePhaseSummaryCardTop>
                <LanePhaseSummaryCardJg gameData={gameData} gameDuration={gameDuration} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15}></LanePhaseSummaryCardJg>
                <LanePhaseSummaryCardMid gameData={gameData} gameDuration={gameDuration} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15}></LanePhaseSummaryCardMid>
                <LanePhaseSummaryCardBot gameData={gameData} gameDuration={gameDuration} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15}></LanePhaseSummaryCardBot>
              </Grid>
            </Grid>

          )}
        </div>

        {/* Graphs */}
        <div id='GraphsAnchor' style={{ backgroundColor: '#f2f2f2' }}>
          <Grid className='GameDetailsContainer' width={'65%'} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', paddingTop: '30px', textAlign: 'flex-start' }}>
            <Box className='GraphSectionHeaderBox'>
              <Typography style={{ fontWeight: 'bold', fontSize: '20px' }}>Graphs</Typography>
              <Typography style={{ fontSize: '20px', marginBottom: '20px', color: '#4B4B4B' }}>Match Data Visualized</Typography>
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
                  {/* Red Team */}
                  <Grid style={{ marginRight: playerData.teamId === 200 ? '25px' : '0px' }} order={playerData.teamId === 200 ? 1 : 2} xs={12} sm={6}>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      {gameData.info.participants.filter(players => players.teamId === 200).map((item, index) => (
                        <div className='matchDetailsObjectiveContainer'>
                          <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageDealtToChampions / 1000)}k</Typography>
                          <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageDealtToChampions.toLocaleString()}<br />AP: {item.magicDamageDealtToChampions.toLocaleString()}<br />True: {item.trueDamageDealtToChampions.toLocaleString()}</>}>
                            <Box className='graphDamageBar' height={`${(item.totalDamageDealtToChampions / highestDamageDealt) * 200}px`} backgroundColor={redColors[index]}></Box>
                          </Tooltip>
                          <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} title={`${item.riotIdGameName} #${item.riotIdTagline}`}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                              <img className='graphChampIcon' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                            </a>
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  </Grid>
                  {/* Blue Team */}
                  <Grid style={{ marginRight: playerData.teamId === 100 ? '25px' : '0px' }} order={playerData.teamId === 100 ? 1 : 2} xs={12} sm={6}>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      {gameData.info.participants.filter(players => players.teamId === 100).map((item, index) => (
                        <div className='matchDetailsObjectiveContainer'>
                          <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageDealtToChampions / 1000)}k</Typography>
                          <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageDealtToChampions.toLocaleString()}<br />AP: {item.magicDamageDealtToChampions.toLocaleString()}<br />True: {item.trueDamageDealtToChampions.toLocaleString()}</>}>
                            <Box className='graphDamageBar' height={`${(item.totalDamageDealtToChampions / highestDamageDealt) * 200}px`} backgroundColor={blueColors[index]}></Box>
                          </Tooltip>
                          <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} title={`${item.riotIdGameName} #${item.riotIdTagline}`}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                              <img className='graphChampIcon' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                            </a>
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  </Grid>
                </div>
                <Grid className='hideMobile' order={3}>
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
                  <Grid style={{ marginRight: playerData.teamId === 200 ? '25px' : '0px' }} order={playerData.teamId === 200 ? 1 : 2}>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      {gameData.info.participants.filter(players => players.teamId === 200).map((item, index) => (
                        <div className='matchDetailsObjectiveContainer'>
                          <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageTaken / 1000)}k</Typography>
                          <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageTaken.toLocaleString()}<br />AP: {item.magicDamageTaken.toLocaleString()}<br />True: {item.trueDamageTaken.toLocaleString()}</>}>
                            <Box className='graphDamageBar' height={`${(item.totalDamageTaken / highestDamageTaken) * 200}px`} backgroundColor={redColors[index]}></Box>
                          </Tooltip>
                          <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} title={`${item.riotIdGameName} #${item.riotIdTagline}`}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                              <img className='graphChampIcon' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                            </a>
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  </Grid>
                  {/* Blue Team */}
                  <Grid style={{ marginRight: playerData.teamId === 100 ? '25px' : '0px' }} order={playerData.teamId === 100 ? 1 : 2}>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      {gameData.info.participants.filter(players => players.teamId === 100).map((item, index) => (
                        <div className='matchDetailsObjectiveContainer'>
                          <Typography className='matchDetailsObjectiveValueText'>{Math.floor(item.totalDamageTaken / 1000)}k</Typography>
                          <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 15] } }] } }} disableInteractive placement='top' title={<>AD: {item.physicalDamageTaken.toLocaleString()}<br />AP: {item.magicDamageTaken.toLocaleString()}<br />True: {item.trueDamageTaken.toLocaleString()}</>}>
                            <Box className='graphDamageBar' height={`${(item.totalDamageTaken / highestDamageTaken) * 200}px`} backgroundColor={blueColors[index]}></Box>
                          </Tooltip>
                          <Tooltip slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }} title={`${item.riotIdGameName} #${item.riotIdTagline}`}>
                            <a href={`/profile/${gameData.info.platformId.toLowerCase()}/${item.riotIdGameName}/${item.riotIdTagline.toLowerCase()}`}>
                              <img className='graphChampIcon' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                            </a>
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  </Grid>
                </div>
                <Grid className='hideMobile' order={3}>
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

      </div>
    )
  }

}

export default GameDetails