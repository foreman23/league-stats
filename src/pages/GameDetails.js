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
import ForwardIcon from '@mui/icons-material/Forward';
import Standout from '../components/Standout';

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
  const [topSummaryCardStatus, setTopSummaryCardStatus] = useState(true);
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

  // Handle lane summary card active status
  const [lastButtonPressedTop, setLastButtonPressedTop] = useState('laneSumTop1');
  const [lastButtonPressedJg, setLastButtonPressedJg] = useState('laneSumJg1');
  const [lastButtonPressedMid, setLastButtonPressedMid] = useState('laneSumMid1');
  const [lastButtonPressedBot, setLastButtonPressedBot] = useState('laneSumBot1');
  const handleLaneCard = (lane, btnName) => {
    if (lane === 'top') {
      setLastButtonPressedTop(btnName)
      if (topSummaryCardStatus === false) {
        setTopSummaryCardStatus(true);
      }
      // else if (btnName === lastButtonPressedTop) {
      //   setTopSummaryCardStatus(false);
      //   setLastButtonPressedTop(null);
      // }
    };

    if (lane === 'mid') {
      setLastButtonPressedMid(btnName)
      if (midSummaryCardStatus === false) {
        setMidSummaryCardStatus(true);
      }
      // else if (btnName === lastButtonPressedMid) {
      //   setMidSummaryCardStatus(false);
      //   setLastButtonPressedMid(null);
      // }
    };

    if (lane === 'jg') {
      setLastButtonPressedJg(btnName)
      if (jgSummaryCardStatus === false) {
        setJgSummaryCardStatus(true);
      }
      // else if (btnName === lastButtonPressedJg) {
      //   setJgSummaryCardStatus(false);
      //   setLastButtonPressedJg(null);
      // }
    };

    if (lane === 'bot') {
      setLastButtonPressedBot(btnName)
      if (botSummaryCardStatus === false) {
        setBotSummaryCardStatus(true);
      }
      // else if (btnName === lastButtonPressedBot) {
      //   setBotSummaryCardStatus(false);
      //   setLastButtonPressedBot(null);
      // }
    };

  }

  const [currBuildChamp, setCurrBuildChamp] = useState(null);
  const handleBuildClick = (champ) => {
    if (champ !== currBuildChamp) {
      setCurrBuildChamp(champ)
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

      setCurrBuildChamp(playerData)

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
        if (timelineData) {
          const graphData = await generateGraphData(gameData, timelineData);
          const stats15 = await getStatsAt15(alternateRegion, gameData.metadata.matchId, gameData, timelineData);
          const buildData = await getBuildInfo(gameData, timelineData, champsJSON);
          console.log(stats15)
          console.log(buildData)
          setGraphData(graphData);
          const shortSummaryRes = await generateShortSummary(gameData, playerData, timelineData, stats15, dataDragonVersion)
          setShortSummary(shortSummaryRes)
          setStatsAt15(stats15);
          setBuildData(buildData);
        }
      }

      fetch15Stats();
    }

  }, [gameData, alternateRegion, timelineData, playerData]);

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
                <Grid className='' justifyContent={'left'} paddingLeft={'30px'} item xs={12} sm={7}>
                  <Typography style={{ paddingTop: '10px', lineHeight: '1.4' }} fontSize={23} fontWeight={600} maxWidth={'460px'}>
                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                      <a className='clickableName' style={{ textDecoration: 'none', color: 'inherit' }} href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`}>
                        {playerData.riotIdGameName}
                      </a>
                    </Tooltip>
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
                <Grid className='MatchSummaryGrid' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} item xs={12} sm={6}>
                  <Typography className='MatchSummaryText' marginLeft={'15px'} fontSize={20} fontWeight={'bold'}>Match Summary</Typography>
                  <ul className='gameDetailsMatchSummaryList'>
                    <li style={{ marginBottom: '20px' }}>{shortSummary}</li>
                    <li>{matchSummaryDesc}</li>
                    {gameData.info.participants[0].gameEndedInSurrender === true && playerData.win === false &&
                      <li style={{ marginTop: '20px' }}>{playerData.riotIdGameName}'s team surrendered the game at {gameDuration}.</li>
                    }
                    {gameData.info.participants[0].gameEndedInSurrender === true && playerData.win === true &&
                      <li style={{ marginTop: '20px' }}>{playerData.teamId === 100 ? 'Red' : 'Blue'} team surrendered the game at {gameDuration}.</li>
                    }
                    {gameData.info.participants[0].gameEndedInSurrender === false && playerData.win === false &&
                      <li style={{ marginTop: '20px' }}>{playerData.riotIdGameName}'s nexus was destroyed at {gameDuration}.</li>
                    }
                    {gameData.info.participants[0].gameEndedInSurrender === false && playerData.win === true &&
                      <li style={{ marginTop: '20px' }}>{playerData.teamId === 100 ? 'Red' : 'Blue'} team's nexus was destroyed at {gameDuration}.</li>
                    }
                  </ul>
                </Grid>
                <Grid className='hideMobile' style={{ borderRadius: '10px', marginLeft: '30px' }} backgroundColor='white' item xs={12} sm={6}>
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
              <Box className='MatchDetailsGraphBox' minWidth={'100%'} style={{ display: 'flex', backgroundColor: 'white', padding: '20px', boxShadow: '0px 6px 24px 0px rgba(0, 0, 0, 0.25)' }} border={'1px solid #BBBBBB'} borderRadius={'10px'}>
                {/* Red Team */}
                <Grid order={playerData.teamId === 100 ? 2 : 1} xs={12} sm={6}>
                  <Typography style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Red Team</Typography>

                  <div style={{ display: 'flex' }}>
                    <Typography fontWeight={'bold'} fontSize={'18px'} marginRight={'50px'} color={'#FF3F3F'}>{gameData.info.teams[1].objectives.champion.kills} kills</Typography>
                    <Typography fontWeight={'bold'} fontSize={'18px'} color={'#FF3F3F'}>{totalTeamGoldRed.toLocaleString()}g</Typography>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px' }}>

                    <div className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[1].objectives.horde.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 6) * gameData.info.teams[1].objectives.horde.kills}px`} backgroundColor={'#FF3F3F'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Grubs</Typography>
                    </div>

                    <div style={{ textAlign: 'center' }} className='matchDetailsObjectiveContainer'>
                      {gameData.info.teams[1].objectives.riftHerald.kills >= 1 ? (
                        <CheckIcon style={{ fontSize: '40px', color: '#17BA6C' }}></CheckIcon>
                      ) : (
                        <CloseIcon style={{ fontSize: '40px', color: '#777777' }}></CloseIcon>
                      )}
                      <Typography className='matchDetailsObjectiveText'>Herald</Typography>
                    </div>

                    <div className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[1].objectives.dragon.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 5) * gameData.info.teams[1].objectives.dragon.kills}px`} backgroundColor={'#FF3F3F'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Dragons</Typography>
                    </div>

                    <div className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[1].objectives.baron.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 2) * gameData.info.teams[1].objectives.baron.kills}px`} backgroundColor={'#FF3F3F'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Barons</Typography>
                    </div>

                    <div className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[1].objectives.tower.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 11) * gameData.info.teams[1].objectives.tower.kills}px`} backgroundColor={'#FF3F3F'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Towers</Typography>
                    </div>

                    <div className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[1].objectives.inhibitor.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 3) * gameData.info.teams[1].objectives.inhibitor.kills}px`} backgroundColor={'#FF3F3F'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Inhibs.</Typography>
                    </div>

                  </div>
                </Grid>
                {/* Blue Team */}
                <Grid order={playerData.teamId === 100 ? 1 : 2} xs={12} sm={6}>
                  <Typography className='matchDetailsTeamNameText' style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Blue Team</Typography>
                  <div style={{ display: 'flex' }}>
                    <Typography fontWeight={'bold'} fontSize={'18px'} marginRight={'50px'} color={'#568CFF'}>{gameData.info.teams[0].objectives.champion.kills} kills</Typography>
                    <Typography fontWeight={'bold'} fontSize={'18px'} color={'#568CFF'}>{totalTeamGoldBlue.toLocaleString()}g</Typography>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px' }}>
                    <div className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[0].objectives.horde.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 6) * gameData.info.teams[0].objectives.horde.kills}px`} backgroundColor={'#568CFF'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Grubs</Typography>
                    </div>
                    <div style={{ textAlign: 'center' }} className='matchDetailsObjectiveContainer'>
                      {gameData.info.teams[0].objectives.riftHerald.kills >= 1 ? (
                        <CheckIcon style={{ fontSize: '40px', color: '#17BA6C' }}></CheckIcon>
                      ) : (
                        <CloseIcon style={{ fontSize: '40px', color: '#777777' }}></CloseIcon>
                      )}
                      <Typography className='matchDetailsObjectiveText'>Herald</Typography>
                    </div>
                    <div className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[0].objectives.dragon.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 5) * gameData.info.teams[0].objectives.dragon.kills}px`} backgroundColor={'#568CFF'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Dragons</Typography>
                    </div>
                    <div className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[0].objectives.baron.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 2) * gameData.info.teams[0].objectives.baron.kills}px`} backgroundColor={'#568CFF'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Barons</Typography>
                    </div>
                    <div className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[0].objectives.tower.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 11) * gameData.info.teams[0].objectives.tower.kills}px`} backgroundColor={'#568CFF'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Towers</Typography>
                    </div>
                    <div className='matchDetailsObjectiveContainer'>
                      <Typography className='matchDetailsObjectiveValueText'>{gameData.info.teams[0].objectives.inhibitor.kills}</Typography>
                      <Box className='matchDetailsObjectiveBar' height={`${(100 / 3) * gameData.info.teams[0].objectives.inhibitor.kills}px`} backgroundColor={'#568CFF'}></Box>
                      <Typography className='matchDetailsObjectiveText'>Inhibs.</Typography>
                    </div>
                  </div>
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
                          <img style={{
                            width: '58px',
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
                              <img style={{
                                width: '58px',
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
                          <img style={{
                            width: '58px',
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
                              <img style={{
                                width: '58px',
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
            <Grid width={'65%'} style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '10px', paddingTop: '40px', maxWidth: '100vw' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {/* Blue Team */}
              <Grid order={playerData.teamId === 100 ? 1 : 2} width={'100%'} className={playerData.teamId === 100 ? 'GameOverviewTable1' : 'GameOverviewTable2'} style={{ display: 'flex', justifyContent: 'center', margin: 'auto', textAlign: 'center' }} justifyContent={'center'} backgroundColor='#EDF8FF' boxShadow={'rgba(100, 100, 111, 0.1) 0px 7px 29px 0px'} item xs={12}>
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
                            <Tooltip title={Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).name} disableInteractive placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                              <div style={{ position: 'relative', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
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
                                <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).id}.png`}></img>
                              </Tooltip>
                              <Tooltip
                                title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).description}</span></>}
                                disableInteractive
                                placement='top'
                                arrow
                                slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).id}.png`}></img>
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
                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.teamPosition.toLowerCase().charAt(0).toUpperCase() + player.teamPosition.toLowerCase().slice(1)}</Typography></TableCell>
                        <TableCell align='center'>
                          <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.kills}/{player.deaths}/{player.assists}</Typography>
                          <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{(player.kills / player.deaths).toFixed(1)}</Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalDamageDealtToChampions.toLocaleString()}</Typography>
                          <Tooltip disableInteractive title={<div>{`AD: ${player.physicalDamageDealtToChampions.toLocaleString()}`} <br></br>  {`AP: ${player.magicDamageDealtToChampions.toLocaleString()}`} <br></br> {`True: ${player.trueDamageDealtToChampions.toLocaleString()}`} </div>}>
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
                                <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
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
              {/* Red Team */}
              <Grid order={playerData.teamId === 200 ? 1 : 2} className={playerData.teamId === 200 ? 'GameOverviewTable1' : 'GameOverviewTable2'} style={{ display: 'flex', justifyContent: 'center', margin: 'auto', marginLeft: '0%', marginRight: '0%' }} marginLeft={'10%'} marginRight={'10%'} backgroundColor='#FFF1F3' boxShadow={'rgba(100, 100, 111, 0.1) 0px 7px 29px 0px'} item xs={12}>
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
                            <Tooltip title={Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).name} disableInteractive placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                              <div style={{ position: 'relative', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
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
                                <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).id}.png`}></img>
                              </Tooltip>
                              <Tooltip
                                title={<><span style={{ textDecoration: 'underline' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).name}</span><br /><span style={{ color: '#f2f2f2' }}>{summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).description}</span></>}
                                disableInteractive
                                placement='top'
                                arrow
                                slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                                <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).id}.png`}></img>
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
                            <Tooltip disabledInteractive slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} arrow placement='top' title={<div>{`${player.riotIdGameName} #${player.riotIdTagline}`}</div>}>
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
                        <TableCell align='center'><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.teamPosition.toLowerCase().charAt(0).toUpperCase() + player.teamPosition.toLowerCase().slice(1)}</Typography></TableCell>
                        <TableCell align='center'>
                          <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.kills}/{player.deaths}/{player.assists}</Typography>
                          <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{(player.kills / player.deaths).toFixed(1)}</Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalDamageDealtToChampions.toLocaleString()}</Typography>
                          <Tooltip disabledInteractive title={<div>{`AD: ${player.physicalDamageDealtToChampions.toLocaleString()}`} <br></br>  {`AP: ${player.magicDamageDealtToChampions.toLocaleString()}`} <br></br> {`True: ${player.trueDamageDealtToChampions.toLocaleString()}`} </div>}>
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
                                <img style={{ width: '24px', borderRadius: '100%', marginBottom: '2px', marginRight: '1px' }}
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
                <LanePhaseSummaryCardTop gameData={gameData} gameDuration={gameDuration} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15} handleLaneCard={handleLaneCard} lastButtonPressedTop={lastButtonPressedTop} topSummaryCardStatus={topSummaryCardStatus}></LanePhaseSummaryCardTop>
                <LanePhaseSummaryCardJg gameData={gameData} gameDuration={gameDuration} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15} handleLaneCard={handleLaneCard} lastButtonPressedJg={lastButtonPressedJg} jgSummaryCardStatus={jgSummaryCardStatus}></LanePhaseSummaryCardJg>
                <LanePhaseSummaryCardMid gameData={gameData} gameDuration={gameDuration} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15} handleLaneCard={handleLaneCard} lastButtonPressedMid={lastButtonPressedMid} midSummaryCardStatus={midSummaryCardStatus}></LanePhaseSummaryCardMid>
                <LanePhaseSummaryCardBot gameData={gameData} gameDuration={gameDuration} champsJSON={champsJSON} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15} handleLaneCard={handleLaneCard} lastButtonPressedBot={lastButtonPressedBot} botSummaryCardStatus={botSummaryCardStatus}></LanePhaseSummaryCardBot>
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
              <Box width={'65%'} justifyContent={'space-between'} style={{ display: 'flex', alignItems: 'center', padding: '20px', marginTop: '20px' }} border={'0px solid #BBBBBB'} borderRadius={'10px'}>
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

        {/* Timeline */}
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
          {buildData === null && gameData !== null && currBuildChamp !== null ? (
            <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid className='GameDetailsContainer' width={'65%'} container justifyContent={'center'} margin={'auto'} marginTop={'20px'} marginBottom={'10px'}>
              <Box className='BuildsBox'>
                <Typography style={{ fontWeight: 'bold', fontSize: '20px' }}>Builds</Typography>
                <Typography style={{ fontSize: '20px', marginBottom: '20px', color: '#4B4B4B' }}>Player Items & Level Ups</Typography>
              </Box>
              <Box className='BuildsBox2'>
                <div className='BuildsChampPicsContainer'>
                  <Grid order={{ xs: playerData.teamId === 100 ? 1 : 3 }} style={{}}>
                    {gameData.info.participants.filter(players => players.teamId === 100).map((item, index) => (
                      <div className='pointer' onClick={() => handleBuildClick(item)} style={{ border: '4px solid #568CFF', borderRadius: '5px', display: 'inline-flex', filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.25))', margin: '5px', transform: item.championId === currBuildChamp.championId ? 'scale(115%)' : 'scale(100%)' }}>
                        <Typography style={{
                          fontSize: '12px',
                          position: 'absolute',
                          backgroundColor: item.teamId === 100 ? '#568CFF' : '#FF3A54',
                          color: 'white',
                          borderRadius: '0px',
                          borderBottomRightRadius: '5px',
                          paddingLeft: '0px',
                          paddingRight: '4px',
                          paddingTop: '1px',
                          paddingBottom: '1px',
                          textAlign: 'center',
                          right: 'auto',
                          bottom: 'auto',
                          top: '0px',
                          left: '0px',
                          justifyContent: 'center',
                          zIndex: 1
                        }}>{item.champLevel}
                        </Typography>
                        <img className='BuildsChampPic' style={{ filter: item.championId !== currBuildChamp.championId ? 'grayscale(100%)' : 'grayscale(0%)', borderRadius: '0%' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                      </div>
                    ))}
                  </Grid>
                  <Grid className='hideMobile' style={{ alignSelf: 'center' }} order={{ xs: 2 }}>
                    <Box marginBottom={'3px'} marginLeft={'20px'} marginRight={'20px'} width={'10px'} height={'10px'} borderRadius={'100%'} backgroundColor={'#C3C3C3'}></Box>
                  </Grid>
                  <Grid order={{ xs: playerData.teamId === 200 ? 1 : 3 }}>
                    {gameData.info.participants.filter(players => players.teamId === 200).map((item, index) => (
                      <div className='pointer' onClick={() => handleBuildClick(item)} style={{ border: '4px solid #FF3F3F', borderRadius: '5px', display: 'inline-flex', filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.25))', margin: '5px', transform: item.championId === currBuildChamp.championId ? 'scale(115%)' : 'scale(100%)' }}>
                        <Typography style={{
                          fontSize: '12px',
                          position: 'absolute',
                          backgroundColor: item.teamId === 100 ? '#568CFF' : '#FF3A54',
                          color: 'white',
                          borderRadius: '0px',
                          borderBottomRightRadius: '5px',
                          paddingLeft: '0px',
                          paddingRight: '4px',
                          paddingTop: '1px',
                          paddingBottom: '1px',
                          textAlign: 'center',
                          right: 'auto',
                          bottom: 'auto',
                          top: '0px',
                          left: '0px',
                          justifyContent: 'center',
                          zIndex: 1
                        }}>{item.champLevel}
                        </Typography>
                        <img className='BuildsChampPic' style={{ filter: item.championId !== currBuildChamp.championId ? 'grayscale(100%)' : 'grayscale(0%)', borderRadius: '0px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(item.championId)).id}.png`}></img>
                      </div>
                    ))}
                  </Grid>
                </div>
                {/* Skill Order */}
                <div style={{ display: 'flex', marginLeft: '0px', marginTop: '15px', flexDirection: 'column' }}>
                  <Typography fontSize={'20px'} color={currBuildChamp?.teamId === 100 ? '#568CFF' : '#FF3F3F'} marginBottom={'15px'} fontWeight={'bold'}>
                    {`${currBuildChamp?.championName} (${currBuildChamp?.riotIdGameName} #${currBuildChamp?.riotIdTagline})`}
                  </Typography>
                  <Typography fontSize={'20px'} color={'#4B4B4B'} marginTop={'10px'}>Skill Order</Typography>
                  <div style={{ display: 'flex', overflowX: 'auto', backgroundColor: '#E6E6E6', filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.25))', justifyContent: 'start', padding: '10px', paddingTop: '20px', paddingBottom: '10px', borderRadius: '10px', marginTop: '20px' }}>
                    {Array.from({ length: 18 }).map((_, index) => {
                      const skillEvent = buildData.skillTimeline[currBuildChamp.participantId - 1].filter(event => event.type === 'SKILL_LEVEL_UP')[index];

                      return (
                        <div key={index}>
                          <div style={{ filter: 'drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.25))' }}>
                            <Typography
                              style={{
                                backgroundColor: skillEvent ? (skillEvent.skillSlot !== 4 ? '#FFFFFF' : '#6E6E6E') : '#f2f2f2',
                                color: skillEvent
                                  ? skillEvent.skillSlot === 1
                                    ? '#2a1e96'
                                    : skillEvent.skillSlot === 2
                                      ? '#3c756a'
                                      : skillEvent.skillSlot === 3
                                        ? '#a3a53f'
                                        : skillEvent.skillSlot === 4
                                          ? 'white'
                                          : 'black'
                                  : 'black',
                                fontWeight: 'bold',
                                margin: '3px',
                                fontSize: '28px',
                                padding: '0',
                                textAlign: 'center',
                                marginBottom: '0px',
                                lineHeight: '38px',
                                width: '42px',
                                height: '42px',
                                borderTopLeftRadius: '5px',
                                borderTopRightRadius: '5px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {skillEvent ? (skillEvent.skillSlot === 1 ? 'Q' : skillEvent.skillSlot === 2 ? 'W' : skillEvent.skillSlot === 3 ? 'E' : 'R') : ' '}
                            </Typography>

                            <img
                              style={{
                                height: '42px',
                                width: '42px',
                                margin: '3px',
                                marginTop: '0px',
                                borderBottomLeftRadius: '5px',
                                borderBottomRightRadius: '5px',
                              }}
                              src={skillEvent
                                ? `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/spell/${buildData.champInfo[currBuildChamp.participantId - 1].data[
                                  gameData.info.participants
                                    .slice() // Create a shallow copy of the array
                                    .sort((a, b) => a.participantId - b.participantId)[currBuildChamp.participantId - 1]
                                    .championName
                                ]?.spells[skillEvent.skillSlot - 1].image.full}`
                                : '/images/blankItem.webp'}
                              alt={skillEvent ? `${skillEvent.skillSlot} Skill` : 'Empty'}
                            />
                          </div>

                          <Typography style={{ textAlign: 'center', color: '#4B4B4B', fontSize: '16px' }}>
                            {skillEvent ? index + 1 : ''}
                          </Typography>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Item build */}
                <div style={{ display: 'flex', marginLeft: '0px', marginTop: '20px', flexDirection: 'column' }}>
                  <Typography fontSize={'20px'} color={'#4B4B4B'} marginTop={'10px'}>Item Build</Typography>
                  <div style={{ display: 'flex', justifyContent: 'start', padding: '10px', paddingLeft: '3px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '10px', marginTop: '0px', flexWrap: 'wrap' }}>
                    {buildData.itemTimeline[currBuildChamp.participantId - 1].itemHistory.map((itemGroup, itemGroupIndex) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>

                        <div style={{ display: 'flex', filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.25))', boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px', margin: '15px', marginRight: '0px', marginLeft: '0px', backgroundColor: '#E6E6E6', padding: '10px', paddingBottom: '5px', borderRadius: '5px', flexDirection: 'column' }}>
                          <div style={{ display: 'flex' }}>
                            {itemGroup.map((item, itemIndex) => (
                              <img style={{ height: '42px', width: '42px', borderRadius: '5px', margin: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/item/${item.itemId}.png`}></img>
                            ))}
                          </div>
                          <div>
                            <Typography style={{ textAlign: 'center', color: '#747474', fontSize: '14px', fontWeight: 'bold', marginTop: '3px' }}>
                              {`${String(Math.floor(itemGroup[0].timestamp / 60000)).padStart(2, '0')}:${String(Math.floor((itemGroup[0].timestamp % 60000) / 1000)).padStart(2, '0')}`}
                            </Typography>
                          </div>
                        </div>
                        {itemGroupIndex !== buildData.itemTimeline[currBuildChamp.participantId - 1].itemHistory.length - 1 && (
                          <div>
                            <ForwardIcon style={{ fontSize: '42px', color: '#A4A4A4', marginLeft: '10px', marginRight: '10px' }}></ForwardIcon>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </div>
              </Box>
            </Grid>
          )}
        </div>

      </div>
    )
  }

}

export default GameDetails