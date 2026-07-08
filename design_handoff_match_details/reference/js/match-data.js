/* ============================================================
   Match Details — mock data (end-of-game results)
   matchDetails = {
     winner: "blue" | "purple",
     blue/purple: { kills, gold },
     objectives: [{ key, label, blue, purple, cap, kind }],   // kind: "count" | "binary"
     bans: { blue: [{id, champ}...], purple: [{id, champ}...] }
   }
   ============================================================ */
(function () {
  const MATCH = {
    winner: "purple",
    blue:   { kills: 19, gold: 44879 },
    purple: { kills: 39, gold: 57116 },
    objectives: [
      { key: "grubs",   label: "Void Grubs",  blue: 3, purple: 0,  cap: 6,  kind: "count" },
      { key: "herald",  label: "Rift Herald", blue: 0, purple: 1,  cap: 1,  kind: "binary" },
      { key: "dragons", label: "Dragons",     blue: 0, purple: 3,  cap: 6,  kind: "count" },
      { key: "atakhan", label: "Atakhan",     blue: 0, purple: 0,  cap: 1,  kind: "binary" },
      { key: "barons",  label: "Barons",      blue: 0, purple: 1,  cap: 3,  kind: "count" },
      { key: "towers",  label: "Towers",      blue: 2, purple: 10, cap: 11, kind: "count" },
      { key: "inhibs",  label: "Inhibitors",  blue: 0, purple: 2,  cap: 3,  kind: "count" },
    ],
    bans: {
      blue:   [{ id: 122, champ: "Darius" }, { id: 64, champ: "Lee Sin" }, { id: 875, champ: "Sett" }, { id: 141, champ: "Kayn" }, { id: 238, champ: "Zed" }],
      purple: [{ id: 103, champ: "Ahri" }, { id: 145, champ: "Kaisa" }, { id: 412, champ: "Thresh" }, { id: 51, champ: "Caitlyn" }, { id: 99, champ: "Lux" }],
    },
  };
  window.MATCH = MATCH;
})();
