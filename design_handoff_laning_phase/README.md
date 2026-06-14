# Handoff: Laning Phase Results — section redesign (riftreport.gg)

## Overview
Redesign of the **Laning Phase Results** section on a League of Legends match-details page.
It reports who won each lane at the 15-minute mark. The old version was four near-duplicate
cards of long sentences with Summary / Bloodshed / CS Graph tabs. This redesign keeps the same
information but makes it visual and scannable: one **parameterized lane card** with an outcome
headline, a 0–5 severity meter, a center gold tug-of-war bar, a one-line dynamic takeaway, and a
**segmented control** (Summary / Kill feed / CS graph) that swaps the detail view.

There are four lanes: **Top, Jungle, Mid** are 1v1; **Bottom** is 2v2 (ADC + Support per side).

## About the Design Files
The files in `reference/` are a **design reference built in HTML/React+Babel** — a prototype that
shows the intended look and behavior. **They are not production code to paste in.** The task is to
**recreate this design inside the riftreport.gg codebase** using its existing environment (React +
MUI, Roboto). The current `reference/js/*.jsx` are written with plain React (no JSX build step,
loaded via in-browser Babel) purely so the prototype runs standalone — reimplement them as normal
components in your build.

Crucially, the visual layer in the reference is **already structured to port directly**. The only
real new work is a **data adapter** from your real data contract to the card's view-model. A starter
for that adapter is provided in `ADAPTER_STARTER.js`.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, and interactions are all specified
below and present in `reference/styles.css`. Recreate pixel-faithfully using MUI components +
your token system. The one placeholder is the **champion portrait** — the reference draws a striped
monogram square; production must use the real Data Dragon champion image (see Assets).

---

## The chosen direction
Three layouts were explored (Unified / Segmented pills / Hybrid expand). **The approved direction is
the segmented-pill version** — `LaneCardB` in `reference/js/variants.jsx`. Ignore `LaneCardA` and
`LaneCardC`; they are alternates left in the file for reference only.

## Data contract (input)
Each lane card is built from:
```
gameData, gameDuration, champsJSON, dataDragonVersion, timelineData, statsAt15
```
```js
statsAt15.laneResults.TOP = {
  laneWinner: { riotIdGameName, riotIdTagline, championId, teamId, kdaAlt, cs, gold },
  laneLoser:  { riotIdGameName, riotIdTagline, championId, teamId, kdaAlt, cs, gold },
  teamWonLane: 100,        // 100 = blue, 200 = purple
  goldDifference: 2350,
  resTag: "dominates",     // obliterates ≥3000 | dominates ≥2000 | won ≥150 | draw
  bubbleCount: 4,          // 0–5 severity
}
// BOTTOM: laneWinner/laneLoser are ARRAYS of two players ([ADC, SUP]).

statsAt15.laningKills = [
  { timestamp: 240000, killerId: 1, victimId: 6, monsterType: null },        // champ kill
  { timestamp: 480000, killerId: 2, victimId: 0, monsterType: "RIFTHERALD" },// monster kill
  { timestamp: 840000, killerId: 0, victimId: 6, monsterType: null },        // killerId 0 = tower/execute
]
// CS graph: per-minute cumulative CS per player, minutes 2–15 (from timelineData frames).
```

## Card view-model (what the components consume)
The adapter must turn each `laneResults[LANE]` into this shape (see `ADAPTER_STARTER.js`):
```js
lane = {
  anchor: "laningTopAnchor",            // PRESERVE — see Anchor IDs below
  laneKey: "top", laneLabel: "Top",
  duo: false,                            // true only for BOTTOM
  resTag: "dominates",
  teamWonLane: 100,                      // 100 blue | 200 purple | (draw: ignored)
  goldDifference: 2350,
  bubbleCount: 4,                        // 0–5
  blue:   [player, ...],                 // teamId 100, ALWAYS left  (BOTTOM: [ADC, SUP])
  purple: [player, ...],                 // teamId 200, ALWAYS right (BOTTOM: [ADC, SUP])
  kills:  [{ t, killer, victim, side, type }],  // type: "champ" | "monster" | "tower"
  cs:     { [champName]: [{ m, cs }, ...] },     // minutes 2–15
}
player = {
  name, tag, champ, championId, side:"blue"|"purple",
  kda:"3/0/2", cs:142, gold:7240,
  winner:true, role:"ADC"|"SUP"|undefined,
  portrait:"https://ddragon…/Aatrox.png"
}
```
Orientation rule: **blue (teamId 100) is always the left side, purple (200) always the right**,
regardless of who won. `winner` is `teamWonLane === player.teamId && resTag !== "draw"`.

