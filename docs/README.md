# riftreport.gg — Developer Documentation

A [Create React App](https://github.com/facebook/create-react-app) frontend that fetches and
analyzes League of Legends match data. It searches summoners, displays their profile and match
history, and renders deep per-match analysis (op scores, lane phase, builds, feats, graphs).

This document is the high-level map of the project. For the terse working-rules version, see
[`/CLAUDE.md`](../CLAUDE.md) in the repo root.

---

## Tech stack

| Concern        | Choice                                                            |
| -------------- | ----------------------------------------------------------------- |
| Framework      | React 18 (functional components + hooks, **no TypeScript**)       |
| Tooling        | Create React App (`react-scripts` 5) — webpack/Babel/ESLint baked in |
| Routing        | `react-router-dom` 6                                              |
| UI             | MUI 5 (`@mui/material`, `@mui/icons-material`). Grid is **Grid v2** (`@mui/material/Unstable_Grid2`) |
| Charts         | `chart.js` 4 and `@mui/x-charts` 7                                |
| HTTP           | `axios`                                                           |
| Cache / DB     | Firebase Firestore (client-side cache only)                       |
| Contact form   | `@emailjs/browser`                                                |

---

## Getting started

```bash
npm install
npm start        # dev server on http://localhost:3000
npm run build    # production build to build/
npm test         # CRA/Jest watcher (no tests currently exist)
```

There is **no separate lint command** — ESLint runs through `react-scripts` during `start` /
`build` (config: `react-app` / `react-app/jest`).

> **Important:** Without the backend proxy running (see below), almost nothing on the site works
> beyond the static pages. The proxy lives in a **separate repository**.

### Environment

All runtime config lives in `.env` (gitignored). Keys are **inlined into the bundle at build
time**, so any change requires restarting `npm start`.

| Variable                       | Purpose                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| `REACT_APP_REST_URL`           | Backend proxy base URL. Dev: `http://localhost:3030`. Prod: `https://rr-proxy-production.up.railway.app` |
| `REACT_APP_FIREBASE_*`         | Firestore config (see `src/FirebaseConfig.js`) — 7 keys                  |
| `REACT_APP_EMAILJS_*`          | Contact form (`src/pages/Contact.js`) — 3 keys                          |

---

## Architecture

### Data flow: proxy + Firestore cache

Riot's API is **never** called directly from the browser. Two layers sit in front of it:

```
Browser ──> Firestore cache ──(miss)──> Backend proxy ──> Riot API
              ^                              │
              └────── setDoc (backfill) ─────┘
```

1. **Backend proxy** (`REACT_APP_REST_URL`, external repo) wraps Riot endpoints. Routes used by
   this app:

   `/puuid` · `/summoner` · `/ranked` · `/history` · `/matchinfo` · `/matchtimeline` ·
   `/mastery` · `/featuredgame`

   Most accept `alternateRegion` (routing cluster — `americas` / `asia` / `europe`) and/or
   `selectedRegion` (platform — `na1`, `euw1`, etc.).

2. **Firestore cache** (`src/FirebaseConfig.js`), keyed by region:
   - `${region}-matches` — one doc per `matchId`
   - `${region}-users` — one doc per `${summonerName}-${riotId}`

   Every details page and `SummonerProfile` follows the **read-then-write** pattern: check
   Firestore first; on miss, hit the proxy, then `setDoc` to backfill the cache. **Preserve this
   pattern when editing match/summoner loading code** — it is the only thing protecting the Riot
   rate budget.

### Region handling

Riot splits **platform** regions (`na1`, `euw1`, `kr`, …) from **routing** clusters (`americas`,
`asia`, `europe`). The mapping logic is duplicated across several files — if you change region
behavior, search-and-update all copies:

- Platform → cluster arrays (`americasServers` / `asiaServers` / `europeServer`) are re-declared in
  `SummonerSearch.js`, `SummonerProfile.js`, and each `*Details.js`.
- The numeric dropdown values (10, 20, 30, …) → platform codes via a `regionValues` object in
  `SummonerSearch.js`, duplicated in `getPrevRegion`.
- `oc1` is special-cased: its Riot ID tag is `OCE`, not `OC1`.

### Routing → details pages

`App.js` defines all routes. Match detail pages are chosen **by game mode**, because each Riot
match schema differs:

| Route                          | Page                | Handles                                                  |
| ------------------------------ | ------------------- | ------------------------------------------------------- |
| `/`                            | `SummonerSearch.js` | Landing + search, recent/favorite cards, featured game  |
| `/profile/:region/:name/:riotId` | `SummonerProfile.js` | Summoner overview + match history                       |
| `/match/:matchId/...`          | `GameDetails.js`    | Summoner's Rift classic & Swiftplay ≥ 5 min (richest page) |
| `/aram/:matchId/...`           | `AramDetails.js`    | ARAM (uses `CalculateOpScoresAram.js`)                  |
| `/arena/:matchId/...`          | `ArenaDetails.js`   | Cherry / Arena mode                                     |
| `/altmatch/:matchId/...`       | `GenericDetails.js` | Fallback: remakes (< 5 min), URF, other unsupported modes |
| `/nosummoner/...`, `/loading`, `/about`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/*` | misc pages | Static / status pages |

`SummonerSearch.js` and `SummonerProfile.js` pick the route per match by inspecting `gameMode` +
`gameDuration` (`CLASSIC` / `SWIFTPLAY` / `ARAM` / `CHERRY` / `URF`). **Keep that selector in sync
when adding modes.**

### Analysis layer (`src/functions/`)

Pure functions that take Riot match JSON and produce derived views — the brain of the site; UI
components mostly render their output.

| File                          | Output                                                      |
| ----------------------------- | ---------------------------------------------------------- |
| `CalculateOpScores.js`        | Per-player 0–100 performance score (Summoner's Rift formula) |
| `CalculateOpScoresAram.js`    | Same, ARAM-specific formula                                 |
| `LaneAnalysis.js`             | `getStatsAt15` — lane-phase stats from match timeline       |
| `GenerateFeats.js`            | Notable achievements ("feats") per player                  |
| `GenerateShortSummary.js`     | Human-readable match summary text                          |
| `GenerateGraphData.js`        | Time-series data for graphs                                |
| `GetBuildInfo.js`             | Item-build sequence / order                                |

### Components (`src/components/`)

Presentational pieces rendered by the pages:

- **Layout / nav:** `Navbar.js`, `Footer.js`, `ScrollTopButton.js`
- **Search results:** `SummonerCard.js` (recent / favorite cards), `DisplayGame.js`
- **Match tables:** `OverviewTable.js`, `DetailsTable.js`
- **Lane phase:** `LanePhaseSummaryCard{Top,Jg,Mid,Bot}.js` — powered by `LaneAnalysis.js`
- **Charts / visuals:** `Graphs.js`, `TeamGoldDifGraph.js`, `DamagePie.js`, `BubblesSummary.js`
- **Highlights:** `Standout.js`, `DisplayFeats.js`, `Battles.js`, `Builds.js`

### Static reference data (`src/jsonData/`)

- `runes.json`, `summonerSpells.json` — hand-maintained snapshots of Riot data for rune/spell icons.
- Champion data and the current patch version come **live** from Riot's DataDragon CDN
  (`ddragon.leagueoflegends.com`). The version is fetched once in `App.js` and re-fetched per page.

### Cross-page state

There is **no global store**. State crosses page boundaries via:

- **`localStorage`** keys: `recentSearches`, `favorites`, `searchRegion`, `prevTab`, and `gameData`
  (a JSON-stringified payload the search/profile pages drop in before navigating, so details pages
  can render immediately without re-fetching).
- **React Router URL params:** region, summoner name, riot ID, match ID.
- **Firestore:** see the cache section above.

---

## Conventions

- **All app-level styles live in one file:** `src/App.css` (large, class-based). New components
  should reuse existing classes rather than introduce per-component stylesheets.
- Components are **functional with hooks**; no TypeScript.
- MUI `Grid` is imported from `@mui/material/Unstable_Grid2` (Grid v2) throughout — match this when
  adding layout.

---

## Project layout

```
league-site/
├── public/              # CRA static assets, index.html
├── src/
│   ├── App.js           # Router + all routes; fetches DataDragon version
│   ├── index.js         # React root
│   ├── App.css          # All app styles (class-based)
│   ├── FirebaseConfig.js# Firestore init + export
│   ├── pages/           # Route-level components (search, profile, *Details, static pages)
│   ├── components/      # Presentational pieces rendered by pages
│   ├── functions/       # Pure analysis functions (op scores, lane, feats, graphs, builds)
│   └── jsonData/        # Static Riot snapshots (runes, summoner spells)
├── docs/                # This documentation
├── CLAUDE.md            # Working rules for Claude Code / contributors
└── .env                 # Runtime config (gitignored)
```
