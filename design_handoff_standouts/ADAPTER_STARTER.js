/* ============================================================================
 * ADAPTER STARTER — riftreport.gg Standout Performances
 * ----------------------------------------------------------------------------
 * Picks MVP / 2ND / INT from the match's players and shapes each into the
 * `standout` view-model the StandoutsCard consumes.
 *
 * Reuses champName/champKey/ddPortrait (copied so this file stands alone).
 * ==========================================================================*/

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

const kdaRatio = (k, d, a) => +(((k + a) / Math.max(1, d))).toFixed(1);

/* ---- TODO 1: performance score ------------------------------------------- *
 * Prefer whatever the page already computes. A reasonable fallback blends KDA,
 * kill participation, and damage share. Tune weights to taste.
 * ------------------------------------------------------------------------- */
function perfScore(p, teamKills, teamDamage) {
  const kda = kdaRatio(p.kills, p.deaths, p.assists);
  const kp = teamKills ? (p.kills + p.assists) / teamKills : 0;
  const dmgShare = teamDamage ? p.totalDamageDealtToChampions / teamDamage : 0;
  return kda * 1.0 + kp * 4 + dmgShare * 4; // weights — adjust
}

/* ---- map one participant -> view-model ----------------------------------- */
function toStandout(p, rank, champsJSON, version, teamKills) {
  return {
    rank, // "MVP" | "2ND" | "INT"
    name: p.riotIdGameName,
    tag: p.riotIdTagline,
    champ: champName(p.championId, champsJSON),
    championId: p.championId,
    side: p.teamId === 100 ? "blue" : "purple",
    k: p.kills, d: p.deaths, a: p.assists,
    kda: kdaRatio(p.kills, p.deaths, p.assists),
    // TODO 2: kill participation %. Drop this (and the 3rd stat tile in the
    // component) if you don't compute team totals.
    kp: teamKills ? Math.round(((p.kills + p.assists) / teamKills) * 100) : null,
    // TODO 3: generated copy. Replace with your sentence generator; `lead` is
    // the bolded verb phrase, `detail` the remainder.
    summary: standoutCopy(rank, p, champsJSON),
  };
}

function standoutCopy(rank, p, champsJSON) {
  const champ = champName(p.championId, champsJSON);
  const line = `${p.kills}/${p.deaths}/${p.assists}`;
  if (rank === "MVP") return { lead: "carried the match", detail: `ending ${line} for a ${kdaRatio(p.kills, p.deaths, p.assists)} KDA and the highest overall impact on the rift.` };
  if (rank === "2ND") return { lead: "was a steady force", detail: `posting ${line} and consistently showing up in fights.` };
  return { lead: "had a rough game", detail: `going ${line} — caught out repeatedly and giving up tempo.` };
}

/* ---- pick the three standouts -------------------------------------------- */
export function buildStandouts(gameData, champsJSON, version) {
  const players = gameData.participants;
  const teamKillsOf = (teamId) =>
    players.filter((p) => p.teamId === teamId).reduce((s, p) => s + p.kills, 0);
  const teamDmgOf = (teamId) =>
    players.filter((p) => p.teamId === teamId).reduce((s, p) => s + p.totalDamageDealtToChampions, 0);

  const scored = players.map((p) => ({
    p, score: perfScore(p, teamKillsOf(p.teamId), teamDmgOf(p.teamId)),
  }));
  const byScore = [...scored].sort((a, b) => b.score - a.score);

  const mvp = byScore[0].p;
  const second = byScore[1].p;
  const intP = byScore[byScore.length - 1].p; // lowest score

  return [
    toStandout(mvp, "MVP", champsJSON, version, teamKillsOf(mvp.teamId)),
    toStandout(second, "2ND", champsJSON, version, teamKillsOf(second.teamId)),
    toStandout(intP, "INT", champsJSON, version, teamKillsOf(intP.teamId)),
  ];
}

/* ---- render --------------------------------------------------------------- *
 * import StandoutsCard from "./StandoutsCard";
 * const standouts = buildStandouts(gameData, champsJSON, dataDragonVersion);
 * return <StandoutsCard standouts={standouts} />;
 * ------------------------------------------------------------------------- */
