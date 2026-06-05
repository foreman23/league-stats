// Thin client for the backend proxy (REACT_APP_REST_URL), which fronts Riot's
// API. These wrap the endpoint URLs that were previously hand-built inline at
// ~16 call sites. Each returns the raw axios response promise, so callers keep
// using `.data` / `.status` exactly as before.
//
// `alternateRegion` is the routing cluster (americas/sea/asia/europe);
// `selectedRegion` is the platform (na1/euw1/...). See src/utils/regions.js.
import axios from 'axios';

const BASE = process.env.REACT_APP_REST_URL;

export const getFeaturedGame = () =>
  axios.get(`${BASE}/featuredgame`);

export const getPuuid = (alternateRegion, summonerName, riotId) =>
  axios.get(`${BASE}/puuid?alternateRegion=${alternateRegion}&summonerName=${summonerName}&riotId=${riotId}`);

export const getSummoner = (selectedRegion, puuid) =>
  axios.get(`${BASE}/summoner?selectedRegion=${selectedRegion}&puuid=${puuid}`);

export const getRanked = (selectedRegion, summonerId) =>
  axios.get(`${BASE}/ranked?selectedRegion=${selectedRegion}&summonerId=${summonerId}`);

export const getHistory = (alternateRegion, puuid) =>
  axios.get(`${BASE}/history?alternateRegion=${alternateRegion}&puuid=${puuid}`);

export const getMatchInfo = (alternateRegion, matchId) =>
  axios.get(`${BASE}/matchinfo?alternateRegion=${alternateRegion}&matchId=${matchId}`);

export const getMatchTimeline = (alternateRegion, matchId) =>
  axios.get(`${BASE}/matchtimeline?alternateRegion=${alternateRegion}&matchId=${matchId}`);

export const getMastery = (selectedRegion, puuid, count = 3) =>
  axios.get(`${BASE}/mastery?selectedRegion=${selectedRegion}&puuid=${puuid}&count=${count}`);
