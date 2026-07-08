# Handoff: Match Details — section redesign (riftreport.gg)

## Overview
Redesign of the **Match Details** card on a League of Legends match-details page (end-of-game
results). The old version drew Blue's and Purple's objective counts as **two separate bar groups**
side by side, so comparing the teams meant looking back and forth. This redesign converts it into a
**diverging head-to-head**: a shared center axis with Blue bars growing left and Purple bars growing
right, plus split bars for Kills/Gold up top and a Bans row below. The whole thing reads at a glance.

> Part of the same visual system as Laning Phase / Battles / Standouts. It **reuses** `Portrait` from
> `components.jsx` and the `:root` tokens.

## About the Design Files
`reference/` is a **design reference in HTML/React+Babel** — a prototype of the intended look &
behavior, **not production code to paste in**. Recreate it in the riftreport.gg codebase (React +
MUI, Roboto). The only real new work is a thin **data adapter** (`ADAPTER_STARTER.js`).

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, and the bar math are specified below and in
`reference/match.css`. Two placeholders: (1) **champion portraits** for bans use a monogram circle —
production uses the real Data Dragon image; (2) **objective icons** are minimal abstract glyphs —
swap in Riot's real objective icons if available (see Assets).

---

## Data — view-model
No formal contract was given. The reference shape (`reference/js/match-data.js`); the adapter fills
it from your end-of-game stats:
```js
match = {
  winner: "blue" | "purple",
  blue:   { kills, gold },
  purple: { kills, gold },
  objectives: [
    { key, label, blue, purple, cap, kind }   // kind: "count" | "binary"
  ],
  bans: { blue: [{ id, champ }], purple: [{ id, champ }] },   // id = championId
}
```
- **`key`** is the icon key — one of `grubs | herald | dragons | atakhan | barons | towers | inhibs`.
- **`cap`** is the realistic maximum for that objective, used to normalize bar length (see Bar math).
  Reference caps: grubs 6, dragons 6, barons 3, towers 11, inhibs 3, herald/atakhan 1.
- **`kind:"binary"`** = a one-off objective (Herald, Atakhan) — at most one team has it; the winning
  side gets a green ✓ next to its value.
- Convention (shared across all sections): **Blue (teamId 100) is always the left side, Purple (200)
  always the right.**

---

## Layout & components

### Section header
- Eyebrow `MATCH DETAILS` (13px / 700 / `letter-spacing 1.2px` / uppercase / `#3C4150`).
- Subhead `Results at the end of the game` — 13.5px `#6B7280`.

### Card 1 — results
White card (`border-radius:10px`, card shadow, `padding:22px 26px 26px`).

**Team summary** — a 3-col grid `1fr auto 1fr`:
- Left: `Blue Team` (16px / 700, `#568CFF`) + a result eyebrow `Victory`/`Defeat` (11px / 700 /
  uppercase; winner is green `#2E9E6B`, loser `#9AA1AD`).
- Center: `VS` (11px / 700 / `letter-spacing 1.5px` / `#9AA1AD`).
- Right: `Purple Team` (`#A35BFF`), right-aligned, same result eyebrow.

**Split bars** (Kills, Gold) — a stat with the blue total on the left, purple on the right, and a
single horizontal bar between them split by share:
- Grid `92px 1fr 92px`. Left value `#0089D6` right-aligned; right value `#8A3FE6` left-aligned; the
  **losing side's value is dimmed** (`#9AA1AD`, weight 600).
- Tiny uppercase label centered above the bar (`KILLS` / `GOLD`).
- Bar: `height:12px`, `radius:7px`, track `#E7E9EE`. Two segments — solid `#568CFF` and `#A35BFF`
  (a 2px transparent gap between) — widths = each team's share of the total. Animates width on mount.
- Gold value formats as `44,879g`.

**Objectives** — a header row (`1fr 132px 1fr`, hairline under it) with `Blue` (right-aligned, blue),
`Objectives` (center, faint), `Purple` (left-aligned, purple). Then one **diverging row** per
objective, grid `32px 1fr 132px 1fr 32px`, thin `#F2F3F5` separators:
- Outer cells = the values. Blue value `#0089D6` (right-aligned), purple `#8A3FE6` (left-aligned); a
  **0 renders muted** `#C7CBD2`. Binary winner gets a green ✓ adjacent to its value.
- Inner cells = the bar halves. Left half is `justify-content:flex-end` so the blue fill grows
  **leftward from the center**; right half grows rightward. Fills are **solid** team colors
  (`#568CFF` / `#A35BFF`), `height:14px`, `radius:5px`, animate width on mount.
