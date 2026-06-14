// Adapter: turn the real `statsAt15` data contract into the `lane` view-model
// the redesigned Laning Phase cards consume. This is the only data-shaping
// layer between Riot's match/timeline JSON and the presentational components.
//
// Real-data notes (differ from the idealized design handoff):
//   - laneResults keys are TOP | JUNGLE | MIDDLE | BOTTOM  (note MIDDLE, not MID)
//   - player.participantId is a STRING ("1".."10")
//   - laningKills are RAW Riot events: champion kills have numeric killer/victim
//     ids; ELITE_MONSTER kills get victimId 0 + a monsterType; tower/execute
//     deaths have killerId 0. They are NOT pre-filtered per lane.
//   - BOTTOM's laneWinner/laneLoser are ARRAYS of two players ([ADC|SUP]).

import { championImg, profileIconImg } from '../../api/ddragon';

// data key -> { laneKey, label, anchor }. Anchor IDs are preserved from the old
// cards (scroll targets referenced elsewhere on the page).
export const LANES = [
  { data: 'TOP', key: 'top', label: 'Top', anchor: 'laningTopAnchor' },
  { data: 'JUNGLE', key: 'jungle', label: 'Jungle', anchor: 'laningJgAnchor' },
  { data: 'MIDDLE', key: 'mid', label: 'Mid', anchor: 'laningMidAnchor' },
  { data: 'BOTTOM', key: 'bottom', label: 'Bottom', anchor: 'laningBotAnchor' },
];

// gold-difference tier label (kept independent of the headline verb / resTag)
export function goldLabel(d) {
  if (d > 3000) return 'massive lead';
  if (d > 2000) return 'big lead';
  if (d > 650) return 'advantage';
  if (d >= 150) return 'small advantage';
  return 'even';
}

