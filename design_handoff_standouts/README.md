# Handoff: Standout Performances — section redesign (riftreport.gg)

## Overview
Redesign of the **Standout Performances** card on a League of Legends match-details page.
It highlights the best (MVP), second-best (2nd), and worst (Int) players of the match. The old
version was a row of three ringed champion portraits with rank pills, and a static text blurb for
the MVP on the right. This redesign keeps that shape but makes the **whole card interactive and
rank-themed**: clicking any of the three avatars switches the right-hand detail panel, and every
accent (badge, active highlight, KDA chip) recolors to that rank.

> Third section in the same visual system. It **reuses** `components.jsx` (`Portrait`) and the
> `:root` tokens from the Laning Phase / Battles work.

## About the Design Files
`reference/` is a **design reference in HTML/React+Babel** — a prototype of the intended look and
behavior, **not production code to paste in**. Recreate it in the riftreport.gg codebase (React +
MUI, Roboto). The only real new work is a small **data adapter** (`ADAPTER_STARTER.js`); everything
else is presentation that ports directly.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, and the select interaction are specified below and
in `reference/standouts.css`. The one placeholder is the **champion portrait** — the reference draws
a striped monogram circle; production uses the real Data Dragon champion image (see Assets).

---

## Data — minimal, inferred
No formal contract was given. The reference shape (`reference/js/standouts-data.js`) — the adapter
fills this from your player stats:
```js
standout = {
  rank: "MVP" | "2ND" | "INT",        // exactly these three, in this order
  name, tag,                           // riot IGN + tagline (for the profile link)
  champ, championId,                   // champion display name + id (for portrait)
  side: "blue" | "purple",             // team → portrait ring + name link color
  k, d, a,                             // kills / deaths / assists
  kda,                                 // ratio number, e.g. 5.4  ((k+a)/max(1,d))
  kp,                                  // kill-participation % (see note)
  summary: { lead, detail },           // dynamic sentence; `lead` is the bolded verb phrase
}
```
**Note on `kp` (kill participation):** this stat was *added* in the redesign (the original card
showed only KDA). It's `(playerKills + playerAssists) / teamTotalKills`. If you don't compute it,
drop the third stat tile — the layout handles two tiles fine. Confirm with the team before shipping.

### How the three ranks are chosen (typical)
- **MVP** = highest performance score on the winning side (not necessarily highest KDA — weight by
  damage share, KP, objective participation, etc. — use whatever the page already computes).
- **2ND** = next-highest performer overall.
- **INT** = lowest performer (most deaths / lowest KDA). Keep the "Int" label (community slang); the
  panel spells it out as "Struggled".

---

## Layout & components

### Card
- `background:#fff`, `border:1px solid rgba(20,23,31,.09)`, `border-radius:10px`, card shadow,
  `padding:22px 24px 24px`.
- Header: eyebrow `STANDOUT PERFORMANCES` (13px / 700 / `letter-spacing 1.2px` / uppercase /
  `#3C4150`) + a 1px bottom hairline.
- Body grid `grid-template-columns:auto 1fr; gap:32px` (stacks at ≤680px).

### Rank theming (the core mechanic)
Each rank maps to a CSS variable set applied to the card root **and** each rail item:
```
MVP  --rank #C9A227  --rank-d #9A7416  --rank-soft #FBF4DE  --rank-border #EBD9A3   (gold)
2ND  --rank #8B93A1  --rank-d #5C636F  --rank-soft #F1F2F4  --rank-border #E2E4E9   (slate)
INT  --rank #D26072  --rank-d #B14457  --rank-soft #FBEDEF  --rank-border #F2D4D9   (muted rose)
```
The card root carries `so-rank-{currentRank}`, so badge, active highlight, and the accented KDA
tile all recolor when the selection changes. **INT is a restrained rose, deliberately not an
alarming red** — keeps the negative signal without breaking the blue/purple palette.

### Left rail — selectable avatars
- Three `<button>`s in a row, `gap:8px`. Each: a **round** champion portrait (68px, team-colored
  ring `box-shadow:0 0 0 2px #fff, 0 0 0 4px {teamColor}`) with a **rank pill** overlapping its
  bottom edge (gold MVP / slate 2nd / rose Int; the 2nd pill uses dark text).
