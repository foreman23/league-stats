import '../App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, ButtonGroup, Typography, ListItem, List, Divider, Autocomplete, Select, MenuItem, LinearProgress, Tooltip } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Navbar from '../components/Navbar';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import { sum } from 'firebase/firestore';
import DisplayGame from '../components/DisplayGame';
import { ClassNames } from '@emotion/react';

function SummonerSearch() {

  // const [summonerNotFound, setSummonerNotFound] = useState(false);
  const [summonerName, setSummonerName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [dataDragonVersion, setDataDragonVersion] = useState(null);
  const [recentArr, setRecentArr] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [champsJSON, setChampsJSON] = useState(null);
  const [queues, setQueues] = useState(null);
  const [queueTitle, setQueueTitle] = useState(null);
  const [timeSinceMatch, setTimeSinceMatch] = useState(null);
  const [rankedTierMatch, setRankedTierMatch] = useState(null);

  const [recentOpen, setRecentOpen] = useState(false);

  const initialFavHeight = 115

  // Init navigate
  const navigate = useNavigate();

  // Set the current ddragon version
  const getDataDragonVersion = async () => {
    axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
      .then(function (response) {
        const currentVersion = response.data[0];
        setDataDragonVersion(currentVersion);
        getChampsJSON(currentVersion);
      })
      .catch(function (response) {
        console.log('Error: Error fetching datadragon version')
      })
  }

  const updateSummonerNameState = async (event) => {
    if (event.target.value !== 0) {
      setSummonerName(event.target.value.toLowerCase());
    }
  }

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
      console.error('Error fetching champion JSON data:', error);
    }
  }

  // Get queue JSON data from riot
  const getQueueJSON = async (featuredMatch) => {
    try {
      const response = await fetch('https://static.developer.riotgames.com/docs/lol/queues.json');
      const data = await response.json();
      findQueueTitle(data, featuredMatch)
    } catch (error) {
      console.error('Error fetching queue data:', error);
    }
  }

  // Search JSON for relevant Queue data
  const findQueueTitle = async (queues, featuredMatch) => {

    let queue = await findQueueInfo(queues, featuredMatch);

    // Set queue title
    let tempQueueTitle = queue?.description;
    if (tempQueueTitle === undefined) {
      setQueueTitle('Swiftplay')
    }
    if (tempQueueTitle === '5v5 Ranked Solo games') {
      setQueueTitle('Ranked Solo');
    }
    if (tempQueueTitle === '5v5 Ranked Flex games') {
      setQueueTitle('Ranked Flex');
    }
    if (tempQueueTitle === '5v5 Draft Pick games') {
      setQueueTitle('Normal');
    }
    else if (tempQueueTitle === "Summoner's Rift Clash games") {
      setQueueTitle('SR Clash')
    }
    else if (tempQueueTitle === '5v5 ARAM games') {
      setQueueTitle('ARAM')
    }
    else if (tempQueueTitle === 'ARAM Clash games') {
      setQueueTitle('ARAM Clash')
    }
    else if (tempQueueTitle === 'Arena') {
      setQueueTitle('Arena')
    }

    // Set time since match was played
    const timeMatchStarted = new Date(featuredMatch.featuredGameData.matchData.info.gameEndTimestamp);
    const now = new Date();
    const timeDifferenceInSeconds = Math.floor((now - timeMatchStarted) / 1000);

    if (timeDifferenceInSeconds < 60) {
      // Less than a minute
      setTimeSinceMatch(`${timeDifferenceInSeconds} seconds ago`);
    } else if (timeDifferenceInSeconds < 3600) {
      // Less than an hour
      const minutes = Math.floor(timeDifferenceInSeconds / 60);
      setTimeSinceMatch(`${minutes} minute${minutes !== 1 ? 's' : ''} ago`);
    } else if (timeDifferenceInSeconds < 86400) {
      // Less than a day
      const hours = Math.floor(timeDifferenceInSeconds / 3600);
      setTimeSinceMatch(`${hours} hour${hours !== 1 ? 's' : ''} ago`);
    } else {
      // More than a day
      const days = Math.floor(timeDifferenceInSeconds / 86400);
      setTimeSinceMatch(`${days} day${days !== 1 ? 's' : ''} ago`);
    }
  }

  const findQueueInfo = async (queues, featuredMatch) => {
    const queue = queues.find(queue => queue.queueId === featuredMatch.featuredGameData.matchData.info.queueId);
    return queue;
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
    getQueueJSON(featuredGame);
  }

  // Get data dragon version on initial load
  useEffect(() => {
    getDataDragonVersion();
    getRecentSearches();
    getFavorites();
    getPrevRegion();
    getPrevTab();
    getFeaturedGame();
  }, [])

  return (
    <div className='summonerSearchBody'>

      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <Grid style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }} container>

          {/* <div className='summonerSearchContainer'> */}


          <Grid xs={12} display={'flex'} margin={'auto'}>
            <div className='searchMainImageContainer'>
              <a href='/'>
                <img className='searchMainImage' alt='site logo' src='/images/sorakaLogo.webp'></img>
              </a>
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
                        setTimeout(() => {
                          setRecentOpen(true);
                          setTimeout(() => {
                            setRecentOpen(false);
                          }, 200);
                        }, 200);
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

          <div className='searchFavoritesContainer' style={{ height: `auto` }}>
            <Grid container style={{ display: 'flex', margin: 'auto', justifyContent: 'center' }}>
              <span onClick={() => handleChangeTab('favorites')} style={{ marginRight: '50px' }}>
                <Typography style={{ textAlign: 'center', fontWeight: 'bold', cursor: 'pointer', color: currentTab === 'favorites' ? 'black' : '#999999' }}>Favorites</Typography>
                <Divider color={currentTab === 'favorites' ? 'black' : '#999999'} style={{ width: '100%', margin: 'auto', marginTop: '10px', marginBottom: '10px' }}></Divider>
              </span>
              <span onClick={() => handleChangeTab('recent')} style={{ marginLeft: '50px' }}>
                <Typography style={{ textAlign: 'center', fontWeight: 'bold', cursor: 'pointer', color: currentTab === 'recent' ? 'black' : '#999999' }}>Recent</Typography>
                <Divider color={currentTab === 'recent' ? 'black' : '#999999'} style={{ width: '100%', margin: 'auto', marginTop: '10px', marginBottom: '10px' }}></Divider>
              </span>
            </Grid>
            {favorites !== null && currentTab === 'favorites' ? (
              <List className='favoriteRecentList'>
                {favorites.length <= 0 &&
                  <Typography style={{ marginLeft: '15px', marginBottom: '10px' }}>Favorites will appear here...</Typography>
                }
                <Grid style={{ justifyContent: 'center', alignItems: 'center', marginLeft: '5px' }} container>
                  {Array.from({ length: favorites.length <= 9 ? 9 : favorites.length }, (_, index) => (
                    favorites.length > index ? (
                      <Grid key={`favorite_${index}`} xs={12} sm={4}>
                        <FavoriteIcon className='favoriteButtonActive' onClick={() => handleRemoveFavorite(favorites[index])} style={{ display: 'flex', marginRight: 'auto', marginLeft: '0px', marginTop: '10px', fontSize: '18px', position: 'absolute', zIndex: 1 }}></FavoriteIcon>
                        <a className='recentSearchItem' href={`/profile/${favorites[index].selectedRegion}/${favorites[index].summonerName}/${favorites[index].riotId}`}>
                          <ListItem style={{ justifyContent: 'center' }} key={index}>
                            <img style={{ borderRadius: '100%', border: '3px solid white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)', width: '65px', right: 'auto', left: '8px', position: 'absolute' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${favorites[index].icon}.png`}></img>
                            <div style={{ marginLeft: '60px', textAlign: 'center' }}>
                              <div>
                                <b style={{ fontSize: '14px' }}>{favorites[index].summonerName}</b>
                              </div>
                              <div>
                                <b style={{ fontSize: '14px' }}>#{favorites[index].riotId}</b>
                              </div>
                              <div>
                                <span style={{ fontSize: '14px' }}>Level: {favorites[index].level}</span>
                              </div>
                              <div>
                                {favorites[index].rank !== null ? (
                                  <span style={{ fontSize: '14px' }}>{favorites[index].rank.charAt(0) + favorites[index].rank.split(' ')[0].substring(1).toLowerCase() + ' ' + favorites[index].rank.split(' ')[1]}</span>
                                ) : (
                                  <span style={{ fontSize: '14px' }}>Unranked</span>
                                )}
                              </div>
                            </div>
                          </ListItem>
                        </a>
                      </Grid>
                    ) : (
                      <Grid key={index} xs={12} sm={4}>
                        <div className='recentSearchItem'>
                          <ListItem style={{ justifyContent: 'center' }}>
                            <img style={{ borderRadius: '100%', border: '3px solid white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)', width: '65px', right: 'auto', left: '8px', position: 'absolute' }} src={`/images/novalue.webp`}></img>
                            <div style={{ marginLeft: '60px', textAlign: 'center' }}>
                              <div>
                                <b style={{ fontSize: '14px' }}>Summoner</b>
                              </div>
                              <div>
                                <b style={{ fontSize: '14px' }}>#RiotID</b>
                              </div>
                              <div>
                                <span style={{ fontSize: '14px' }}>Level:</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '14px' }}>Rank</span>
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

            {recentArr !== null && currentTab === 'recent' ? (
              <List className='favoriteRecentList'>
                {recentArr.length <= 0 &&
                  <Typography style={{ marginLeft: '15px', marginBottom: '10px' }}>Recent searches will appear here...</Typography>
                }
                <Grid style={{ justifyContent: 'center', alignItems: 'center', marginLeft: '5px' }} container>
                  {Array.from({ length: recentArr.length <= 9 ? 9 : recentArr.length }, (_, index) => (
                    recentArr.length > index ? (
                      <Grid key={`recent_${index}`} xs={12} sm={4}>
                        <CloseIcon className='deleteRecentButton' onClick={() => handleRemoveRecent(recentArr[index])} style={{ display: 'flex', marginRight: 'auto', marginLeft: '0px', marginTop: '10px', fontSize: '14px', position: 'absolute', zIndex: 1 }}></CloseIcon>
                        <a className='recentSearchItem' href={`/profile/${recentArr[index].selectedRegion}/${recentArr[index].summonerName}/${recentArr[index].riotId}`}>
                          <ListItem style={{ justifyContent: 'center' }} key={index}>
                            <img style={{ borderRadius: '100%', border: '3px solid white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)', width: '65px', right: 'auto', left: '8px', position: 'absolute' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${recentArr[index].icon}.png`}></img>
                            <div style={{ marginLeft: '60px', textAlign: 'center' }}>
                              <div>
                                <b style={{ fontSize: '14px' }}>{recentArr[index].summonerName}</b>
                              </div>
                              <div>
                                <b style={{ fontSize: '14px' }}>#{recentArr[index].riotId}</b>
                              </div>
                              <div>
                                <span style={{ fontSize: '14px' }}>Level: {recentArr[index].level}</span>
                              </div>
                              <div>
                                {recentArr[index].rank !== null ? (
                                  <span style={{ fontSize: '14px' }}>{recentArr[index].rank.charAt(0) + recentArr[index].rank.split(' ')[0].substring(1).toLowerCase() + ' ' + recentArr[index].rank.split(' ')[1]}</span>
                                ) : (
                                  <span style={{ fontSize: '14px' }}>Unranked</span>
                                )}
                              </div>
                            </div>
                          </ListItem>
                        </a>
                      </Grid>
                    ) : (
                      <Grid key={`recent_${index}`} xs={12} sm={4}>
                        <div className='recentSearchItem'>
                          <ListItem style={{ justifyContent: 'center' }}>
                            <img style={{ borderRadius: '100%', border: '3px solid white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)', width: '65px', right: 'auto', left: '8px', position: 'absolute' }} src={`/images/novalue.webp`}></img>
                            <div style={{ marginLeft: '60px', textAlign: 'center' }}>
                              <div>
                                <b style={{ fontSize: '14px' }}>Summoner</b>
                              </div>
                              <div>
                                <b style={{ fontSize: '14px' }}>#RiotID</b>
                              </div>
                              <div>
                                <span style={{ fontSize: '14px' }}>Level:</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '14px' }}>Rank</span>
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