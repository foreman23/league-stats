# Handoff: Battles (BETA) — section redesign (riftreport.gg)

## Overview
Redesign of the **Battles (BETA)** section on a League of Legends match-details page.
A "battle" is a discrete fight/skirmish during the match. The old version was a stack of
gray accordion rows; expanding one showed a paragraph, a gold-difference graph, and a kill list.
This redesign keeps the same information but rebuilds each battle as a clean **collapsible card**
consistent with the Laning Phase redesign: a scannable header (outcome + scoreline + title + time),
and an expanded body with a one-line takeaway, a **gold-swing area chart**, and a modern
**duel-style kill feed**.

> This is the second section in the same visual system. It **reuses** `components.jsx` (the
> `Portrait` + `useMounted` helpers) and the `:root` tokens / `.kf-*` patterns from the Laning
> Phase work. If you implemented that handoff already, share its primitives here.

## About the Design Files
The files in `reference/` are a **design reference built in HTML/React+Babel** — a standalone
prototype that demonstrates the intended look and behavior. **They are not production code to paste
in.** Recreate this design inside the riftreport.gg codebase using its environment (React + MUI,
Roboto). The reference is structured to port directly; the only real new work is a **data adapter**
from your real battles data to the card view-model (`ADAPTER_STARTER.js`).

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, and interactions are specified below and present in
`reference/battles.css`. The one placeholder is the **champion portrait** — the reference draws a
striped monogram square; production must use the real Data Dragon champion image (see Assets).

---

## Data — no formal contract was provided
The reference **infers** a battle shape (see `reference/js/battles-data.js`). Replace it with the
real data. The card view-model each `BattleCard` consumes:
```js
battle = {
  id,
  winner: "blue" | "purple" | "even",
  blueKills, purpleKills,            // scoreline numbers (blue left, purple right)
  timeLabel: "1:16" | "2:24–3:17",   // single instant OR a range
  window: [startMin, endMin],        // numeric minutes, for the gold graph x-axis
  title: "Fight in Top",             // human title
  location: "Top",                   // substring of title to emphasize in winner color
  firstBlood: boolean,
  objective: null | "dragon" | "herald" | "baron" | "tower",
  summary: { lead, detail },         // dynamic sentence, lead is highlighted
  goldSwing: 239,                    // headline gold diff, BLUE perspective (+ blue / − purple)
  goldSeries: [{ m, diff }],         // gold diff (blue perspective) sampled across the window
  kills: [
    { t:"05:08", side:"blue", type:"champ",
      killer:{ name, tag, champ, side }, victim:{ name, tag, champ, side } },
    { t:"08:33", side:"purple", type:"objective",
      killer:{ name, champ, side }, victim:null, objLabel:"Infernal Dragon" },
  ],
}
```
Conventions (match the Laning Phase rules):
- **Blue (teamId 100) is always the left number; purple (200) always the right** — independent of
  who won. `winner` drives the accent color, eyebrow, and emphasis.
- `goldSwing` and `goldSeries.diff` are from **blue's perspective**: positive = blue ahead (blue
  fill above the zero baseline), negative = purple ahead (purple fill below). The chip shows
  `+239g` (blue) or `−2,931g` (purple); even ≈ `±Ng` gray.
- Kill `side` = the killer's team. `type:"objective"` rows have `victim:null` + an `objLabel`.

---

## Layout & components

### Section header
- Eyebrow `BATTLES` (13px / 700 / `letter-spacing 1.2px` / uppercase / `#3C4150`) + a **BETA pill**
  (10px / 700 / uppercase / white on a purple gradient `#B14BD8→#8A3FE6`, rounded 999px).
- Subhead `Fights that occurred during the match` — 13.5px `#6B7280`.
- Disclaimer `Descriptions are generated and may not be 100% accurate.` — 12.5px `#9AA1AD`.

### Battle card (collapsible)
- `background:#fff`, `border:1px solid rgba(20,23,31,.09)`, `border-radius:10px`,
  `box-shadow` card token, `margin-bottom:12px`, `overflow:hidden`. Hover lifts the shadow.
- **Left accent bar 3px** in the winner color: blue `#568CFF` / purple `#A35BFF` / even `#E7E9EE`.

**Header (a `<button>`, full width, `grid-template-columns:auto 1fr auto`, `gap:18px`, `padding:15px 18px`):**
- *Result block (left):* outcome eyebrow (11px / 700 / uppercase) colored by winner
  (`#0089D6` / `#8A3FE6` / `#9AA1AD`) reading `Blue wins` / `Purple wins` / `Even trade`; below it a
  scoreline — two big 22px / 700 numbers, **blue number `#568CFF`, purple number `#A35BFF`**,
  separated by a gray en-dash.
- *Title (center, flex-1):* 16px / 700 title with the **location word emphasized** in the winner
  color. Under it a tag row: `First blood` (gold chip `#FBF4DE`/`#8A6D1F` w/ a diamond), an
  `{objective} secured` chip (purple/blue soft), and a neutral `N kills` chip.
- *Right:* a time pill (`#F4F5F7`, 1px border, 12.5px / 600 `#6B7280`, tabular) + a chevron that
  rotates 180° when open.
- Hover tints the header `#FAFAFB`.