- **Active item** (the selected one): background `var(--rank-soft)`, plus a 3px `var(--rank)`
  underline bar near the bottom. Hover (inactive): `#F7F8FA`.
- `aria-pressed` reflects selection.

### Right detail panel
- **Rank badge** — pill, `var(--rank)` fill, white text (dark text for 2nd), small leading icon
  (crown / medal / warning-triangle). Reads `Most Valuable` / `Runner-up` / `Struggled`.
- **Identity** — IGN as a team-link-colored `<a>` (19px / 700, wrapped in single quotes) + champion
  name (14px `#6B7280`).
- **Stat strip** — three tiles (`#F7F8FA`, 1px border, radius 9px):
  1. **KDA ratio** — *accented* tile (`var(--rank-soft)` bg, `var(--rank-border)` border,
     `var(--rank-d)` text), big 17px value.
  2. **K / D / A** — `6 / 5 / 21` with faint slashes, tabular.
  3. **Kill part.** — `68%` (omit if `kp` unavailable).
- **Summary** — one sentence, 14.5px / 1.6 `#3C4150`: `'{name}' ({champ}) **{lead}**, {detail}` with
  the name in the team link color and `lead` bolded.

### Responsive
- ≤680px: grid collapses to one column, rail centers above the detail, card padding tightens.

---

## Interactions & behavior
- One piece of state: `selectedIndex` (default `0` = MVP). Clicking a rail avatar sets it.
- Switching recolors the whole card (root rank class) and swaps the detail content. No animation is
  required, but a subtle cross-fade on the detail is fine if it follows the static-render rule below.
- Hover states on rail items and the name link.

### Static-render note (same discipline as the other sections)
Don't gate content visibility on `@keyframes` that start at `opacity:0` — anything that animates
must use the visible end-state as its base (so print / PDF / reduced-motion / SSR show content).
This card is mostly static; just keep that rule if you add a detail transition.

## State management
- `selectedIndex: number` on the card. That's it — no fetching inside the component; data comes from
  the adapted `standouts` array.

## Design tokens (shared)
```
Team blue #568CFF link #0089D6 · Team purple #A35BFF link #8A3FE6
Ink #14171F · Ink-2 #3C4150 · Muted #6B7280 · Faint #9AA1AD
Hairline rgba(20,23,31,.09) · Track #E7E9EE · Card #fff · Page #ECEDF0
Rank gold / slate / rose sets — see "Rank theming" above
Radius card 10px · tiles/pills 9–999px · portrait round 68px
Shadow card 0 1px 2px rgba(16,24,40,.06), 0 4px 14px rgba(16,24,40,.05)
Font Roboto 400/500/700
```

## Assets
- **Champion portraits** — Data Dragon
  `https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{ChampionKey}.png`; map
  `championId → ChampionKey` via `champsJSON`. Replace the `Portrait` body with an `<img>`, keep the
  round shape + team ring. (`Portrait` is in `reference/js/components.jsx`; the round/68px override
  lives in `standouts.css` under `.so-port .portrait`.)
- **Icons** — small inline SVGs (crown, medal, warning triangle). No icon font.

## Files
```
reference/Standouts Redesign.html  – standalone prototype entry
reference/styles.css               – shared tokens + .portrait base
reference/standouts.css            – Standouts-specific styles incl. rank themes (port to MUI)
reference/js/components.jsx         – shared Portrait (+ helpers)
reference/js/standouts.jsx          – StandoutsCard, StandoutDetail, RankPill, RANK_META (port these)
reference/js/standouts-app.jsx      – MOCK shell (discard)
reference/js/standouts-data.js      – MOCK data (discard; replace via adapter)
ADAPTER_STARTER.js                  – maps your player stats → the standout view-model
```

## Suggested implementation order
1. Build `StandoutsCard` shell with the rank-theme variable sets + the left rail (hardcoded props).
2. Wire `selectedIndex` state + the active highlight.
3. Build `StandoutDetail` (badge + identity + stat strip + summary).
4. Swap `Portrait` to real Data Dragon images (round + team ring).
5. Implement `ADAPTER_STARTER.js` (rank selection + view-model) against your match data.
6. Decide on `kp` (keep or drop the 3rd tile). QA all three ranks + mobile + print/reduced-motion.