const MONSTER_LABEL = {
  RIFTHERALD: 'Rift Herald',
  BARON_NASHOR: 'Baron',
  DRAGON: 'Dragon',
  ELDER_DRAGON: 'Elder Dragon',
  HORDE: 'Void Grub',
  ATAKHAN: 'Atakhan',
};
function monsterLabel(type) {
  if (!type) return 'Objective';
  if (MONSTER_LABEL[type]) return MONSTER_LABEL[type];
  // Title-case the raw enum as a fallback (e.g. "SOME_NEW_MONSTER").
  return type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Game clock "m:ss" from an event timestamp in milliseconds.
function clock(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function champEntry(championId, champsJSON) {
  return Object.values(champsJSON.data).find((c) => String(c.key) === String(championId));
}

function profileHref(platformId, name, tag) {
  return `/profile/${platformId}/${name}/${String(tag).toLowerCase()}`;
}

function roleFor(teamPosition) {
  if (teamPosition === 'UTILITY') return 'SUP';
  if (teamPosition === 'BOTTOM') return 'ADC';
  return undefined;
}

// A lightweight "actor" used by the kill feed — built for ALL ten participants
// (a kill in a lane can involve a non-laner, e.g. a jungle gank).
function toActor(p, platformId, champsJSON, ddVersion) {
  const entry = champEntry(p.championId, champsJSON);
  return {
    participantId: String(p.participantId),
    name: p.riotIdGameName,
    tag: p.riotIdTagline,
    champ: entry ? entry.name : String(p.championId),
    side: p.teamId === 100 ? 'blue' : 'purple',
    portrait: entry ? championImg(ddVersion, entry.id) : null,
    profilePic: p.profileIcon != null ? profileIconImg(ddVersion, p.profileIcon) : null,
    href: profileHref(platformId, p.riotIdGameName, p.riotIdTagline),
  };
}

// A full matchup player (portrait + name + KDA/CS, drives the summary + graph).
function toPlayer(p, laneResult, platformId, champsJSON, ddVersion) {
  const entry = champEntry(p.championId, champsJSON);
  return {
    participantId: String(p.participantId),
    name: p.riotIdGameName,
    tag: p.riotIdTagline,
    champ: entry ? entry.name : String(p.championId),
    championId: p.championId,
    teamId: p.teamId,
    side: p.teamId === 100 ? 'blue' : 'purple',
    kda: p.kdaAlt,
    cs: p.cs,
    gold: p.gold,
    role: roleFor(p.teamPosition),
    winner: laneResult.teamWonLane === p.teamId && laneResult.resTag !== 'draw',
    portrait: entry ? championImg(ddVersion, entry.id) : null,
    href: profileHref(platformId, p.riotIdGameName, p.riotIdTagline),
  };
}

// Kills filtered to this lane's participants, resolved against the full roster.
function adaptKills(laningKills, laneParticipantIds, rosterById) {
  const idSet = new Set(laneParticipantIds);
  return (laningKills || [])
    .filter((ev) => idSet.has(String(ev.killerId)) || idSet.has(String(ev.victimId)))
    .map((ev) => {
      const t = clock(ev.timestamp); // exact "m:ss"
      const position = ev.position; // {x, y} game coords (origin bottom-left)
      // ELITE_MONSTER kills are flagged with victimId 0 upstream.
      if (ev.victimId === 0) {
        const killer = rosterById[String(ev.killerId)];
        return { t, type: 'monster', killer, objective: monsterLabel(ev.monsterType), side: killer?.side, position };
      }
      // killerId 0 == tower / execution (no attributed killer).
      if (ev.killerId === 0) {
        const victim = rosterById[String(ev.victimId)];
        return { t, type: 'tower', victim, side: 'neutral', position };
      }
      const killer = rosterById[String(ev.killerId)];
      const victim = rosterById[String(ev.victimId)];
      return { t, type: 'champ', killer, victim, side: killer?.side, position };
    });
}

// Per-minute cumulative CS for this lane's players, keyed by participantId.
function adaptCS(timelineData, laners) {
  const frames = timelineData?.info?.frames || [];
  const out = {};
  laners.forEach((p) => { out[p.participantId] = []; });
  const lastIdx = Math.min(15, frames.length - 1);
  for (let m = 2; m <= lastIdx; m++) {
    const pf = frames[m]?.participantFrames;
    if (!pf) continue;
    laners.forEach((p) => {
      const f = pf[p.participantId];
      if (f) out[p.participantId].push({ m, cs: (f.minionsKilled || 0) + (f.jungleMinionsKilled || 0) });
    });
  }
  return out;
}

// Assemble one lane view-model. `laneDef` is an entry from LANES.
export function toLaneVM(laneDef, statsAt15, ctx) {
  const { champsJSON, dataDragonVersion, timelineData, gameData } = ctx;
  const lr = statsAt15.laneResults[laneDef.data];
  const platformId = gameData.info.platformId.toLowerCase();

  const winners = [].concat(lr.laneWinner); // BOTTOM is already an array
  const losers = [].concat(lr.laneLoser);
  const duo = laneDef.data === 'BOTTOM';

  // participantId -> profile-icon URL, sourced from the match data itself
  // (`profileIcon` ships with each participant — no extra query needed).
  const iconUrlById = {};
  gameData.info.participants.forEach((gp) => {
    iconUrlById[String(gp.participantId)] =
      gp.profileIcon != null ? profileIconImg(dataDragonVersion, gp.profileIcon) : null;
  });
  const laners = [...winners, ...losers].map((p) => {
    const vm = toPlayer(p, lr, platformId, champsJSON, dataDragonVersion);
    vm.profilePic = iconUrlById[vm.participantId];
    return vm;
  });

  // The VIEWED player's team renders on the LEFT, opponents on the RIGHT
  // (default to blue-left when the viewer team is unknown). Team COLORS still
  // follow teamId (blue = 100, purple = 200) via each player's `side`; only the
  // left/right placement is viewer-relative. In a duo lane, ADC sits above SUP.
  const orderDuo = (a, b) => (a.role === 'ADC' ? -1 : b.role === 'ADC' ? 1 : 0);
  const leftTeam = ctx.viewerTeam === 200 ? 200 : 100;
  const rightTeam = leftTeam === 100 ? 200 : 100;
  const teamPlayers = (t) => laners.filter((p) => p.teamId === t).sort(orderDuo);
  const left = teamPlayers(leftTeam);
  const right = teamPlayers(rightTeam);

  const rosterById = {};
  gameData.info.participants.forEach((p) => {
    rosterById[String(p.participantId)] = toActor(p, platformId, champsJSON, dataDragonVersion);
  });
  const laneIds = laners.map((p) => p.participantId);

  return {
    anchor: laneDef.anchor,
    laneKey: laneDef.key,
    laneLabel: laneDef.label,
    duo,
    resTag: lr.resTag,
    teamWonLane: lr.teamWonLane,
    leftTeam,
    goldDifference: lr.goldDifference,
    bubbleCount: lr.bubbleCount,
    left,
    right,
    kills: adaptKills(statsAt15.laningKills, laneIds, rosterById),
    cs: adaptCS(timelineData, laners),
  };
}
