import '../App.css';
import { getChampions, getVersion } from '../api/ddragon';
import { regionValues, getAccountCluster } from '../lib/regions';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, Autocomplete, Select, MenuItem } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import DisplayGame from '../components/DisplayGame';
import SearchIcon from '@mui/icons-material/Search';
import SummonerCard from '../components/SummonerCard';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';


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
    try {
      const currentVersion = await getVersion();
      setDataDragonVersion(currentVersion);
      getChampsJSON(currentVersion);
    } catch (error) {
      // console.error('Error: Error fetching datadragon version')
    }
  }, [])

  const [dropdownDefaultValue, setDropdownDefaultValue] = useState('');
  const handleRegionChange = async (event) => {
    const value = event.target.value;
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
      const data = await getChampions(currentVersion);
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
                // account cluster (featured-game routing)
                let alternateRegion = getAccountCluster(selectedRegion);

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
                  gameModeHref = `/arena/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`;
                } else {
                  gameModeHref = `/altmatch/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`;
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
                      champsJSON={champsJSON}
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

          <div className='favorites-recent-container'>
            <div className='tab-selector'>
              <button 
                onClick={() => handleChangeTab('favorites')} 
                className={`tab-button ${currentTab === 'favorites' ? 'active' : ''}`}
              >
                <Typography className='tab-button-text'>Favorites</Typography>
              </button>
              <button 
                onClick={() => handleChangeTab('recent')} 
                className={`tab-button ${currentTab === 'recent' ? 'active' : ''}`}
              >
                <Typography className='tab-button-text'>Recent</Typography>
              </button>
            </div>

            {currentTab === 'favorites' ? (
              <div className='summoner-list'>
                {favorites && favorites.length > 0 ? (
                  <div className='summoner-grid'>
                    {favorites.map((favorite, index) => (
                      <SummonerCard
                        key={`favorite_${index}`}
                        summoner={favorite}
                        dataDragonVersion={dataDragonVersion}
                        type='favorite'
                        onRemove={handleRemoveFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='empty-state'>
                    <FavoriteIcon className='empty-state-icon' />
                    <Typography className='empty-state-text'>
                      Favorites will appear here...
                    </Typography>
                  </div>
                )}
              </div>
            ) : (
              <div></div>
            )}

            {currentTab === 'recent' ? (
              <div className='summoner-list'>
                {recentArr && recentArr.length > 0 ? (
                  <div className='summoner-grid'>
                    {recentArr.map((recent, index) => (
                      <SummonerCard
                        key={`recent_${index}`}
                        summoner={recent}
                        dataDragonVersion={dataDragonVersion}
                        type='recent'
                        onRemove={handleRemoveRecent}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='empty-state'>
                    <PersonIcon className='empty-state-icon' />
                    <Typography className='empty-state-text'>
                      Recent searches will appear here...
                    </Typography>
                  </div>
                )}
              </div>
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