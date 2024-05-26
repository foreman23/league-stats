import { Button, Typography, Box, Grid, ButtonGroup, Container, ListItem, List, TableContainer, Table, TableHead, TableRow, TableCell } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';

function GameDetails() {

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
          <Grid backgroundColor='pink' style={{ textAlign: 'center', display: 'flex', alignItems: 'center' }} justifyContent={'center'} item xs={5}>
            <img style={{ margin: '20px', width: '100px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/Rammus.png`} alt=''></img>
            <img src='/images/swords.svg'></img>
            <img style={{ margin: '20px', width: '100px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/Volibear.png`} alt=''></img>
          </Grid>
          <Grid backgroundColor='cyan' justifyContent={'center'} item xs={7}>
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
          <Grid style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} paddingLeft={'70px'} paddingRight={'20px'} backgroundColor='cyan' item xs={7}>
            <Typography fontSize={20} fontWeight={600}>Match Summary</Typography>
            <Typography fontSize={16}>Ler lost top lane against Volibear while their team got crushed in jungle, won in middle lane, and dominated in bot lane. Ler’s team was winning most of the game which included 2 lead changes. In the end, that resulted in victory.</Typography>
          </Grid>
          <Grid backgroundColor='pink' item xs={5}>
            <List>
              <ListItem>Top</ListItem>
              <ListItem>Jungle</ListItem>
              <ListItem>Mid</ListItem>
              <ListItem>Bot</ListItem>
            </List>
          </Grid>
        </Grid>

        {/* Section 3 */}
        <Grid marginTop={'20px'} backgroundColor={'#EDF8FF'} item xs={12}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Victory</TableCell>
                  <TableCell>(Blue Side)</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>KDA</TableCell>
                  <TableCell>Damage</TableCell>
                  <TableCell>Gold</TableCell>
                  <TableCell>CS</TableCell>
                  <TableCell>Wards</TableCell>
                  <TableCell>Build</TableCell>
                </TableRow>
              </TableHead>
              {data.map((player, index) => (
                <TableRow key={index}>
                  <TableCell><img style={{ width: '25%', borderRadius: '100%' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${player.champName}.png`}></img></TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.role}</TableCell>
                  <TableCell>{player.kda}</TableCell>
                  <TableCell>{player.damage}</TableCell>
                  <TableCell>{player.gold}</TableCell>
                  <TableCell>{player.cs}</TableCell>
                  <TableCell>{player.wards}</TableCell>
                  <TableCell>ITEMS..</TableCell>
                </TableRow>
              ))}
            </Table>
          </TableContainer>
        </Grid>
        <Grid marginTop={'10px'} backgroundColor={'#FFF1F3'} item xs={12}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Defeat</TableCell>
                  <TableCell>(Red Side)</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>KDA</TableCell>
                  <TableCell>Damage</TableCell>
                  <TableCell>Gold</TableCell>
                  <TableCell>CS</TableCell>
                  <TableCell>Wards</TableCell>
                  <TableCell>Build</TableCell>
                </TableRow>
              </TableHead>
              {data.map((player, index) => (
                <TableRow key={index}>
                  <TableCell><img style={{ width: '25%', borderRadius: '100%' }} src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${player.champName}.png`}></img></TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.role}</TableCell>
                  <TableCell>{player.kda}</TableCell>
                  <TableCell>{player.damage}</TableCell>
                  <TableCell>{player.gold}</TableCell>
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