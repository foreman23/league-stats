/* ============================================================================
 * ADAPTER STARTER — riftreport.gg Match Details
 * ----------------------------------------------------------------------------
 * Maps your end-of-game stats into the `match` view-model the MatchDetails
 * component consumes. Fill the TODOs where they reference YOUR field names.
 *
 * Riot's match-v5 payload exposes most of this under
 * info.teams[].objectives.{champion,tower,inhibitor,dragon,baron,riftHerald,
 * horde,atakhan}.kills and info.teams[].bans[]. Adjust to whatever your
 * backend already normalizes.
 * ==========================================================================*/

/* ---- champion lookups (Data Dragon) -------------------------------------- */
export function champName(championId, champsJSON) {
  const e = Object.values(champsJSON.data).find((c) => Number(c.key) === Number(championId));
  return e ? e.name : String(championId);
}
export function champKey(championId, champsJSON) {
  const e = Object.values(champsJSON.data).find((c) => Number(c.key) === Number(championId));
  return e ? e.id : null;
}
export function ddPortrait(championId, champsJSON, version) {
  const k = champKey(championId, champsJSON);
  return k ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${k}.png` : null;
}

/* ---- objective definitions ----------------------------------------------- *
 * key  -> matches OBJ_ICON in match.jsx (don't rename without updating icons)
 * cap  -> realistic max, used to normalize bar length (tune to your data)
 * kind -> "binary" objectives (at most one per game) get the ✓ treatment
 * ------------------------------------------------------------------------- */
const OBJECTIVE_DEFS = [
  { key: "grubs",   label: "Void Grubs",  cap: 6,  kind: "count",  riot: "horde" },
  { key: "herald",  label: "Rift Herald", cap: 1,  kind: "binary", riot: "riftHerald" },
  { key: "dragons", label: "Dragons",     cap: 6,  kind: "count",  riot: "dragon" },
  { key: "atakhan", label: "Atakhan",     cap: 1,  kind: "binary", riot: "atakhan" },
  { key: "barons",  label: "Barons",      cap: 3,  kind: "count",  riot: "baron" },
  { key: "towers",  label: "Towers",      cap: 11, kind: "count",  riot: "tower" },
  { key: "inhibs",  label: "Inhibitors",  cap: 3,  kind: "count",  riot: "inhibitor" },
];

/* ---- TODO 1: read one team's objective count ----------------------------- *
 * With raw match-v5: team.objectives[def.riot].kills
 * With a normalized backend: whatever field holds the per-objective count.
 * ------------------------------------------------------------------------- */
function objCount(team, def) {
  const o = team.objectives || {};
  return (o[def.riot] && o[def.riot].kills) || 0;   // TODO: match your shape
}

/* ---- TODO 2: read a team's kills + gold ---------------------------------- */
function teamTotals(team, participants) {
  const mine = participants.filter((p) => p.teamId === team.teamId);
  return {
    kills: mine.reduce((s, p) => s + p.kills, 0),                 // or team.objectives.champion.kills
    gold:  mine.reduce((s, p) => s + p.goldEarned, 0),           // TODO: your gold field
  };
}

/* ---- TODO 3: bans -------------------------------------------------------- *
 * match-v5: team.bans = [{ championId, pickTurn }] (championId -1 = no ban).
 * ------------------------------------------------------------------------- */
function teamBans(team, champsJSON) {
  return (team.bans || [])
    .filter((b) => b.championId && b.championId > 0)
    .map((b) => ({ id: b.championId, champ: champName(b.championId, champsJSON) }));
}

/* ---- assemble the view-model --------------------------------------------- */
export function toMatchVM(gameData, champsJSON) {
  const teams = gameData.teams;                       // [{ teamId:100,... }, { teamId:200,... }]
  const participants = gameData.participants;
  const blueTeam = teams.find((t) => t.teamId === 100);
  const purpleTeam = teams.find((t) => t.teamId === 200);

  const blue = teamTotals(blueTeam, participants);
  const purple = teamTotals(purpleTeam, participants);

  const objectives = OBJECTIVE_DEFS.map((def) => ({
    key: def.key, label: def.label, cap: def.cap, kind: def.kind,
    blue: objCount(blueTeam, def),
    purple: objCount(purpleTeam, def),
  }));

  // winner: Riot gives team.win (boolean). Fallback: more towers, then kills.
  const blueWin = blueTeam.win != null ? blueTeam.win
    : (blue && purple ? blue.kills > purple.kills : true);

  return {
    winner: blueWin ? "blue" : "purple",
    blue, purple,
    objectives,
    bans: { blue: teamBans(blueTeam, champsJSON), purple: teamBans(purpleTeam, champsJSON) },
  };
}

/* ---- render --------------------------------------------------------------- *
 * import MatchDetails from "./MatchDetails";
 * const match = toMatchVM(gameData, champsJSON);
 * return <MatchDetails match={match} />;
 *
 * If you have real objective icons, pass them into OBJ_ICON (in match.jsx)
 * keyed by `key`; otherwise the built-in abstract glyphs are used.
 * ------------------------------------------------------------------------- */
