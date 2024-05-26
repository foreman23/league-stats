import { Button, Typography, Box, Grid, ButtonGroup, Container, ListItem, List, TableContainer, Table, TableHead, TableRow, TableCell } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import { useParams, useLocation } from 'react-router-dom';
import summonerSpells from '../jsonData/summonerSpells.json';

function GameDetails() {

  // Get props
  const location = useLocation();
  const { gameId, summonerName, riotId } = useParams();
  const { gameData } = location.state;
  console.log(gameData)
  console.log(gameId, summonerName, riotId)

  // Find player data
  const playerData = gameData.info.participants.find(player => player.riotIdGameName.toLowerCase() === summonerName)
  console.log(playerData)

  // Find opposing laner
  const opposingLaner = gameData.info.participants.find(laner => laner.teamPosition === playerData.teamPosition && laner.summonerId !== playerData.summonerId)

  // Find gold difference between opposing laner
  const participantGold = playerData.goldEarned;
  const opposingGold = opposingLaner.goldEarned;
  const goldDifference = participantGold - opposingGold;

  // Init navigate
  const navigate = useNavigate();

  return (
    <div>
      <Navbar></Navbar>
      {/* <Button color={'primary'} variant={'contained'} onClick={() => navigate(-1)}>Back</Button> */}

      <Grid style={{ margin: 'auto' }} container maxWidth={'75%'} rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

        {/* Section 1 */}
        <Grid container marginTop={'20px'}>
          <Grid backgroundColor='white' style={{ textAlign: 'center', display: 'flex', alignItems: 'center' }} justifyContent={'center'} item xs={5}>
            <img style={{ margin: '20px', width: '100px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${playerData.championName}.png`} alt=''></img>
            <img style={{ width: '30px' }} src='/images/swords.svg'></img>
            <img style={{ margin: '20px', width: '100px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${opposingLaner.championName}.png`} alt=''></img>
          </Grid>
          <Grid backgroundColor='white' justifyContent={'center'} item xs={7}>
            <Typography style={{ paddingTop: '10px' }} fontSize={26} fontWeight={600}>{playerData.riotIdGameName} {playerData.win ? 'won' : 'lost'} to {opposingLaner.teamId === 100 ? 'Blue Team' : 'Red Team'} as {playerData.teamPosition} finishing {playerData.kills}/{playerData.deaths}/{playerData.assists} with {playerData.totalMinionsKilled + playerData.neutralMinionsKilled} CS.</Typography>
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
        <Grid container marginTop={'20px'}>
          <Grid style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} paddingLeft={'70px'} paddingRight={'20px'} backgroundColor='white' item xs={7}>
            <Typography fontSize={20} fontWeight={600}>Match Summary</Typography>
            <Typography style={{ marginRight: '15%' }} fontSize={16}>{playerData.summonerName} lost {playerData.teamPosition.toLowerCase()} lane against {opposingLaner.championName} while their team got crushed in jungle, won in middle lane, and dominated in bot lane. Ler’s team was winning most of the game which included 2 lead changes. In the end, that resulted in victory.</Typography>
          </Grid>
          <Grid backgroundColor='white' item xs={5}>
            <List>
              <ListItem style={{ backgroundColor: 'white', padding: '2px' }}>
                <div style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Typography style={{ width: '75px' }} fontSize={'14px'}>Top</Typography>
                  <Box style={{ flex: '1', backgroundColor: '#FF8B8B', height: '25px', width: `100px` }}></Box>
                </div>
              </ListItem>
              <ListItem style={{ backgroundColor: 'white', padding: '2px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Typography style={{ width: '75px' }} fontSize={'14px'}>Jungle</Typography>
                  <Box style={{ flex: '1', backgroundColor: '#FF3F3F', height: '25px', width: `50px` }}></Box>
                </div>
              </ListItem>
              <ListItem style={{ backgroundColor: 'white', padding: '2px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Typography style={{ width: '75px' }} fontSize={'14px'}>Mid</Typography>
                  <Box style={{ backgroundColor: '#ABE1FF', height: '25px', width: `150px` }}></Box>
                </div>
              </ListItem>
              <ListItem style={{ backgroundColor: 'white', padding: '2px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Typography style={{ width: '75px' }} fontSize={'14px'}>Bot</Typography>
                  <Box style={{ backgroundColor: '#37B7FF', height: '25px', width: `300px` }}></Box>
                </div>
              </ListItem>
            </List>
          </Grid>
        </Grid>

        {/* Section 3 */}
        <Grid marginLeft={'50px'} marginRight={'50px'} marginTop={'20px'} backgroundColor={gameData.info.teams[0].win ? '#EDF8FF' : '#FFF1F3'} item xs={12}>
          <TableContainer>
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
                      <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.riotIdGameName}</Typography>
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
        <Grid marginLeft={'50px'} marginRight={'50px'} marginTop={'10px'} backgroundColor={gameData.info.teams[1].win ? '#EDF8FF' : '#FFF1F3'} item xs={12}>
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
                      <Typography fontSize={'13px'} fontWeight={player.riotIdGameName.toLowerCase() === summonerName ? 'Bold' : '500'}>{player.riotIdGameName}</Typography>
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

export default GameDetails