---

## Layout & components

### Section header
- Eyebrow `LANING PHASE RESULTS` — 13px / 700 / `letter-spacing 1.2px` / uppercase / `#3C4150`.
- Subhead `How each lane was performing @ 15 minutes` — 14px / `#6B7280`.
- 1px bottom divider `rgba(20,23,31,.09)`, 18px gap below.

### Lane card (the parameterized component)
- `background:#fff`, `border:1px solid rgba(20,23,31,.09)`, `border-radius:10px`,
  `box-shadow:0 1px 2px rgba(16,24,40,.06), 0 4px 14px rgba(16,24,40,.05)`,
  `padding:18px 20px 20px`, `margin-bottom:14px`. Hover raises shadow to
  `0 2px 4px rgba(16,24,40,.07), 0 10px 28px rgba(16,24,40,.09)`.
- Draw cards get a faint `#FCFCFD` background.
- `scroll-margin-top:80px` (so anchor scroll lands cleanly under any sticky header).

**Card header row** (flex, space-between, align-start):
- *Left — headline + severity.*
  - Headline 18px / 700 / `-.2px`. Format: non-draw → `"{Blue|Purple} {resTag} {laneKey}"`
    with the team word colored (`#568CFF` blue / `#A35BFF` purple) and the rest `#14171F`;
    draw → `"{LaneLabel} was a draw"` all `#14171F`.
  - Severity = five 9px dots, `gap:5px`. Filled dots use the winning team color; empty are `#E7E9EE`.
    Draw shows 0 filled + an `EVEN` label (11px / 700 / `#9AA1AD`). Dots pop in on mount
    (scale 0→1, staggered 55ms, `cubic-bezier(.34,1.56,.64,1)`).
- *Right — gold chip.* `padding:7px 12px`, `background:#F4F5F7`, `border:1px solid rgba(20,23,31,.09)`,
  `radius:8px`. Amount 15px / 700 colored by winner (`#0089D6` blue link / `#8A3FE6` purple link /
  `#6B7280` even). Tier label 11px / 600 / uppercase / `#6B7280` = `goldLabel(diff)` + `" gold"`.

**Segmented control** (replaces the old tabs):
- Inline-flex, `background:#F1F2F4`, `border:1px solid rgba(20,23,31,.09)`, `radius:9px`, `padding:3px`.
- Buttons 13px / 600, `padding:7px 14px`, `radius:7px`. Inactive `#6B7280` (hover `#14171F`).
  **Active**: `background:#fff`, `#14171F`, `box-shadow:0 1px 2px rgba(16,24,40,.12)`.
- Tabs: `Summary` · `Kill feed` (+count badge) · `CS graph`. Count badge: 10px / 700, pill,
  `#E7E9EE`/`#3C4150`, turning `#EEF4FF`/`#0089D6` when its tab is active.
- Default tab = **Summary**. Panel swaps with a 5px translateY ease (opacity stays 1 — do not fade
  from 0, see "Static-render note").

**Summary panel** — `Matchup` + `TakeawayLine`:
- Matchup is a 3-col grid `1fr 210px 1fr`, align-center. Bottom (2v2) stacks two player rows per side.
- *Player block*: square portrait (50px, `radius:8px`, ring = `box-shadow:0 0 0 2px #fff, 0 0 0 4px {teamColor}`;
  duo uses 42px) + name + champ + KDA/CS. Left side is mirrored (portrait toward center, text right-aligned).
  Winner portrait shows a small gold crown badge (top-right).
  - Name: `<a>` 14.5px / 600, color `#0089D6` (blue) / `#8A3FE6` (purple), underline on hover.
  - Champ caption 12px `#9AA1AD` (+ ` · ADC`/` · SUP` role tag for bottom).
  - KDA 13px / 600 `#3C4150` rendered `3 / 0 / 2`; CS 13px `#6B7280`. `tabular-nums`.
