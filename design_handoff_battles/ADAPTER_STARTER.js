/* ============================================================================
 * ADAPTER STARTER — riftreport.gg Battles (BETA)
 * ----------------------------------------------------------------------------
 * Turns your real battles payload into the `battle` view-model the
 * BattleCard components consume. No formal contract was provided, so the
 * TODOs below mark where to read YOUR fields. Shapes shown are the reference's
 * assumptions — adjust field names to match production.
 *
 * Reuses champName/champKey/ddPortrait from the Laning Phase adapter; copied
 * here so this file stands alone.
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

/* ---- helpers -------------------------------------------------------------- */
const msToMin = (ms) => +(ms / 60000).toFixed(2);
const fmtClock = (ms) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const sideOf = (teamId) => (teamId === 100 ? "blue" : "purple");

const OBJ_LABEL = {
  RIFTHERALD: "Rift Herald", AIR_DRAGON: "Cloud Dragon", FIRE_DRAGON: "Infernal Dragon",
  WATER_DRAGON: "Ocean Dragon", EARTH_DRAGON: "Mountain Dragon", HEXTECH_DRAGON: "Hextech Dragon",
  CHEMTECH_DRAGON: "Chemtech Dragon", ELDER_DRAGON: "Elder Dragon", BARON_NASHOR: "Baron",
  TOWER_BUILDING: "Tower",
};

/* ---- TODO 1: derive winner + scoreline ----------------------------------- *
 * Most payloads give per-team kill counts for the fight. winner = whoever has
 * more kills; "even" when tied.
 * ------------------------------------------------------------------------- */
function outcome(b) {
  const blueKills = b.blueKills;     // TODO: your field
  const purpleKills = b.purpleKills; // TODO: your field
  const winner = blueKills === purpleKills ? "even" : blueKills > purpleKills ? "blue" : "purple";
  return { winner, blueKills, purpleKills };
}

/* ---- TODO 2: title + emphasized location + tags -------------------------- *
 * If the payload already has a generated title ("Fight in Top",
 * "Battle for Dragon"), use it and pull the location noun out for emphasis.
 * ------------------------------------------------------------------------- */
function titleBits(b) {
  const title = b.title;                              // TODO: your generated title
  const location = b.location || lastWord(title);     // word to color in the title
  const objective = b.objectiveType
    ? b.objectiveType.toLowerCase().includes("dragon") ? "dragon"
      : b.objectiveType.includes("HERALD") ? "herald"
      : b.objectiveType.includes("BARON") ? "baron" : "tower"
    : null;
  return { title, location, objective, firstBlood: !!b.firstBlood };
}
const lastWord = (s) => (s ? s.trim().split(/\s+/).pop() : "");

/* ---- TODO 3: gold series (blue perspective) over the battle window -------- *
 * Sample the team gold-difference (blueGold − purpleGold) at each frame inside
 * [startMs, endMs]. If you only have a single endpoint swing, synthesize a
 * short 2-point series; the graph handles any length ≥ 2.
 * ------------------------------------------------------------------------- */
function goldSeries(b, timelineData) {
  const startMs = b.startMs, endMs = b.endMs;          // TODO: your window bounds
  const pts = [];
  (timelineData.frames || []).forEach((f) => {
    if (f.timestamp < startMs || f.timestamp > endMs) return;
    let blue = 0, purple = 0;
    Object.values(f.participantFrames).forEach((pf) => {
      const team = pf.participantId <= 5 ? 100 : 200; // adjust if you have explicit teamId
      if (team === 100) blue += pf.totalGold; else purple += pf.totalGold;
    });
    pts.push({ m: msToMin(f.timestamp), diff: blue - purple });
  });
  if (pts.length < 2) {                                 // fallback: 2-point synth
    return [{ m: msToMin(startMs), diff: 0 }, { m: msToMin(endMs), diff: b.goldSwing || 0 }];
  }
  // re-base so the series starts near 0 (swing is what matters for one fight)
  const base = pts[0].diff;
  return pts.map((p) => ({ m: p.m, diff: p.diff - base }));
}

/* ---- TODO 4: kills + objectives ------------------------------------------ *
 * Map each event in the battle to a row. killerId/victimId are participantIds;
 * build a participantId -> {name, tag, championId, teamId} map from gameData.
 * ------------------------------------------------------------------------- */
function adaptKills(b, gameData, champsJSON) {
  const byId = {};
  gameData.participants.forEach((p) => { byId[p.participantId] = p; });
  const mk = (p) => p && ({
    name: p.riotIdGameName, tag: p.riotIdTagline,
    champ: champName(p.championId, champsJSON), side: sideOf(p.teamId),
  });

  return (b.events || []).map((e) => {           // TODO: your per-battle event list
    if (e.monsterType || e.buildingType) {
      const team = e.killerTeamId || (e.killerId <= 5 ? 100 : 200);
      return {
        t: fmtClock(e.timestamp), side: sideOf(team), type: "objective",
        killer: { name: team === 100 ? "Blue" : "Purple", champ: null, side: sideOf(team) },
        victim: null,
        objLabel: OBJ_LABEL[e.monsterType || e.buildingType] || (e.monsterType || e.buildingType),
      };
    }
    const killer = byId[e.killerId], victim = byId[e.victimId];
    return {
      t: fmtClock(e.timestamp), side: sideOf(killer.teamId), type: "champ",
      killer: mk(killer), victim: mk(victim),
    };
  });
}

/* ---- assemble one battle view-model -------------------------------------- */
export function toBattleVM(b, ctx) {
  const { gameData, champsJSON, timelineData } = ctx;
  const o = outcome(b);
  const t = titleBits(b);
  const startMs = b.startMs, endMs = b.endMs;
  const sameInstant = Math.abs(endMs - startMs) < 1000;

  return {
    id: b.id,
    ...o,
    window: [msToMin(startMs), msToMin(endMs)],
    timeLabel: sameInstant ? fmtClock(startMs) : `${fmtClock(startMs)}–${fmtClock(endMs)}`,
    ...t,
    summary: { lead: b.summaryLead, detail: b.summaryDetail },  // TODO: your generated text
    goldSwing: b.goldSwing,                                     // blue perspective, headline number
    goldSeries: goldSeries(b, timelineData),
    kills: adaptKills(b, gameData, champsJSON),
  };
}

/* ---- TODO 5: render ------------------------------------------------------ *
 * import BattleCard from "./BattleCard";
 *
 * const ctx = { gameData, champsJSON, timelineData };
 * return battles.map((b, i) => (
 *   <BattleCard key={b.id} battle={toBattleVM(b, ctx)} defaultOpen={i === 0} />
 * ));
 * ------------------------------------------------------------------------- */
