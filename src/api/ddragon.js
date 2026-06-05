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

// Latest patch version. Cached in-memory only (NOT sessionStorage) so a new
// patch is picked up on the next hard reload, while still avoiding the
// per-page refetch during a single session's navigations.
export const getVersion = async () => {
  if (memoryCache['ddragon-version']) {
    return memoryCache['ddragon-version'];
  }
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await response.json();
  const latest = versions[0];
  memoryCache['ddragon-version'] = latest;
  return latest;
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

// Summoner spells ({ data: {...} }) and rune trees (array). Version-keyed, so a
// new patch produces a new cache key and auto-refetches.
export const getSummonerSpells = (version) =>
  fetchCached(
    `ddragon-summoner-${version}`,
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`
  );

export const getRunes = (version) =>
  fetchCached(
    `ddragon-runes-${version}`,
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`
  );

// Queue id -> mode metadata. Not version-keyed on the CDN, and new queues are
// added when Riot ships new modes, so cache in-memory only (refetched each
// session = always current) rather than persisting a snapshot.
export const getQueues = async () => {
  if (memoryCache['ddragon-queues']) {
    return memoryCache['ddragon-queues'];
  }
  const response = await fetch('https://static.developer.riotgames.com/docs/lol/queues.json');
  const data = await response.json();
  memoryCache['ddragon-queues'] = data;
  return data;
};
