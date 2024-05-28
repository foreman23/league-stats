import { Button, Typography, Box, Grid, ButtonGroup, Container, ListItem, List, TableContainer, Table, TableHead, TableRow, TableCell, LinearProgress } from '@mui/material';
import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import { useParams, useLocation } from 'react-router-dom';
import queues from '../jsonData/queues.json'
import summonerSpells from '../jsonData/summonerSpells.json';

function GameDetails() {

  // Get props
  const location = useLocation();
  const { gameId, summonerName, riotId } = useParams();
  const { gameData } = location.state;
  console.log(gameData)
  // console.log(gameId, summonerName, riotId)

  // Find player data
  const playerData = gameData.info.participants.find(player => player.riotIdGameName.toLowerCase() === summonerName)
  // console.log(playerData)

  // Find opposing laner
  const opposingLaner = gameData.info.participants.find(laner => laner.teamPosition === playerData.teamPosition && laner.summonerId !== playerData.summonerId)

  // Find gold difference between opposing laner
  const participantGold = playerData.goldEarned;
  const opposingGold = opposingLaner.goldEarned;
  const goldDifference = participantGold - opposingGold;

  // Find queue title
  const queue = queues.find(queue => queue.queueId === gameData.info.queueId)
  let queueTitle = queue.description;
  let isLaning = true; // set to false for non summoners rift modes
  if (queueTitle === '5v5 Ranked Solo games') {
    queueTitle = 'Ranked Solo';
  }
  if (queueTitle === '5v5 Ranked Flex games') {
    queueTitle = 'Ranked Flex'
  }
  if (queueTitle === '5v5 Draft Pick games') {
    queueTitle = 'Normal'
  }
  else if (queueTitle === '5v5 ARAM games') {
    queueTitle = 'ARAM';
    isLaning = false;
  }
  else if (queueTitle === 'Arena') {
    isLaning = false;
  }

  // Find duration and date of game start
  let gameStartDate = new Date(gameData.info.gameCreation);
  console.log(gameStartDate)
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

  // Calculate individual player scores
  const [playersWithScores, setPlayersWithScore] = useState([]);
  const [matchSummaryDesc, setMatchSummaryDesc] = useState(null);

  useEffect(() => {
    calculateOpScores();
  }, [gameData]);

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

    // // Assign game standing
    sortedPlayers.forEach((player, index) => {
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
        console.log(roles[i], scoreDiff)
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
        console.log(roles[i], scoreDiff)
        console.log(winner)

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
        console.log(roles[i], scoreDiff)
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
        <Navbar></Navbar>
        {/* <Button color={'primary'} variant={'contained'} onClick={() => navigate(-1)}>Back</Button> */}

        <Grid className='GameDetailsContainer' style={{ margin: 'auto' }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

          {/* Section 1 */}
          <Grid container marginTop={'3%'}>
            <Grid style={{ textAlign: 'center', display: 'flex', alignItems: 'center' }} justifyContent={'center'} item xs={5}>
              <img style={{ margin: '20px', width: '120px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${playerData.championName}.png`} alt=''></img>
              <img style={{ width: '30px' }} src='/images/swords.svg'></img>
              <img style={{ margin: '20px', width: '120px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${opposingLaner.championName}.png`} alt=''></img>
            </Grid>
            <Grid justifyContent={'center'} item xs={7}>
              <Typography style={{ paddingTop: '10px' }} fontSize={26} fontWeight={600}>{playerData.riotIdGameName} <span style={{ color: playerData.win ? 'blue' : 'red' }}>{playerData.win ? 'won' : 'lost'}</span> playing {playerData.championName} {playerData.teamPosition.toLowerCase()} for {playerData.teamId === 100 ? 'blue team' : 'red team'} finishing {playerData.kills}/{playerData.deaths}/{playerData.assists} with {playerData.totalMinionsKilled + playerData.neutralMinionsKilled} CS.</Typography>
              <Typography style={{ paddingTop: '10px', paddingBottom: '10px' }} fontSize={14}>{queueTitle} played on {gameStartDate.toLocaleDateString()} at {gameStartDate.toLocaleTimeString()} lasting for {gameDuration}</Typography>
              <span style={{ textAlign: 'start' }}>
                <Button className='GameDetailsCatBtn' color='grey' variant='contained'>Overview</Button>
                <Button className='GameDetailsCatBtn' color='grey' variant='contained'>Laning</Button>
                <Button className='GameDetailsCatBtn' color='grey' variant='contained'>Graphs</Button>
                <Button className='GameDetailsCatBtn' color='grey' variant='contained'>Teamfights</Button>
                <Button className='GameDetailsCatBtn' color='grey' variant='contained'>Builds</Button>
              </span>
            </Grid>
          </Grid>


          {/* Section 2 */}
          <Grid container marginTop={'3%'}>
            <Grid style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} paddingLeft={'10%'} paddingRight={'10%'} item xs={7}>
              <Typography fontSize={20} fontWeight={600}>Match Summary</Typography>
              <Typography style={{ marginRight: '15%' }} fontSize={16}>{matchSummaryDesc}</Typography>
            </Grid>
            <Grid backgroundColor='white' item xs={5}>
              <List>
                <ListItem style={{ backgroundColor: 'white', padding: '2px' }}>
                  <div style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography style={{ width: '75px' }} fontSize={'14px'}>Top</Typography>
                    <Box style={{ flex: '1', backgroundColor: '#FF8B8B', height: '25px', width: `100px`, borderRadius: '2px' }}></Box>
                  </div>
                </ListItem>
                <ListItem style={{ backgroundColor: 'white', padding: '2px' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography style={{ width: '75px' }} fontSize={'14px'}>Jungle</Typography>
                    <Box style={{ flex: '1', backgroundColor: '#FF3F3F', height: '25px', width: `50px`, borderRadius: '2px' }}></Box>
                  </div>
                </ListItem>
                <ListItem style={{ backgroundColor: 'white', padding: '2px' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography style={{ width: '75px' }} fontSize={'14px'}>Mid</Typography>
                    <Box style={{ backgroundColor: '#ABE1FF', height: '25px', width: `150px`, borderRadius: '2px' }}></Box>
                  </div>
                </ListItem>
                <ListItem style={{ backgroundColor: 'white', padding: '2px' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography style={{ width: '75px' }} fontSize={'14px'}>Bot</Typography>
                    <Box style={{ backgroundColor: '#37B7FF', height: '25px', width: `300px`, borderRadius: '2px' }}></Box>
                  </div>
                </ListItem>
              </List>
            </Grid>
          </Grid>

          {/* Section 3 */}
          <Grid marginLeft={'10%'} marginRight={'10%'} marginTop={'4%'} backgroundColor={gameData.info.teams[0].win ? '#EDF8FF' : '#FFF1F3'} item xs={12}>
            <TableContainer >
              <Table size='small'>
                <TableHead>
                  <TableRow style={{ alignItems: 'center' }}>
                    <TableCell>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography color={gameData.info.teams[0].win ? '#3374FF' : '#FF3F3F'} fontWeight={'bold'} fontSize={'18px'}>{gameData.info.teams[0].win ? "Victory" : "Defeat"}</Typography>
                        <Typography style={{ marginLeft: '10px', fontWeight: '600' }} fontSize={'14px'}>(Blue Team)</Typography>
                      </div>
                    </TableCell>
                    <TableCell style={{ fontWeight: '600' }}>Role</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>KDA</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>Damage</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>Gold</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>CS</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>Wards</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>Build</TableCell>
                  </TableRow>
                </TableHead>
                {gameData.info.participants.filter(player => player.teamId === 100).map((player, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <img style={{ width: '38px', borderRadius: '100%', marginRight: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${player.championName}.png`}></img>
                        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
                          <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/SummonerCherryFlash.png`}></img>
                          <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/SummonerTeleport.png`}></img>
                        </div>
                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}><Typography className='summonerNameTable' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`)} fontSize={'12px'}>{player.riotIdGameName}</Typography> {player.score.toFixed(1)} {(playersWithScores.find(participant => participant.puuid === player.puuid)).standing}</Typography>
                      </div>
                    </TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.teamPosition.toLowerCase()}</Typography></TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.kills}/{player.deaths}/{player.assists}</Typography></TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalDamageDealtToChampions.toLocaleString()}</Typography></TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.goldEarned.toLocaleString()}g</Typography></TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalMinionsKilled + player.neutralMinionsKilled}</Typography></TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.wardsPlaced}</Typography></TableCell>
                    <TableCell>ITEMS..</TableCell>
                  </TableRow>
                ))}
              </Table>
            </TableContainer>
          </Grid>
          <Grid marginLeft={'10%'} marginRight={'10%'} marginTop={'10px'} backgroundColor={gameData.info.teams[1].win ? '#EDF8FF' : '#FFF1F3'} item xs={12}>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography color={gameData.info.teams[1].win ? '#3374FF' : '#FF3F3F'} fontWeight={'bold'} fontSize={'18px'}>{gameData.info.teams[1].win ? "Victory" : "Defeat"}</Typography>
                        <Typography style={{ marginLeft: '10px', fontWeight: '600' }} fontSize={'14px'}>(Red Team)</Typography>
                      </div>
                    </TableCell>
                    <TableCell style={{ fontWeight: '600' }}>Role</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>KDA</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>Damage</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>Gold</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>CS</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>Wards</TableCell>
                    <TableCell style={{ fontWeight: '600' }}>Build</TableCell>
                  </TableRow>
                </TableHead>
                {gameData.info.participants.filter(player => player.teamId === 200).map((player, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <img style={{ width: '38px', borderRadius: '100%', marginRight: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${player.championName}.png`}></img>
                        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
                          <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/SummonerCherryFlash.png`}></img>
                          <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/SummonerTeleport.png`}></img>
                        </div>
                        <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}><Typography className='summonerNameTable' onClick={() => navigate(`/profile/${gameData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`)} fontSize={'12px'}>{player.riotIdGameName}</Typography> {player.score.toFixed(1)} {(playersWithScores.find(participant => participant.puuid === player.puuid)).standing}</Typography>
                      </div>
                    </TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.teamPosition.toLowerCase()}</Typography></TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.kills}/{player.deaths}/{player.assists}</Typography></TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalDamageDealtToChampions.toLocaleString()}</Typography></TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.goldEarned.toLocaleString()}g</Typography></TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.totalMinionsKilled + player.neutralMinionsKilled}</Typography></TableCell>
                    <TableCell><Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.wardsPlaced}</Typography></TableCell>
                    <TableCell>ITEMS..</TableCell>
                  </TableRow>
                ))}
              </Table>
            </TableContainer>
          </Grid>

        </Grid>
      </div>
    )
  }

}

export default GameDetails