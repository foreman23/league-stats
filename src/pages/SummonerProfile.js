import { Box, List, ListItem, LinearProgress, Button, Typography, CircularProgress, Tooltip, Divider, Skeleton } from '@mui/material';
import React, { useCallback } from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
import { firestore } from '../FirebaseConfig';
import { collection, updateDoc, doc, getDoc, setDoc } from "firebase/firestore";
import SyncIcon from '@mui/icons-material/Sync';
import DisplayGame from '../components/DisplayGame';
import FavoriteIcon from '@mui/icons-material/Favorite';

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

  const [favorited, setFavorited] = useState(false);

  const [levelBG, setLevelBG] = useState(null);
  const [champsJSON, setChampsJSON] = useState(null);

  // Init navigate
  const navigate = useNavigate();

  // Get summoner name from url
  let { selectedRegion, summonerName, riotId } = useParams();
  summonerName = summonerName.toLowerCase();
  riotId = riotId.toUpperCase();

  // Set region string name
  let regionStr = ''
  if (selectedRegion === 'na1') {
    regionStr = 'North America'
  }
  else if (selectedRegion === 'euw1') {
    regionStr = 'Europe West'
  }
  else if (selectedRegion === 'br1') {
    regionStr = 'Brazil'
  }
  else if (selectedRegion === 'eun1') {
    regionStr = 'Europe Nordic & East'
  }
  else if (selectedRegion === 'la1') {
    regionStr = 'Latin America North'
  }
  else if (selectedRegion === 'la2') {
    regionStr = 'Latin America South'
  }
  else if (selectedRegion === 'oc1') {
    regionStr = 'Oceania'
  }
  else if (selectedRegion === 'ru') {
    regionStr = 'Russia'
  }
  else if (selectedRegion === 'tr1') {
    regionStr = 'Turkey'
  }
  else if (selectedRegion === 'jp1') {
    regionStr = 'Japan'
  }
  else if (selectedRegion === 'kr') {
    regionStr = 'Korea'
  }
  else if (selectedRegion === 'ph2') {
    regionStr = 'The Philippines'
  }
  else if (selectedRegion === 'sg2') {
    regionStr = 'Singapore'
  }
  else if (selectedRegion === 'tw2') {
    regionStr = 'Taiwan'
  }
  else if (selectedRegion === 'th2') {
    regionStr = 'Thailand'
  }
  else if (selectedRegion === 'vn2') {
    regionStr = 'Vietnam'
  }

  // Set the current ddragon version
  const getDataDragonVersion = useCallback(async () => {
    axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
      .then(function (response) {
        const currentVersion = response.data[0];
        setDataDragonVersion(currentVersion);
        getChampsJSON(currentVersion);
      })
      .catch(function (response) {
        // console.log('Error: Error fetching datadragon version')
      })
  }, [])

  const [loadingMatches, setLoadingMatches] = useState(false);

  // Update matches involving user can increase limit later
  const updateUserMatchInfo = useCallback(async (data) => {
    let historyData = data.historyData
    setHistoryState(historyData)
    let newMatchDataArray = [];
    // let riotApiCallCount = 0;

    setLoadingMatches(true)

    if (data.status === 400) {
      navigate(`/nosummoner/${summonerName}/${riotId}`);
    }

    if (historyData.length < 1) {
      setMatchData([]);
      setMatchesLoaded(true);
      setLoadingMatches(false);
    }
    else if (historyData.length >= 1) {
      for (let i = 0; i < 5; i++) {
        // check if match already exists
        const docRef = doc(firestore, `${selectedRegion}-matches`, historyData[i]);
        // console.log('Reading from firestore (checking match exists)')
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          if (!docSnap.data().matchData.status) {
            newMatchDataArray.push(docSnap.data().matchData);
          }
        }
        else {
          let dateRetrieved = new Date()
          // get match information
          const matchResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/matchinfo?alternateRegion=${matchRegion}&matchId=${historyData[i]}`);
          // riotApiCallCount += 1;

          // break loop if game too old
          if (new Date(matchResponse.data.info.gameStartTimestamp + 7776000000) < new Date()) {
            // if first game too old, rest must be
            if (i === 0) {
              break;
            }
            else {
              continue;
            }
          }

          let matchData = null

          if (matchResponse.status === 200) {
            matchData = matchResponse.data;
          }
          const newDocRef = doc(collection(firestore, `${selectedRegion}-matches`), historyData[i]);

          if (matchResponse.status === 200 && (new Date((matchData.info.gameStartTimestamp) + 7776000000)) > new Date()) {
            // console.log('WRITING TO FIRESTORE (match)')
            await setDoc(newDocRef, {
              dateRetrieved: dateRetrieved,
              matchData: matchData,
              expiration: new Date((matchData.info.gameStartTimestamp) + 7776000000)
            });
          }

          // setMatchData(matchData);
          if (matchData !== null) {
            newMatchDataArray.push(matchData);
          }
        }
      }
      // console.log(`CALLED RIOT API ${riotApiCallCount} TIMES`)
      setHistoryIndex(newMatchDataArray.length)
      setMatchData(newMatchDataArray);
      setMatchesLoaded(true);
      setLoadingMatches(false);
    }
  }, [matchRegion, selectedRegion, riotId, summonerName, navigate])

  // Load additional matches for the player
  const handleLoadMore = async () => {
    setLoadingMore(true)
    let newMatchDataArray = [...matchData];
    // let riotApiCallCount = 0;

    if (!allLoaded) {
      for (let i = historyIndex; i < historyIndex + 5; i++) {
        // check if match already exists
        const docRef = doc(firestore, `${selectedRegion}-matches`, historyState[i]);
        // console.log('Reading from firestore (checking match exists)')
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          newMatchDataArray.push(docSnap.data().matchData);
        }

        else {
          let dateRetrieved = new Date()
          // get match information
          const matchResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/matchinfo?alternateRegion=${matchRegion}&matchId=${historyState[i]}`);
          // riotApiCallCount += 1;

          // break loop if game too old
          if (new Date(matchResponse.data.info.gameStartTimestamp + 7776000000) < new Date()) {
            // if first game too old, rest must be
            if (i === 0) {
              break;
            }
            else {
              continue;
            }
          }

          let matchData = null
          if (matchResponse.status === 200) {
            matchData = matchResponse.data;
          }

          const newDocRef = doc(collection(firestore, `${selectedRegion}-matches`), historyState[i]);

          if (matchResponse.status === 200 && (new Date((matchData.info.gameStartTimestamp) + 7776000000)) > new Date()) {
            // console.log('WRITING TO FIRESTORE (match)')
            await setDoc(newDocRef, {
              dateRetrieved: dateRetrieved,
              matchData: matchData,
              expiration: new Date((matchData.info.gameStartTimestamp) + 7776000000)
            });
          }

          // setMatchData(matchData);
          if (matchData !== null) {
            newMatchDataArray.push(matchData);
          }
        }
      }
    }

    // console.log(`CALLED RIOT API ${riotApiCallCount} TIMES`)
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
    // console.log('Reading from firestore (checking user)')
    const docSnap = await getDoc(docRef);

    // Reset load more button
    setAllLoaded(false);

    // Load summoner profile from firestore
    if (docSnap.exists()) {
      setSummonerData(docSnap.data());
      updateUserMatchInfo(docSnap.data());
      setTimeSinceUpdated(docSnap.data().lastUpdated.seconds);
      // Reset update button if aplicable
      const lastUpdatedDate = new Date(docSnap.data().lastUpdated.seconds * 1000);
      const now = new Date();
      const timeDifferenceInSeconds = Math.floor((now - lastUpdatedDate) / 1000);
      if (timeDifferenceInSeconds < 120) {
        setDisableUpdateButton(true)
      } else {
        setDisableUpdateButton(false)
      }
    }

    // Create new summoner profile on firestore
    else {
      try {
        // let riotApiCallCount = 0
        const puuidResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/puuid?alternateRegion=${alternateRegion}&summonerName=${summonerName}&riotId=${riotId}`);
        // riotApiCallCount += 1
        const puuidData = puuidResponse.data;


        // If summoner does not exist anywhere
        if (puuidResponse.status === 400) {
          navigate(`/nosummoner/${summonerName}/${riotId}`)
        }

        const summonerResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/summoner?selectedRegion=${selectedRegion}&puuid=${puuidData.puuid}`);
        // riotApiCallCount += 1
        const summonerResData = summonerResponse.data;

        const rankedResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/ranked?selectedRegion=${selectedRegion}&summonerId=${summonerResData.id}`);
        // riotApiCallCount += 1
        const rankedData = rankedResponse.data;

        const historyResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/history?alternateRegion=${matchRegion}&puuid=${puuidData.puuid}`);
        // riotApiCallCount += 1
        const historyData = historyResponse.data;

        const masteryResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/mastery?selectedRegion=${selectedRegion}&puuid=${puuidData.puuid}&count=3`)
        // riotApiCallCount += 1
        const masteryData = masteryResponse.data;

        // console.log(`CALLED RIOT API: ${riotApiCallCount} times`)

        // if match history is empty set matchesLoaded to true
        if (historyData.length < 1) {
          setMatchesLoaded(true);
        }

        let lastUpdated = new Date();
        const newDocRef = doc(collection(firestore, `${selectedRegion}-users`), `${summonerName}-${riotId}`);
        const data = {
          lastUpdated: lastUpdated,
          summonerData: summonerResData,
          rankedData: rankedData,
          historyData: historyData,
          masteryData: masteryData
        }
        if (puuidData.status !== 400 && puuidData.status !== 404) {
          // console.log('WRITING TO FIRESTORE')
          await setDoc(newDocRef, {
            lastUpdated: lastUpdated,
            summonerData: summonerResData,
            rankedData: rankedData,
            historyData: historyData,
            masteryData: masteryData
          });
        }
        setSummonerData(data);
        updateUserMatchInfo(data);
        setTimeLastUpdated('Just now');
        setDisableUpdateButton(true);
      } catch (error) {
        navigate(`/nosummoner/${summonerName}/${riotId}`)
      }
    }
    return;
  }, [alternateRegion, matchRegion, navigate, riotId, selectedRegion, summonerName, updateUserMatchInfo])

  // Update user document in firestore
  const updateUserFirestore = async () => {
    try {
      setIsLoadingRank(true);
      setRankIndex(null);
      // let riotApiCallCount = 0

      const puuidResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/puuid?alternateRegion=${alternateRegion}&summonerName=${summonerName}&riotId=${riotId}`);
      // riotApiCallCount += 1
      const puuidData = puuidResponse.data;

      const summonerResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/summoner?selectedRegion=${selectedRegion}&puuid=${puuidData.puuid}`);
      // riotApiCallCount += 1
      const summonerData = summonerResponse.data;

      const rankedResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/ranked?selectedRegion=${selectedRegion}&summonerId=${summonerData.id}`);
      // riotApiCallCount += 1
      const rankedData = rankedResponse.data;

      const historyResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/history?alternateRegion=${matchRegion}&puuid=${summonerData.puuid}`);
      // riotApiCallCount += 1
      const historyData = historyResponse.data;

      const masteryResponse = await axios.get(`${process.env.REACT_APP_REST_URL}/mastery?selectedRegion=${selectedRegion}&puuid=${puuidData.puuid}&count=3`)
      // riotApiCallCount += 1
      const masteryData = masteryResponse.data;

      // console.log(`CALLED RIOT API: ${riotApiCallCount} times`)

      let lastUpdated = new Date()
      const docRef = doc(firestore, `${selectedRegion}-users`, `${summonerName}-${riotId}`);
      const data = {
        lastUpdated: lastUpdated,
        summonerData: summonerData,
        rankedData: rankedData,
        historyData: historyData,
        masteryData: masteryData
      }
      await updateDoc(docRef, {
        lastUpdated: lastUpdated,
        summonerData: summonerData,
        rankedData: rankedData,
        historyData: historyData,
        masteryData: masteryData
      });
      setSummonerData(data);
      updateUserMatchInfo(data);
      setTimeLastUpdated('Just now');
      setDisableUpdateButton(true);
      setIsLoadingRank(false);
    }
    catch (error) {
      navigate(`/nosummoner/${summonerName}/${riotId}`)
    }
    return;
  }

  // Update summoner level background color based on rank
  useEffect(() => {
    if (summonerData) {
      if (summonerData.rankedData.length > 0) {
        if (summonerData.rankedData[0].tier === "IRON") {
          setLevelBG('#2D1E1A')
        }
        else if (summonerData.rankedData[0].tier === "BRONZE") {
          setLevelBG('#845850')
        }
        else if (summonerData.rankedData[0].tier === "SILVER") {
          setLevelBG('#687681')
        }
        else if (summonerData.rankedData[0].tier === "GOLD") {
          setLevelBG('#B68D52')
        }
        else if (summonerData.rankedData[0].tier === "PLATINUM") {
          setLevelBG('#278FAC')
        }
        else if (summonerData.rankedData[0].tier === "EMERALD") {
          setLevelBG('#047F46')
        }
        else if (summonerData.rankedData[0].tier === "DIAMOND") {
          setLevelBG('#486DC7')
        }
        else if (summonerData.rankedData[0].tier === "MASTER") {
          setLevelBG('#C37FB4')
        }
        else if (summonerData.rankedData[0].tier === "GRANDMASTER") {
          setLevelBG('#9E2C22')
        }
        else if (summonerData.rankedData[0].tier === "CHALLENGER") {
          setLevelBG('#4B78E4')
        }
      } else {
        setLevelBG('grey')
      }
    }
  }, [summonerData])

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
  }, [dataDragonVersion, getDataDragonVersion])

  // Get summoner data on page load
  useEffect(() => {

    setIsLoadingRank(true);

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

    // Get summonerData from firestore
    if (summonerName !== null && selectedRegion !== null && alternateRegion !== null) {
      getUserFromFirestore();
    }

  }, [summonerName, selectedRegion, alternateRegion, matchRegion, riotId, getUserFromFirestore])

  // Handle favorite click
  const handleFavoriteClick = () => {
    const favorites = localStorage.getItem('favorites')

    let rank = null
    // Select highest rank to display on profile
    if (summonerData.rankedData.length > 0) {
      let rankedValues = {
        'IRON': 0,
        'BRONZE': 1,
        'SILVER': 2,
        'GOLD': 3,
        'PLATINUM': 4,
        'EMERALD': 5,
        'DIAMOND': 6,
        'MASTER': 7,
        'GRANDMASTER': 8,
        'CHALLENGER': 9
      }
      let tierValues = {
        'IV': 0,
        'III': 1,
        'II': 2,
        'I': 3
      }
      let highestRank = 0;
      let highestRankIndex = null;
      let highestTierValue = 0;
      for (let i = 0; i < summonerData.rankedData.length; i++) {
        if (summonerData.rankedData[i].queueType === 'RANKED_FLEX_SR' || summonerData.rankedData[i].queueType === 'RANKED_SOLO_5x5') {
          if (rankedValues[summonerData.rankedData[i].tier] > highestRank) {
            highestRank = rankedValues[summonerData.rankedData[i].tier]
            highestRankIndex = i
            highestTierValue = tierValues[summonerData.rankedData[i].rank]
          }
          // If rank same (eg. silver and silver) pick higher tier
          else if (rankedValues[summonerData.rankedData[i].tier] === highestRank) {
            if (tierValues[summonerData.rankedData[i].rank] > highestTierValue) {
              highestTierValue = summonerData.rankedData[i].rank
              highestRankIndex = i
            }
          }
        }
      }
      rank = `${summonerData.rankedData[highestRankIndex].tier} ${summonerData.rankedData[highestRankIndex].rank}`
    }

    const summonerObj = {
      puuid: playerData.puuid,
      selectedRegion: selectedRegion,
      summonerName: playerData.riotIdGameName,
      riotId: playerData.riotIdTagline,
      icon: summonerData.summonerData.profileIconId,
      level: summonerData.summonerData.summonerLevel,
      rank: rank
    }
    if (favorited === false) {
      setFavorited(true)
      if (favorites === null) {
        const newArr = [summonerObj]
        localStorage.setItem('favorites', JSON.stringify(newArr))
      } else {
        const parsedArr = JSON.parse(favorites)
        if (!parsedArr.some(obj =>
          obj.selectedRegion === summonerObj.selectedRegion &&
          obj.summonerName === summonerObj.summonerName &&
          obj.riotId === summonerObj.riotId
        )) {
          parsedArr.push(summonerObj)
          localStorage.setItem('favorites', JSON.stringify(parsedArr))
        }
      }
    } else {
      setFavorited(false)
      if (favorites !== null) {
        let favsArr = JSON.parse(favorites)
        favsArr = favsArr.filter(obj =>
          !(obj.selectedRegion === summonerObj.selectedRegion &&
            obj.summonerName === summonerObj.summonerName &&
            obj.riotId === summonerObj.riotId))
        let favsStr = JSON.stringify(favsArr)
        localStorage.setItem('favorites', favsStr)
      }
    }
  }

  // Get champion JSON data from riot
  const getChampsJSON = async (currentVersion) => {
    try {
      const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/en_US/champion.json`);
      const data = await response.json();
      setChampsJSON(data);
    } catch (error) {
    }
  }

  // Render page once data is loaded
  const [rankIndex, setRankIndex] = useState(null);
  const [isLoadingRank, setIsLoadingRank] = useState(true);
  useEffect(() => {
    if (summonerData !== null && matchesLoaded === true && matchData !== null && summonerData !== undefined && matchData !== undefined) {
      setFavorited(false)

      // Select highest rank to display on profile
      if (summonerData.rankedData.length > 0) {
        let rankedValues = {
          'IRON': 0,
          'BRONZE': 1,
          'SILVER': 2,
          'GOLD': 3,
          'PLATINUM': 4,
          'EMERALD': 5,
          'DIAMOND': 6,
          'MASTER': 7,
          'GRANDMASTER': 8,
          'CHALLENGER': 9
        }
        let tierValues = {
          'IV': 0,
          'III': 1,
          'II': 2,
          'I': 3
        }
        let highestRank = 0;
        let highestRankIndex = null;
        let highestTierValue = 0;
        for (let i = 0; i < summonerData.rankedData.length; i++) {
          if (summonerData.rankedData[i].queueType === 'RANKED_FLEX_SR' || summonerData.rankedData[i].queueType === 'RANKED_SOLO_5x5') {
            if (rankedValues[summonerData.rankedData[i].tier] > highestRank) {
              highestRank = rankedValues[summonerData.rankedData[i].tier]
              highestRankIndex = i
              highestTierValue = tierValues[summonerData.rankedData[i].rank]
            }
            // If rank same (eg. silver and silver) pick higher tier
            else if (rankedValues[summonerData.rankedData[i].tier] === highestRank) {
              if (tierValues[summonerData.rankedData[i].rank] > highestTierValue) {
                highestTierValue = summonerData.rankedData[i].rank
                highestRankIndex = i
              }
            }
          }
        }
        setRankIndex(highestRankIndex)
        setIsLoadingRank(false);
      }

      else {
        setRankIndex(null);
        setIsLoadingRank(false);
      }

      // Find player data
      if (matchData.length > 0) {
        setPlayerData(matchData[0].info.participants.find(player => player.puuid === summonerData.summonerData.puuid))
      }
      else {
        let dummyPlayerData = {
          riotIdGameName: summonerName,
          riotIdTagline: riotId
        }
        setPlayerData(dummyPlayerData)
      }
    }
  }, [summonerData, matchData, matchesLoaded, riotId, summonerName])

  useEffect(() => {
    if (playerData !== undefined && playerData !== null) {
      document.title = `${playerData.riotIdGameName}#${riotId} - ${selectedRegion}`;

      // Add summoner to local storage
      const recentSearches = localStorage.getItem('recentSearches')

      let rank = null
      // Select highest rank to display on profile
      if (summonerData.rankedData.length > 0) {
        let rankedValues = {
          'IRON': 0,
          'BRONZE': 1,
          'SILVER': 2,
          'GOLD': 3,
          'PLATINUM': 4,
          'EMERALD': 5,
          'DIAMOND': 6,
          'MASTER': 7,
          'GRANDMASTER': 8,
          'CHALLENGER': 9
        }
        let tierValues = {
          'IV': 0,
          'III': 1,
          'II': 2,
          'I': 3
        }
        let highestRank = 0;
        let highestRankIndex = 0;
        let highestTierValue = 0;
        for (let i = 0; i < summonerData.rankedData.length; i++) {
          if (summonerData.rankedData[i].queueType === 'RANKED_FLEX_SR' || summonerData.rankedData[i].queueType === 'RANKED_SOLO_5x5') {
            if (rankedValues[summonerData.rankedData[i].tier] > highestRank) {
              highestRank = rankedValues[summonerData.rankedData[i].tier]
              highestRankIndex = i
              highestTierValue = tierValues[summonerData.rankedData[i].rank]
            }
            // If rank same (eg. silver and silver) pick higher tier
            else if (rankedValues[summonerData.rankedData[i].tier] === highestRank) {
              if (tierValues[summonerData.rankedData[i].rank] > highestTierValue) {
                highestTierValue = summonerData.rankedData[i].rank
                highestRankIndex = i
              }
            }
          }
        }
        rank = `${summonerData.rankedData[highestRankIndex].tier} ${summonerData.rankedData[highestRankIndex].rank}`
      }

      const summonerObj = {
        puuid: playerData.puuid,
        selectedRegion: selectedRegion,
        summonerName: playerData.riotIdGameName,
        riotId: playerData.riotIdTagline,
        icon: summonerData.summonerData.profileIconId,
        level: summonerData.summonerData.summonerLevel,
        rank: rank
      }

      // Set favorited if in local storage
      let favsStr = localStorage.getItem('favorites')
      let favsArr = JSON.parse(favsStr)
      if (favsArr) {
        if (favsArr.some(obj =>
          obj.selectedRegion === summonerObj.selectedRegion &&
          obj.summonerName === summonerObj.summonerName &&
          obj.riotId === summonerObj.riotId &&
          obj.puuid === summonerObj.puuid
        )) {
          // Update favorite summoner info
          favsArr = favsArr.map(obj => {
            if (
              obj.selectedRegion === summonerObj.selectedRegion &&
              obj.summonerName === summonerObj.summonerName &&
              obj.riotId === summonerObj.riotId &&
              obj.puuid === summonerObj.puuid
            ) {
              return {
                ...obj,
                ...summonerObj
              }
            }
            return obj;
          })
          setFavorited(true);
          localStorage.setItem('favorites', JSON.stringify(favsArr))
          // Create favorites array if not exist
        }
      }
      else if (favsArr === null) {
        localStorage.setItem('favorites', JSON.stringify([]))
      }

      if (recentSearches === null) {
        const newArr = [summonerObj]
        localStorage.setItem('recentSearches', JSON.stringify(newArr))
      }
      else {
        const parsedArr = JSON.parse(recentSearches)
        // Less than 9 recent searches
        if (parsedArr.length < 9 && !parsedArr.some(obj =>
          obj.selectedRegion === summonerObj.selectedRegion &&
          obj.summonerName === summonerObj.summonerName &&
          obj.riotId === summonerObj.riotId &&
          obj.puuid === summonerObj.puuid
        )) {
          parsedArr.push(summonerObj)
          localStorage.setItem('recentSearches', JSON.stringify(parsedArr))
        }

        // If already 9 recent searches and NOT current summoner one of them
        if (parsedArr.length >= 9 && !parsedArr.some(obj =>
          obj.selectedRegion === summonerObj.selectedRegion &&
          obj.summonerName === summonerObj.summonerName &&
          obj.riotId === summonerObj.riotId &&
          obj.puuid === summonerObj.puuid
        )) {
          parsedArr.shift()
          parsedArr.push(summonerObj)
          localStorage.setItem('recentSearches', JSON.stringify(parsedArr))
        }
      }
    }
  }, [playerData, riotId, selectedRegion, summonerData]);


  useEffect(() => {

    if (matchesLoaded && playerData !== undefined && matchData !== undefined && matchData !== null) {
      setIsLoading(false);
    }

  }, [playerData, matchData, matchesLoaded])

  useEffect(() => {
    if (matchesLoaded === true) {
      setIsLoading(false);
    }
    else {
      setIsLoading(true);
    }
  }, [matchesLoaded])

  if (isLoading === true || !playerData === true) {
    return (
      <Box>
        <LinearProgress></LinearProgress>
      </Box>
    )
  }

  else {
    return (

      <Box>
        <Grid container display={'flex'} marginTop={'35px'} justifyContent={'center'}>
          <Grid className='summonerProfilePicture'>
            <Grid style={{ margin: 'auto', justifyContent: 'center', position: 'relative', display: 'flex', paddingRight: '30px' }}>
              <Typography style={{
                position: 'absolute',
                top: '-5px',
                margin: 'auto',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundColor: levelBG,
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '10px',
                paddingLeft: '10px',
                paddingRight: '10px',
                paddingTop: '1px',
                paddingBottom: '1px',
                filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.8))'
              }}>{summonerData.summonerData.summonerLevel}
              </Typography>
              <img style={{
                borderRadius: '100%',
                border: '6px solid white',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.25)',
                margin: 'auto',
                marginRight: '0px',
                width: '170px',
                marginBottom: '10px',
                justifyContent: 'center'
              }}
                src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${summonerData.summonerData.profileIconId}.png`} alt=''>
              </img>
              <FavoriteIcon
                onClick={handleFavoriteClick}
                className={favorited === false ? 'favoriteButtonInactive' : 'favoriteButtonActive'}
                style={{
                  verticalAlign: 'top',
                  top: '10px',
                  right: '6px',
                  fontSize: '1.875rem',
                  position: 'absolute'
                }}>
              </FavoriteIcon>
            </Grid>
            <Grid style={{ margin: 'auto', textAlign: 'center', paddingRight: '30px', marginTop: '12px' }}>
              <Button style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))', marginBottom: '10px', width: '130px' }} disabled={disableUpdateButton} onClick={updateUserFirestore} variant='contained' endIcon={<SyncIcon></SyncIcon>}>Update</Button>
              <Typography style={{ fontSize: '0.75rem', color: '#4E4E4E' }}>Updated: {timeLastUpdated}</Typography>
            </Grid>
          </Grid>

          <Grid display={'flex'} flexDirection={'column'} marginTop={'0px'}>
            <Divider className='hideDesktop' variant="middle" width={'50%'} style={{ margin: 'auto', marginTop: '10px', marginBottom: '25px' }} flexItem />
            <Grid className='summonerRankedInfoContainer'>
              {rankIndex !== null && !isLoadingRank ? (
                <Grid>
                  <List style={{ lineHeight: '22px' }}>
                    {playerData ? (
                      <ListItem className='summonerProfileRiotName'>{playerData.riotIdGameName} #{riotId}</ListItem>
                    ) : (
                      <ListItem style={{ fontWeight: 'bolder' }}><Box><LinearProgress></LinearProgress></Box></ListItem>
                    )}
                    <ListItem style={{ fontWeight: '500', color: '#404040' }}>{regionStr}</ListItem>
                    {summonerData.rankedData &&
                      <ListItem style={{ fontWeight: '500', color: '#404040' }}>{(summonerData.rankedData[rankIndex]?.tier)?.charAt(0) + summonerData.rankedData[rankIndex]?.tier.substring(1).toLowerCase()} {summonerData.rankedData[rankIndex]?.rank}</ListItem>
                    }
                    {summonerData.rankedData &&
                      <ListItem style={{ fontWeight: '500', color: '#404040' }}>{summonerData.rankedData[rankIndex]?.wins}W {summonerData.rankedData[rankIndex]?.losses}L {((summonerData.rankedData[rankIndex]?.wins / (summonerData.rankedData[rankIndex]?.wins + summonerData.rankedData[rankIndex]?.losses)) * 100)?.toFixed(0)}%</ListItem>
                    }
                  </List>
                </Grid>
              ) : isLoadingRank ? (
                // skeleton loader
                <div style={{ marginTop: '20px', marginRight: '12px', marginLeft: '10px' }}>
                  <Skeleton animation='wave' style={{ marginBottom: '12px', borderRadius: '3px' }} variant='rectangular' width={150} height={23} />
                  <Skeleton animation='wave' style={{ marginBottom: '12px', borderRadius: '3px' }} variant='rectangular' width={150} height={23} />
                  <Skeleton animation='wave' style={{ marginBottom: '12px', borderRadius: '3px' }} variant='rectangular' width={150} height={23} />
                  <Skeleton animation='wave' style={{ marginBottom: '12px', borderRadius: '3px' }} variant='rectangular' width={150} height={23} />
                </div>
              ) : (
                <Grid className='summonerRankedInfoUnranked' style={{ marginBottom: '15px' }}>
                  <List style={{ lineHeight: '22px' }}>
                    {playerData ? (
                      <ListItem style={{ fontWeight: 'bolder' }}>{playerData.riotIdGameName} #{riotId}</ListItem>
                    ) : (
                      <ListItem style={{ fontWeight: 'bolder' }}>{summonerName} #{riotId}</ListItem>
                    )}
                    <ListItem style={{ fontWeight: '500', color: '#404040' }}>{regionStr}</ListItem>
                    <ListItem style={{ fontWeight: '500', color: '#404040' }}>Unranked</ListItem>
                  </List>
                </Grid>
              )}

              <Grid className='summonerProfileInformation'>
                {rankIndex !== null && !isLoadingRank ? (
                  <div>
                    <Tooltip
                      slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -40] } }] } }}
                      placement='top'
                      arrow
                      disableInteractive
                      title={<>
                        <div>
                          <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{summonerData.rankedData[rankIndex]?.queueType === 'RANKED_SOLO_5x5' ? 'Ranked Solo' : 'Ranked Flex'}<br></br></span>
                          {(summonerData.rankedData[rankIndex]?.tier)?.charAt(0) + summonerData.rankedData[rankIndex]?.tier.substring(1).toLowerCase()} {summonerData.rankedData[rankIndex]?.rank} - {summonerData.rankedData[rankIndex]?.leaguePoints} lp
                        </div>
                      </>}
                    >
                      <img alt='Rank Badge' style={{
                        backgroundColor: '#E3E3E3',
                        borderRadius: '100%',
                        border: '4px white solid',
                        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25',
                        maxWidth: '150px',
                      }}
                        src={`/images/rankIcons/Rank=${(summonerData.rankedData[rankIndex]?.tier)?.charAt(0) + summonerData.rankedData[rankIndex]?.tier.substring(1).toLowerCase()}.webp`}>
                      </img>
                    </Tooltip>
                    <Typography style={{
                      position: 'absolute',
                      margin: 'auto',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#949494',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      borderRadius: '10px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      paddingTop: '1px',
                      paddingBottom: '1px',
                      bottom: '4px',
                      filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.45))'
                    }}>
                      {summonerData.rankedData[0]?.leaguePoints} lp
                    </Typography>
                  </div>
                ) : isLoadingRank ? (
                  // skeleton loader
                  <div>
                    <Skeleton animation='wave' style={{ marginTop: '5px' }} variant='circular' width={150} height={150}></Skeleton>
                  </div>
                ) : (
                  <div></div>
                )
                }
              </Grid>
            </Grid>
            <Grid className="summonerProfileMastery" xs={12}>
              {isLoadingRank ? (
                // Skeleton loaders while mastery data is loading
                <Grid display="flex">
                  {[...Array(3)].map((_, index) => (
                    <Grid key={index} marginRight={index < 2 ? '20px' : '0'} flex="column">
                      <Skeleton variant="circular" width={65} height={65} />
                      <Skeleton variant="text" width={35} height={25} style={{ margin: 'auto', marginTop: '5px' }} />
                    </Grid>
                  ))}
                </Grid>
              ) : summonerData.masteryData.length > 0 ? (
                // Display mastery images once data is loaded
                <Grid display="flex">
                  {summonerData.masteryData.slice(0, 3).map((mastery, index) => {
                    const champion = Object.values(champsJSON.data).find(champ => champ.key === String(mastery.championId));

                    return (
                      <Grid key={index} marginRight={index < 2 ? '20px' : '0'} flex="column">
                        <Tooltip
                          disableInteractive
                          placement="top"
                          arrow
                          slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -6] } }] } }}
                          title={
                            <>
                              <div style={{ textDecoration: 'underline' }}>{champion?.name}</div>
                              <div>Level: {mastery.championLevel}</div>
                              <div>Mastery: {mastery.championPoints.toLocaleString()}</div>
                            </>
                          }
                        >
                          <img
                            style={{
                              borderRadius: '100%',
                              border: '3px solid white',
                              width: '65px',
                              filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
                            }}
                            src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${champion?.id}.png`}
                            alt=""
                          />
                        </Tooltip>
                        <Typography
                          style={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            backgroundColor: '#606060',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '5px',
                            width: '50%',
                            paddingLeft: '3px',
                            paddingRight: '3px',
                            margin: 'auto',
                            filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
                          }}
                        >
                          {mastery.championLevel}
                        </Typography>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                // Default placeholders when no mastery data exists
                <Grid display="flex">
                  {[...Array(3)].map((_, index) => (
                    <img
                      key={index}
                      style={{
                        marginRight: index < 2 ? '20px' : '0',
                        borderRadius: '100%',
                        border: '3px solid white',
                        width: '65px',
                        filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))'
                      }}
                      src={`/images/novalue.webp`}
                      alt=""
                    />
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>

        <Box
          className='displayGamesMainContainer'
          sx={{
            justifyContent: 'center',
            width: { xs: '100%', sm: '80%', lg: '50%', xl: '37%' },
            margin: 'auto',
            borderRadius: '5px',
            marginTop: '20px',
            paddingTop: '10px',
            paddingBottom: '25px'
          }}
        >
          {
            loadingMatches ? (
              <div style={{ textAlign: 'center', marginTop: '50px', margin: 'auto' }}>
                <CircularProgress style={{ marginTop: '30px' }} />
              </div>
            ) : matchData === null || matchData.length === 0 || matchData === -1 ? (
              // Display NO MATCHES FOUND
              <div>
                <Grid xs={12} display={'flex'} justifyContent={'center'} flexDirection={'column'} margin={'auto'} marginTop={'20px'}>
                  <Typography style={{ textAlign: 'center' }}>No recent matches!</Typography>
                </Grid>
              </div>
            ) : playerData ? (  // Check if playerData is defined
              matchData.map((gameData, index) => {
                let gameModeHref = "";

                if ((gameData.info.gameMode === "CLASSIC" || gameData.info.gameMode === "SWIFTPLAY") && gameData.info.gameDuration > 300) {
                  gameModeHref = `/match/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`;
                } else if (gameData.info.gameMode === "CLASSIC" && gameData.info.gameDuration < 300) {
                  gameModeHref = `/altmatch/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`;
                } else if (gameData.info.gameMode === "ARAM") {
                  gameModeHref = `/aram/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`;
                }
                else if (gameData.info.gameMode === "URF") {
                  gameModeHref = `/altmatch/${gameData.metadata.matchId}/${playerData.riotIdGameName}/${playerData.riotIdTagline}`
                }
                else if (gameData.info.gameMode === "CHERRY") {
                  gameModeHref = "/Test";
                } else {
                  gameModeHref = "/Test";
                }


                let gameDataPayload = {
                  "gameData": gameData,
                  "alternateRegion": alternateRegion,
                  "dataDragonVersion": dataDragonVersion
                };

                return (
                  <a
                    style={{ textDecoration: 'inherit', color: 'inherit' }}
                    onMouseDown={(e) => {
                      // Set localStorage for all mouse buttons immediately
                      localStorage.setItem('gameData', JSON.stringify(gameDataPayload));
                    }}
                    onClick={(e) => {
                      // Handle left-click only
                      if (e.button === 0) {
                        e.preventDefault();
                        window.location.href = gameModeHref;
                      }
                      // Middle-click (button 1) and right-click (button 2) will use native <a> behavior
                    }}
                    className="DisplayGameContainer"
                    href={gameModeHref}
                    key={index}
                  >
                    <DisplayGame
                      gameData={gameData}
                      dataDragonVersion={dataDragonVersion}
                      puuid={summonerData.summonerData.puuid}
                    />
                  </a>
                );

              })
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Typography style={{ textAlign: 'center' }}>Player data is not available!</Typography>
              </div>
            )
          }

        </Box>

        {!loadingMatches &&
          <Grid style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', marginBottom: '35px' }}>
            {!allLoaded ? (
              !loadingMore && !(matchData === null || matchData.length === 0 || matchData === -1) ? (
                <Button onClick={() => handleLoadMore()} variant="contained">
                  Load more
                </Button>
              ) : (
                !(matchData === null || matchData.length === 0 || matchData === -1) ? (
                  <Button variant="contained" disabled>
                    <CircularProgress style={{ color: 'white' }} />
                  </Button>
                ) : (
                  <div></div>
                )
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