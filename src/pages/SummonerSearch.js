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
        getChampsJSON(currentVersion);
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
      console.log(data)
      findQueueTitle(data, featuredMatch)
    } catch (error) {
      console.error('Error fetching queue data:', error);
    }
  }

  // Search JSON for relevant Queue data
  const findQueueTitle = async (queues, featuredMatch) => {

    let queue = await findQueueInfo(queues, featuredMatch);

    console.log(queue)

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
    console.log(featuredGame)
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

          {featuredData !== null && champsJSON !== null &&
            <a
              href={
                featuredData.featuredGameData.matchData.info.gameMode === "CLASSIC" || featuredData.featuredGameData.matchData.info.gameMode ==="SWIFTPLAY" &&
                  featuredData.featuredGameData.matchData.info.gameDuration > 300
                  ? `/match/${featuredData.featuredGameData.matchData.metadata.matchId}/${featuredData.featuredPlayer.riotIdGameName}/${featuredData.featuredPlayer.riotIdTagline}`
                  : featuredData.featuredGameData.matchData.info.gameMode === "CLASSIC" &&
                    featuredData.featuredGameData.matchData.info.gameDuration <= 300
                    ? `/remake/${featuredData.featuredGameData.matchData.metadata.matchId}/${featuredData.featuredPlayer.riotIdGameName}/${featuredData.featuredPlayer.riotIdTagline}`
                    : featuredData.featuredGameData.matchData.info.gameMode === "ARAM"
                      ? `/aram/${featuredData.featuredGameData.matchData.metadata.matchId}/${featuredData.featuredPlayer.riotIdGameName}/${featuredData.featuredPlayer.riotIdTagline}`
                      : "/default"
              }
              style={{ backgroundColor: featuredData.featuredPlayer.win ? '#ECF2FF' : '#FFF1F3', color: 'inherit', textDecoration: 'inherit' }}
              className='searchFeaturedContainer'>
              <Grid>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'column', marginBottom: '10px' }}>
                  {featuredData.gameTier !== 'Unranked' ? (
                    <span style={{ display: 'flex', flexDirection: 'row', }} className='hideDesktop'>
                      <span>
                        <Typography className='featuredGameMainHeader'>Featured Report</Typography>
                        <Divider className='featuredGameMainDivider' color={'#7E7E7E'}></Divider>
                      </span>
                      <span style={{ flexDirection: 'row', display: 'flex' }}>
                        <Typography className='featuredGameRankHeader'>{timeSinceMatch}</Typography>
                        <Typography className='featuredGameRankHeader'>{selectedRegion.toUpperCase()}</Typography>
                      </span>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', flexDirection: 'row' }} className='hideDesktop'>
                      <span>
                        <Typography className='featuredGameMainHeader'>Featured Report</Typography>
                        <Divider className='featuredGameMainDivider' color={'#7E7E7E'}></Divider>
                      </span>
                      <span style={{ flexDirection: 'row', display: 'flex' }}>
                        <Typography className='featuredGameRankHeader'>{timeSinceMatch}</Typography>
                        <Typography className='featuredGameRankHeader'>{selectedRegion.toUpperCase()}</Typography>
                      </span>
                    </span>
                  )}
                  <Typography className='featuredGameMainHeader hideMobile'>Featured Report</Typography>
                  <Divider className='featuredGameMainDivider hideMobile' color={'#7E7E7E'}></Divider>
                  <Typography className='hideMobile' style={{ textAlign: 'right', left: 'auto', right: '30px', color: '#7E7E7E', fontSize: '16px', whiteSpace: 'nowrap', position: 'absolute', fontWeight: 'bold' }}>{selectedRegion.toUpperCase()}</Typography>
                </div>

                {/* Display featured game */}
                {featuredData !== null && champsJSON !== null &&
                  <Grid style={{ display: 'flex' }}>

                    <div className='featuredGamePlayerImgContainer'>
                      <Tooltip arrow placement='top' slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, 90] } }] } }} title={`${featuredData.featuredPlayer.riotIdGameName} #${featuredData.featuredPlayer.riotIdTagline}`}>
                        <a href={`/profile/${featuredData.featuredGameData.matchData.info.platformId.toLowerCase()}/${featuredData.featuredPlayer.riotIdGameName}/${featuredData.featuredPlayer.riotIdTagline.toLowerCase()}`} style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                          <Typography className='featuredGamePlayerLevel' style={{
                            fontSize: '12px',
                            position: 'absolute',
                            backgroundColor: featuredData.featuredPlayer.teamId === 100 ? '#568CFF' : '#FF3A54',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '100%',
                            paddingLeft: '5px',
                            paddingRight: '5px',
                            paddingTop: '1px',
                            paddingBottom: '1px',
                            textAlign: 'center',
                            right: 'auto',
                            top: 'auto',
                            left: '76px',
                            justifyContent: 'center'
                          }}
                          >{17}
                          </Typography>
                          <img className='featuredGamePlayerImg' style={{ backgroundColor: featuredData.featuredPlayer.teamId === 100 ? '#568CFF' : '#FF3A54' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(featuredData.featuredPlayer.championId)).id}.png`}></img>
                        </a>
                      </Tooltip>
                    </div>
                    <div className='featuredGamePlayerInfo'>
                      <Typography style={{ fontWeight: 'bold', fontSize: '18px' }}>{featuredData.featuredPlayer.riotIdGameName}</Typography>
                      <Typography style={{ color: '#7E7E7E' }}>{`${featuredData.featuredPlayer.championName} (${featuredData.featuredPlayer.kills}/${featuredData.featuredPlayer.deaths}/${featuredData.featuredPlayer.assists})`}</Typography>
                    </div>
                    <div style={{ marginRight: '20px', marginTop: '25px' }}>
                      <Box marginTop={'3px'} marginBottom={'3px'} alignSelf={'center'} width={'10px'} height={'10px'} borderRadius={'100%'} backgroundColor={'#DDDDDD'}></Box>
                    </div>
                    <div style={{ marginRight: '20px', marginTop: '5px' }}>
                      <Typography style={{ fontWeight: 'bold', fontSize: '16px' }}>{queueTitle}</Typography>
                      <Typography className='hideMobile' style={{ color: '#7E7E7E' }}>{timeSinceMatch}</Typography>
                      {featuredData.gameTier !== 'Unranked' ? (
                        <Typography className='hideDesktop' style={{ color: '#7E7E7E' }}>{featuredData.gameTier.charAt(0) + featuredData.gameTier.split(' ')[0].substring(1).toLowerCase() + ' ' + featuredData.gameTier.split(' ')[1]}</Typography>
                      ) : (
                        <Typography className='hideDesktop' style={{ color: '#7E7E7E' }}>{featuredData.gameTier}</Typography>
                      )
                      }
                    </div>
                    <div className='hideMobile' style={{ marginRight: '20px', marginTop: '25px' }}>
                      <Box marginTop={'3px'} marginBottom={'3px'} alignSelf={'center'} width={'10px'} height={'10px'} borderRadius={'100%'} backgroundColor={'#DDDDDD'}></Box>
                    </div>
                    <div className='hideMobile' style={{ marginRight: '20px', marginTop: '5px' }}>
                      <Typography style={{ fontWeight: 'bold', fontSize: '16px' }}>Tier</Typography>
                      {featuredData.gameTier !== 'Unranked' ? (
                        <Typography style={{ color: '#7E7E7E' }}>{featuredData.gameTier.charAt(0) + featuredData.gameTier.split(' ')[0].substring(1).toLowerCase() + ' ' + featuredData.gameTier.split(' ')[1]}</Typography>
                      ) : (
                        <Typography style={{ color: '#7E7E7E' }}>{featuredData.gameTier}</Typography>
                      )
                      }
                    </div>
                  </Grid>
                }

                {/* Participant Champs (MOBILE) */}
                <div className='featuredGameChamps hideDesktop' style={{ display: 'flex', marginLeft: '170px', position: 'absolute', top: 'auto', bottom: '45px' }}>
                  {/* Team 1 */}
                  <Grid style={{ marginTop: '15px' }}>
                    {featuredData.featuredGameData.matchData.info.participants
                      .filter(player => player.summonerId !== featuredData.featuredPlayer.summonerId)
                      .sort((a, b) => {
                        // Sort players by teamId: Featured player's team (100 or 200) comes first
                        const featuredTeamId = featuredData.featuredPlayer.teamId;
                        if (a.teamId === featuredTeamId && b.teamId !== featuredTeamId) return -1;
                        if (a.teamId !== featuredTeamId && b.teamId === featuredTeamId) return 1;
                        return 0;
                      })
                      .map((player, index) => (
                        <Tooltip arrow title={`${player.riotIdGameName} #${player.riotIdTagline}`}>
                          <a href={`/profile/${featuredData.featuredGameData.matchData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`} style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                            <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '32px', marginRight: '3px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).id}.png`}></img>
                            <Box style={{ position: 'absolute', width: '32px', height: '5px', bottom: '0px', left: '0px', backgroundColor: player.teamId === 100 ? '#568CFF' : '#FF3A54', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                          </a>
                        </Tooltip>
                      ))}
                  </Grid>
                </div>

                {/* Participant Champs */}
                <div className='featuredGameChamps hideMobile' style={{ display: 'flex', marginLeft: '170px', position: 'absolute', top: 'auto', bottom: '45px' }}>
                  {/* Team 1 */}
                  <Grid>
                    {featuredData.featuredGameData.matchData.info.participants.filter(player => player.teamId === featuredData.featuredPlayer.teamId && player.summonerId !== featuredData.featuredPlayer.summonerId).map((player, index) => (
                      <Tooltip arrow title={`${player.riotIdGameName} #${player.riotIdTagline}`}>
                        <a href={`/profile/${featuredData.featuredGameData.matchData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`} style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                          <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).id}.png`}></img>
                          <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', left: '0px', backgroundColor: player.teamId === 100 ? '#568CFF' : '#FF3A54', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                        </a>
                      </Tooltip>
                    ))}
                  </Grid>

                  <img className='hideMobile' style={{ width: '27px', opacity: '0.65', marginLeft: '25px', marginRight: '25px' }} src='/images/swords.svg'></img>

                  {/* Team 2 */}
                  <Grid>
                    {featuredData.featuredGameData.matchData.info.participants.filter(player => player.teamId !== featuredData.featuredPlayer.teamId && player.summonerId !== featuredData.featuredPlayer.summonerId).map((player, index) => (
                      <Tooltip arrow title={`${player.riotIdGameName} #${player.riotIdTagline}`}>
                        <a href={`/profile/${featuredData.featuredGameData.matchData.info.platformId.toLowerCase()}/${player.riotIdGameName}/${player.riotIdTagline.toLowerCase()}`} style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
                          <img style={{ borderTopLeftRadius: '5px', borderTopRightRadius: '5px', width: '36px', marginRight: '5px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${Object.values(champsJSON.data).find(champ => champ.key === String(player.championId)).id}.png`}></img>
                          <Box style={{ position: 'absolute', width: '36px', height: '5px', bottom: '0px', left: '0px', backgroundColor: player.teamId === 100 ? '#568CFF' : '#FF3A54', borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px' }}></Box>
                        </a>
                      </Tooltip>
                    ))}
                  </Grid>
                </div>

              </Grid>
            </a>
          }

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
            {favorites !== null && currentTab === 'favorites' ? (
              <List>
                <Grid style={{ justifyContent: 'center', alignItems: 'center', marginLeft: '5px' }} container>
                  {favorites.map((item, index) => (
                    <Grid item xs={12} sm={4}>
                      <FavoriteIcon className='favoriteButtonActive' onClick={() => handleRemoveFavorite(item)} style={{ display: 'flex', marginRight: 'auto', marginLeft: '0px', marginTop: '10px', fontSize: '18px', position: 'absolute', zIndex: 1 }}></FavoriteIcon>
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
                              {item.rank !== null ? (
                                <span style={{ fontSize: '14px' }}>{item.rank.charAt(0) + item.rank.split(' ')[0].substring(1).toLowerCase() + ' ' + item.rank.split(' ')[1]}</span>
                              ) : (
                                <span style={{ fontSize: '14px' }}>Unranked</span>
                              )}
                            </Grid>
                          </Grid>
                        </ListItem>
                      </a>
                    </Grid>
                  ))}
                </Grid>
              </List>

            ) : (
              <div></div>
            )}

            {recentArr !== null && currentTab === 'recent' ? (
              <List>
                <Grid style={{ justifyContent: 'center', alignItems: 'center', marginLeft: '5px' }} container>
                  {recentArr.map((item, index) => (
                    <Grid item xs={12} sm={4}>
                      <CloseIcon className='deleteRecentButton' onClick={() => handleRemoveRecent(item)} style={{ display: 'flex', marginRight: 'auto', marginLeft: '0px', marginTop: '10px', fontSize: '14px', position: 'absolute', zIndex: 1 }}></CloseIcon>
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
                              {item.rank !== null ? (
                                <span style={{ fontSize: '14px' }}>{item.rank.charAt(0) + item.rank.split(' ')[0].substring(1).toLowerCase() + ' ' + item.rank.split(' ')[1]}</span>
                              ) : (
                                <span style={{ fontSize: '14px' }}>Unranked</span>
                              )}
                            </Grid>
                          </Grid>
                        </ListItem>
                      </a>
                    </Grid>
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