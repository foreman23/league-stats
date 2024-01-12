import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, TextField, Box, ButtonGroup, List, ListItem } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';

function App() {

  const [summonerName, setSummonerName] = useState(null);
  const [summonerData, setSummonerData] = useState(null);
  // const [summonerNotFound, setSummonerNotFound] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('na1');
  const [dataDragonVersion, setDataDragonVersion] = useState(null);

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

  const updateSummonerNameState = async (event) => {
    const inputValue = event.target.value;
    setSummonerName(inputValue);
    //console.log(inputValue);
  }

  const handleRegionChange = async (event) => {
    const value = event.target.value;
    setSelectedRegion(value);
    //console.log(value)
  }

  const getSummoner = async () => {
    if (summonerName !== null) {
      axios.get(`https://${selectedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`)
      .then(function (response) {
        // setSummonerNotFound(false);
        setSummonerData(response.data)
      })
      .catch(function (response) {
        console.log('Error: Error fetching summoner info from API')
        // setSummonerNotFound(true);
      })
    }
  }

  const [isInitialRender, setIsInitialRender] = useState(true);
  useEffect(() => {
    // On summoner data retrieval
    if (isInitialRender === false && summonerData !== null) {
      console.log(summonerData)
      //   axios.get(`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/data/en_US/champion/Aatrox.json`)
      //   .then(function (response) {
      //     console.log(response.data)
      //   })
      //   .catch(function (response) {
      //     console.log('Error: Error fetching data from ddragon')
      //   })
    }
    // Set callback
    else {
      setIsInitialRender(false);
    }
  }, [summonerData, isInitialRender])

  // Get data dragon version on initial load
  useEffect(() => {
    getDataDragonVersion();
  }, [])

  return (
    <Box style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      <Grid style={{ alignItems: 'center', display: 'flex' }} container>

        <Grid xs={12} display={'flex'} justifyContent={'center'}>
          {/* <img src=''></img> */}
          <img src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${summonerData !== null ? summonerData.profileIconId : 69}.png`} alt=''></img>
        </Grid>

        <Grid xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
          <List>
            <ListItem>{summonerData !== null ? summonerData.name : 'summoner name'}</ListItem>
            <ListItem>{summonerData !== null ? `lvl: ${summonerData.summonerLevel}` : 'level'}</ListItem>
          </List>
        </Grid>

        <Grid xs={12} display={'flex'} justifyContent={'center'}>
          <TextField onKeyDown={event => {
            if (event.key === 'Enter') {
              getSummoner();
            }
          }}
            onChange={updateSummonerNameState}
            placeholder='Search for a Summoner'
            style={{ width: '40%' }}
            fullWidth>
          </TextField>
          <Button onClick={getSummoner} style={{ marginLeft: '5px' }} variant='contained'>Search</Button>
        </Grid>
        <Grid style={{ marginTop: '15px' }} xs={12} display={'flex'} justifyContent={'center'}>
          <ButtonGroup>
            <Button onClick={handleRegionChange} value='br1' color={selectedRegion === 'br1' ? 'secondary' : 'info'} variant='contained'>BR</Button>
            <Button onClick={handleRegionChange} value='eun1' color={selectedRegion === 'eun1' ? 'secondary' : 'info'} variant='contained'>EUNE</Button>
            <Button onClick={handleRegionChange} value='euw1' color={selectedRegion === 'euw1' ? 'secondary' : 'info'} variant='contained'>EUW</Button>
            <Button onClick={handleRegionChange} value='la1' color={selectedRegion === 'la1' ? 'secondary' : 'info'} variant='contained'>LAN</Button>
            <Button onClick={handleRegionChange} value='la2' color={selectedRegion === 'la2' ? 'secondary' : 'info'} variant='contained'>LAS</Button>
            <Button onClick={handleRegionChange} value='na1' color={selectedRegion === 'na1' ? 'secondary' : 'info'} variant='contained'>NA</Button>
            <Button onClick={handleRegionChange} value='oc1' color={selectedRegion === 'oc1' ? 'secondary' : 'info'} variant='contained'>OCE</Button>
            <Button onClick={handleRegionChange} value='ru' color={selectedRegion === 'ru' ? 'secondary' : 'info'} variant='contained'>RU</Button>
            <Button onClick={handleRegionChange} value='tr1' color={selectedRegion === 'tr1' ? 'secondary' : 'info'} variant='contained'>TR</Button>
          </ButtonGroup>
        </Grid>
        <Grid xs={12} display={'flex'} justifyContent={'center'}>
          <ButtonGroup>
            <Button onClick={handleRegionChange} value='jp1' color={selectedRegion === 'jp1' ? 'secondary' : 'info'} variant='contained'>JP</Button>
            <Button onClick={handleRegionChange} value='kr' color={selectedRegion === 'kr' ? 'secondary' : 'info'} variant='contained'>KR</Button>
            <Button onClick={handleRegionChange} value='ph2' color={selectedRegion === 'ph2' ? 'secondary' : 'info'} variant='contained'>PH</Button>
            <Button onClick={handleRegionChange} value='sg2' color={selectedRegion === 'sg2' ? 'secondary' : 'info'} variant='contained'>SG</Button>
            <Button onClick={handleRegionChange} value='tw2' color={selectedRegion === 'tw2' ? 'secondary' : 'info'} variant='contained'>TW</Button>
            <Button onClick={handleRegionChange} value='th2' color={selectedRegion === 'th2' ? 'secondary' : 'info'} variant='contained'>TH</Button>
            <Button onClick={handleRegionChange} value='vn2' color={selectedRegion === 'vn2' ? 'secondary' : 'info'} variant='contained'>VN</Button>
          </ButtonGroup>
        </Grid>

        <Grid xs={12} display={'flex'} justifyContent={'center'}>
          {/* <img src=''></img> */}
          <p>{dataDragonVersion}</p>
        </Grid>

      </Grid>

    </Box>
  );
}

export default App;
