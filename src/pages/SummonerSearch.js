import '../App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, ButtonGroup, Typography, ListItem, List, Divider, Autocomplete, Select, MenuItem, LinearProgress } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Navbar from '../components/Navbar';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { sum } from 'firebase/firestore';

function SummonerSearch() {

  // const [summonerNotFound, setSummonerNotFound] = useState(false);
  const [summonerName, setSummonerName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [dataDragonVersion, setDataDragonVersion] = useState(null);
  const [recentSearches, setRecentSearches] = useState(null);
  const [recentArr, setRecentArr] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialFavHeight = 115

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
    // console.log(event.target.value)
    if (event.target.value !== 0) {
      setSummonerName(event.target.value.toLowerCase());
      //console.log(inputValue);
      console.log(summonerName)
    }
  }

  const [dropdownDefaultValue, setDropdownDefaultValue] = useState(null);
  const handleRegionChange = async (event) => {
    const value = event.target.value;
    const regionValues = {
      10: 'na1',
      20: 'euw1',
      30: 'br1',
      40: 'eun1',
      50: 'la1',
      60: 'la2',
      70: 'oc1',
      80: 'ru',
      90: 'tr1',
      100: 'jp1',
      110: 'kr',
      120: 'ph2',
      130: 'sg2',
      140: 'tw2',
      150: 'th2',
      160: 'vn2'
    }

    localStorage.setItem('searchRegion', regionValues[value])
    setSelectedRegion(regionValues[value]);
    setDropdownDefaultValue(value);
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

    // Remove trailing white space if necessary
    if (summonerNamePayload[summonerNamePayload.length - 1] === ' ') {
      summonerNamePayload = summonerNamePayload.slice(0, summonerNamePayload.length - 1)
    }

    navigate(`/profile/${selectedRegion}/${summonerNamePayload}/${riotTagPayload}`);
  }

  // Retrieve recent summoners from local storage
  const getRecentSearches = () => {
    let recentSearchStr = localStorage.getItem('recentSearches')
    if (recentSearchStr !== null) {
      let recentSearchArr = JSON.parse(recentSearchStr)
      recentSearchArr.reverse()
      setRecentSearches(recentSearchArr)

      let arr = []
      for (let i = 0; i < recentSearchArr.length; i++) {
        let temp = {
          summonerName: recentSearchArr[i].summonerName,
          selectedRegion: recentSearchArr[i].selectedRegion,
          riotId: recentSearchArr[i].riotId
        }
        arr.push(temp)
      }
      console.log(arr)
      setRecentArr(arr)
    }
  }

  // Retrieve favorite summoners from local storage
  const getFavorites = () => {
    let favoritesStr = localStorage.getItem('favorites')
    if (favoritesStr !== null) {
      let favoritesArr = JSON.parse(favoritesStr)
      setFavorites(favoritesArr)
    }
  }

  // Retrieve previous region from local storage
  const getPrevRegion = () => {

    const regionValues = {
      10: 'na1',
      20: 'euw1',
      30: 'br1',
      40: 'eun1',
      50: 'la1',
      60: 'la2',
      70: 'oc1',
      80: 'ru',
      90: 'tr1',
      100: 'jp1',
      110: 'kr',
      120: 'ph2',
      130: 'sg2',
      140: 'tw2',
      150: 'th2',
      160: 'vn2'
    }

    let prevRegion = localStorage.getItem('searchRegion')
    if (prevRegion !== null) {
      setSelectedRegion(prevRegion)
      let defaultValue = parseInt(Object.keys(regionValues).find(
        (key) => regionValues[key] === prevRegion
      )) || 10;
      setDropdownDefaultValue(defaultValue);
    } else {
      setSelectedRegion('na1')
      setDropdownDefaultValue(10);
    }
  }

  // Remove summoner from recent searches
  const handleRemoveRecent = (summonerObj) => {
    let recentStr = localStorage.getItem('recentSearches')
    if (recentStr) {
      let recentArr = JSON.parse(recentStr)
      recentArr = recentArr.filter(obj =>
        !(obj.selectedRegion === summonerObj.selectedRegion &&
          obj.summonerName === summonerObj.summonerName &&
          obj.riotId === summonerObj.riotId)
      )
      recentStr = JSON.stringify(recentArr)
      localStorage.setItem('recentSearches', recentStr)
      setRecentSearches(recentArr)
    }
  }

  // Remove summoner from favorites
  const handleRemoveFavorite = (summonerObj) => {
    let favoritesStr = localStorage.getItem('favorites')
    if (favoritesStr !== null) {
      let favsArr = JSON.parse(favoritesStr)
      favsArr = favsArr.filter(obj =>
        !(obj.selectedRegion === summonerObj.selectedRegion &&
          obj.summonerName === summonerObj.summonerName &&
          obj.riotId === summonerObj.riotId))
      favoritesStr = JSON.stringify(favsArr)
      localStorage.setItem('favorites', favoritesStr)
      setFavorites(favsArr)
    }
  }

  // Get data dragon version on initial load
  useEffect(() => {
    getDataDragonVersion();
    getRecentSearches();
    getFavorites();
    getPrevRegion();
  }, [])

  return (
    <div className='summonerSearchContainer'>

      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <Grid style={{ alignItems: 'center', display: 'flex', marginTop: '50px' }} container>

          <Grid xs={12} display={'flex'} margin={'auto'}>
            <div style={{ display: 'flex', margin: 'auto', marginLeft: 'auto', marginRight: '40%' }}>
              <img style={{ width: '174px', margin: '20px' }} alt='site logo' src='/images/sorakaLogo.webp'></img>
              <Typography style={{
                textAlign: 'center', margin: 'auto', fontSize: '32px', fontWeight: 'bold', color: 'white', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.75))'
              }}>RiftReport.gg</Typography>
            </div>
          </Grid>

          {/* <TextField onKeyDown={event => {
              if (event.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
              onChange={updateSummonerNameState}
              placeholder='Search by Riot ID (eg. Teemo#NA1)'
              style={{ width: '30%' }}
              fullWidth>
            </TextField> */}

          <Grid xs={12} display={'flex'} justifyContent={'center'}>
            <Select
              sx={{
                backgroundColor: '#519EDD',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                width: '80px',
                height: 'auto',
                border: 'none',
                filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
              }}
              value={dropdownDefaultValue}
              onChange={(event) => handleRegionChange(event)}
            >
              <MenuItem value={10}>NA</MenuItem>
              <MenuItem value={20}>EUW</MenuItem>
              <MenuItem value={30}>BR</MenuItem>
              <MenuItem value={40}>EUNE</MenuItem>
              <MenuItem value={50}>LAN</MenuItem>
              <MenuItem value={60}>LAS</MenuItem>
              <MenuItem value={70}>OCE</MenuItem>
              <MenuItem value={80}>RU</MenuItem>
              <MenuItem value={90}>TR</MenuItem>
              <MenuItem value={100}>JP</MenuItem>
              <MenuItem value={110}>KR</MenuItem>
              <MenuItem value={120}>PH</MenuItem>
              <MenuItem value={130}>SG</MenuItem>
              <MenuItem value={140}>TW</MenuItem>
              <MenuItem value={150}>TH</MenuItem>
              <MenuItem value={160}>VN</MenuItem>
            </Select>
            <Autocomplete
              options={recentArr || []}
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : `${option.summonerName} #${option.riotId}`
              }
              value={summonerName || ''}
              onInputChange={(event, newInputValue) => {
                setSummonerName(newInputValue)
              }}
              onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                  setSummonerName(newValue);
                } else if (newValue && typeof newValue === 'object') {
                  setSummonerName(newValue.summonerName + ' #' + newValue.riotId)
                }
              }}
              fullWidth
              style={{ width: '495px' }}
              freeSolo
              renderInput={(params) => (
                <TextField
                  style={{ backgroundColor: 'white', borderTopRightRadius: '5px', borderBottomRightRadius: '5px', borderTopLeftRadius: '5px', borderBottomLeftRadius: '5px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}
                  {...params}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearchSubmit();
                    }
                  }}
                  placeholder="Search by Riot ID (e.g., Teemo#NA1)"
                />
              )}
            />
            <Button onClick={handleSearchSubmit} style={{ marginLeft: '5px', height: 'auto', backgroundColor: '#519EDD', color: 'white', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }} variant='contained'>Search</Button>
          </Grid>
          {/* <Grid style={{ marginTop: '15px' }} xs={12} display={'flex'} justifyContent={'center'}>
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
          </Grid> */}

          {favorites !== null ? (
            <div style={{ justifyContent: 'center', margin: 'auto', marginTop: '16px', width: '665px', height: `${initialFavHeight + Math.ceil(favorites.length / 3) * 90}px`, backgroundColor: 'white', padding: '5px', paddingTop: '10px', marginBottom: '15px', borderRadius: '5px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
              <Typography style={{ textAlign: 'center', color: '#7E7E7E' }}>Favorites</Typography>
              <Divider color='#ABABAB' style={{ width: '30%', margin: 'auto', marginTop: '10px', marginBottom: '10px' }}></Divider>
              <List>
                <Grid style={{ justifyContent: 'center', alignItems: 'center' }} container>
                  {favorites.map((item, index) => (
                    <Grid item xs={4}>
                      <FavoriteIcon className='favoriteButtonActive' onClick={() => handleRemoveFavorite(item)} style={{ display: 'flex', marginRight: 'auto', marginLeft: '8px', marginTop: '10px', fontSize: '18px', position: 'absolute', zIndex: 1 }}></FavoriteIcon>
                      <a className='recentSearchItem' href={`/profile/${item.selectedRegion}/${item.summonerName}/${item.riotId}`}>
                        <ListItem style={{ justifyContent: 'center' }} key={index}>
                          <img style={{ borderRadius: '100%', border: '3px solid white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)', width: '65px', right: 'auto', left: '8px', position: 'absolute' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${item.icon}.png`}></img>
                          <Grid style={{ marginLeft: '60px', textAlign: 'center' }}>
                            <Grid>
                              <b style={{ fontSize: '14px' }}>{item.summonerName}</b>
                            </Grid>
                            <Grid>
                              <b style={{ fontSize: '14px' }}>#{item.riotId}</b>
                            </Grid>
                            <Grid>
                              <span style={{ fontSize: '14px' }}>Level: {item.level}</span>
                            </Grid>
                            <Grid>
                              <span style={{ fontSize: '14px' }}>{item.rank}</span>
                            </Grid>
                          </Grid>
                        </ListItem>
                      </a>
                    </Grid>
                  ))}
                </Grid>
              </List>
            </div>
          ) : (
            <div></div>
          )}

          <Grid style={{ marginTop: '5px', color: 'white', marginBottom: '135px' }} xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
            <Typography>{dataDragonVersion}</Typography>
          </Grid>

        </Grid>
      </Box>
    </div>

  );
}

export default SummonerSearch;