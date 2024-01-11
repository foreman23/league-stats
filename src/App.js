import './App.css';
import axios from 'axios';
import { useEffect } from 'react';
import { Button, TextField, Box, ButtonGroup } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

function App() {

  const getSummoner = async () => {
    axios.get('https://americas.api.riotgames.com/lol/match/v5/matches/NA1_4884650142?api_key=RGAPI-f72cf64f-505d-4e52-8b5d-04bdf7d651b3')
      .then(function (response) {
        console.log(response.data.info);
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  const updateSummonerNameState = async (event) => {
    const inputValue = event.target.value;
    console.log(inputValue);
  }

  useEffect(() => {
    getSummoner();
  })

  return (
    <Box style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      <Grid style={{ alignItems: 'center', display: 'flex' }} container>
        <Grid xs={12} display={'flex'} justifyContent={'center'}>
          <TextField onChange={updateSummonerNameState} placeholder='Search for a Summoner' style={{ width: '40%' }} fullWidth></TextField>
          <Button style={{ marginLeft: '5px' }} variant='contained'>Search</Button>
        </Grid>
        <Grid style={{ marginTop: '15px' }} xs={12} display={'flex'} justifyContent={'center'}>
          <ButtonGroup>
            <Button color='info' variant='contained'>BR</Button>
            <Button color='info' variant='contained'>EUNE</Button>
            <Button color='info' variant='contained'>EUW</Button>
            <Button color='info' variant='contained'>LAN</Button>
            <Button color='info' variant='contained'>LAS</Button>
            <Button color='primary' variant='contained'>NA</Button>
            <Button color='info' variant='contained'>OCE</Button>
            <Button color='info' variant='contained'>RU</Button>
            <Button color='info' variant='contained'>TR</Button>
          </ButtonGroup>
        </Grid>
        <Grid xs={12} display={'flex'} justifyContent={'center'}>
          <ButtonGroup>
            <Button color='info' variant='contained'>JP</Button>
            <Button color='info' variant='contained'>KR</Button>
            <Button color='info' variant='contained'>PH</Button>
            <Button color='info' variant='contained'>SG</Button>
            <Button color='info' variant='contained'>TW</Button>
            <Button color='info' variant='contained'>TH</Button>
            <Button color='info' variant='contained'>VN</Button>
          </ButtonGroup>
        </Grid>

      </Grid>

    </Box>
  );
}

export default App;
