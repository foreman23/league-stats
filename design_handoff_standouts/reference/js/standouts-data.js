/* ============================================================
   Standout Performances — mock data
   standout = {
     rank: "MVP" | "2ND" | "INT",
     name, tag, champ, championId, side: "blue"|"purple",
     k, d, a,                       // kills / deaths / assists
     kda,                           // ratio (number)
     kp,                            // kill participation % (optional highlight)
     summary: { lead, detail },     // dynamic sentence
   }
   ============================================================ */
(function () {
  const STANDOUTS = [
    {
      rank: "MVP",
      name: "Livebait57", tag: "NA1", champ: "Poppy", championId: 78, side: "blue",
      k: 6, d: 5, a: 21, kda: 5.4, kp: 68,
      summary: {
        lead: "carried the match",
        detail: "ending 6/5/21 for a 5.4 KDA and the highest overall impact on the rift.",
      },
    },
    {
      rank: "2ND",
      name: "Shotcaller", tag: "NA1", champ: "Galio", championId: 3, side: "blue",
      k: 5, d: 4, a: 12, kda: 4.3, kp: 57,
      summary: {
        lead: "anchored the team",
        detail: "with a steady 5/4/12, setting up fights without overextending.",
      },
    },
    {
      rank: "INT",
      name: "IntDiff", tag: "NA1", champ: "Nocturne", championId: 56, side: "purple",
      k: 1, d: 9, a: 4, kda: 0.6, kp: 31,
      summary: {
        lead: "had a rough game",
        detail: "going 1/9/4 — repeatedly caught out and giving up tempo to the enemy.",
      },
    },
  ];
  window.STANDOUTS = STANDOUTS;
})();
