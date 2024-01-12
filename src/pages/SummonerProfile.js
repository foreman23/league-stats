import { Box, List, ListItem, LinearProgress } from '@mui/material';
import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import Grid from '@mui/material/Unstable_Grid2';

const SummonerProfile = () => {

  const [summonerData, setSummonerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get summoner name from url
  let { selectedRegion, summonerName, dataDragonVersion } = useParams();

  useEffect(() => {
    console.log(summonerName)
    if (summonerName !== null) {
      axios.get(`https://${selectedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`)
      .then(function (response) {
        // setSummonerNotFound(false);
        setSummonerData(response.data)
      })
      .catch(function (response) {
        console.log('Error: Error fetching summoner info from API')
        // setSummonerNotFound(true);
      })
    }

  }, [summonerName, selectedRegion])

  const [isInitialRender, setIsInitialRender] = useState(true);
  useEffect(() => {
    if (isInitialRender === false && summonerData !== null) {
      setIsLoading(false);
    }
    else {
      setIsInitialRender(false);
    }
  }, [summonerData, isInitialRender])


  if (isLoading) {
    return (
      <LinearProgress></LinearProgress>
    )
  }

  else {
    return (

      <Box>
        <Grid xs={12} display={'flex'} justifyContent={'center'}>
          <img src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${summonerData.profileIconId}.png`} alt=''></img>
        </Grid>
  
        <Grid xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'}>
          <List>
            <ListItem>{summonerData.name}</ListItem>
            <ListItem>lvl: {summonerData.summonerLevel}</ListItem>
          </List>
        </Grid>
      </Box>
    )
  }


}

export default SummonerProfile