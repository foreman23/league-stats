import { Button, Typography, Box, Grid, ButtonGroup, Container, ListItem, List, TableContainer, Table, TableHead, TableRow, TableCell } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import { useParams, useLocation } from 'react-router-dom';

function GameDetails() {

  // Get props
  const location = useLocation();
  const { gameId, summonerName, riotId } = useParams();
  const { gameData } = location.state;
  console.log(gameData)

  // Init navigate
  const navigate = useNavigate();

  const data = [
    {
      champName: 'Rammus',
      name: 'Ler',
      role: 'Top',
      rank: 'Diamond 4',
      kda: '4/5/3',
      kdaRatio: 1.4,
      damage: 14267,
      gold: 8982,
      cs: '162 (6.9/m)',
      wards: 9,
      build: [
        'https://link-to-item1.png',
        'https://link-to-item2.png',
        'https://link-to-item3.png',
      ],
    },
    {
      champName: 'Karthus',
      name: 'Misandric Man',
      role: 'Jungle',
      rank: 'Diamond 4',
      kda: '6/5/12',
      kdaRatio: 3.6,
      damage: 16028,
      gold: 11105,
      cs: '173 (7.4/m)',
      wards: 3,
      build: [
        'https://link-to-item1.png',
        'https://link-to-item2.png',
        'https://link-to-item3.png',
      ],
    },
    {
      champName: 'Taliyah',
      name: 'pranro',
      role: 'Middle',
      rank: 'Level 372',
      kda: '6/4/5',
      kdaRatio: 2.75,
      damage: 12518,
      gold: 11797,
      cs: '196 (8.3/m)',
      wards: 7,
      build: [
        'https://link-to-item1.png',
        'https://link-to-item2.png',
        'https://link-to-item3.png',
      ],
    },
    {
      champName: 'Lucian',
      name: 'mother seulgi',
      role: 'Carry',
      rank: 'Diamond 4',
      kda: '20/3/9',
      kdaRatio: 9.67,
      damage: 36344,
      gold: 16067,
      cs: '219 (9.3/m)',
      wards: 6,
      build: [
        'https://link-to-item1.png',
        'https://link-to-item2.png',
        'https://link-to-item3.png',
      ],
    },
    {
      champName: 'Braum',
      name: 'llllllllllll',
      role: 'Support',
      rank: 'Emerald 2',
      kda: '4/3/25',
      kdaRatio: 9.67,
      damage: 9701,
      gold: 9699,
      cs: '17 (0.7/m)',
      wards: 20,
      build: [
        'https://link-to-item1.png',
        'https://link-to-item2.png',
        'https://link-to-item3.png',
      ],
    },
  ];


  return (
    <div>
      <Navbar></Navbar>
      {/* <Button color={'primary'} variant={'contained'} onClick={() => navigate(-1)}>Back</Button> */}

      <Grid style={{ margin: 'auto' }} container maxWidth={'75%'} rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

        {/* Section 1 */}
        <Grid container marginTop={'20px'}>
          <Grid backgroundColor='white' style={{ textAlign: 'center', display: 'flex', alignItems: 'center' }} justifyContent={'center'} item xs={5}>
            <img style={{ margin: '20px', width: '100px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/Rammus.png`} alt=''></img>
            <img style={{ width: '30px' }} src='/images/swords.svg'></img>
            <img style={{ margin: '20px', width: '100px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/Volibear.png`} alt=''></img>
          </Grid>
          <Grid backgroundColor='white' justifyContent={'center'} item xs={7}>
            <Typography style={{ paddingTop: '10px' }} fontSize={26} fontWeight={600}>Ler won against Volibear as top with gold difference of 5,000g at end of game</Typography>
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
            <Typography style={{ marginRight: '15%' }} fontSize={16}>Ler lost top lane against Volibear while their team got crushed in jungle, won in middle lane, and dominated in bot lane. Ler’s team was winning most of the game which included 2 lead changes. In the end, that resulted in victory.</Typography>
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
              <ListItem style={{ backgroundColor: 'white', padding:'2px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Typography style={{ width: '75px' }} fontSize={'14px'}>Bot</Typography>
                  <Box style={{ backgroundColor: '#37B7FF', height: '25px', width: `300px` }}></Box>
                </div>
              </ListItem>
            </List>
          </Grid>
        </Grid>

        {/* Section 3 */}
        <Grid marginLeft={'50px'} marginRight={'50px'} marginTop={'20px'} backgroundColor={'#EDF8FF'} item xs={12}>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow style={{ alignItems: 'center' }}>
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <Typography color={'#3374FF'} fontWeight={'bold'} fontSize={'18px'}>Victory</Typography>
                      <Typography style={{ marginLeft: '10px', fontWeight: '600' }} fontSize={'14px'}>(Blue Side)</Typography>
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight:'600' }}>Role</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>KDA</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>Damage</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>Gold</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>CS</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>Wards</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>Build</TableCell>
                </TableRow>
              </TableHead>
              {gameData.info.participants.filter(player => player.teamId === 100 ).map((player, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img style={{ width: '38px', borderRadius: '100%', marginRight: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${player.championName}.png`}></img>
                      <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
                        <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/SummonerCherryFlash.png`}></img>
                        <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/SummonerTeleport.png`}></img>
                      </div>
                      {player.name}
                    </div>
                  </TableCell>
                  <TableCell>{player.championName}</TableCell>
                  <TableCell>{player.championName}</TableCell>
                  <TableCell>{player.championName.toLocaleString()}</TableCell>
                  <TableCell>{player.championName.toLocaleString()}</TableCell>
                  <TableCell>{player.championName}</TableCell>
                  <TableCell>{player.championName}</TableCell>
                  <TableCell>ITEMS..</TableCell>
                </TableRow>
              ))}
            </Table>
          </TableContainer>
        </Grid>
        <Grid marginLeft={'50px'} marginRight={'50px'} marginTop={'10px'} backgroundColor={'#FFF1F3'} item xs={12}>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <Typography color={'#FF3F3F'} fontWeight={'bold'} fontSize={'18px'}>Defeat</Typography>
                      <Typography style={{ marginLeft: '10px', fontWeight: '600' }} fontSize={'14px'}>(Red Side)</Typography>
                    </div>
                  </TableCell>
                  <TableCell style={{ fontWeight:'600' }}>Role</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>KDA</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>Damage</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>Gold</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>CS</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>Wards</TableCell>
                  <TableCell style={{ fontWeight:'600' }}>Build</TableCell>
                </TableRow>
              </TableHead>
              {data.map((player, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img style={{ width: '38px', borderRadius: '100%', marginRight: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${player.champName}.png`}></img>
                      <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
                        <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/SummonerCherryFlash.png`}></img>
                        <img style={{ width: '19px', borderRadius: '2px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/spell/SummonerTeleport.png`}></img>
                      </div>
                      {player.name}
                    </div>
                  </TableCell>
                  <TableCell>{player.role}</TableCell>
                  <TableCell>{player.kda}</TableCell>
                  <TableCell>{player.damage.toLocaleString()}</TableCell>
                  <TableCell>{player.gold.toLocaleString()}</TableCell>
                  <TableCell>{player.cs}</TableCell>
                  <TableCell>{player.wards}</TableCell>
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