# Handoff: Post-game Scoreboard — section redesign (riftreport.gg)

## Overview
Modernization of the **post-game scoreboard** on a League of Legends match-details page — the two
team tables (Victory / Blue, Defeat / Purple) listing every player's Role, KDA, Damage, Gold, CS,
Wards, and Build. **The brief was explicitly "keep it mostly the same, just modernize to match our
other sections."** So the table structure, column set, and row content are unchanged — only the
styling is brought in line with the shared design system (token palette, cleaner type, team colors
instead of red, placement pills, solid damage bars, softer cards).

> Part of the same visual system as Laning Phase / Battles / Standouts / Match Details. Reuses
> `Portrait` from `components.jsx` and the `:root` tokens.

## About the Design Files
`reference/` is a **design reference in HTML/React+Babel** — a prototype of the intended look, **not
production code to paste in**. Recreate it in the riftreport.gg codebase (React + MUI, Roboto). The
real work is a **data adapter** (`ADAPTER_STARTER.js`) plus swapping placeholder art for real Data
Dragon icons.

## Fidelity
**High-fidelity styling, faithful structure.** Colors, type, spacing, the grid columns, placement
pills, and the damage-bar math are specified below and in `reference/scoreboard.css`. **Champion,
summoner-spell, rune, item, and trinket art are PLACEHOLDERS** (deterministic colored glyphs) — every
slot is keyed so you can drop in real Data Dragon images (see Assets).

---

## What changed vs. the old scoreboard (the point of this work)
- Red "Defeat" → a **muted rose pill**; team names use the system blue/purple link colors; "Victory"
  is a **green ✓ pill**. (No harsh red anywhere — consistent with the other sections.)
- Bold black column headers → **uppercase faint labels** (`ROLE`, `KDA`, …) like the rest of the app.
- Flat tinted tables → **white cards** with the shared soft shadow + a subtle team-tinted header band.
- Placement/score → **pills**: 1st gold, 2nd slate, 3rd bronze, rest neutral; score colored by value.
- KDA ratio turns **green when strong (≥4)**; **damage bars** are solid team color, normalized to the
  match's top damage; gold is amber; numerals are tabular throughout; rows get a hover tint.
- Everything else (the column set, the identity cell composition, the per-player data) is unchanged.

## Data — view-model
The reference shape (`reference/js/scoreboard-data.js`); the adapter fills it from per-player stats:
```js
data = {
  maxDamage,                         // max damageToChampions across all 10 players (bar normalization)
  blue:   { result: "Victory"|"Defeat", players: [player ...] },   // teamId 100
  purple: { result: "Victory"|"Defeat", players: [player ...] },   // teamId 200
}
player = {
  name, tag, champ, championId, level, role,        // role: "Top"|"Jungle"|"Middle"|"Bottom"|"Utility"
  k, d, a, kda,                                      // kda = ratio number
  placement,                                         // 1..10 rank by `score` across BOTH teams
  score,                                             // 0–10 performance rating (your "OP score")
  damage, gold, cs, csm, wards,                      // csm = CS per minute
  spells: [s1, s2],                                  // summoner-spell ids/names
  runes: [keystone, secondaryTree],                  // for the two rune glyphs
  items: [i0..i5 | null],                            // exactly 6 slots; null = empty
  trinket,                                           // "Yellow"|"Red"|"Blue" (or a trinket itemId)
}
```
Notes:
- **`placement`/`score`** rank all 10 players together (1 = best score, 10 = worst), matching the
  original. Use whatever rating the page already computes; the component only displays it.
- **`maxDamage`** is shared across both tables so damage bars are comparable team-to-team.
- Convention (shared): **Blue = teamId 100, Purple = 200.**

---

## Layout & components

### Grid (keeps header + rows aligned)
Both the header and every row use the **same** grid template:
```
grid-template-columns: 300px 66px 86px 118px 80px 84px 54px 1fr;
/*                     identity role kda  damage gold cs   wards build */
```
The table is **968px wide** and lives in a per-table `overflow-x:auto` wrapper, so it fits the
full-width match page and scrolls on narrow screens. Header band is team-tinted (`--blue-soft` /
`--purple-soft`).

### Header row
- First cell: `Blue Team` / `Purple Team` (16px / 700, team color, `nowrap`) + a result pill —
  `Victory` (green `#1F8A5B` on `#E4F6EC`, with a ✓) or `Defeat` (rose `#B14457` on `#FBEDEF`).
- Remaining cells: uppercase faint column labels.

