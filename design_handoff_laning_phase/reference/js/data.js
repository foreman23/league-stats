/* ============================================================
   Laning Phase — mock data model
   Mirrors the real data contract: statsAt15.laneResults[LANE]
   + laningKills + per-minute cumulative CS.
   teamId 100 = BLUE, 200 = PURPLE.  Names are illustrative.
   ============================================================ */
(function () {
  // ---- per-minute cumulative CS, minutes 2..15 (14 points) ----
  function genCS(final, jitter) {
    const out = [];
    for (let m = 2; m <= 15; m++) {
      // gentle accelerating curve, ends near `final`
      let v = final * Math.pow(m / 15, 1.04);
      // tiny deterministic wobble so lines aren't perfectly smooth
      v += Math.sin(m * (jitter || 1.3)) * (final * 0.012);
      out.push({ m, cs: Math.max(0, Math.round(v)) });
    }
    out[out.length - 1].cs = final; // pin the endpoint to the real total
    return out;
  }

  // gold-difference tier label (independent of the headline verb)
  function goldLabel(d) {
    if (d > 3000) return "massive lead";
    if (d > 2000) return "big lead";
    if (d > 650)  return "advantage";
    if (d >= 150) return "small advantage";
    return "even";
  }

  // headline verb → already provided per lane as resTag
  // ("won" | "dominates" | "obliterates" | "draw")
  function headline(lane) {
    if (lane.resTag === "draw") return `${lane.laneLabel} was a draw`;
    const team = lane.teamWonLane === 100 ? "Blue" : "Purple";
    return `${team} ${lane.resTag} ${lane.laneKey}`;
  }

  // ---------- players ----------
  // side: 'blue' | 'purple'  (visual orientation, blue always left)
  const P = (o) => o;

  const TOP = {
    anchor: "laningTopAnchor",
    laneKey: "top", laneLabel: "Top",
    resTag: "dominates", teamWonLane: 100,
    goldDifference: 2350, bubbleCount: 4,
    duo: false,
    blue: [P({ name: "Deeto", tag: "NA1", champ: "Aatrox", championId: 266, kda: "3/0/2", cs: 142, gold: 7240, side: "blue", winner: true })],
    purple: [P({ name: "Wyetas", tag: "NA1", champ: "Garen", championId: 86, kda: "1/3/0", cs: 118, gold: 4890, side: "purple", winner: false })],
    kills: [
      { t: 4, killer: "Aatrox", victim: "Garen", side: "blue", type: "champ" },
      { t: 9, killer: "Garen", victim: "Aatrox", side: "purple", type: "champ" },
      { t: 12, killer: "Aatrox", victim: "Garen", side: "blue", type: "champ" },
      { t: 14, killer: "Environment", victim: "Garen", side: "neutral", type: "tower" },
    ],
    cs: { Aatrox: genCS(142, 1.1), Garen: genCS(118, 1.7) },
  };

  const JUNGLE = {
    anchor: "laningJgAnchor",
    laneKey: "jungle", laneLabel: "Jungle",
    resTag: "won", teamWonLane: 200,
    goldDifference: 820, bubbleCount: 2,
    duo: false,
    // blue (left) = Viego, purple (right) = Lee Sin (winner)
    blue: [P({ name: "GraveWalker", tag: "NA1", champ: "Viego", championId: 234, kda: "1/2/3", cs: 89, gold: 5420, side: "blue", winner: false })],
    purple: [P({ name: "JGdiff", tag: "NA1", champ: "Lee Sin", championId: 64, kda: "2/1/4", cs: 96, gold: 6240, side: "purple", winner: true })],
    kills: [
      { t: 8, killer: "Lee Sin", victim: "Rift Herald", side: "purple", type: "monster" },
      { t: 11, killer: "Lee Sin", victim: "Viego", side: "purple", type: "champ" },
    ],
    cs: { Viego: genCS(89, 1.5), "Lee Sin": genCS(96, 1.2) },
  };

  const MID = {
    anchor: "laningMidAnchor",
    laneKey: "mid", laneLabel: "Mid",
    resTag: "draw", teamWonLane: 0,
    goldDifference: 90, bubbleCount: 0,
    duo: false,
    blue: [P({ name: "Foxfire", tag: "NA1", champ: "Ahri", championId: 103, kda: "1/1/2", cs: 130, gold: 6010, side: "blue", winner: false })],
    purple: [P({ name: "OrbWeaver", tag: "NA1", champ: "Syndra", championId: 134, kda: "1/1/1", cs: 127, gold: 5920, side: "purple", winner: false })],
    kills: [],
    cs: { Ahri: genCS(130, 1.3), Syndra: genCS(127, 1.6) },
  };

  const BOTTOM = {
    anchor: "laningBotAnchor",
    laneKey: "bottom", laneLabel: "Bottom",
    resTag: "obliterates", teamWonLane: 100,
    goldDifference: 3400, bubbleCount: 5,
    duo: true,
    blue: [
      P({ name: "PowPow", tag: "NA1", champ: "Jinx", championId: 222, kda: "5/0/3", cs: 138, gold: 8120, side: "blue", winner: true, role: "ADC" }),
      P({ name: "HookCity", tag: "NA1", champ: "Thresh", championId: 412, kda: "0/1/7", cs: 22, gold: 4360, side: "blue", winner: true, role: "SUP" }),
    ],
    purple: [
      P({ name: "OnTarget", tag: "NA1", champ: "Caitlyn", championId: 51, kda: "1/4/1", cs: 101, gold: 5210, side: "purple", winner: false, role: "ADC" }),
      P({ name: "FinalSpark", tag: "NA1", champ: "Lux", championId: 99, kda: "0/3/2", cs: 18, gold: 3470, side: "purple", winner: false, role: "SUP" }),
    ],
    kills: [
      { t: 4, killer: "Jinx", victim: "Lux", side: "blue", type: "champ" },
      { t: 5, killer: "Jinx", victim: "Caitlyn", side: "blue", type: "champ" },
      { t: 7, killer: "Caitlyn", victim: "Thresh", side: "purple", type: "champ" },
      { t: 9, killer: "Jinx", victim: "Lux", side: "blue", type: "champ" },
      { t: 10, killer: "Environment", victim: "Caitlyn", side: "neutral", type: "tower" },
      { t: 12, killer: "Jinx", victim: "Caitlyn", side: "blue", type: "champ" },
      { t: 13, killer: "Environment", victim: "Lux", side: "neutral", type: "tower" },
      { t: 14, killer: "Jinx", victim: "Caitlyn", side: "blue", type: "champ" },
    ],
    cs: {
      Jinx: genCS(138, 1.1), Thresh: genCS(22, 2.1),
      Caitlyn: genCS(101, 1.4), Lux: genCS(18, 1.9),
    },
  };

  window.LANES = [TOP, JUNGLE, MID, BOTTOM];
  window.LaneHelpers = { goldLabel, headline, genCS };
})();
