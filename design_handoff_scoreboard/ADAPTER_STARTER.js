/* ============================================================================
 * ADAPTER STARTER — riftreport.gg Post-game Scoreboard
 * ----------------------------------------------------------------------------
 * Maps your per-player match stats into the scoreboard view-model.
 * Field names below follow Riot match-v5 participant objects; adjust to
 * whatever your backend normalizes.
 * ==========================================================================*/

/* ---- Data Dragon lookups -------------------------------------------------- */
export function champKey(championId, champsJSON) {
  const e = Object.values(champsJSON.data).find((c) => Number(c.key) === Number(championId));
  return e ? e.id : null;
}
export const champPortrait = (id, champsJSON, v) =>
  champKey(id, champsJSON) ? `https://ddragon.leagueoflegends.com/cdn/${v}/img/champion/${champKey(id, champsJSON)}.png` : null;
export const spellIcon = (spellFileKey, v) =>
  `https://ddragon.leagueoflegends.com/cdn/${v}/img/spell/${spellFileKey}.png`;   // e.g. "SummonerFlash"
export const itemIcon = (itemId, v) =>
  itemId ? `https://ddragon.leagueoflegends.com/cdn/${v}/img/item/${itemId}.png` : null;
export const perkIcon = (iconPath) =>
  iconPath ? `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}` : null;    // from runesReforged.json

const ROLE_LABEL = { TOP: "Top", JUNGLE: "Jungle", MIDDLE: "Middle", BOTTOM: "Bottom", UTILITY: "Utility" };
const kdaRatio = (k, d, a) => +(((k + a) / Math.max(1, d))).toFixed(1);

/* ---- TODO 1: summoner-spell id -> Data Dragon file key ------------------- *
 * match-v5 gives numeric summoner1Id/summoner2Id. Build the id->key map from
 * Data Dragon summoner.json (Object.values(summonerJSON.data) each has .key
 * (numeric, as string) and .id (file key like "SummonerFlash")).
 * ------------------------------------------------------------------------- */
function spellKey(spellId, summonerJSON) {
  const e = Object.values(summonerJSON.data).find((s) => Number(s.key) === Number(spellId));
  return e ? e.id : null;
}

/* ---- TODO 2: runes ------------------------------------------------------- *
 * From p.perks: keystone = styles[0].selections[0].perk; secondary tree =
 * styles[1].style. Resolve both to icon paths via runesReforged.json.
 * The reference only needs [keystoneIconPath, secondaryTreeIconPath].
 * ------------------------------------------------------------------------- */
function runeIcons(p, runesReforged) {
  try {
    const keystoneId = p.perks.styles[0].selections[0].perk;
    const secondaryStyleId = p.perks.styles[1].style;
    let keystonePath = null, secondaryPath = null;
    runesReforged.forEach((tree) => {
      if (tree.id === secondaryStyleId) secondaryPath = tree.icon;
      tree.slots.forEach((slot) => slot.runes.forEach((r) => { if (r.id === keystoneId) keystonePath = r.icon; }));
    });
    return [keystonePath, secondaryPath];
  } catch (e) { return [null, null]; }
}

/* ---- TODO 3: items + trinket --------------------------------------------- *
 * match-v5: p.item0..p.item5 are inventory slots, p.item6 is the trinket.
 * Keep exactly 6 item slots (0 -> null = empty).
 * ------------------------------------------------------------------------- */
function items(p) {
  return [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].map((id) => (id ? id : null));
}

/* ---- map one participant -> view-model player ---------------------------- */
function toPlayer(p, placement) {
  return {
    name: p.riotIdGameName, tag: p.riotIdTagline,
    champ: p.championName, championId: p.championId,
    level: p.champLevel,
    role: ROLE_LABEL[p.teamPosition] || p.teamPosition,
    k: p.kills, d: p.deaths, a: p.assists, kda: kdaRatio(p.kills, p.deaths, p.assists),
    placement,                       // filled by caller (cross-team rank)
    score: p.opScore != null ? p.opScore : derivedScore(p),  // TODO 4: your rating
    damage: p.totalDamageDealtToChampions,
    gold: p.goldEarned,
    cs: p.totalMinionsKilled + (p.neutralMinionsKilled || 0),
    csm: round1((p.totalMinionsKilled + (p.neutralMinionsKilled || 0)) / Math.max(1, p.timePlayed / 60)),
    wards: p.wardsPlaced,
    spells: [p.summoner1Id, p.summoner2Id],   // resolve to file keys at render: spellKey(id, summonerJSON)
    runes: [/* keystone */ null, /* secondary */ null], // fill via runeIcons(p, runesReforged)
    items: items(p),
    trinket: p.item6 || null,
    // raw kept for icon resolution at render time
    _raw: p,
  };
}
const round1 = (n) => Math.round(n * 10) / 10;

/* ---- TODO 4: performance score (only if you don't already have one) ------ */
function derivedScore(p) {
  const kda = kdaRatio(p.kills, p.deaths, p.assists);
  return Math.max(0, Math.min(10, 3 + kda * 1.1)); // crude placeholder — replace
}

/* ---- assemble both teams + cross-team placement -------------------------- */
export function toScoreboardVM(gameData /*, champsJSON, version, summonerJSON, runesReforged */) {
  const all = gameData.participants;

  // placement: rank ALL players (both teams) by score, 1 = best
  const scoreOf = (p) => (p.opScore != null ? p.opScore : derivedScore(p));
  const ranked = [...all].sort((a, b) => scoreOf(b) - scoreOf(a));
  const placementById = new Map(ranked.map((p, i) => [p.participantId, i + 1]));

  const build = (teamId, result) => ({
    result,
    players: all.filter((p) => p.teamId === teamId).map((p) => toPlayer(p, placementById.get(p.participantId))),
  });

  const blueWin = (gameData.teams.find((t) => t.teamId === 100) || {}).win;

  return {
    maxDamage: Math.max(...all.map((p) => p.totalDamageDealtToChampions)),
    blue: build(100, blueWin ? "Victory" : "Defeat"),
    purple: build(200, blueWin ? "Defeat" : "Victory"),
  };
}

/* ---- render --------------------------------------------------------------- *
 * import Scoreboard from "./Scoreboard";
 * const data = toScoreboardVM(gameData);
 * return <Scoreboard data={data} />;
 *
 * In the components, replace the placeholder Spell/Rune/Item/Trinket/Portrait
 * bodies with <img src={...}> using the Data Dragon helpers above. Sizes and
 * slots are already correct — you're only swapping each glyph's inner art.
 * ------------------------------------------------------------------------- */