- *Center gold tug-of-war* (SVG, `viewBox 0 0 200 14`, `preserveAspectRatio="none"`, width 100%):
  track rect `#E7E9EE` r6; a fill rect grows from center (x=100) toward the winner, width =
  `min(goldDiff/4000,1)*100` user-units, colored `#568CFF`/`#A35BFF`; white 2px center tick.
  Draw = two faint 16-unit stubs at 0.5 opacity. Above it a `VS` label; below it `Blue`/`Purple`
  end labels (winner side colored, other `#E7E9EE`). **Render at final geometry — see Static-render note.**
- *TakeawayLine* — one sentence, 13.5px / 1.55 / `#3C4150`, with a faint oversized opening quote.
  - non-draw: `"{champ} {lead} ({kda}) — {tier}, +{gold} gold for {Team}."` where `lead` =
    `{obliterates:"hard-carried the lane", dominates:"won the trades", won:"came out ahead"}[resTag]`.
    Champ name, `+{gold} gold` colored by winner link color; kda + tier bold `#14171F`.
  - draw: `"Dead even. {champA} and {champB} traded blows and CS, separated by just +{gold} gold."`

**Kill feed panel** — a modern vertical timeline-list (this replaces the old text list AND my earlier
horizontal-timeline idea; the client specifically wanted the list format, modernized):
- A `.kf-list` with a vertical spine line (`#E7E9EE`, 2px) at x≈69px.
- Each row = grid `48px 24px 1fr`, `gap:10px`, `padding:5px 0`, hover `#F7F8FA`, `radius:8px`.
  - **Time** (col 1, right-aligned) `{minute}:00`, 12px / 600 `#9AA1AD`, tabular.
  - **Node** (col 2) an 11px dot on the spine: champ kill = killer team color; monster = gold `#C9A227`
    rounded square; tower = white with `#9AA1AD` ring.
  - **Event** (col 3) inline-flex: champ-avatar (24px) + IGN link, verb, second avatar + IGN.
    - champ kill: `{killer} killed {victim}`
    - monster: `{killer} secured` + objective chip (`#FBF4DE`/`#8A6D1F`, e.g. "Rift Herald")
    - tower/execute (killerId 0): turret glyph + `{victim} fell to turret` (no killer)
  - Names are links, team-link-colored, 13.5px / 600.
  - Rows fade/slide in on mount, staggered 55ms (state-driven — see Static-render note).
- Empty state (e.g. Mid had no kills): centered italic `#9AA1AD`
  `"No kills or objectives before 15:00 — a quiet, even lane."`

**CS graph panel** — `reference/js/graph.jsx`:
- SVG line chart, `viewBox 0 0 620 168`. X = minutes 2–15, Y = 0..(ceil maxCS/25*25).
- One line per player (2.5px), colored by team (`#568CFF`/`#A35BFF`); **support lines dashed** (`4 4`, 2px).
- 3 horizontal gridlines + y labels; x labels at 2/5/8/11/15m. Endpoint dot in the player's link color.
- Lines **draw in** on mount via `stroke-dashoffset` (state-driven). Legend below: line swatch +
  IGN + `· {finalCS} CS` (+ `(sup)`), each in its link color.

### Mobile / responsive
- At `max-width:640px` the matchup collapses to one column: gold tug-of-war moves to the top (`order:-1`),
  portraits stack, all text/stat left-aligns, card header becomes a column. The reference also includes a
  390px phone frame demoing this; the real implementation just needs the responsive breakpoint.

---

## Interactions & behavior
- **Segmented control**: local `tab` state per card, default `"summary"`. Switching swaps the panel.
  Kill feed shows a count badge; CS graph lines redraw each time the tab is opened (acceptable).
- **Animations** (all tasteful, ~0.25–1.1s): severity dots pop-in (stagger), kill-feed rows slide-in
  (stagger), CS lines draw-in, gold-chip none, gold-bar none (intentionally static — see note).
- **Hover**: card shadow lift; segmented buttons; name links underline; kill-feed rows tint.
- No loading/error states in scope (data is present when the section renders).

### Static-render note (important)
Entrance reveals must **never** leave content stuck hidden in a non-animating render (print, PDF,
`prefers-reduced-motion`, SSR snapshot). In the reference, anything that animates uses the visible
end-state as its base and is **driven by component state** (a `mounted` flag) with CSS transitions —
not by `@keyframes` that start at `opacity:0`. The gold tug-of-war is rendered at final geometry with
no transform animation for the same reason. Preserve this discipline when reimplementing.

