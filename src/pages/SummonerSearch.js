import '../App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, ButtonGroup, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function SummonerSearch() {

  // const [summonerNotFound, setSummonerNotFound] = useState(false);
  const [summonerName, setSummonerName] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('na1');
  const [dataDragonVersion, setDataDragonVersion] = useState(null);

  // Init navigate
  const navigate = useNavigate();

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
    setSummonerName(inputValue.toLowerCase());
    //console.log(inputValue);
  }

  const handleRegionChange = async (event) => {
    const value = event.target.value;
    setSelectedRegion(value);
    //console.log(value)
  }

  const handleSearchSubmit = async () => {
    // Extract riot tag from summoner name
    let summonerNamePayload = null;
    let riotTagPayload = null;

    // If last character is #
    if (summonerName[summonerName.length - 1] === "#") {
      summonerNamePayload = summonerName.split("#")[0];
      riotTagPayload = selectedRegion;
      // Change tag to #OCE for oc1
      if (riotTagPayload === 'oc1') {
        riotTagPayload = 'oce';
      }
    }

    // Else if contains # but not last character (contains riot tag)
    else if (summonerName.includes("#")) {
      summonerNamePayload = summonerName.split("#")[0];
      riotTagPayload = summonerName.split("#")[1];
      console.log(summonerNamePayload, riotTagPayload)
      if (riotTagPayload === undefined || riotTagPayload === null) {
      }
    }

    // If no # riot tag is provided
    else {
      summonerNamePayload = summonerName;
      riotTagPayload = selectedRegion;
      // Change tag to #OCE for oc1
      if (riotTagPayload === 'oc1') {
        riotTagPayload = 'oce';
      }
    }

    navigate(`/profile/${selectedRegion}/${summonerNamePayload}/${riotTagPayload}`);
  }

  // Get data dragon version on initial load
  useEffect(() => {
    getDataDragonVersion();
  }, [])

  return (
    <div>
      <Navbar></Navbar>

      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <Grid style={{ alignItems: 'center', display: 'flex', marginTop: '70px' }} container>

          <Typography style={{ textAlign: 'center', margin: 'auto', fontSize: '32px', fontWeight: 'bold' }}>RiftReport.gg</Typography>

          <Grid xs={12} display={'flex'} justifyContent={'center'}>
            <img style={{ width: '150px', margin: '20px' }} alt='site logo' src='/images/aurelionLogo.webp'></img>
          </Grid>

          <Grid xs={12} display={'flex'} justifyContent={'center'}>
            <TextField onKeyDown={event => {
              if (event.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
              onChange={updateSummonerNameState}
              placeholder='Search by Riot ID (eg. Teemo#NA1)'
              style={{ width: '30%' }}
              fullWidth>
            </TextField>
            <Button onClick={handleSearchSubmit} style={{ marginLeft: '5px' }} variant='contained'>Search</Button>
          </Grid>
          <Grid style={{ marginTop: '15px' }} xs={12} display={'flex'} justifyContent={'center'}>
            <ButtonGroup>
              <Button onClick={handleRegionChange} value='br1' style={{ backgroundColor: selectedRegion === 'br1' ? '#1b5f98' : '#4d9de0' }} variant='contained'>BR</Button>
              <Button onClick={handleRegionChange} value='eun1' style={{ backgroundColor: selectedRegion === 'eun1' ? '#1b5f98' : '#4d9de0' }} variant='contained'>EUNE</Button>
              <Button onClick={handleRegionChange} value='euw1' style={{ backgroundColor: selectedRegion === 'euw1' ? '#1b5f98' : '#4d9de0' }} variant='contained'>EUW</Button>
              <Button onClick={handleRegionChange} value='la1' style={{ backgroundColor: selectedRegion === 'la1' ? '#1b5f98' : '#4d9de0' }} variant='contained'>LAN</Button>
              <Button onClick={handleRegionChange} value='la2' style={{ backgroundColor: selectedRegion === 'la2' ? '#1b5f98' : '#4d9de0' }} variant='contained'>LAS</Button>
              <Button onClick={handleRegionChange} value='na1' style={{ backgroundColor: selectedRegion === 'na1' ? '#1b5f98' : '#4d9de0' }} variant='contained'>NA</Button>
              <Button onClick={handleRegionChange} value='oc1' style={{ backgroundColor: selectedRegion === 'oc1' ? '#1b5f98' : '#4d9de0' }} variant='contained'>OCE</Button>
              <Button onClick={handleRegionChange} value='ru' style={{ backgroundColor: selectedRegion === 'ru' ? '#1b5f98' : '#4d9de0' }} variant='contained'>RU</Button>
              <Button onClick={handleRegionChange} value='tr1' style={{ backgroundColor: selectedRegion === 'tr1' ? '#1b5f98' : '#4d9de0' }} variant='contained'>TR</Button>
            </ButtonGroup>
          </Grid>
          <Grid xs={12} display={'flex'} justifyContent={'center'}>
            <ButtonGroup>
              <Button onClick={handleRegionChange} value='jp1' style={{ backgroundColor: selectedRegion === 'jp1' ? '#1b5f98' : '#4d9de0' }} variant='contained'>JP</Button>
              <Button onClick={handleRegionChange} value='kr' style={{ backgroundColor: selectedRegion === 'kr' ? '#1b5f98' : '#4d9de0' }} variant='contained'>KR</Button>
              <Button onClick={handleRegionChange} value='ph2' style={{ backgroundColor: selectedRegion === 'ph2' ? '#1b5f98' : '#4d9de0' }} variant='contained'>PH</Button>
              <Button onClick={handleRegionChange} value='sg2' style={{ backgroundColor: selectedRegion === 'sg2' ? '#1b5f98' : '#4d9de0' }} variant='contained'>SG</Button>
              <Button onClick={handleRegionChange} value='tw2' style={{ backgroundColor: selectedRegion === 'tw2' ? '#1b5f98' : '#4d9de0' }} variant='contained'>TW</Button>
              <Button onClick={handleRegionChange} value='th2' style={{ backgroundColor: selectedRegion === 'th2' ? '#1b5f98' : '#4d9de0' }} variant='contained'>TH</Button>
              <Button onClick={handleRegionChange} value='vn2' style={{ backgroundColor: selectedRegion === 'vn2' ? '#1b5f98' : '#4d9de0' }} variant='contained'>VN</Button>
            </ButtonGroup>
          </Grid>

          <Grid style={{ marginTop: '10px' }} xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
            <Typography>{dataDragonVersion}</Typography>
          </Grid>

        </Grid>
      </Box>
    </div>

  );
}

export default SummonerSearch;