import { Button, Typography, Box, Grid, ButtonGroup, Container, ListItem, List, TableContainer, Table, TableHead, TableRow, TableCell, LinearProgress, CircularProgress, Tooltip } from '@mui/material';
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

function GameDetails() {

  const [isLaning, setIsLaning] = useState(true);
  const [queues, setQueues] = useState(null);
  const [queueTitle, setQueueTitle] = useState(null);


  // Init state
  const { summonerName } = useParams();
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

  // Card states (lane summaries)
  const [topSummaryCardStatus, setTopSummaryCardStatus] = useState(false);
  const [jgSummaryCardStatus, setJgSummaryCardStatus] = useState(false);
  const [midSummaryCardStatus, setMidSummaryCardStatus] = useState(false);
  const [botSummaryCardStatus, setBotSummaryCardStatus] = useState(false);

  // Timeline data
  const [timelineData, setTimelineData] = useState(null);

  // Find gold difference between opposing laner
  // const goldDifference = participantGold - opposingGold;

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
  const [lastButtonPressedTop, setLastButtonPressedTop] = useState(null);
  const [lastButtonPressedJg, setLastButtonPressedJg] = useState(null);
  const [lastButtonPressedMid, setLastButtonPressedMid] = useState(null);
  const [lastButtonPressedBot, setLastButtonPressedBot] = useState(null);
  const handleLaneCard = (lane, btnName) => {
    if (lane === 'top') {
      setLastButtonPressedTop(btnName)
      if (topSummaryCardStatus === false) {
        setTopSummaryCardStatus(true);
      }
      else if (btnName === lastButtonPressedTop) {
        setTopSummaryCardStatus(false);
        setLastButtonPressedTop(null);
      }
    };

    if (lane === 'mid') {
      setLastButtonPressedMid(btnName)
      if (midSummaryCardStatus === false) {
        setMidSummaryCardStatus(true);
      }
      else if (btnName === lastButtonPressedMid) {
        setMidSummaryCardStatus(false);
        setLastButtonPressedMid(null);
      }
    };

    if (lane === 'jg') {
      setLastButtonPressedJg(btnName)
      if (jgSummaryCardStatus === false) {
        setJgSummaryCardStatus(true);
      }
      else if (btnName === lastButtonPressedJg) {
        setJgSummaryCardStatus(false);
        setLastButtonPressedJg(null);
      }
    };

    if (lane === 'bot') {
      setLastButtonPressedBot(btnName)
      if (botSummaryCardStatus === false) {
        setBotSummaryCardStatus(true);
      }
      else if (btnName === lastButtonPressedBot) {
        setBotSummaryCardStatus(false);
        setLastButtonPressedBot(null);
      }
    };

  }

  // Calculate individual player scores
  const [playersWithScores, setPlayersWithScore] = useState([]);
  const [matchSummaryDesc, setMatchSummaryDesc] = useState(null);
  const [highestDamageDealt, setHighestDamageDealt] = useState(null);

  const [statsAt15, setStatsAt15] = useState(null);
  const [graphData, setGraphData] = useState(null);
  useEffect(() => {

    if (gameData && alternateRegion && timelineData && playerData) {
      document.title = `${playerData.riotIdGameName}#${playerData.riotIdTagline} - ${new Date(gameData.info.gameCreation).toLocaleDateString()} @${new Date(gameData.info.gameCreation).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(/\s/g, '')}`
      calculateOpScores();

      console.log(timelineData)
      const fetch15Stats = async () => {
        if (timelineData) {
          const graphData = await generateGraphData(gameData, timelineData);
          const stats15 = await getStatsAt15(alternateRegion, gameData.metadata.matchId, gameData, timelineData);
          setGraphData(graphData);
          setStatsAt15(stats15);
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

  // Get queue JSON data from riot
  const getQueueJSON = async () => {
    try {
      const response = await fetch('https://static.developer.riotgames.com/docs/lol/queues.json');
      const data = await response.json();
      setQueues(data);
    } catch (error) {
      console.error('Error fetching queue JSON data:', error);
    }
  }

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

  // On initial page load
  useEffect(() => {
    let payload = JSON.parse(localStorage.getItem('gameData'));
    setAlternateRegion(payload.alternateRegion);
    setGameData(payload.gameData);
    setDataDragonVersion(payload.dataDragonVersion);
    getQueueJSON();
    getItemsJSON();
  }, [])

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
    if (queues) {
      // Call queue title function
      findQueueTitle();
    }

  }, [queues])

  useEffect(() => {
    if (graphData) {
      console.log(graphData.leadChanges)
      let playerTeamLeading = null;
      let closeGame = false;
      let blowout = false;
      let nearBlowout = false;

      // Determine which team was winning most of the match
      let gameLength = graphData.blueLeadingTime + graphData.redLeadingTime;
      let blueLeadingPercentage = graphData.blueLeadingTime / gameLength;
      let redLeadingPercentage = graphData.redLeadingTime / gameLength
      console.log(blueLeadingPercentage)
      console.log(redLeadingPercentage)

      // Blue has more time winning
      if (graphData.blueLeadingTime > graphData.redLeadingTime) {
        console.log(blueLeadingPercentage - redLeadingPercentage)
        if (blueLeadingPercentage - redLeadingPercentage < 0.25) {
          closeGame = true;
        }
        if (graphData.redLeadingTime === 0) {
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
        console.log(redLeadingPercentage - blueLeadingPercentage)
        if (redLeadingPercentage - blueLeadingPercentage < 0.25) {
          closeGame = true;
        }
        if (graphData.blueLeadingTime === 0) {
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
        console.log(closeGame)
        playerTeamLeading = false;
      }

      // Determine team leading most of game
      let teamLeadingSentence = '';
      if (!closeGame && !blowout) {
        if (graphData.leadChanges === 1) {
          teamLeadingSentence = `${playerData.riotIdGameName}'s team was ${playerTeamLeading ? 'winning' : 'losing'} most of the game which had ${graphData.leadChanges} lead change.`
        } else {
          teamLeadingSentence = `${playerData.riotIdGameName}'s team was ${playerTeamLeading ? 'winning' : 'losing'} most of the game which had ${graphData.leadChanges} lead changes.`
        }
      } if (blowout) {
        teamLeadingSentence = `${playerData.riotIdGameName}'s team was ${playerTeamLeading ? 'winning' : 'losing'} the whole game.`
      } else if (nearBlowout) {
        if (graphData.leadChanges > 1) {
          teamLeadingSentence = `${playerData.riotIdGameName}'s team was ${playerTeamLeading ? 'winning' : 'losing'} for almost the whole game which had ${graphData.leadChanges} lead changes.`
        } else {
          teamLeadingSentence = `${playerData.riotIdGameName}'s team was ${playerTeamLeading ? 'winning' : 'losing'} for almost the whole game which had ${graphData.leadChanges} lead change.`
        }
      }
      else if (closeGame) {
        teamLeadingSentence = `The game was evenly matched for most of the game.`
      }

      // Determine closing sentence
      let lastSentence = '';
      if (playerData.win && playerTeamLeading === false) {
        lastSentence = 'Despite of that, their team made a comeback and ended up winning the game.'
      }
      if (!playerData.win && playerTeamLeading === true) {
        lastSentence = `Unfortunately the other team made a comeback and ${playerData.riotIdGameName}'s team ended up losing the game.`
      }
      if (playerData.win && playerTeamLeading === true) {
        lastSentence = `In the end that resulted in victory.`
      }
      if (!playerData.win && playerTeamLeading === false) {
        lastSentence = `In the end that resulted in defeat.`
      }

      setMatchSummaryDesc(`${matchSummaryDesc} ${teamLeadingSentence} ${lastSentence} `)
    }
  }, [graphData])

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
      wards: Math.max(...players.map(p => p.wardsPlaced)),
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
        wards: player.wardsPlaced / maxValues.wards,
        killParticipation: killParticipation / maxValues.killParticipation
      };

      const weights = {
        kills: 1.5,
        deaths: 1.5,
        assists: 1.2,
        damage: 1.3,
        gold: 1.1,
        cs: 1.0,
        wards: 2,
        killParticipation: 1.4
      };

      const score = (
        normalized.kills * weights.kills +
        normalized.deaths * weights.deaths +
        normalized.assists * weights.assists +
        normalized.damage * weights.damage +
        normalized.gold * weights.gold +
        normalized.cs * weights.cs +
        normalized.wards * weights.wards +
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

    // Re-sort by role
    const roleOrder = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
    let reSortedPlayers = sortedPlayers.sort((a, b) => roleOrder.indexOf(a.teamPosition) - roleOrder.indexOf(b.teamPosition));

    // Set matchup result descriptors
    const roles = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM'];
    let topDescEndGame = null;
    let jgDescEndGame = null;
    let midDescEndGame = null;
    let botDescEndGame = null;
    for (let i = 0; i < roles.length; i++) {
      // Calculate bot lane as BOT + UTILITY
      if (roles[i] === 'BOTTOM') {
        const allyADC = playersWithOpScores.find((player => player.teamPosition === `BOTTOM` && player.teamId === playerData.teamId))
        const allySupp = playersWithOpScores.find((player => player.teamPosition === `UTILITY` && player.teamId === playerData.teamId))
        const oppADC = playersWithOpScores.find((player => player.teamPosition === `BOTTOM` && player.teamId !== playerData.teamId))
        const oppSupp = playersWithOpScores.find((player => player.teamPosition === `UTILITY` && player.teamId !== playerData.teamId))
        let scoreDiff = null;
        let winner = null;
        let allies = [allyADC, allySupp];
        let opps = [oppADC, oppSupp];
        if (allyADC && allySupp && oppSupp && oppADC) {
          let allyCombinedScore = allyADC.score + allySupp.score;
          let oppCombinedScore = oppADC.score + oppSupp.score;
          if (allyCombinedScore > oppCombinedScore) {
            scoreDiff = allyCombinedScore - oppCombinedScore;
            winner = [allyADC, allySupp];
          }
          if (oppCombinedScore > allyCombinedScore) {
            scoreDiff = oppCombinedScore - allyCombinedScore;
            winner = [oppADC, oppSupp];
          }
        }
        // Description from results
        let descEndGame = null;

        // Calculate win/loss tag
        // console.log(roles[i], scoreDiff)
        let resTag = null;
        if (scoreDiff > 2) {
          if (winner[0] === allyADC || winner[1] === allyADC) {
            resTag = 'dominated'
          }
          else {
            resTag = 'got crushed'
          }
        }
        else if (scoreDiff < 0.1) {
          resTag = 'tied'
        }
        else {
          if (winner[0] === allyADC || winner[1] === allyADC) {
            resTag = 'won'
          }
          else {
            resTag = 'lost'
          }
        }

        // Calculate win/loss tag

        if (winner[0] === allyADC || winner[1] === allyADC) {
          if (winner[0].puuid === playerData.puuid || winner[1].puuid === playerData.puuid) {
            descEndGame = `${playerData.riotIdGameName} ${resTag} alongside ${allies.find(player => player.puuid !== playerData.puuid).championName} in bot lane against ${oppADC.championName} and ${oppSupp.championName}`
          }
          else {
            descEndGame = `${resTag} in bot`;
          }
        }
        else if (winner[0] === oppADC || winner[1] === oppADC) {
          if (winner[0].teamPosition === playerData.teamPosition || winner[1].teamPosition === playerData.teamPosition) {
            descEndGame = `${playerData.riotIdGameName} ${resTag} alongside ${allies.find(player => player.puuid !== playerData.puuid).championName} in bot lane against ${oppADC.championName} and ${oppSupp.championName}`
          }
          else {
            descEndGame = `${resTag} in bot`;
          }
        }
        botDescEndGame = descEndGame
        // setBotDescEndGame(descEndGame);
      }

      else {
        const ally = playersWithOpScores.find((player => player.teamPosition === `${roles[i]}` && player.teamId === playerData.teamId))
        const opp = playersWithOpScores.find((player => player.teamPosition === `${roles[i]}` && player.teamId !== playerData.teamId))
        let scoreDiff = null;
        let winner = null;
        if (ally && opp) {
          if (ally.score > opp.score) {
            scoreDiff = ally.score - opp.score;
            winner = ally;
          }
          if (opp.score > ally.score) {
            scoreDiff = opp.score - ally.score;
            winner = opp;
          }
        }
        // Description from results
        let descEndGame = null;

        // Calculate win/loss tag
        // console.log(roles[i], scoreDiff)
        let resTag = null;
        if (scoreDiff > 2) {
          if (winner === ally) {
            resTag = 'dominated'
          }
          else {
            resTag = 'got crushed'
          }
        }
        else if (scoreDiff < 0.1) {
          resTag = 'tied'
        }
        else {
          if (winner === ally) {
            resTag = 'won'
          }
          else {
            resTag = 'lost'
          }
        }


        if (winner === ally) {
          if (winner.puuid === playerData.puuid) {
            descEndGame = `${playerData.riotIdGameName} ${resTag} in ${winner.teamPosition.toLowerCase()} against ${opp.championName}`
          }
          else {
            descEndGame = `${resTag} in ${winner.teamPosition.toLowerCase()}`
          }
        }
        if (winner === opp) {
          if (winner.teamPosition === playerData.teamPosition) {
            descEndGame = `${playerData.riotIdGameName} ${resTag} ${winner.teamPosition.toLowerCase()} against ${opp.championName}`
          }
          else {
            descEndGame = `${resTag} in ${winner.teamPosition.toLowerCase()}`
          }
        }

        if (roles[i] === 'TOP') {
          topDescEndGame = descEndGame
          // setTopDescEndGame(descEndGame);
        }
        if (roles[i] === 'JUNGLE') {
          jgDescEndGame = descEndGame
          // setjgDescEndGame(descEndGame);
        }
        if (roles[i] === 'MIDDLE') {
          midDescEndGame = descEndGame
          // setMidDescEndGame(descEndGame);
        }
      }
    }

    // Assemble match summary text
    let matchSummaryText = null;
    if (playerData.teamPosition === 'TOP') {
      matchSummaryText = `${topDescEndGame} while their team ${jgDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
    }
    if (playerData.teamPosition === 'JUNGLE') {
      matchSummaryText = `${jgDescEndGame} while their team ${topDescEndGame}, ${midDescEndGame}, and ${botDescEndGame}.`
    }
    if (playerData.teamPosition === 'MIDDLE') {
      matchSummaryText = `${midDescEndGame} while their team ${topDescEndGame}, ${jgDescEndGame}, and ${botDescEndGame}.`
    }
    else if (playerData.teamPosition === 'BOTTOM' || playerData.teamPosition === 'UTILITY') {
      matchSummaryText = `${botDescEndGame} while their team ${topDescEndGame}, ${jgDescEndGame}, and ${midDescEndGame}.`
    }

    setMatchSummaryDesc(matchSummaryText);

    // Update the gameData object with the new opScores
    const updatedGameData = { ...gameData };
    updatedGameData.info.participants = reSortedPlayers;
    // console.log(updatedGameData.info.participants)
    setHighestDamageDealt(highestDamageDealt)
    setPlayersWithScore(updatedGameData.info.participants)
  };

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
        <Navbar></Navbar>
        <LinearProgress></LinearProgress>
      </Box>
    )
  }

  else {
    return (
      <div>
        <div id={'SummaryAnchor'} style={{ backgroundColor: 'white' }}>
          <Navbar></Navbar>

          <Grid className='GameDetailsContainer' style={{ margin: 'auto', justifyContent: 'center', paddingBottom: '20px' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

            {/* Section 1 */}
            <Grid container marginLeft={'2%'} marginRight={'2%'} marginTop={'2%'} maxWidth={'90%'}>
              <Grid style={{ textAlign: 'center', display: 'flex', alignItems: 'center' }} justifyContent={'center'} item xs={5}>
                {playerData.win ? (
                  <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block' }}>
                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                      <img
                        style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${playerData.championName}.png`} alt=''>
                      </img>
                    </Tooltip>
                    <img style={{ position: 'absolute', top: '8px', right: '8px', width: '36px' }} src='/images/accept.png' alt='Crown'></img>
                    <Box style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '10px', backgroundColor: playerData.teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </a>
                ) : (
                  <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block' }}>
                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                      <img
                        style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px', filter: 'grayscale(80%)' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${playerData.championName}.png`} alt=''>
                      </img>
                    </Tooltip>
                    <img style={{ position: 'absolute', top: '8px', right: '8px', width: '36px' }} src='/images/close.png' alt='Crown'></img>
                    <Box style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '10px', backgroundColor: playerData.teamId === 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </a>
                )}
                <img style={{ width: '55px' }} src='/images/swords.svg'></img>
                {playerData.win ? (
                  <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${opposingLaner.riotIdGameName}/${opposingLaner.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block' }}>
                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${opposingLaner.riotIdGameName} #${opposingLaner.riotIdTagline}`}>
                      <img
                        style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px', filter: 'grayscale(80%)' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${opposingLaner.championName}.png`} alt=''>
                      </img>
                    </Tooltip>
                    <Box style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '10px', backgroundColor: playerData.teamId !== 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </a>
                ) : (
                  <a className='clickableName' href={`/profile/${gameData.info.platformId.toLowerCase()}/${opposingLaner.riotIdGameName}/${opposingLaner.riotIdTagline.toLowerCase()}`} style={{ position: 'relative', display: 'inline-block', color: 'red' }}>
                    <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -1] } }] } }} title={`${opposingLaner.riotIdGameName} #${opposingLaner.riotIdTagline}`}>
                      <img
                        style={{ margin: '20px', width: '110px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', marginBottom: '0px', }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${opposingLaner.championName}.png`} alt=''>
                      </img>
                    </Tooltip>
                    <Box style={{ position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '10px', backgroundColor: playerData.teamId !== 100 ? '#37B7FF' : '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </a>
                )}
              </Grid>
              <Grid justifyContent={'center'} item xs={7}>
                <Typography style={{ paddingTop: '10px' }} fontSize={26} fontWeight={600}>
                  <Tooltip placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} title={`${playerData.riotIdGameName} #${playerData.riotIdTagline}`}>
                    <a className='clickableName' style={{ textDecoration: 'none', color: 'inherit' }} href={`/profile/${gameData.info.platformId.toLowerCase()}/${playerData.riotIdGameName}/${playerData.riotIdTagline.toLowerCase()}`}>
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

            {/* Section 2 */}
            <Grid style={{ overflow: 'clip' }} marginLeft={'0%'} marginRight={'5%'} container marginTop={'15px'} paddingBottom={'15px'}>
              <Grid className='MatchSummaryGrid' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} item xs={7}>
                <Typography fontSize={20} fontWeight={600}>Match Summary</Typography>
                <Typography style={{ marginRight: '15%', marginTop: '5px' }} fontSize={16}>{matchSummaryDesc}</Typography>
              </Grid>
              <Grid backgroundColor='white' item xs={5}>
                {graphData ? (
                  <TeamGoldDifGraph width={600} teamId={playerData.teamId} height={250} hideTitle yAxisGold={graphData.yAxisGold} xAxisGold={graphData.xAxisGold}></TeamGoldDifGraph>
                ) : (
                  <CircularProgress style={{ justifyContent: 'center', marginTop: '20px' }}></CircularProgress>
                )}
              </Grid>
            </Grid>
          </Grid>
        </div>

        {/* Section 3 */}

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
                          <Tooltip title={player.championName} disableInteractive placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
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
                                src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${player.championName}.png`}>
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
                              {/* <span className={
                                (playersWithScores.find(participant => participant.puuid === player.puuid)?.standing === '1st' ?
                                  'TableStandingMVP' :
                                  'TableStanding')
                              }>{(playersWithScores.find(participant => participant.puuid === player.puuid)).standing}
                              </span> {player.score.toFixed(1)} */}
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
                          <Tooltip title={player.championName} disableInteractive placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
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
                                src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${player.championName}.png`}>
                              </img>
                            </div>
                          </Tooltip>
                          <div style={{ display: 'flex', flexDirection: 'column', marginRight: '3px' }}>
                            <Tooltip title={`summoner 1`} disableInteractive placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                              <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner1Id.toString()).id}.png`}></img>
                            </Tooltip>
                            <Tooltip title={`summoner 2`} disableInteractive placement='top' arrow slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}>
                              <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/${summonerSpellsObj.find(spell => spell.key === player.summoner2Id.toString()).id}.png`}></img>
                            </Tooltip>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', marginRight: '15px' }}>
                            <img style={{ width: '19px', borderRadius: '2px' }} src={getKeystoneIconUrl(player, runesObj)} alt="Keystone"></img>
                            <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.canisback.com/img/${runesObj.find(keystone => keystone.id === player.perks.styles[0].style).icon}`}></img>
                          </div>
                          <Tooltip disabledInteractive slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -9] } }] } }} arrow placement='top' title={<div>{`${player.riotIdGameName} #${player.riotIdTagline}`}</div>}>
                            <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}><a style={{ textDecoration: 'none', color: 'inherit' }} href={`/profile/${gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`}><Typography className='summonerNameTable' fontSize={'12px'}>{player.riotIdGameName}</Typography></a>
                              {/* ********************** COMMENT THIS BACK IN LATER ******************************* */}
                              {/* <span className={
                                (playersWithScores.find(participant => participant.puuid === player.puuid)?.standing === '1st' ?
                                  'TableStandingMVP' :
                                  'TableStanding')
                              }>{(playersWithScores.find(participant => participant.puuid === player.puuid)).standing}
                              </span> {player.score.toFixed(1)} */}
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

        {/* Section 4 */}
        <div id='LaningAnchor' style={{ backgroundColor: 'white' }}>
          {statsAt15 === null ? (
            <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid xs={12} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', marginTop: '45px', textAlign: 'center', marginBottom: '45px' }}>
              <Grid style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', maxWidth: '1000px' }}>
                <Typography fontSize={20} fontWeight={600}>Laning Phase Results</Typography>
                <Typography marginBottom={'20px'}>How each lane was performing @ 15 minutes</Typography>

                <LanePhaseSummaryCardTop gameData={gameData} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15} handleLaneCard={handleLaneCard} lastButtonPressedTop={lastButtonPressedTop} topSummaryCardStatus={topSummaryCardStatus}></LanePhaseSummaryCardTop>
                <LanePhaseSummaryCardJg gameData={gameData} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15} handleLaneCard={handleLaneCard} lastButtonPressedJg={lastButtonPressedJg} jgSummaryCardStatus={jgSummaryCardStatus}></LanePhaseSummaryCardJg>
                <LanePhaseSummaryCardMid gameData={gameData} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15} handleLaneCard={handleLaneCard} lastButtonPressedMid={lastButtonPressedMid} midSummaryCardStatus={midSummaryCardStatus}></LanePhaseSummaryCardMid>
                <LanePhaseSummaryCardBot gameData={gameData} dataDragonVersion={dataDragonVersion} timelineData={timelineData} statsAt15={statsAt15} handleLaneCard={handleLaneCard} lastButtonPressedBot={lastButtonPressedBot} botSummaryCardStatus={botSummaryCardStatus}></LanePhaseSummaryCardBot>

              </Grid>
            </Grid>

          )}
        </div>

        {/* Section 5 */}
        <div id='GraphsAnchor' style={{ backgroundColor: '#f2f2f2' }}>
          {statsAt15 && graphData ? (
            <Grid xs={12} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', paddingTop: '45px', textAlign: 'center' }}>
              <Grid style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', maxWidth: '1000px' }}>
                <Grid style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', maxWidth: '1000px' }}>
                  <Typography fontSize={20} fontWeight={600}>Graphs</Typography>
                  <Typography marginBottom={'20px'}>Match data visualized</Typography>
                  <Graphs gameData={gameData} teamId={playerData.teamId} timelineData={timelineData} graphData={graphData}></Graphs>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
              <CircularProgress />
            </Box>
          )}
        </div>

        {/* Section 6 */}
        <div id='TeamfightsAnchor'>
          {statsAt15 === null ? (
            <Box sx={{ display: 'flex', height: '300px', justifyContent: 'center', margin: 'auto', alignItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid xs={12} container style={{ display: 'flex', justifyContent: 'center', margin: 'auto', paddingTop: '45px', textAlign: 'center', marginBottom: '150px' }}>
              <Grid style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', maxWidth: '1000px' }}>
                <Grid style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', maxWidth: '1000px' }}>
                  <Battles gameData={gameData} timelineData={timelineData}></Battles>
                </Grid>
              </Grid>
            </Grid>
          )}
        </div>

      </div>
    )
  }

}

export default GameDetails