- A **zero value** shows a 6px muted stub (`#E4E7EC`) instead of a fill, so the row never looks broken.
- Center label: a monochrome objective glyph (`#9AA1AD`) above the objective name (11.5px / 600 /
  `#3C4150`). For an uncontested binary (both 0, e.g. Atakhan) the name is muted.

### Card 2 — bans
Separate white card. `Bans` label (13px / 700 / uppercase) + two groups of five **round** champion
portraits (46px, team-colored ring), a small dot separator between groups. Each ban has a subtle
diagonal "denied" slash overlay and is slightly desaturated.

### Responsive (≤680px)
Split-bar side columns shrink (64px), objective rows tighten (`26px 1fr 96px 1fr 26px`), ban
portraits shrink to 38px and may wrap.

---

## Bar math (important)
- **Split bars** (kills/gold): each segment width = `value / (blue + purple)` as a %. Before the
  mount-reveal, both sit at 50% so the bar is never empty.
- **Objective diverging bars**: each fill width = `value / cap` as a % of its half-cell, with a floor
  of 8% for any non-zero value (so a `1` is still visible). Zero → the muted stub, not a fill.
- Normalizing by `cap` (not by the row max) keeps lengths **truthful across rows** — Towers 10/11
  nearly fills, Grubs 3/6 is half, and you can compare magnitudes row to row.

## Interactions & behavior
- No user interaction — this is a static results panel. The only motion is the **width reveal** of the
  split bars and objective fills shortly after mount.

### Reveal timing — use a timer, not rAF (learned the hard way)
The bars flip from 0 → final width via a `mounted` flag set on a **`setTimeout(~60ms)`**, NOT
`requestAnimationFrame`. rAF is **paused in hidden/background iframes**, which left every bar stuck at
`width:0` until the frame was focused. A timer fires regardless. Keep this. And per the shared
discipline, the visible end-state is the base — never gate content on a keyframe that starts at
`opacity:0` (so print / PDF / reduced-motion show the bars).

## State management
- Per bar component: a single `grown` boolean (false → true after mount) driving the width transition.
- No data fetching inside components — everything comes from the adapted `match` view-model.

## Design tokens (shared)
```
Team blue #568CFF  link #0089D6      Team purple #A35BFF  link #8A3FE6
Win green #2E9E6B
Ink #14171F · Ink-2 #3C4150 · Muted #6B7280 · Faint #9AA1AD · Zero #C7CBD2
Hairline rgba(20,23,31,.09) · row sep #F2F3F5 · Track #E7E9EE · stub #E4E7EC
Card #fff · Page #ECEDF0
Radius card 10px · bars 5–7px · ban portrait round 46px
Shadow card 0 1px 2px rgba(16,24,40,.06), 0 4px 14px rgba(16,24,40,.05)
Font Roboto 400/500/700
```

## Assets
- **Ban portraits** — Data Dragon
  `https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{ChampionKey}.png`; map
  `championId → ChampionKey` via `champsJSON`. Replace the `Portrait` body with an `<img>`, keep the
  round shape + team ring + the `::after` denied-slash overlay.
- **Objective icons** — the reference uses minimal abstract line glyphs in `OBJ_ICON` (keyed by the
  objective `key`). If you have Riot's real objective icons, drop them in by key; otherwise the glyphs
  are intentionally neutral and on-brand.

## Files
```
reference/Match Details Redesign.html  – standalone prototype entry
reference/styles.css                   – shared tokens + .portrait base
reference/match.css                    – Match Details styles (port to MUI/CSS modules)
reference/js/components.jsx             – shared Portrait (+ helpers)
reference/js/match.jsx                  – MatchDetails, SplitBar, ObjRow, BansRow, OBJ_ICON (port these)
reference/js/match-app.jsx              – MOCK shell (discard)
reference/js/match-data.js              – MOCK data (discard; replace via adapter)
ADAPTER_STARTER.js                      – maps your end-of-game stats → the match view-model
```

## Suggested implementation order
1. Build the results card shell (team summary + the two split bars) with hardcoded props.
2. Add the objective header + `ObjRow` diverging bars; verify the bar math against a blowout
   (Towers 10-2), an even/zero row (Atakhan), and a binary win (Herald ✓).
3. Swap ban `Portrait`s to real Data Dragon images; wire `OBJ_ICON` (yours or the glyphs).
4. Implement `ADAPTER_STARTER.js` against your end-of-game payload.
5. QA: mobile breakpoint, print/reduced-motion (bars must show), and confirm the timer-based reveal.
