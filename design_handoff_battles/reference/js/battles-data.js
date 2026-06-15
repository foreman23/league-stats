/* ============================================================
   Battles (BETA) — mock data model
   A "battle" = a discrete fight/skirmish during the match.
   Inferred shape (no formal contract was given):

   battle = {
     id,
     winner: 'blue' | 'purple' | 'even',
     blueKills, purpleKills,        // scoreline, e.g. 3 & 1
     window: [startMin, endMin],    // minutes; single-kill battles repeat the value
     timeLabel: "1:16" | "2:24–3:17",
     title,                         // "Fight in Top", "Battle for dragon", ...
     location,                      // emphasized noun inside the title
     firstBlood,                    // bool
     objective,                     // null | "dragon" | "herald" | "baron"
     summary,                       // dynamic sentence
     goldSwing,                     // gold diff from BLUE's perspective (+ blue ahead, − purple)
     goldSeries: [{ m, diff }],     // gold diff (blue perspective) across the window
     kills: [{ t, killer, victim, side, type }]   // t = "MM:SS", side = killer team
   }
   Champion names are illustrative; portraits use the placeholder monogram.
   ============================================================ */
(function () {
  // build a small gold-diff curve across a window. `peak` is blue-perspective.
  function series(startM, endM, peak, shape) {
    const out = [];
    const steps = Math.max(2, Math.round((endM - startM)));
    for (let i = 0; i <= steps; i++) {
      const m = startM + (i / steps) * (endM - startM);
      const tp = i / steps; // 0..1
      let f;
      if (shape === "dip") f = Math.sin(tp * Math.PI);          // down then back up
      else if (shape === "drift") f = Math.pow(tp, 0.7);         // steady drift out
      else f = tp;                                               // linear
      out.push({ m: +m.toFixed(2), diff: Math.round(peak * f) });
    }
    return out;
  }

  const BATTLES = [
    {
      id: "b1",
      winner: "purple", blueKills: 0, purpleKills: 1,
      window: [0.2, 1.27], timeLabel: "1:16",
      title: "First blood in Top", location: "Top",
      firstBlood: true, objective: null,
      summary: { lead: "Purple draws first blood", detail: "Tahm Kench caught Kayle overextended in the top lane." },
      goldSwing: -2931,
      goldSeries: series(0.2, 1.27, -1100, "drift"),
      kills: [
        { t: "01:16", killer: { name: "creeeeb", tag: "NA1", champ: "Tahm Kench", side: "purple" },
          victim: { name: "EternalJoker", tag: "NA1", champ: "Kayle", side: "blue" }, side: "purple", type: "champ" },
      ],
    },
    {
      id: "b2",
      winner: "even", blueKills: 2, purpleKills: 2,
      window: [2.4, 3.28], timeLabel: "2:24–3:17",
      title: "Skirmish in Bottom", location: "Bottom",
      firstBlood: false, objective: null,
      summary: { lead: "An even trade bot", detail: "both sides walked away with two kills apiece." },
      goldSwing: 60,
      goldSeries: series(2.4, 3.28, 140, "dip"),
      kills: [
        { t: "02:24", killer: { name: "PowPow", tag: "NA1", champ: "Jinx", side: "blue" },
          victim: { name: "OnTarget", tag: "NA1", champ: "Caitlyn", side: "purple" }, side: "blue", type: "champ" },
        { t: "02:51", killer: { name: "FinalSpark", tag: "NA1", champ: "Lux", side: "purple" },
          victim: { name: "HookCity", tag: "NA1", champ: "Thresh", side: "blue" }, side: "purple", type: "champ" },
        { t: "03:09", killer: { name: "PowPow", tag: "NA1", champ: "Jinx", side: "blue" },
          victim: { name: "FinalSpark", tag: "NA1", champ: "Lux", side: "purple" }, side: "blue", type: "champ" },
        { t: "03:17", killer: { name: "OnTarget", tag: "NA1", champ: "Caitlyn", side: "purple" },
          victim: { name: "PowPow", tag: "NA1", champ: "Jinx", side: "blue" }, side: "purple", type: "champ" },
      ],
    },
    {
      id: "b3",
      winner: "blue", blueKills: 3, purpleKills: 1,
      window: [4.5, 5.3], timeLabel: "4:30–5:18",
      title: "Fight in Top", location: "Top",
      firstBlood: false, objective: null,
      summary: { lead: "Blue took the top skirmish 3–1", detail: "MrEmperorSir cleaned up two kills before trading back." },
      goldSwing: 239,
      goldSeries: series(4.5, 5.3, 239, "dip"),
      kills: [
        { t: "04:30", killer: { name: "Gaeul", tag: "NA1", champ: "Ahri", side: "blue" },
          victim: { name: "ztlfrancis", tag: "NA1", champ: "Viego", side: "purple" }, side: "blue", type: "champ" },
        { t: "05:08", killer: { name: "MrEmperorSir", tag: "NA1", champ: "Aatrox", side: "blue" },
          victim: { name: "Wyetas", tag: "NA1", champ: "Garen", side: "purple" }, side: "blue", type: "champ" },
        { t: "05:18", killer: { name: "MrEmperorSir", tag: "NA1", champ: "Aatrox", side: "blue" },
          victim: { name: "creeeeb", tag: "NA1", champ: "Tahm Kench", side: "purple" }, side: "blue", type: "champ" },
        { t: "05:18", killer: { name: "creeeeb", tag: "NA1", champ: "Tahm Kench", side: "purple" },
          victim: { name: "MrEmperorSir", tag: "NA1", champ: "Aatrox", side: "blue" }, side: "purple", type: "champ" },
      ],
    },
    {
      id: "b4",
      winner: "purple", blueKills: 2, purpleKills: 3,
      window: [6.57, 8.55], timeLabel: "6:34–8:33",
      title: "Battle for Dragon", location: "Dragon",
      firstBlood: false, objective: "dragon",
      summary: { lead: "Purple won the fight for Dragon 3–2", detail: "and secured the objective off the back of it." },
      goldSwing: -1430,
      goldSeries: series(6.57, 8.55, -1430, "drift"),
      kills: [
        { t: "06:34", killer: { name: "JGdiff", tag: "NA1", champ: "Lee Sin", side: "purple" },
          victim: { name: "GraveWalker", tag: "NA1", champ: "Viego", side: "blue" }, side: "purple", type: "champ" },
        { t: "07:02", killer: { name: "Gaeul", tag: "NA1", champ: "Ahri", side: "blue" },
          victim: { name: "OrbWeaver", tag: "NA1", champ: "Syndra", side: "purple" }, side: "blue", type: "champ" },
        { t: "07:40", killer: { name: "creeeeb", tag: "NA1", champ: "Tahm Kench", side: "purple" },
          victim: { name: "HookCity", tag: "NA1", champ: "Thresh", side: "blue" }, side: "purple", type: "champ" },
        { t: "08:11", killer: { name: "PowPow", tag: "NA1", champ: "Jinx", side: "blue" },
          victim: { name: "FinalSpark", tag: "NA1", champ: "Lux", side: "purple" }, side: "blue", type: "champ" },
        { t: "08:33", killer: { name: "JGdiff", tag: "NA1", champ: "Lee Sin", side: "purple" },
          victim: { name: "PowPow", tag: "NA1", champ: "Jinx", side: "blue" }, side: "purple", type: "champ" },
        { t: "08:33", killer: { name: "Drake", tag: "OBJ", champ: "Infernal Drake", side: "purple" },
          victim: null, side: "purple", type: "objective", objLabel: "Infernal Dragon" },
      ],
    },
  ];

  window.BATTLES = BATTLES;
})();
