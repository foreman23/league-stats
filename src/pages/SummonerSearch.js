import '../App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, ButtonGroup, Typography, Divider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { firestore } from '../FirebaseConfig';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc, setDoc } from "firebase/firestore";

function SummonerSearch() {

  // const [summonerNotFound, setSummonerNotFound] = useState(false);
  const [summonerName, setSummonerName] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('na1');
  const [riotTag, setRiotTag] = useState(null);
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
    if (summonerName[summonerName.length - 1] == "#") {
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

    navigate(`/${selectedRegion}/${summonerNamePayload}/${riotTagPayload}`);
  }

  // Get data dragon version on initial load
  useEffect(() => {
    getDataDragonVersion();
  }, [])

  return (
    <div>
      <Navbar></Navbar>

      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <Grid style={{ alignItems: 'center', display: 'flex', marginTop: '125px' }} container>

          <Grid xs={12} display={'flex'} justifyContent={'center'}>
            <img style={{ width: '10%', margin: '20px' }} src='../logo512.png'></img>
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

          <Grid style={{ marginTop: '10px' }} xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
            <Typography>{dataDragonVersion}</Typography>
          </Grid>

          {/* <Grid xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
            <Divider style={{ width: '30%' }}></Divider>
            <Typography style={{ width: '50%', fontSize: '12px', lineHeight: '16px', color: '#9AA4AF' }}>[Your Product Name] is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc</Typography>
          </Grid> */}

        </Grid>

      </Box>

      {/* <Footer></Footer> */}

    </div>

  );
}

export default SummonerSearch;