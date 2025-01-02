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

    if (summonerNamePayload && riotTagPayload) {
      navigate(`/profile/${selectedRegion}/${summonerNamePayload}/${riotTagPayload}`);
    }
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
          riotId: recentSearchArr[i].riotId,
          level: recentSearchArr[i].level,
          icon: recentSearchArr[i].icon,
          rank: recentSearchArr[i].rank
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

  // Retrieve previous tab pref from local storage
  const getPrevTab = () => {
    let prevTab = localStorage.getItem('prevTab')
    if (prevTab !== null) {
      setCurrentTab(prevTab)
    } else {
      setCurrentTab('recent')
    }
  }

  // Handle click favorite or recent tab
  const [currentTab, setCurrentTab] = useState('recent');
  const handleChangeTab = (tab) => {
    if (tab === 'recent' || tab === 'favorites') {
      localStorage.setItem('prevTab', tab)
      setCurrentTab(tab)
    }
  }

  // Get data dragon version on initial load
  useEffect(() => {
    getDataDragonVersion();
    getRecentSearches();
    getFavorites();
    getPrevRegion();
    getPrevTab();
  }, [])

  return (
    <div className='summonerSearchContainer'>

      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <Grid style={{ alignItems: 'center', display: 'flex', marginTop: '50px', flexDirection: 'column' }} container>

          <Grid xs={12} display={'flex'} margin={'auto'}>
            <div className='searchMainImageContainer'>
              <img className='searchMainImage' alt='site logo' src='/images/sorakaLogo.webp'></img>
              <Typography style={{
                textAlign: 'center', margin: 'auto', fontSize: '32px', fontWeight: 'bold', color: 'white', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.75))'
              }}>RiftReport.gg</Typography>
            </div>
          </Grid>

          <Grid className='searchSearchContainer' xs={12}>
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
            <Button onClick={handleSearchSubmit} className='summonerSearchButton' variant='contained'>Search</Button>
          </Grid>

          <a href='https://www.google.com/' target='__blank' style={{ backgroundColor: '#FFF1F3', color: 'inherit', textDecoration: 'inherit' }} className='searchFeaturedContainer'>
            <Grid>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'column', marginBottom: '10px' }}>
                <Typography style={{ fontWeight: 'bold', color: '#7E7E7E', textAlign: 'center', margin: 'auto' }}>Featured Game</Typography>
                <Divider color={'#7E7E7E'} style={{ width: '30%', margin: 'auto', marginTop: '10px', marginBottom: '10px' }}></Divider>
                <Typography style={{ textAlign: 'right', left: 'auto', right: '30px', color: '#7E7E7E', fontSize: '16px', whiteSpace: 'nowrap', position: 'absolute', fontWeight: 'bold' }}>NA</Typography>
              </div>

              <Grid style={{ display: 'flex' }}>
                <div style={{ marginLeft: '35px', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.8))' }}>
                  <Typography style={{
                    fontSize: '12px',
                    position: 'absolute',
                    backgroundColor: '#FF3A54',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '100%',
                    paddingLeft: '5px',
                    paddingRight: '5px',
                    paddingTop: '1px',
                    paddingBottom: '1px',
                    textAlign: 'center',
                    right: 'auto',
                    bottom: 'auto',
                    top: '-2px',
                    left: '76px',
                    justifyContent: 'center'
                  }}
                  >{17}
                  </Typography>
                  <img style={{ borderRadius: '100%', width: '102px', backgroundColor: '#FF3F3F', padding: '4px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/AurelionSol.png`}></img>
                </div>
                <div style={{ marginLeft: '25px', marginRight: '20px', marginTop: '5px' }}>
                  <Typography style={{ fontWeight: 'bold', fontSize: '18px' }}>Deeto #NA1</Typography>
                  <Typography style={{ color: '#7E7E7E' }}>Aurelion Sol</Typography>
                </div>
                <div style={{ marginRight: '20px', marginTop: '25px' }}>
                  <Box marginTop={'3px'} marginBottom={'3px'} alignSelf={'center'} width={'10px'} height={'10px'} borderRadius={'100%'} backgroundColor={'#DDDDDD'}></Box>
                </div>
                <div style={{ marginRight: '20px', marginTop: '5px' }}>
                  <Typography style={{ fontWeight: 'bold', fontSize: '16px' }}>Ranked Solo</Typography>
                  <Typography style={{ color: '#7E7E7E' }}>1 hour ago</Typography>
                </div>
                <div style={{ marginRight: '20px', marginTop: '25px' }}>
                  <Box marginTop={'3px'} marginBottom={'3px'} alignSelf={'center'} width={'10px'} height={'10px'} borderRadius={'100%'} backgroundColor={'#DDDDDD'}></Box>
                </div>
                <div style={{ marginRight: '20px', marginTop: '5px' }}>
                  <Typography style={{ fontWeight: 'bold', fontSize: '16px' }}>Tier</Typography>
                  <Typography style={{ color: '#7E7E7E' }}>Gold 3</Typography>
                </div>
              </Grid>
              <div style={{ display: 'flex', marginLeft: '170px', position: 'absolute', top: 'auto', bottom: '45px' }}>
                <Grid>
                  <span style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                    <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Yone.png`}></img>
                    <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', backgroundColor: '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </span>
                  <span style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                    <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Akshan.png`}></img>
                    <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', left: '0px', backgroundColor: '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </span>
                  <span style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                    <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Jhin.png`}></img>
                    <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', left: '0px', backgroundColor: '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </span>
                  <span style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                    <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Galio.png`}></img>
                    <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', left: '0px', backgroundColor: '#FF3F3F', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </span>
                </Grid>
                <img style={{ width: '27px', opacity: '0.65', marginLeft: '25px', marginRight: '25px' }} src='/images/swords.svg'></img>
                <Grid>
                  <span style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                    <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Heimerdinger.png`}></img>
                    <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', backgroundColor: '#37B7FF', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </span>
                  <span style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                    <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Ivern.png`}></img>
                    <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', left: '0px', backgroundColor: '#37B7FF', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </span>
                  <span style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                    <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Kayle.png`}></img>
                    <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', left: '0px', backgroundColor: '#37B7FF', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </span>
                  <span style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                    <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Kassadin.png`}></img>
                    <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', left: '0px', backgroundColor: '#37B7FF', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </span>
                  <span style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                    <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Singed.png`}></img>
                    <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', left: '0px', backgroundColor: '#37B7FF', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                  </span>
                </Grid>
              </div>

            </Grid>
          </a>

          {favorites !== null && currentTab === 'favorites' ? (
            <div className='searchFavoritesContainer' style={{ height: `auto` }}>
              <Grid style={{ display: 'flex', margin: 'auto', justifyContent: 'center' }}>
                <span onClick={() => handleChangeTab('favorites')} style={{ marginRight: '50px' }}>
                  <Typography style={{ textAlign: 'center', fontWeight: 'bold', cursor: 'pointer', color: currentTab === 'favorites' ? 'black' : '#999999' }}>Favorites</Typography>
                  <Divider color={currentTab === 'favorites' ? 'black' : '#999999'} style={{ width: '100%', margin: 'auto', marginTop: '10px', marginBottom: '10px' }}></Divider>
                </span>
                <span onClick={() => handleChangeTab('recent')} style={{ marginLeft: '50px' }}>
                  <Typography style={{ textAlign: 'center', fontWeight: 'bold', cursor: 'pointer', color: currentTab === 'recent' ? 'black' : '#999999' }}>Recent</Typography>
                  <Divider color={currentTab === 'recent' ? 'black' : '#999999'} style={{ width: '100%', margin: 'auto', marginTop: '10px', marginBottom: '10px' }}></Divider>
                </span>
              </Grid>

              <List>
                <Grid style={{ justifyContent: 'center', alignItems: 'center' }} container>
                  {favorites.map((item, index) => (
                    <Grid item xs={12} sm={4}>
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

          {recentArr !== null && currentTab === 'recent' ? (
            <div className='searchRecentContainer' style={{ height: `auto` }}>
              <Grid style={{ display: 'flex', margin: 'auto', justifyContent: 'center' }}>
                <span onClick={() => handleChangeTab('favorites')} style={{ marginRight: '50px' }}>
                  <Typography style={{ textAlign: 'center', fontWeight: 'bold', cursor: 'pointer', color: currentTab === 'favorites' ? 'black' : '#999999' }}>Favorites</Typography>
                  <Divider color={currentTab === 'favorites' ? 'black' : '#999999'} style={{ width: '100%', margin: 'auto', marginTop: '10px', marginBottom: '10px' }}></Divider>
                </span>
                <span onClick={() => handleChangeTab('recent')} style={{ marginLeft: '50px' }}>
                  <Typography style={{ textAlign: 'center', fontWeight: 'bold', cursor: 'pointer', color: currentTab === 'recent' ? 'black' : '#999999' }}>Recent</Typography>
                  <Divider color={currentTab === 'recent' ? 'black' : '#999999'} style={{ width: '100%', margin: 'auto', marginTop: '10px', marginBottom: '10px' }}></Divider>
                </span>
              </Grid>
              <List>
                <Grid style={{ justifyContent: 'center', alignItems: 'center' }} container>
                  {recentArr.map((item, index) => (
                    <Grid item xs={12} sm={4}>
                      <FavoriteIcon className='favoriteButtonActive' style={{ display: 'flex', marginRight: 'auto', marginLeft: '8px', marginTop: '10px', fontSize: '18px', position: 'absolute', zIndex: 1 }}></FavoriteIcon>
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

          <Grid xs={12} className='dataDragonVersionContainer'>
            <Typography>{dataDragonVersion}</Typography>
          </Grid>

        </Grid>
      </Box>
    </div>

  );
}

export default SummonerSearch;