### Player row (`padding:9px 20px`, `#F2F3F5` separators, hover `#FAFBFC`)
1. **Identity** (flex, gap 9): 
   - **Champion portrait** 50px (`radius 9px`, team ring) with a **level badge** (dark pill, top-left).
   - **Summoner spells** — two 20px rounded squares stacked.
   - **Runes** — keystone (20px dark circle w/ tree-colored dot) + secondary (18px) stacked.
   - **Name block** — IGN link (team link color, ellipsis at ~178px) + a row of `[placement pill]`
     `[score]` (score green if ≥6.5, muted if <5).
2. **Role** — 13px `#3C4150`.
3. **KDA** — `k / d / a` (faint slashes) on top, `{ratio} KDA` below (green when ratio ≥4).
4. **Damage** — value on top, a 5px solid team-color bar below (`width = damage/maxDamage`).
5. **Gold** — amber `#B8901E`, `21,729g`.
6. **CS** — `274` + faint `6.2/m`.
7. **Wards** — centered.
8. **Build** — six 26px item squares (empty slots are a muted dashed-ish tile) + a 26px round trinket.

### Responsive
Per-table horizontal scroll handles narrow viewports; no layout reflow needed (a scoreboard is
inherently wide and users expect to scroll it).

## Damage-bar math & reveal
- `width = max(4%, damage / maxDamage * 100)` — the 4% floor keeps tiny values visible.
- The bar animates 0 → final width on mount via a **`setTimeout(~60ms)` flag, NOT
  `requestAnimationFrame`** (rAF is paused in hidden/background iframes and left bars at 0). Keep the
  timer; keep the visible end-state as the base so print/reduced-motion show full bars.

## State management
- Stateless except each row's `grown` boolean for the damage-bar reveal. No fetching in components.

## Design tokens (shared)
```
Team blue #568CFF  link #0089D6  soft #EEF4FF      Team purple #A35BFF  link #8A3FE6  soft #F6EFFF
Win green #1F8A5B on #E4F6EC      Loss rose #B14457 on #FBEDEF
Gold (amber) #B8901E
Ink #14171F · Ink-2 #3C4150 · Muted #6B7280 · Faint #9AA1AD
Hairline rgba(20,23,31,.09) · row sep #F2F3F5 · Track #E7E9EE · hover #FAFBFC
Placement 1st #FBF1D2/#9A7416 · 2nd #ECEFF3/#5C636F · 3rd #F5E6D6/#97632B · rest #EDEEF1/#5C636F
Level badge #2C3140 on white ring
Card #fff · Page #ECEDF0 · Radius card 10px / portrait 9px / items 6px
Font Roboto 400/500/700 · all stats tabular-nums
```

## Assets — placeholders to replace
All five art types are deterministic colored glyphs in `reference/js/scoreboard.jsx`. Swap for real
Data Dragon (CDN base `https://ddragon.leagueoflegends.com/cdn/{version}/img/...`):
- **Champion** (`Portrait`) → `.../champion/{ChampionKey}.png` (map `championId`→key via `champsJSON`).
- **Summoner spells** (`Spell`) → `.../spell/{SpellKey}.png` (e.g. `SummonerFlash`).
- **Runes** (`Rune`) → perk icons from `runesReforged.json` (keystone + secondary tree icon).
- **Items** (`Item`) → `.../item/{itemId}.png`; keep the empty-slot tile for `null`.
- **Trinket** (`Trinket`) → also an item icon (`.../item/{trinketId}.png`).
The component structure, sizes, and slots stay identical — you're only replacing each glyph's body
with an `<img>`.

## Files
```
reference/Scoreboard Redesign.html  – standalone prototype entry
reference/styles.css                – shared tokens + .portrait base
reference/scoreboard.css            – scoreboard styles incl. grid template (port to MUI/CSS modules)
reference/js/components.jsx          – shared Portrait (+ helpers)
reference/js/scoreboard.jsx          – Scoreboard, TeamTable, PlayerRowSB, Spell/Rune/Item/Trinket (port)
reference/js/scoreboard-app.jsx      – MOCK shell (discard)
reference/js/scoreboard-data.js      – MOCK data (discard; replace via adapter)
ADAPTER_STARTER.js                   – maps your per-player stats → the scoreboard view-model
```

## Suggested implementation order
1. Build `TeamTable` + `PlayerRowSB` with the shared grid and hardcoded props; confirm header/rows align.
2. Style the identity cell (portrait + level + spells + runes + name/placement/score).
3. Add the stat cells (KDA green rule, damage bar, gold/CS/wards) and the build row.
4. Swap all five placeholder glyphs for real Data Dragon art.
5. Implement `ADAPTER_STARTER.js` (incl. cross-team placement ranking + `maxDamage`).
6. QA: both teams, the green-ratio + placement-pill rules, horizontal scroll, print/reduced-motion.
