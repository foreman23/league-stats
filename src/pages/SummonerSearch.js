import '../App.css';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, ListItem, List, Divider, Autocomplete, Select, MenuItem } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import DisplayGame from '../components/DisplayGame';
import SearchIcon from '@mui/icons-material/Search';


function SummonerSearch() {

  // const [summonerNotFound, setSummonerNotFound] = useState(false);
  const [summonerName, setSummonerName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [dataDragonVersion, setDataDragonVersion] = useState(null);
  const [recentArr, setRecentArr] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [champsJSON, setChampsJSON] = useState(null);

  // Init navigate
  const navigate = useNavigate();

  // Set the current ddragon version
  const getDataDragonVersion = useCallback(async () => {
    axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
      .then(function (response) {
        const currentVersion = response.data[0];
        setDataDragonVersion(currentVersion);
        getChampsJSON(currentVersion);
      })
      .catch(function (response) {
        // console.error('Error: Error fetching datadragon version')
      })
  }, [])

  const [dropdownDefaultValue, setDropdownDefaultValue] = useState('');
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
      setRecentArr(recentSearchArr)

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
    if (recentStr !== null) {
      let recentArr = JSON.parse(recentStr)
      recentArr = recentArr.filter(obj =>
        !(obj.selectedRegion === summonerObj.selectedRegion &&
          obj.summonerName === summonerObj.summonerName &&
          obj.riotId === summonerObj.riotId)
      )
      recentStr = JSON.stringify(recentArr)
      localStorage.setItem('recentSearches', recentStr)
      setRecentArr(recentArr)
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

  // Handle clicking of autocomplete element
  const handleAutoCompleteSelect = (newValue) => {
    if (newValue && typeof newValue === 'object') {
      navigate(`/profile/${newValue.selectedRegion}/${newValue.summonerName}/${newValue.riotId}`);
    }
  };

  // Get champion JSON data from riot
  const getChampsJSON = async (currentVersion) => {
    try {
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/en_US/champion.json`);
      const data = await response.json();
      setChampsJSON(data);
    } catch (error) {
      // console.error('Error fetching champion JSON data');
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

  // Retrieve featured game
  const [featuredData, setFeaturedData] = useState(null);
  const getFeaturedGame = async () => {
    const featuredResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/featuredgame`);
    const featuredGame = featuredResponse.data;
    setFeaturedData(featuredGame);
  }

  // Get data dragon version on initial load
  useEffect(() => {
    getDataDragonVersion();
    getRecentSearches();
    getFavorites();
    getPrevRegion();
    getPrevTab();
    getFeaturedGame();
  }, [getDataDragonVersion])

  return (
    <div className='summonerSearchBody'>

      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <Grid style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }} container>

          <div className='firstSection'>
            <Grid xs={12} display={'flex'} margin={'auto'}>
              <div className='searchMainImageContainer'>

                <div style={{ alignItems: 'center', display: 'flex' }}>
                  <a href='/'>
                    <img className='searchMainImage' alt='site logo' src='/images/spiritMage.webp'></img>
                  </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '20px' }}>
                  <Typography id='RiftReportTitle' className='hideMobile' >riftreport.gg
                  </Typography>
                  <Typography id='RiftReportSubTitle' className='hideMobile'>LoL Match Analysis</Typography>
                </div>

                <div className='hideMobile hideKindle' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '55px', marginRight: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img alt='Champion' style={{ border: '3px solid #FF3F3F' }} className='RiftReportChamp' src={`/images/Shadow_Isles_Poro_profileicon.webp`}></img>
                    <Box height={'16px'} width={'16px'} style={{ backgroundColor: '#FF3F3F', borderRadius: '100%', marginRight: '3px' }}></Box>
                    <Box height={'16px'} width={'16px'} style={{ backgroundColor: '#FF3F3F', borderRadius: '100%', marginRight: '3px' }}></Box>
                    <Box height={'16px'} width={'16px'} style={{ backgroundColor: '#FF3F3F', borderRadius: '100%', marginRight: '3px' }}></Box>
                    <Box height={'16px'} width={'16px'} style={{ backgroundColor: '#FF3F3F', borderRadius: '100%', marginRight: '3px' }}></Box>
                    <Box height={'16px'} width={'16px'} style={{ backgroundColor: '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '6px' }}>
                    <img alt='Champion' style={{ border: '3px solid #3173FF' }} className='RiftReportChamp' src={`/images/Bedge_Poro_profileicon.webp`}></img>
                    <Box height={'16px'} width={'16px'} style={{ backgroundColor: '#3173FF', borderRadius: '100%', marginRight: '3px' }}></Box>
                    <Box height={'16px'} width={'16px'} style={{ backgroundColor: '#3173FF', borderRadius: '100%', marginRight: '3px' }}></Box>
                    <Box height={'16px'} width={'16px'} style={{ backgroundColor: '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                    <Box height={'16px'} width={'16px'} style={{ backgroundColor: '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                    <Box height={'16px'} width={'16px'} style={{ backgroundColor: '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                  </div>
                </div>

                <Typography className='hideDesktop' style={{
                  textAlign: 'center', margin: 'auto', fontSize: '2rem', fontWeight: 'bold', color: 'white', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.75))'
                }}>RR.gg
                </Typography>
              </div>
            </Grid>

          </div>


          <Grid className='searchSearchContainer' xs={12}>
            <Select
              sx={{
                background: 'linear-gradient(135deg, #3A5A9B, #5678B9)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                width: '80px',
                height: 'auto',
                border: 'none',
                filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
                borderTopRightRadius: '0px',
                borderBottomRightRadius: '0px'
              }}
              value={dropdownDefaultValue}
              onChange={(event) => handleRegionChange(event)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: '50vh'
                  }
                }
              }}
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
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderTopLeftRadius: '0px',
                  borderBottomLeftRadius: '0px',
                  borderRadius: '0px'
                },
              }}
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
                  handleAutoCompleteSelect(newValue)
                }
              }}
              fullWidth
              freeSolo
              renderInput={(params) => (
                <TextField
                  style={{ backgroundColor: 'white', filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}
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
            <Button onClick={handleSearchSubmit} className='summonerSearchButton' variant='contained'><SearchIcon></SearchIcon></Button>
          </Grid>

          <div className="searchFeaturedContainer">
            {featuredData !== null && champsJSON !== null &&
              (() => {
                let gameData = featuredData.featuredGameData.matchData
                let playerData = featuredData.featuredPlayer
                let selectedRegion = gameData.info.platformId.toLowerCase()
                let alternateRegion = null;
                // set alternate routing value
                const americasServers = ['na1', 'br1', 'la1', 'la2'];
                const asiaServers = ['kr', 'jp1', 'oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'];
                const europeServer = ['eun1', 'euw1', 'tr1', 'ru'];

                if (americasServers.includes(selectedRegion) && alternateRegion === null) {
                  alternateRegion = 'americas'
                }
                if (asiaServers.includes(selectedRegion) && alternateRegion === null) {
                  alternateRegion = 'asia'
                }
                if (europeServer.includes(selectedRegion) && alternateRegion === null) {
                  alternateRegion = 'europe'
                }

                let gameModeHref;
                if ((gameData.info.gameMode === "CLASSIC" || gameData.info.gameMode === "SWIFTPLAY") && gameData.info.gameDuration > 300) {
                  gameModeHref = `/match/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`;
                } else if (gameData.info.gameMode === "CLASSIC" && gameData.info.gameDuration < 300) {
                  gameModeHref = `/altmatch/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`;
                } else if (gameData.info.gameMode === "ARAM") {
                  gameModeHref = `/aram/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`;
                } else if (gameData.info.gameMode === "URF") {
                  gameModeHref = `/altmatch/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`;
                } else if (gameData.info.gameMode === "CHERRY") {
                  gameModeHref = "/Test";
                } else {
                  gameModeHref = "/Test";
                }

                const gameDataPayload = {
                  gameData,
                  alternateRegion,
                  dataDragonVersion,
                };

                return (
                  <a
                    style={{ textDecoration: "inherit", color: "inherit" }}
                    onMouseDown={(e) => {
                      if (e.button === 0 || e.button === 1) {
                        localStorage.setItem("gameData", JSON.stringify(gameDataPayload));
                      }
                    }}
                    href={gameModeHref}
                  >
                    <DisplayGame
                      featured
                      gameData={gameData}
                      dataDragonVersion={dataDragonVersion}
                      puuid={playerData.puuid}
                    />
                  </a>
                );
              })()}
          </div>

          {/* </div> */}

          {/* <div className='searchFavoritesContainer' style={{ height: `auto` }}>
            <iframe src='https://www.leagueoflegends.com/en-us/news/game-updates/patch-2025-s1-3-notes/'></iframe>
          </div> */}

          <div className='searchFavoritesContainer' style={{ 
            height: 'auto',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            padding: '24px',
            marginTop: '24px',
            marginBottom: '24px',
            maxWidth: '1200px',
            margin: '24px auto'
          }}>
            <Grid container style={{ display: 'flex', margin: 'auto', justifyContent: 'center', marginBottom: '24px' }}>
              <span 
                onClick={() => handleChangeTab('favorites')} 
                style={{ 
                  marginRight: '24px',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  backgroundColor: currentTab === 'favorites' ? '#f0f2f5' : 'transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <Typography style={{ 
                  textAlign: 'center', 
                  fontWeight: currentTab === 'favorites' ? '600' : '500', 
                  fontSize: '16px',
                  color: currentTab === 'favorites' ? '#1a1a1a' : '#666666',
                  transition: 'color 0.2s ease'
                }}>Favorites</Typography>
              </span>
              <span 
                onClick={() => handleChangeTab('recent')} 
                style={{ 
                  marginLeft: '24px',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  backgroundColor: currentTab === 'recent' ? '#f0f2f5' : 'transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <Typography style={{ 
                  textAlign: 'center', 
                  fontWeight: currentTab === 'recent' ? '600' : '500', 
                  fontSize: '16px',
                  color: currentTab === 'recent' ? '#1a1a1a' : '#666666',
                  transition: 'color 0.2s ease'
                }}>Recent</Typography>
              </span>
            </Grid>

            {currentTab === 'favorites' ? (
              <List style={{ padding: 0 }}>
                {((favorites?.length <= 0) || (favorites === null)) &&
                  <Typography style={{ 
                    textAlign: 'center', 
                    color: '#999999', 
                    fontSize: '14px',
                    marginTop: '32px',
                    marginBottom: '32px' 
                  }}>Favorites will appear here...</Typography>
                }
                <Grid style={{ justifyContent: 'center', alignItems: 'center', marginLeft: '5px' }} container>
                  {Array.from({ length: favorites !== null ? (favorites?.length <= 9 ? 9 : favorites?.length) : 9 }, (_, index) => (
                    favorites?.length > index ? (
                      <Grid style={{ 
                        position: 'relative',
                        padding: '8px'
                      }} key={`favorite_${index}`} xs={12} sm={6} md={4}>
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px',
                          padding: '16px',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          border: '1px solid transparent',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}>
                          <FavoriteIcon 
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              fontSize: '20px',
                              color: '#ff4757',
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease',
                              zIndex: 2
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveFavorite(favorites[index]);
                            }}
                          />
                          <a 
                            className='recentSearchItem' 
                            href={`/profile/${favorites[index].selectedRegion}/${favorites[index].summonerName}/${favorites[index].riotId}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <ListItem style={{ 
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }} key={index}>
                              <img 
                                alt='Summoner Icon' 
                                style={{ 
                                  borderRadius: '50%', 
                                  width: '52px',
                                  height: '52px',
                                  marginRight: '12px',
                                  flexShrink: 0
                                }} 
                                src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${favorites[index].icon}.png`}
                              />
                              <div style={{
                                flex: 1,
                                minWidth: 0
                              }}>
                                <div style={{ marginBottom: '4px' }}>
                                  <span style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '600',
                                    color: '#1a1a1a',
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>{favorites[index].summonerName}</span>
                                  <span style={{ 
                                    fontSize: '12px',
                                    color: '#666666',
                                    fontWeight: '400'
                                  }}>#{favorites[index].riotId}</span>
                                </div>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: '12px',
                                  fontSize: '12px',
                                  color: '#999999'
                                }}>
                                  <span>Level {favorites[index].level}</span>
                                  <span style={{
                                    color: favorites[index].rank ? '#3A5A9B' : '#999999',
                                    fontWeight: favorites[index].rank ? '500' : '400'
                                  }}>
                                    {favorites[index].rank !== null ? 
                                      favorites[index].rank.charAt(0) + favorites[index].rank.split(' ')[0].substring(1).toLowerCase() + ' ' + favorites[index].rank.split(' ')[1]
                                    : 'Unranked'}
                                  </span>
                                </div>
                              </div>
                            </ListItem>
                          </a>
                        </div>
                      </Grid>
                    ) : (
                      <Grid style={{ 
                        position: 'relative',
                        padding: '8px'
                      }} key={index} xs={12} sm={6} md={4}>
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '1px solid #e0e0e0',
                          opacity: 0.5
                        }}>
                          <ListItem style={{ 
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <img 
                              alt='Summoner Icon' 
                              style={{ 
                                borderRadius: '50%', 
                                width: '52px',
                                height: '52px',
                                marginRight: '12px',
                                flexShrink: 0,
                                opacity: 0.3
                              }} 
                              src={`/images/novalue.webp`}
                            />
                            <div style={{
                              flex: 1,
                              minWidth: 0
                            }}>
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ 
                                  fontSize: '16px', 
                                  fontWeight: '600',
                                  color: '#cccccc',
                                  display: 'block'
                                }}>Empty Slot</span>
                              </div>
                              <div style={{ 
                                fontSize: '13px',
                                color: '#cccccc'
                              }}>
                                <span>Add to favorites</span>
                              </div>
                            </div>
                          </ListItem>
                        </div>
                      </Grid>
                    )
                  ))}
                </Grid>
              </List>

            ) : (
              <div></div>
            )}

            {currentTab === 'recent' ? (
              <List style={{ padding: 0 }}>
                {((recentArr?.length <= 0) || (recentArr === null)) &&
                  <Typography style={{ 
                    textAlign: 'center', 
                    color: '#999999', 
                    fontSize: '14px',
                    marginTop: '32px',
                    marginBottom: '32px' 
                  }}>Recent searches will appear here...</Typography>
                }
                <Grid style={{ justifyContent: 'center', alignItems: 'center', marginLeft: '5px' }} container>
                  {Array.from({ length: recentArr !== null ? (recentArr?.length <= 9 ? 9 : recentArr?.length) : 9 }, (_, index) => (
                    recentArr?.length > index ? (
                      <Grid style={{ 
                        position: 'relative',
                        padding: '8px'
                      }} key={`recent_${index}`} xs={12} sm={6} md={4}>
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px',
                          padding: '16px',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          border: '1px solid transparent',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}>
                          <CloseIcon 
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              fontSize: '20px',
                              color: '#999999',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              zIndex: 2
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.2)';
                              e.currentTarget.style.color = '#666666';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.color = '#999999';
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveRecent(recentArr[index]);
                            }}
                          />
                          <a 
                            className='recentSearchItem' 
                            href={`/profile/${recentArr[index].selectedRegion}/${recentArr[index].summonerName}/${recentArr[index].riotId}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <ListItem style={{ 
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }} key={index}>
                              <img 
                                alt='Summoner Icon' 
                                style={{ 
                                  borderRadius: '50%', 
                                  width: '52px',
                                  height: '52px',
                                  marginRight: '12px',
                                  flexShrink: 0
                                }} 
                                src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${recentArr[index].icon}.png`}
                              />
                              <div style={{
                                flex: 1,
                                minWidth: 0
                              }}>
                                <div style={{ marginBottom: '4px' }}>
                                  <span style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '600',
                                    color: '#1a1a1a',
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>{recentArr[index].summonerName}</span>
                                  <span style={{ 
                                    fontSize: '12px',
                                    color: '#666666',
                                    fontWeight: '400'
                                  }}>#{recentArr[index].riotId}</span>
                                </div>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: '12px',
                                  fontSize: '12px',
                                  color: '#999999'
                                }}>
                                  <span>Level {recentArr[index].level}</span>
                                  <span style={{
                                    color: recentArr[index].rank ? '#3A5A9B' : '#999999',
                                    fontWeight: recentArr[index].rank ? '500' : '400'
                                  }}>
                                    {recentArr[index].rank !== null ? 
                                      recentArr[index].rank.charAt(0) + recentArr[index].rank.split(' ')[0].substring(1).toLowerCase() + ' ' + recentArr[index].rank.split(' ')[1]
                                    : 'Unranked'}
                                  </span>
                                </div>
                              </div>
                            </ListItem>
                          </a>
                        </div>
                      </Grid>
                    ) : (
                      <Grid style={{ 
                        position: 'relative',
                        padding: '8px'
                      }} key={`recent_${index}`} xs={12} sm={6} md={4}>
                        <div style={{
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '1px solid #e0e0e0',
                          opacity: 0.5
                        }}>
                          <ListItem style={{ 
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <img 
                              alt='Summoner Icon' 
                              style={{ 
                                borderRadius: '50%', 
                                width: '52px',
                                height: '52px',
                                marginRight: '12px',
                                flexShrink: 0,
                                opacity: 0.3
                              }} 
                              src={`/images/novalue.webp`}
                            />
                            <div style={{
                              flex: 1,
                              minWidth: 0
                            }}>
                              <div style={{ marginBottom: '4px' }}>
                                <span style={{ 
                                  fontSize: '16px', 
                                  fontWeight: '600',
                                  color: '#cccccc',
                                  display: 'block'
                                }}>Empty Slot</span>
                              </div>
                              <div style={{ 
                                fontSize: '13px',
                                color: '#cccccc'
                              }}>
                                <span>Search for summoners</span>
                              </div>
                            </div>
                          </ListItem>
                        </div>
                      </Grid>
                    )
                  ))}
                </Grid>
              </List>
            ) : (
              <div></div>
            )}
          </div>

          <Grid xs={12} className='dataDragonVersionContainer'>
            <Typography>{dataDragonVersion}</Typography>
          </Grid>

        </Grid>
      </Box>

    </div>
  );
}

export default SummonerSearch;