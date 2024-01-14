import { Box, List, ListItem, LinearProgress, Button, Typography } from '@mui/material';
import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import Grid from '@mui/material/Unstable_Grid2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { firestore } from '../FirebaseConfig';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, getDoc, setDoc } from "firebase/firestore";
import SyncIcon from '@mui/icons-material/Sync';

const SummonerProfile = () => {

  // State variables
  const [summonerData, setSummonerData] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [matchesLoaded, setMatchesLoaded] = useState(false);

  const [alternateRegion, setAlternateRegion] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [timeLastUpdated, setTimeLastUpdated] = useState(null);
  const [disableUpdateButton, setDisableUpdateButton] = useState(false);

  // Get summoner name from url
  let { selectedRegion, summonerName, dataDragonVersion } = useParams();
  summonerName = summonerName.toLowerCase();

  // Get summoner data from firestore
  const getUserFromFirestore = async () => {

    // Check if user exists in firestore
    const docRef = doc(firestore, "users", `${summonerName}-${selectedRegion}`);
    const docSnap = await getDoc(docRef); // ******* CLOSE THIS SNAP

    // Load summoner profile from firestore
    if (docSnap.exists()) {
      console.log('user exists in firestore');
      setSummonerData(docSnap.data());
      updateUserMatchInfo(docSnap.data());
      setTimeSinceUpdated(docSnap.data().lastUpdated.seconds);
    }
    // Create new summoner profile on firestore
    else {
      console.log('no such user exists in firestore')
      try {
        console.log('CALLING RIOT API')
        const summonerResponse = await axios.get(`https://${selectedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`);
        const summonerData = summonerResponse.data;
        const rankedResponse = await axios.get(`https://${selectedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`);
        const rankedData = rankedResponse.data;
        const historyResponse = await axios.get(`https://${'americas'}.api.riotgames.com/lol/match/v5/matches/by-puuid/${summonerData.puuid}/ids?api_key=${process.env.REACT_APP_RIOT_API_KEY}`); 
        const historyData = historyResponse.data;
        let lastUpdated = new Date();
        const newDocRef = doc(collection(firestore, "users"), `${summonerName}-${selectedRegion}`);
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
  }

  // Update user document in firestore **** IMPLEMENT GETTING RANKED DATA AS WELL
  const updateUserFirestore = async () => {
    try {
      console.log('CALLING RIOT API 3 times (ranked and summoner profile info and match history')
      const summonerResponse = await axios.get(`https://${selectedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`);
      const summonerData = summonerResponse.data;
      const rankedResponse = await axios.get(`https://${selectedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`);
      const rankedData = rankedResponse.data;
      const historyResponse = await axios.get(`https://${alternateRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${summonerData.puuid}/ids?api_key=${process.env.REACT_APP_RIOT_API_KEY}`); 
      const historyData = historyResponse.data;
      let lastUpdated = new Date()
      const docRef = doc(firestore, "users", `${summonerName}-${selectedRegion}`);
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

  // Update matches involving user (for first 1) ***can increase limit later
  const updateUserMatchInfo = async (data) => {
    let historyData = data.historyData
    let newMatchDataArray = [];
    let riotApiCallCount = 0;

    if (historyData.length < 1) {
      setMatchData(null)
    }
    else {
      for (let i = 0; i < 1; i++) {
        // check if match already exists
        const docRef = doc(firestore, `${selectedRegion}-matches`, historyData[i]);
        const docSnap = await getDoc(docRef); // ******* CLOSE THIS SNAP
        if (docSnap.exists()) {
          console.log('match already exists')
          console.log(docSnap.data())
          newMatchDataArray.push(docSnap.data().matchData);
        }
        else {
          let dateRetrieved = new Date()
          const matchResponse = await axios.get(`https://${alternateRegion}.api.riotgames.com/lol/match/v5/matches/${historyData[i]}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`);
          riotApiCallCount += 1;
          const matchData = matchResponse.data;
          console.log(matchData)
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

  // Get summoner data on page load
  useEffect(() => {

    // set alternate routing value
    const americasServers = ['na1', 'br1', 'la1', 'la2'];
    const asiaServers = ['kr', 'jp1'];
    const europeServer = ['eun1', 'euw1', 'tr1', 'ru'];
    const seaServer = ['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2']

    if (americasServers.includes(selectedRegion) && alternateRegion === null) {
      console.log('alternate route: americas')
      setAlternateRegion('americas')
    }
    if (asiaServers.includes(selectedRegion) && alternateRegion === null) {
      console.log('alternate route: asia')
      setAlternateRegion('asia')
    }
    if (europeServer.includes(selectedRegion) && alternateRegion === null) {
      console.log('alternate route: europe')
      setAlternateRegion('europe')
    }
    if (seaServer.includes(selectedRegion) && alternateRegion === null) {
      console.log('alternate route: sea')
      setAlternateRegion('sea')
    }

    // Get summonerData from firestore
    if (summonerName !== null && selectedRegion !== null && alternateRegion !== null) {
      console.log(summonerName, selectedRegion, alternateRegion)
      getUserFromFirestore();
    }


  }, [summonerName, selectedRegion, alternateRegion])

  // Render page once data is loaded
  useEffect(() => {
    if (summonerData !== null && matchesLoaded === true) {
      console.log(summonerData)
      console.log(matchData)
      setIsLoading(false);
    }
  }, [summonerData, matchData])

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
              <ListItem>{summonerData.summonerData.name} ({selectedRegion})</ListItem>
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

        <Grid xs={12} display={'flex'} justifyContent={'center'}>
          <Typography>Match 1: {matchData[0].info.gameName}</Typography>
        </Grid>

        {/* <Footer></Footer> */}
      </Box>
    )
  }


}

export default SummonerProfile