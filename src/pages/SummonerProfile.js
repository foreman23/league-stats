import { Box, List, ListItem, LinearProgress, Button, Typography } from '@mui/material';
import React, { useCallback } from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
import Navbar from '../components/Navbar';
import { firestore } from '../FirebaseConfig';
import { collection, updateDoc, doc, getDoc, setDoc } from "firebase/firestore";
import SyncIcon from '@mui/icons-material/Sync';

const SummonerProfile = () => {

  // State variables
  const [summonerData, setSummonerData] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [matchesLoaded, setMatchesLoaded] = useState(false);

  const [alternateRegion, setAlternateRegion] = useState(null);
  const [matchRegion, setMatchRegion] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [timeLastUpdated, setTimeLastUpdated] = useState(null);
  const [disableUpdateButton, setDisableUpdateButton] = useState(false);

  const [dataDragonVersion, setDataDragonVersion] = useState(null);

  // Init navigate
  const navigate = useNavigate();

  // Get summoner name from url
  let { selectedRegion, summonerName, riotId } = useParams();
  summonerName = summonerName.toLowerCase();
  riotId = riotId.toUpperCase();

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

  // Update matches involving user (for first 1) ***can increase limit later
  const updateUserMatchInfo = useCallback(async (data) => {
    let historyData = data.historyData
    let newMatchDataArray = [];
    let riotApiCallCount = 0;

    if (historyData.length < 1) {
      setMatchData(null)
      setMatchesLoaded(true);
    }

    else {
      for (let i = 0; i < 1; i++) {
        console.log(historyData)
        // check if match already exists
        const docRef = doc(firestore, `${selectedRegion}-matches`, historyData[i]);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log('match already exists')
          newMatchDataArray.push(docSnap.data().matchData);
        }
        else {
          let dateRetrieved = new Date()
          const matchResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/matchinfo?alternateRegion=${matchRegion}&matchId=${historyData[i]}`);
          riotApiCallCount += 1;
          const matchData = matchResponse.data;
          const newDocRef = doc(collection(firestore, `${selectedRegion}-matches`), historyData[i]);
          await setDoc(newDocRef, {
            dateRetrieved: dateRetrieved,
            matchData: matchData
          });
          setMatchData(matchData);
          newMatchDataArray.push(matchData);
        }
      }
      console.log(`CALLED RIOT API ${riotApiCallCount} TIMES`)
      setMatchData(newMatchDataArray);
      setMatchesLoaded(true);
    }
  }, [matchRegion, selectedRegion])

  // Get summoner data from firestore
  const getUserFromFirestore = useCallback(async () => {

    // Check if user exists in firestore
    const docRef = doc(firestore, `${selectedRegion}-users`, `${summonerName}-${riotId}`);
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
        console.log(alternateRegion)

        console.log('CALLING RIOT API 4 times')
        const puuidResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/puuid?alternateRegion=${alternateRegion}&summonerName=${summonerName}&riotId=${riotId}`);
        const puuidData = puuidResponse.data;

        // If summoner does not exist anywhere
        if (puuidData.status === 404) {
          console.log(`summoner does not exist :(`)
          navigate(`/nosummoner`)
        }

        console.log(puuidResponse)

        const summonerResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/summoner?selectedRegion=${selectedRegion}&puuid=${puuidData.puuid}`);
        const summonerData = summonerResponse.data;

        // If summoner not found return 404
        if (summonerData.status === 404) {
          console.log(`summoner not found in region ${selectedRegion} :(`)
        }

        console.log(selectedRegion)

        const rankedResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/ranked?selectedRegion=${selectedRegion}&summonerId=${summonerData.id}`);
        const rankedData = rankedResponse.data;

        console.log(selectedRegion)
        console.log(rankedData)
        console.log(matchRegion)

        const historyResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/history?alternateRegion=${matchRegion}&puuid=${puuidData.puuid}`);
        const historyData = historyResponse.data;

        console.log(historyResponse)

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

  // Render page once data is loaded
  useEffect(() => {
    if (summonerData !== null && matchesLoaded === true) {
      console.log(summonerData)
      console.log(matchData)
      setIsLoading(false);
    }
  }, [summonerData, matchData, matchesLoaded])

  if (isLoading) {
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
              <ListItem>{summonerData.summonerData.name}#{riotId} ({selectedRegion})</ListItem>
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

        <Grid xs={12} display={'flex'} justifyContent={'center'}>
          <Button disabled={disableUpdateButton} onClick={updateUserFirestore} variant='contained' endIcon={<SyncIcon></SyncIcon>}>Update</Button>
          <Typography>Last Updated: {timeLastUpdated}</Typography>
        </Grid>

        <Box justifyContent={'center'} width={'25vw'} margin={'auto'} backgroundColor={'#d2d2d2d2'} borderRadius={'5px'} marginTop={'20px'} paddingTop={'10px'} paddingBottom={'10px'}>
          {matchData !== null ? (
            <div>
              <Grid xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} margin={'auto'} >
                <Typography style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{matchData[0].info.gameName}</Typography>
                <Typography>{matchData[0].info.queueId === 420 ? 'Ranked' : 'Normal'}</Typography>
              </Grid>
              <Grid xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
                {matchData[0].info.participants.map(player => (
                  <Grid display={'flex'}>
                    <Typography><b>{player.summonerName}</b> as {player.championName}</Typography>
                    <img style={{ borderRadius: '100%', width: '54px' }} alt='champion icon' src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${player.championName}.png`}></img>
                  </Grid>
                ))}
              </Grid>
            </div>
          ) : (
            <div>
              <Grid xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} margin={'auto'} >
                <Typography style={{ textAlign: 'center' }}>No recent matches!</Typography>
              </Grid>
            </div>
          )}

        </Box>

        {/* <Footer></Footer> */}
      </Box>
    )
  }


}

export default SummonerProfile