## State management
- Per card: `tab: "summary" | "feed" | "graph"`.
- A `mounted` boolean (set true after first paint) gating entrance transitions.
- CSGraph: `drawn` boolean + measured path lengths for the draw-in.
- No data fetching inside the components — everything comes from the adapted `lane` view-model.

## Anchor IDs — MUST preserve
The four cards each render `id={lane.anchor}`, and these exact IDs are scroll targets for the
short-summary phrases/bubbles elsewhere on the page:
```
TOP → laningTopAnchor   JUNGLE → laningJgAnchor   MID → laningMidAnchor   BOTTOM → laningBotAnchor
```
Keep them on the production card root. (The reference prefixes them per-variant only to avoid
duplicate IDs on the comparison page — drop the prefix in production.)

## Design tokens
```
Team blue           #568CFF      Team purple          #A35BFF
Blue light tint     #9EDCFF      Purple light tint    #C9A6FF
Blue name link      #0089D6      Purple name link     #8A3FE6
Blue soft bg        #EEF4FF      Purple soft bg       #F6EFFF
Ink (headings)      #14171F      Ink-2                #3C4150
Muted text          #6B7280      Faint text           #9AA1AD
Hairline            rgba(20,23,31,.09)                Track / empty       #E7E9EE
Objective gold      #C9A227   chip bg #FBF4DE  chip border #EBD9A3  chip text #8A6D1F
Page bg             #ECEDF0      Card bg              #fff
Dark tooltip        #1A1C20 (white text, 8px radius)  — spec'd by client; not currently used in B

Radius   card 10px · chips/controls 8–9px · inner 6–7px · portrait 8px (sm 7 / xs 5)
Shadow   card 0 1px 2px rgba(16,24,40,.06), 0 4px 14px rgba(16,24,40,.05)
         card-hover 0 2px 4px rgba(16,24,40,.07), 0 10px 28px rgba(16,24,40,.09)
Font     Roboto 400 / 500 / 700 (already your MUI default)
```

## Assets
- **Champion portraits** — Data Dragon:
  `https://ddragon.leagueoflegends.com/cdn/{dataDragonVersion}/img/champion/{ChampionKey}.png`.
  Map `championId → ChampionKey` via `champsJSON`. The reference uses a striped-monogram placeholder
  (`Portrait` in `components.jsx`); replace its body with an `<img>` while keeping the wrapper's
  team-color ring, size classes, and winner crown.
- **Icons** — small inline SVGs only (turret, objective diamond, chevrons, crown). No icon font needed.
- No other external assets.

## Files
```
reference/Laning Phase Redesign.html   – standalone prototype entry (Option B is what renders)
reference/styles.css                   – full visual system + tokens (port to MUI/CSS modules)
reference/js/components.jsx            – Portrait, SeverityDots, GoldTug, PlayerRow, Matchup,
                                         KillFeed, FeedActor, TakeawayLine, useMounted, champMap
reference/js/graph.jsx                 – CSGraph
reference/js/variants.jsx              – LaneCardB (→ rename LaneCard), CardHeader, Headline,
                                         segmented control (LaneCardA/C are unused alternates)
reference/js/data.js                   – MOCK data + goldLabel()/headline() helpers (copy the helpers,
                                         discard the mock)
reference/js/app.jsx                   – MOCK page shell (discard)
ADAPTER_STARTER.js                     – stubs to map your data contract → the card view-model
```

## Suggested implementation order
1. Build the `LaneCard` shell (header + segmented control) with hardcoded props; confirm it renders.
2. Port `Matchup` + `GoldTug` + `TakeawayLine` (Summary tab).
3. Swap `Portrait` to real Data Dragon images.
4. Implement `ADAPTER_STARTER.js` (`toLaneVM`, `adaptKills`, `adaptCS`, `champName`).
5. Port `KillFeed` and `CSGraph`.
6. Wire the four lanes with real anchor IDs; verify the summary-phrase bubbles still scroll-to.
7. QA: draw case (Mid), 2v2 case (Bottom), mobile breakpoint, print/reduced-motion.
