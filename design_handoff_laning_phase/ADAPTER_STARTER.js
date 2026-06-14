/* ============================================================================
 * ADAPTER STARTER — riftreport.gg Laning Phase Results
 * ----------------------------------------------------------------------------
 * The ONLY real new work to port the design. Turns the `statsAt15` data
 * contract into the `lane` view-model the card components consume.
 * Fill in the four TODOs; everything else is wired.
 *
 * Inputs available to the section: gameData, gameDuration, champsJSON,
 * dataDragonVersion, timelineData, statsAt15
 * ==========================================================================*/

export const ANCHORS = {
  TOP: "laningTopAnchor",
  JUNGLE: "laningJgAnchor",
  MID: "laningMidAnchor",
  BOTTOM: "laningBotAnchor",
};

const LANE_LABEL = { TOP: "Top", JUNGLE: "Jungle", MID: "Mid", BOTTOM: "Bottom" };
const LANE_KEY = { TOP: "top", JUNGLE: "jungle", MID: "mid", BOTTOM: "bottom" };

// gold-difference tier label (copied verbatim from the reference data.js)
export function goldLabel(d) {
  if (d > 3000) return "massive lead";
  if (d > 2000) return "big lead";
  if (d > 650) return "advantage";
  if (d >= 150) return "small advantage";
  return "even";
}

/* ---- TODO 1: championId -> champion key/name via champsJSON --------------- */
// champsJSON is Data Dragon's champion.json. Its `.data` is keyed by champion
// KEY (e.g. "Aatrox") and each entry has a numeric `.key` (as a string).
export function champName(championId, champsJSON) {
  const entry = Object.values(champsJSON.data).find(
    (c) => Number(c.key) === Number(championId)
  );
  return entry ? entry.name : String(championId); // e.g. "Aatrox", "Lee Sin"
}
export function champKey(championId, champsJSON) {
  const entry = Object.values(champsJSON.data).find(
    (c) => Number(c.key) === Number(championId)
  );
  return entry ? entry.id : null; // e.g. "Aatrox", "LeeSin" (file-name key)
}

/* ---- portrait URL --------------------------------------------------------- */
export function ddPortrait(championId, champsJSON, ddVersion) {
  const key = champKey(championId, champsJSON);
  return key
    ? `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/champion/${key}.png`
    : null;
}

/* ---- map a contract player -> view-model player --------------------------- */
function toPlayer(p, laneResult, champsJSON, ddVersion, role) {
  return {
    name: p.riotIdGameName,
    tag: p.riotIdTagline,
    champ: champName(p.championId, champsJSON),
    championId: p.championId,
    teamId: p.teamId,
    side: p.teamId === 100 ? "blue" : "purple",
    kda: p.kdaAlt,
    cs: p.cs,
    gold: p.gold,
    role, // "ADC" | "SUP" | undefined
    winner: laneResult.teamWonLane === p.teamId && laneResult.resTag !== "draw",
    portrait: ddPortrait(p.championId, champsJSON, ddVersion),
  };
}

/* ---- TODO 2: laningKills -> view-model kills ------------------------------ *
 * killerId/victimId are participantIds (1..10). killerId === 0 means a
 * tower/execute death (no killer). monsterType != null means an objective.
 * Build a participantId -> {name, championId, teamId} map from gameData.
 * ------------------------------------------------------------------------- */
const MONSTER_LABEL = {
  RIFTHERALD: "Rift Herald",
  DRAGON: "Dragon",
  BARON_NASHOR: "Baron",
  // extend as needed
};

