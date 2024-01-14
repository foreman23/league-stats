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
  const [summonerRankedData, setSummonerRankedData] = useState(null);
  const [cachedSummonerRankedData, setCachedSummonerRankedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documentReference, setDocumentReference] = useState(null);
  const [timeLastUpdated, setTimeLastUpdated] = useState(null);
  const [disableUpdateButton, setDisableUpdateButton] = useState(false);

  // Get summoner name from url
  let { selectedRegion, summonerName, dataDragonVersion } = useParams();

  // Get summoner data from firestore
  const getUserFromFirestore = async () => {

    // Check if user exists in firestore
    const docRef = doc(firestore, "users", `${summonerName}-${selectedRegion}`);
    const docSnap = await getDoc(docRef); // ******* CLOSE THIS SNAP

    // Load summoner profile from firestore
    if (docSnap.exists()) {
      console.log('user exists in firestore');
      setSummonerData(docSnap.data());
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
        let lastUpdated = new Date();
        const newDocRef = doc(collection(firestore, "users"), `${summonerName}-${selectedRegion}`);
        const data = {
          lastUpdated: lastUpdated,
          summonerData: summonerData,
          rankedData: rankedData
        }
        await setDoc(newDocRef, {
          lastUpdated: lastUpdated,
          summonerData: summonerData,
          rankedData: rankedData
        });
        setSummonerData(data);
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
      console.log('CALLING RIOT API TWICE (ranked and summoner profile info')
      const summonerResponse = await axios.get(`https://${selectedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`);
      const summonerData = summonerResponse.data;
      const rankedResponse = await axios.get(`https://${selectedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`);
      const rankedData = rankedResponse.data;
      let lastUpdated = new Date()
      const docRef = doc(firestore, "users", `${summonerName}-${selectedRegion}`);
      const data = {
        lastUpdated: lastUpdated,
        summonerData: summonerData,
        rankedData: rankedData
      }
      await updateDoc(docRef, {
        lastUpdated: lastUpdated,
        summonerData: summonerData,
        rankedData: rankedData
      });
      setSummonerData(data);
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

  // Get summoner data on page load
  useEffect(() => {

    console.log(summonerName, selectedRegion)
    // Get summonerData from firestore
    getUserFromFirestore();

  }, [summonerName, selectedRegion])

  // Render page once data is loaded
  useEffect(() => {
    if (summonerData !== null) {
      console.log(summonerData)
      setIsLoading(false);
    }
  }, [summonerData])

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

        {/* <Footer></Footer> */}
      </Box>
    )
  }


}

export default SummonerProfile