/* ============================================================
   Post-game Scoreboard — mock data
   player = {
     name, tag, champ, championId, level, role,
     k, d, a, kda,                 // kda = ratio
     placement, score,            // 1..10 rank by score; score 0–10 rating
     damage, gold, cs, csm, wards,
     spells: [s1, s2],            // summoner spell seeds (placeholder icons)
     runes: [keystone, secondary],
     items: [6 seeds | null], trinket
   }
   Champion / item / spell / rune art are placeholders — see scoreboard.jsx.
   ============================================================ */
(function () {
  const P = (o) => o;
  const mkItems = (seed, n) => {
    const out = [];
    for (let i = 0; i < 6; i++) out.push(i < n ? seed + "-i" + i : null);
    return out;
  };

  const BLUE = [
    P({ name: "LuvSic", tag: "NA1", champ: "Camille", level: 20, role: "Top",
        k: 19, d: 14, a: 9, kda: 2.0, placement: 4, score: 5.9,
        damage: 40171, gold: 21729, cs: 274, csm: 6.2, wards: 11,
        spells: ["Flash", "Ignite"], runes: ["Conqueror", "Resolve"], items: mkItems("LuvSic", 6), trinket: "Red" }),
    P({ name: "Wyetas", tag: "NA1", champ: "Maokai", level: 18, role: "Jungle",
        k: 6, d: 10, a: 30, kda: 3.6, placement: 7, score: 5.5,
        damage: 27182, gold: 16908, cs: 195, csm: 4.4, wards: 4,
        spells: ["Flash", "Smite"], runes: ["Aftershock", "Inspiration"], items: mkItems("Wyetas", 5), trinket: "Red" }),
    P({ name: "NiceGuyCarson", tag: "NA1", champ: "Sylas", level: 18, role: "Middle",
        k: 16, d: 8, a: 13, kda: 3.6, placement: 1, score: 6.9,
        damage: 63527, gold: 19281, cs: 287, csm: 6.5, wards: 11,
        spells: ["Flash", "Teleport"], runes: ["Electrocute", "Sorcery"], items: mkItems("NiceGuy", 6), trinket: "Yellow" }),
    P({ name: "OnlyFans Corki", tag: "NA1", champ: "Corki", level: 18, role: "Bottom",
        k: 12, d: 7, a: 20, kda: 4.6, placement: 2, score: 6.9,
        damage: 50446, gold: 22553, cs: 370, csm: 8.4, wards: 2,
        spells: ["Flash", "Heal"], runes: ["First Strike", "Inspiration"], items: mkItems("Corki", 6), trinket: "Yellow" }),
    P({ name: "MrChikenlittle", tag: "NA1", champ: "Lulu", level: 18, role: "Utility",
        k: 4, d: 12, a: 27, kda: 2.6, placement: 5, score: 5.9,
        damage: 15491, gold: 13135, cs: 49, csm: 1.1, wards: 56,
        spells: ["Flash", "Exhaust"], runes: ["Guardian", "Inspiration"], items: mkItems("Chiken", 5), trinket: "Red" }),
  ];

  const PURPLE = [
    P({ name: "hi im fab", tag: "NA1", champ: "Mordekaiser", level: 20, role: "Top",
        k: 12, d: 13, a: 5, kda: 1.3, placement: 6, score: 5.8,
        damage: 62855, gold: 20853, cs: 317, csm: 7.2, wards: 18,
        spells: ["Flash", "Teleport"], runes: ["Conqueror", "Resolve"], items: mkItems("fab", 6), trinket: "Yellow" }),
    P({ name: "zJado", tag: "NA1", champ: "Viego", level: 18, role: "Jungle",
        k: 11, d: 13, a: 7, kda: 1.4, placement: 10, score: 4.7,
        damage: 44253, gold: 16645, cs: 196, csm: 4.4, wards: 14,
        spells: ["Flash", "Smite"], runes: ["Conqueror", "Domination"], items: mkItems("zJado", 6), trinket: "Yellow" }),
    P({ name: "3rez", tag: "NA1", champ: "Akali", level: 18, role: "Middle",
        k: 10, d: 12, a: 11, kda: 1.8, placement: 9, score: 4.8,
        damage: 39886, gold: 15335, cs: 212, csm: 4.8, wards: 9,
        spells: ["Flash", "Ignite"], runes: ["Electrocute", "Sorcery"], items: mkItems("3rez", 5), trinket: "Blue" }),
    P({ name: "E Girl Gragas", tag: "NA1", champ: "Gragas", level: 18, role: "Bottom",
        k: 14, d: 11, a: 7, kda: 1.9, placement: 8, score: 5.2,
        damage: 35294, gold: 20328, cs: 257, csm: 5.8, wards: 7,
        spells: ["Flash", "Heal"], runes: ["Hail of Blades", "Precision"], items: mkItems("Gragas", 6), trinket: "Blue" }),
    P({ name: "hyhoshi", tag: "NA1", champ: "Nautilus", level: 18, role: "Utility",
        k: 4, d: 8, a: 30, kda: 4.3, placement: 3, score: 6.7,
        damage: 42648, gold: 17892, cs: 51, csm: 1.2, wards: 34,
        spells: ["Flash", "Ignite"], runes: ["Aftershock", "Inspiration"], items: mkItems("hyhoshi", 5), trinket: "Red" }),
  ];

  window.SCOREBOARD = {
    maxDamage: 63527,
    blue: { result: "Victory", players: BLUE },
    purple: { result: "Defeat", players: PURPLE },
  };
})();