export function adaptKills(laningKills, gameData, champsJSON) {
  // participantId -> participant
  const byId = {};
  gameData.participants.forEach((pt) => { byId[pt.participantId] = pt; });
  const champOf = (pt) => champName(pt.championId, champsJSON);

  return (laningKills || []).map((k) => {
    const minute = Math.floor(k.timestamp / 60000);
    const killer = byId[k.killerId];
    const victim = byId[k.victimId];
    if (k.monsterType) {
      return {
        t: minute, side: killer.teamId === 100 ? "blue" : "purple", type: "monster",
        killer: champOf(killer), victim: MONSTER_LABEL[k.monsterType] || k.monsterType,
      };
    }
    if (k.killerId === 0) {
      return {
        t: minute, side: "neutral", type: "tower",
        killer: "Environment", victim: champOf(victim),
      };
    }
    return {
      t: minute, side: killer.teamId === 100 ? "blue" : "purple", type: "champ",
      killer: champOf(killer), victim: champOf(victim),
    };
  });
  // NOTE: KillFeed looks up champ -> player via champMap(lane) for avatars +
  // links, so `killer`/`victim` here must be the champion NAME (champName()).
}

/* ---- TODO 3: timelineData -> per-minute cumulative CS --------------------- *
 * For each frame at minutes 2..15, read each participant's
 * minionsKilled + jungleMinionsKilled. Key the result by champion NAME so it
 * lines up with the players in the matchup.
 * ------------------------------------------------------------------------- */
export function adaptCS(timelineData, players, champsJSON) {
  const out = {};
  players.forEach((p) => { out[p.champ] = []; });
  const pidToChamp = {};
  // map participantId -> champ name for the players in THIS lane
  // (participantId is the index used in timeline participantFrames)
  players.forEach((p) => { if (p.participantId != null) pidToChamp[p.participantId] = p.champ; });

  (timelineData.frames || []).forEach((frame) => {
    const minute = Math.round(frame.timestamp / 60000);
    if (minute < 2 || minute > 15) return;
    Object.values(frame.participantFrames).forEach((pf) => {
      const champ = pidToChamp[pf.participantId];
      if (!champ) return;
      out[champ].push({ m: minute, cs: (pf.minionsKilled || 0) + (pf.jungleMinionsKilled || 0) });
    });
  });
  return out;
  // If players[] don't carry participantId, thread it through toPlayer() from
  // the contract player object (gameData participant) so this map can be built.
}

/* ---- assemble one lane view-model ---------------------------------------- */
export function toLaneVM(lane, statsAt15, ctx) {
  const { champsJSON, dataDragonVersion, timelineData, gameData } = ctx;
  const lr = statsAt15.laneResults[lane];

  const winners = [].concat(lr.laneWinner); // BOTTOM is already an array
  const losers = [].concat(lr.laneLoser);
  const duo = winners.length > 1;

  // BOTTOM order is [ADC, SUP]; assign roles for duo lanes
  const role = (arr, i) => (duo ? (i === 0 ? "ADC" : "SUP") : undefined);
  const all = [
    ...winners.map((p, i) => toPlayer(p, lr, champsJSON, dataDragonVersion, role(winners, i))),
    ...losers.map((p, i) => toPlayer(p, lr, champsJSON, dataDragonVersion, role(losers, i))),
  ];

  return {
    anchor: ANCHORS[lane],
    laneKey: LANE_KEY[lane],
    laneLabel: LANE_LABEL[lane],
    duo,
    resTag: lr.resTag,
    teamWonLane: lr.teamWonLane,
    goldDifference: lr.goldDifference,
    bubbleCount: lr.bubbleCount,
    blue: all.filter((p) => p.teamId === 100),   // always left
    purple: all.filter((p) => p.teamId === 200),  // always right
    kills: adaptKills(statsAt15.laningKills, gameData, champsJSON),
    cs: adaptCS(timelineData, all, champsJSON),
  };
}

/* ---- TODO 4: render the four cards --------------------------------------- *
 * import LaneCard from "./LaneCard"; // the reference's LaneCardB, renamed
 *
 * const ctx = { champsJSON, dataDragonVersion, timelineData, gameData };
 * return ["TOP","JUNGLE","MID","BOTTOM"].map((L) => (
 *   <LaneCard key={L} lane={toLaneVM(L, statsAt15, ctx)} />
 * ));
 *
 * The headline verb logic lives in the reference's <Headline> component and
 * keys off resTag — no extra mapping needed.
 * ------------------------------------------------------------------------- */
