// Riot region / routing helpers.
//
// Riot splits "platform" regions (na1, euw1, kr, ...) from routing clusters.
// There are two cluster flavors the app needs:
//   - account cluster (account-v1 / puuid): americas | asia | europe
//   - match cluster   (match-v5):           americas | sea | asia | europe
// SEA is its own routing cluster for match-v5, but those accounts still route
// through `asia` for account-v1 — hence the two functions below.
//
// This logic used to be copy-pasted (server arrays + the SEA/OCE carve-outs)
// across SummonerSearch, SummonerProfile, Navbar, and every *Details page.

const AMERICAS_SERVERS = ['na1', 'br1', 'la1', 'la2'];
const EUROPE_SERVERS = ['eun1', 'euw1', 'tr1', 'ru'];
const ASIA_SERVERS = ['kr', 'jp1', 'oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'];
const SEA_SERVERS = ['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'];

// True for the South-East-Asia / OCE platforms that route through the `sea`
// cluster for match-v5.
export const isSeaServer = (platform) => SEA_SERVERS.includes(platform);

// account-v1 routing cluster (SEA accounts route through `asia`).
export const getAccountCluster = (platform) => {
  if (AMERICAS_SERVERS.includes(platform)) return 'americas';
  if (EUROPE_SERVERS.includes(platform)) return 'europe';
  if (ASIA_SERVERS.includes(platform)) return 'asia';
  return null;
};

// match-v5 routing cluster (SEA is split out into its own cluster).
export const getMatchCluster = (platform) => {
  if (AMERICAS_SERVERS.includes(platform)) return 'americas';
  if (EUROPE_SERVERS.includes(platform)) return 'europe';
  if (ASIA_SERVERS.includes(platform)) return isSeaServer(platform) ? 'sea' : 'asia';
  return null;
};

// Numeric dropdown value -> platform region code (used by the region selectors).
export const regionValues = {
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
  160: 'vn2',
};