**Expanded body** (`border-top` hairline, `padding:4px 18px 20px`):
- *Takeaway* — one sentence, 14px / 1.55 `#3C4150`, faint oversized opening quote, the `summary.lead`
  bolded and colored by winner; then `— {summary.detail}`.
- *Body grid* `grid-template-columns:320px 1fr; gap:24px` (stacks at ≤680px):
  - **Gold-swing graph** (left): an SVG area chart, `viewBox 0 0 320 150`. A dashed zero baseline at
    mid-height, faint ±max gridlines + axis labels (`+1.25k` / `0` / `−1.25k` style). Area + 2.5px
    line colored by who's ahead (`#568CFF` / `#A35BFF` / `#9AA1AD`), area is a vertical-fade gradient
    (~0.28→0.06 alpha). The line **draws in** via `stroke-dashoffset`; endpoint dot fades in. Header
    row above it: `GOLD SWING` label + the swing chip. Foot shows window start/end as `M:SS`.
  - **Kill feed** (right): label `KILLS & OBJECTIVES`, then rows of grid `48px auto 1fr`, `gap:12px`,
    hover `#F7F8FA`:
    - **Time** (right-aligned, 12.5px / 600 `#9AA1AD`, tabular).
    - **Duel** — killer champ-avatar (24px) **✕** victim champ-avatar (dimmed). The ✕ is a 13px
      stroked icon `#9AA1AD`. Objective rows show avatar ✕ gold-diamond.
    - **Text** — `{killer} killed {victim}` with both IGNs as team-link-colored `<a>` (14px / 600).
      Objective rows read `{team} secured {objLabel}`.
    - Rows fade/slide in on mount, staggered 55ms (state-driven — see Static-render note).

### Collapse behavior
- Each card owns local `open` state; the first battle is **open by default**, the rest collapsed.
  The panel animates `max-height` (0 ↔ measured `scrollHeight`) over .34s.

### Responsive
- At `max-width:680px`: body grid collapses to one column; the header wraps to two rows with the
  time/chevron on their own row.

---

## Interactions & behavior
- Click anywhere on the header toggles the card. Chevron rotates; panel animates open/closed.
- Entrance animations on first paint: gold line draw-in (~.9s), area fade, kill rows stagger-in.
- Hover states: card shadow lift, header tint, kill-row tint, name-link underline.

### Static-render note (same discipline as Laning Phase)
Entrance reveals must **never** leave content stuck hidden in a non-animating render (print, PDF,
`prefers-reduced-motion`, SSR). Everything animates **from** a visible end-state, driven by a
`mounted` state flag + CSS transitions — never `@keyframes` starting at `opacity:0`. Preserve this.

## State management
- Per card: `open: boolean` and a measured panel height for the max-height transition.
- A `mounted` flag gating entrance transitions; the gold graph measures its line length for draw-in.
- No data fetching in the components — everything comes from the adapted `battle` view-model.

## Design tokens (shared with Laning Phase)
```
Team blue   #568CFF   link #0089D6   soft #EEF4FF
Team purple #A35BFF   link #8A3FE6   soft #F6EFFF
Ink #14171F · Ink-2 #3C4150 · Muted #6B7280 · Faint #9AA1AD
Hairline rgba(20,23,31,.09) · Track #E7E9EE · Card #fff · Page #ECEDF0
Objective gold #C9A227   chip bg #FBF4DE  border #EBD9A3  text #8A6D1F
BETA pill gradient #B14BD8 → #8A3FE6
Radius card 10px · chips/controls 6–8px · portrait xs 5px
Shadow card 0 1px 2px rgba(16,24,40,.06), 0 4px 14px rgba(16,24,40,.05)
       hover 0 2px 4px rgba(16,24,40,.07), 0 10px 28px rgba(16,24,40,.09)
Font Roboto 400/500/700
```

## Assets
- **Champion portraits** — Data Dragon
  `https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{ChampionKey}.png`; map
  `championId → ChampionKey` via `champsJSON`. Replace the `Portrait` body with an `<img>`, keep the
  team-color ring + size classes. (`Portrait` lives in `reference/js/components.jsx`.)
- **Icons** — small inline SVGs only (✕ duel mark, chevron, objective diamond). No icon font.

## Files
```
reference/Battles Redesign.html   – standalone prototype entry
reference/styles.css              – shared tokens + .kf-*/.portrait base (from Laning Phase)
reference/battles.css             – Battles-specific styles (port to MUI/CSS modules)
reference/js/components.jsx        – shared: Portrait, useMounted, champHue, mono, TEAM
reference/js/battles.jsx           – BattleCard, BattleScore, BattleTitle, GoldDiffGraph,
                                     BattleKill, Duelist  (port these)
reference/js/battles-app.jsx       – MOCK page shell (discard)
reference/js/battles-data.js       – MOCK battles (discard; replace with real data via the adapter)
ADAPTER_STARTER.js                 – stubs mapping real battle data → the card view-model
```

## Suggested implementation order
1. Build the `BattleCard` header (result + title + time + chevron) with hardcoded props.
2. Add the collapse (open state + max-height transition).
3. Port the takeaway + `GoldDiffGraph` (gold-swing area chart).
4. Port `BattleKill` + `Duelist`; swap `Portrait` to real Data Dragon images.
5. Implement `ADAPTER_STARTER.js` against the real battles payload.
6. QA every state: first blood (single kill), even trade, team win, objective battle, mobile,
   print/reduced-motion.
