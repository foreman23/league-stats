// Maps Riot's raw queue `description` (from queues.json) to the short, friendly
// title shown in the UI. This mapping was copy-pasted (with slightly different
// subsets and fallbacks) across GameDetails, GenericDetails, ArenaDetails, and
// DisplayGame.

const QUEUE_TITLES = {
  '5v5 Ranked Solo games': 'Ranked Solo',
  '5v5 Ranked Flex games': 'Ranked Flex',
  '5v5 Draft Pick games': 'Normal',
  "Summoner's Rift Clash games": 'SR Clash',
  '5v5 ARAM games': 'ARAM',
  'ARAM Clash games': 'ARAM Clash',
  'ARURF games': 'ARURF',
  'URF games': 'URF',
  Arena: 'Arena',
};

// Returns the friendly title for a queue description, or `fallback` when the
// description isn't recognized. Callers pass different fallbacks ('Game',
// 'Featured Mode', the raw description, or null to handle the miss themselves).
export const queueTitle = (description, fallback = null) => {
  const title = QUEUE_TITLES[description];
  return title !== undefined ? title : fallback;
};
