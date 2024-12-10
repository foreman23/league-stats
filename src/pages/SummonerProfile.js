import { Box, List, ListItem, LinearProgress, Button, Typography, CircularProgress } from '@mui/material';
import React, { useCallback } from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
import Navbar from '../components/Navbar';
import { firestore } from '../FirebaseConfig';
import { collection, updateDoc, doc, getDoc, setDoc, sum } from "firebase/firestore";
import SyncIcon from '@mui/icons-material/Sync';
import DisplayGame from '../components/DisplayGame';
import Footer from '../components/Footer';

const SummonerProfile = () => {

  // State variables
  const [summonerData, setSummonerData] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [matchesLoaded, setMatchesLoaded] = useState(false);

  const [historyState, setHistoryState] = useState(null);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(null);

  const [alternateRegion, setAlternateRegion] = useState(null);
  const [matchRegion, setMatchRegion] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [timeLastUpdated, setTimeLastUpdated] = useState(null);
  const [disableUpdateButton, setDisableUpdateButton] = useState(false);

  const [dataDragonVersion, setDataDragonVersion] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  // Init navigate
  const navigate = useNavigate();

  // Get summoner name from url
  let { selectedRegion, summonerName, riotId } = useParams();
  summonerName = summonerName.toLowerCase();
  riotId = riotId.toUpperCase();
  console.log(selectedRegion, summonerName, riotId)
  console.log(isLoading)

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

  const [loadingMatches, setLoadingMatches] = useState(false);

  // Update matches involving user (for first 1) ***can increase limit later
  const updateUserMatchInfo = useCallback(async (data) => {
    let historyData = data.historyData
    setHistoryState(historyData)
    let newMatchDataArray = [];
    let riotApiCallCount = 0;

    setLoadingMatches(true)

    if (historyData.length < 1) {
      setMatchData(null);
      setMatchesLoaded(true);
      setLoadingMatches(false);
    }

    else {
      for (let i = 0; i < 5; i++) {
        // check if match already exists
        const docRef = doc(firestore, `${selectedRegion}-matches`, historyData[i]);
        console.log('Reading from firestore (checking match exists)')
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log('match already exists')
          newMatchDataArray.push(docSnap.data().matchData);
        }
        else {
          let dateRetrieved = new Date()
          // get match information
          const matchResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/matchinfo?alternateRegion=${matchRegion}&matchId=${historyData[i]}`);
          riotApiCallCount += 1;
          const matchData = matchResponse.data;
          const newDocRef = doc(collection(firestore, `${selectedRegion}-matches`), historyData[i]);
          await setDoc(newDocRef, {
            dateRetrieved: dateRetrieved,
            matchData: matchData
            // timelineData: timelineData
          });
          // setMatchData(matchData);
          newMatchDataArray.push(matchData);
        }
      }
      console.log(`CALLED RIOT API ${riotApiCallCount} TIMES`)
      setHistoryIndex(newMatchDataArray.length)
      setMatchData(newMatchDataArray);
      setMatchesLoaded(true);
      setLoadingMatches(false);
    }
  }, [matchRegion, selectedRegion])

  // Load additional matches for the player
  const handleLoadMore = async () => {
    setLoadingMore(true)
    let newMatchDataArray = [...matchData];
    let riotApiCallCount = 0;

    console.log(newMatchDataArray)

    console.log(historyState)
    console.log(historyIndex)

    if (!allLoaded) {
      for (let i = historyIndex; i < historyIndex + 5; i++) {
        console.log(historyState[i])
        // check if match already exists
        const docRef = doc(firestore, `${selectedRegion}-matches`, historyState[i]);
        console.log('Reading from firestore (checking match exists)')
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('match already exists')
          newMatchDataArray.push(docSnap.data().matchData);
        }

        else {
          let dateRetrieved = new Date()
          // get match information
          const matchResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/matchinfo?alternateRegion=${matchRegion}&matchId=${historyState[i]}`);
          riotApiCallCount += 1;
          const matchData = matchResponse.data;
          const newDocRef = doc(collection(firestore, `${selectedRegion}-matches`), historyState[i]);
          await setDoc(newDocRef, {
            dateRetrieved: dateRetrieved,
            matchData: matchData
            // timelineData: timelineData
          });
          // setMatchData(matchData);
          newMatchDataArray.push(matchData);
        }
      }
    }

    console.log(`CALLED RIOT API ${riotApiCallCount} TIMES`)
    setHistoryIndex(newMatchDataArray.length)
    setMatchData(newMatchDataArray);
    setLoadingMore(false)
    if (newMatchDataArray.length >= historyState.length) {
      setAllLoaded(true)
    }
  }

  // Get summoner data from firestore
  const getUserFromFirestore = useCallback(async () => {

    // Check if user exists in firestore
    const docRef = doc(firestore, `${selectedRegion}-users`, `${summonerName}-${riotId}`);
    console.log('Reading from firestore (checking user)')
    const docSnap = await getDoc(docRef);

    // Load summoner profile from firestore
    if (docSnap.exists()) {
      console.log('user exists in firestore');
      setSummonerData(docSnap.data());
      updateUserMatchInfo(docSnap.data());
      setTimeSinceUpdated(docSnap.data().lastUpdated.seconds);
    }
    // Create new summoner profile on firestore
    else {
      try {
        //console.log(alternateRegion)

        console.log('CALLING RIOT API 4 times')
        const puuidResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/puuid?alternateRegion=${alternateRegion}&summonerName=${summonerName}&riotId=${riotId}`);
        const puuidData = puuidResponse.data;

        // If summoner does not exist anywhere
        if (puuidData.status === 404) {
          console.log(`summoner does not exist :(`)
          navigate(`/nosummoner`)
        }

        const summonerResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/summoner?selectedRegion=${selectedRegion}&puuid=${puuidData.puuid}`);
        const summonerData = summonerResponse.data;

        // If summoner not found return 404
        if (summonerData.status === 404) {
          console.log(`summoner not found in region ${selectedRegion} :(`)
        }

        const rankedResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/ranked?selectedRegion=${selectedRegion}&summonerId=${summonerData.id}`);
        const rankedData = rankedResponse.data;

        const historyResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/history?alternateRegion=${matchRegion}&puuid=${puuidData.puuid}`);
        const historyData = historyResponse.data;

        // if match history is empty set matchesLoaded to true
        if (historyData.length < 1) {
          setMatchesLoaded(true);
        }

        let lastUpdated = new Date();
        const newDocRef = doc(collection(firestore, `${selectedRegion}-users`), `${summonerName}-${riotId}`);
        const data = {
          lastUpdated: lastUpdated,
          summonerData: summonerData,
          rankedData: rankedData,
          historyData: historyData
        }
        await setDoc(newDocRef, {
          lastUpdated: lastUpdated,
          summonerData: summonerData,
          rankedData: rankedData,
          historyData: historyData
        });
        setSummonerData(data);
        updateUserMatchInfo(data);
        setTimeLastUpdated('Just now');
        setDisableUpdateButton(true);
      } catch (error) {
        console.error(error);
      }
    }
    return;
  }, [alternateRegion, matchRegion, navigate, riotId, selectedRegion, summonerName, updateUserMatchInfo])

  // Update user document in firestore
  const updateUserFirestore = async () => {
    try {
      console.log('CALLING RIOT API 4 times')

      const puuidResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/puuid?alternateRegion=${alternateRegion}&summonerName=${summonerName}&riotId=${riotId}`);
      const puuidData = puuidResponse.data;

      const summonerResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/summoner?selectedRegion=${selectedRegion}&puuid=${puuidData.puuid}`);
      const summonerData = summonerResponse.data;

      const rankedResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/ranked?selectedRegion=${selectedRegion}&summonerId=${summonerData.id}`);
      const rankedData = rankedResponse.data;

      const historyResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/history?alternateRegion=${matchRegion}&puuid=${summonerData.puuid}`);
      const historyData = historyResponse.data;

      let lastUpdated = new Date()
      const docRef = doc(firestore, `${selectedRegion}-users`, `${summonerName}-${riotId}`);
      const data = {
        lastUpdated: lastUpdated,
        summonerData: summonerData,
        rankedData: rankedData,
        historyData: historyData
      }
      await updateDoc(docRef, {
        lastUpdated: lastUpdated,
        summonerData: summonerData,
        rankedData: rankedData,
        historyData: historyData
      });
      setSummonerData(data);
      updateUserMatchInfo(data);
      setTimeLastUpdated('Just now');
      setDisableUpdateButton(true);
      console.log('updated user info firestore')
    }
    catch (error) {
      console.error(error)
    }
    return;
  }

  // Sets time since summoner profile last updated
  const setTimeSinceUpdated = (timestampSeconds) => {
    const lastUpdatedDate = new Date(timestampSeconds * 1000);
    const now = new Date();
    const timeDifferenceInSeconds = Math.floor((now - lastUpdatedDate) / 1000);

    if (timeDifferenceInSeconds < 120) {
      setDisableUpdateButton(true);
    }

    if (timeDifferenceInSeconds < 60) {
      // Less than a minute
      setTimeLastUpdated(`${timeDifferenceInSeconds} seconds ago`);
    } else if (timeDifferenceInSeconds < 3600) {
      // Less than an hour
      const minutes = Math.floor(timeDifferenceInSeconds / 60);
      setTimeLastUpdated(`${minutes} minute${minutes !== 1 ? 's' : ''} ago`);
    } else if (timeDifferenceInSeconds < 86400) {
      // Less than a day
      const hours = Math.floor(timeDifferenceInSeconds / 3600);
      setTimeLastUpdated(`${hours} hour${hours !== 1 ? 's' : ''} ago`);
    } else {
      // More than a day
      const days = Math.floor(timeDifferenceInSeconds / 86400);
      setTimeLastUpdated(`${days} day${days !== 1 ? 's' : ''} ago`);
    }

  }

  // Get data dragon version on initial load
  useEffect(() => {
    getDataDragonVersion();
  }, [dataDragonVersion])

  // Get summoner data on page load
  useEffect(() => {

    console.log(selectedRegion, summonerName, riotId)

    // set alternate routing value
    const americasServers = ['na1', 'br1', 'la1', 'la2'];
    const asiaServers = ['kr', 'jp1', 'oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'];
    const europeServer = ['eun1', 'euw1', 'tr1', 'ru'];

    if (americasServers.includes(selectedRegion) && alternateRegion === null) {
      setAlternateRegion('americas');
      setMatchRegion('americas');
    }
    if (asiaServers.includes(selectedRegion) && alternateRegion === null) {
      const seaServer = ['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2']
      if (seaServer.includes(selectedRegion)) {
        setMatchRegion('sea');
      }
      else {
        setMatchRegion('asia');
      }
      setAlternateRegion('asia');
    }
    if (europeServer.includes(selectedRegion) && alternateRegion === null) {
      setAlternateRegion('europe');
      setMatchRegion('europe');
    }

    console.log(alternateRegion, matchRegion)

    // Get summonerData from firestore
    if (summonerName !== null && selectedRegion !== null && alternateRegion !== null) {
      getUserFromFirestore();
    }


  }, [summonerName, selectedRegion, alternateRegion, matchRegion, riotId, getUserFromFirestore])

  // Handle match click
  const handleMatchClick = (gameData) => {
    if (gameData.info.gameMode === "CLASSIC") {
      if (gameData.info.gameDuration < 900) {
        navigate(`/remake/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`, { state: { gameData, alternateRegion, dataDragonVersion } });
      } else {
        navigate(`/match/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`, { state: { gameData, alternateRegion, dataDragonVersion } });
      }
    }
    if (gameData.info.gameMode === "ARAM") {
      navigate(`/aram/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`, { state: { gameData, alternateRegion, dataDragonVersion } });
    }
    else if (gameData.info.gameMode === "CHERRY") {
      navigate(`/arena/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`, { state: { gameData, alternateRegion, dataDragonVersion } });
    }
  };

  // Render page once data is loaded
  useEffect(() => {
    if (summonerData !== null && matchesLoaded === true && matchData !== null && summonerData !== undefined && matchData !== undefined) {
      console.log(summonerData)
      console.log(matchData)

      // Find player data
      if (matchData.length > 0) {
        setPlayerData(matchData[0].info.participants.find(player => player.puuid === summonerData.summonerData.puuid))
      }
    }
  }, [summonerData, matchData, matchesLoaded])

  useEffect(() => {
    if (playerData !== undefined && playerData !== null) {
      console.log(playerData)
      console.log(playerData.riotIdGameName)
      console.log(summonerData)
      document.title = `${playerData.riotIdGameName}#${riotId} - ${selectedRegion}`;

      // Add summoner to local storage
      const recentSearches = localStorage.getItem('recentSearches')

      // add ranked data if applicable
      let rank = null
      if (summonerData.rankedData[0]) {
        rank = `${summonerData.rankedData[0].tier} ${summonerData.rankedData[0].rank}`
      }

      const summonerObj = {
        selectedRegion: selectedRegion,
        summonerName: playerData.riotIdGameName,
        riotId: playerData.riotIdTagline,
        icon: summonerData.summonerData.profileIconId,
        level: summonerData.summonerData.summonerLevel,
        rank: rank
      }
      if (recentSearches === null) {
        const newArr = [summonerObj]
        localStorage.setItem('recentSearches', JSON.stringify(newArr))
      }
      else {
        const parsedArr = JSON.parse(recentSearches)
        if (parsedArr.length < 6 && !parsedArr.some(obj =>
          obj.selectedRegion === summonerObj.selectedRegion &&
          obj.summonerName === summonerObj.summonerName &&
          obj.riotId === summonerObj.riotId
        )) {
          parsedArr.push(summonerObj)
          localStorage.setItem('recentSearches', JSON.stringify(parsedArr))
        }
      }
    }
  }, [playerData]);

  useEffect(() => {
    if (matchesLoaded && playerData !== undefined && matchData !== undefined && matchData !== null) {
      console.log(matchData)
      console.log(playerData)
      console.log('loading done')
      setIsLoading(false);
    }
  }, [playerData])

  useEffect(() => {
    if (matchesLoaded === true) {
      setIsLoading(false);
    }
    else {
      setIsLoading(true);
    }
  }, [matchesLoaded])

  if (isLoading === true) {
    return (
      <Box>
        <Navbar></Navbar>
        <LinearProgress></LinearProgress>
      </Box>
    )
  }

  else {
    return (

      <Box>
        <Navbar></Navbar>
        <Grid xs={12} display={'flex'} justifyContent={'center'}>

          <Grid>
            <img style={{ borderRadius: '100%', border: '6px solid white', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)', margin: '20px', width: '170px' }} src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${summonerData.summonerData.profileIconId}.png`} alt=''></img>
          </Grid>

          <Grid alignItems={'center'} display={'flex'}>
            <List>
              {playerData ? (
                <ListItem>{playerData.riotIdGameName} #{riotId} ({selectedRegion})</ListItem>
              ) : (
                <ListItem>{summonerName} #{riotId} ({selectedRegion})</ListItem>
              )}
              <ListItem>level: {summonerData.summonerData.summonerLevel}</ListItem>
              {summonerData.rankedData.length > 0 ? (
                <>
                  <ListItem>{summonerData.rankedData[0].tier} {summonerData.rankedData[0].rank}</ListItem>
                  <ListItem>{summonerData.rankedData[0].wins}W {summonerData.rankedData[0].losses}L {((summonerData.rankedData[0].wins / (summonerData.rankedData[0].wins + summonerData.rankedData[0].losses)) * 100).toFixed(0)}%</ListItem>
                </>
              ) : <ListItem>Unranked</ListItem>}
            </List>
          </Grid>

        </Grid>

        <Grid xs={12} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Button disabled={disableUpdateButton} onClick={updateUserFirestore} variant='contained' endIcon={<SyncIcon></SyncIcon>}>Update</Button>
          <Typography style={{ marginLeft: '15px' }}>Last Updated: {timeLastUpdated}</Typography>
        </Grid>

        <Box justifyContent={'center'} width={'35vw'} margin={'auto'} borderRadius={'5px'} marginTop={'20px'} paddingTop={'10px'} paddingBottom={'25px'}>
          {(loadingMatches) ? (
            <div style={{ textAlign: 'center' }} >
              <CircularProgress />
            </div>
          ) : (matchData === null || matchData.length === 0 && matchData !== -1) ? (
            // Display NO MATCHES FOUND
            <div>
              <Grid xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} margin={'auto'}>
                <Typography style={{ textAlign: 'center' }}>No recent matches!</Typography>
              </Grid>
            </div>
          ) : (
            matchData.map((gameData, index) => (
              <div className='DisplayGameContainer' onClick={() => handleMatchClick(gameData)} key={index}>
                <DisplayGame gameData={gameData} ddragonVersion={dataDragonVersion} puuid={summonerData.summonerData.puuid} />
              </div>
            ))
          )}
        </Box>

        {!loadingMatches &&
          <Grid style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', marginBottom: '70px' }}>
            {!allLoaded ? (
              !loadingMore ? (
                <Button onClick={() => handleLoadMore()} variant="contained">
                  Load more
                </Button>
              ) : (
                <Button variant="contained" disabled>
                  <CircularProgress style={{ color: 'white' }} />
                </Button>
              )
            ) : (
              <div></div>
            )}
          </Grid>
        }

      </Box>
    )
  }


}

export default SummonerProfile