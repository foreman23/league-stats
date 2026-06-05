// Cached access to DataDragon static data (champion.json / item.json).
//
// These payloads are large (champion ~160KB, item ~580KB) and never change for
// a given patch version, yet the app fetches them on every page and every
// navigation. This module memoizes them so repeated reads are free:
//   - in-memory cache: instant within a single session's SPA navigations
//   - sessionStorage: survives full page reloads (F5), per version key
//
// Each getter returns the parsed JSON object, same shape the old inline
// `fetch(...).then(r => r.json())` produced.

const memoryCache = {};

const fetchCached = async (cacheKey, url) => {
  // 1. in-memory (fastest, persists across SPA route changes)
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }

  // 2. sessionStorage (survives a hard reload)
  try {
    const stored = sessionStorage.getItem(cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      memoryCache[cacheKey] = parsed;
      return parsed;
    }
  } catch (e) {
    // sessionStorage unavailable or corrupt entry — fall through to network
  }

  // 3. network
  const response = await fetch(url);
  const data = await response.json();
  memoryCache[cacheKey] = data;
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (e) {
    // quota exceeded / unavailable — in-memory cache still applies
  }
  return data;
};

export const getChampions = (version) =>
  fetchCached(
    `ddragon-champion-${version}`,
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
  );

export const getItems = (version) =>
  fetchCached(
    `ddragon-item-${version}`,
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`
  );
