# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`riftreport.gg` — a Create React App frontend that fetches and analyzes League of Legends match data. Bootstrapped with CRA (`react-scripts` 5), React 18, MUI 5, axios, chart.js / `@mui/x-charts`, and Firebase Firestore for a client-side cache.

## Commands

- `npm start` — dev server on port 3000.
- `npm run build` — production build to `build/`.
- `npm test` — CRA/Jest watcher. Run one test file with `npm test -- src/path/to/file.test.js`. (Note: no tests currently exist.)
- There is no separate lint command — ESLint runs via `react-scripts` during `start`/`build` (config `react-app` / `react-app/jest`).

## Environment

`.env` (gitignored) holds **all** runtime config — keys are inlined into the bundle at build time, so changes require restarting `npm start`.

- `REACT_APP_REST_URL` — backend proxy base URL. **The proxy server is a separate repository.** Default dev value is `http://localhost:3030`; prod points at `https://rr-proxy-production.up.railway.app`. Without the proxy running, almost nothing on the site works beyond static pages.
- `REACT_APP_FIREBASE_*` — Firestore config for the match/summoner cache (see `src/FirebaseConfig.js`).
- `REACT_APP_EMAILJS_*` — Contact form (`src/pages/Contact.js`).

## Architecture

### Data flow: proxy + Firestore cache

Riot's API is **never** called directly from the browser. Two layers sit in front of it:

1. **Backend proxy** (`REACT_APP_REST_URL`, external repo) wraps Riot endpoints. Known routes used from this app: `/puuid`, `/summoner`, `/ranked`, `/history`, `/matchinfo`, `/matchtimeline`, `/mastery`, `/featuredgame`. Most accept `alternateRegion` (routing cluster: `americas` / `asia` / `europe`) and/or `selectedRegion` (platform: `na1`, `euw1`, etc.).
2. **Firestore cache** (`src/FirebaseConfig.js`) keyed by region. Collections follow `${region}-matches` (one doc per `matchId`) and `${region}-users` (one doc per `${summonerName}-${riotId}`). The pattern in every details page and `SummonerProfile`: check Firestore first; on miss, hit the proxy, then `setDoc` to backfill the cache. **Preserve this read-then-write pattern when editing match/summoner loading code** — it is the only thing protecting the Riot rate budget.

### Region handling

Riot splits "platform" regions (`na1`, `euw1`, `kr`, ...) from "routing" clusters (`americas`, `asia`, `europe`). Several files duplicate the same mapping logic:

- Platform → cluster mapping (`americasServers` / `asiaServers` / `europeServer` arrays) is re-declared in `SummonerSearch.js`, `SummonerProfile.js`, and each `*Details.js` page.
- The numeric dropdown values (10, 20, 30, ...) in `SummonerSearch.js` map to platform codes via a `regionValues` object — the same object is duplicated in `getPrevRegion`.
- `oc1` is special-cased: its Riot ID tag is `OCE`, not `OC1`.

If you change region behavior, search-and-update all duplicated copies.

### Routing → details pages

`App.js` routes by game mode to different detail pages — each handles a different Riot match schema:

- `/match/:matchId/...` → `GameDetails.js` — Summoner's Rift classic (and Swiftplay) games ≥ 5 min. The most feature-rich page: lane phase analysis, op scores, feats, builds, damage pie, gold-diff graph, etc.
- `/aram/:matchId/...` → `AramDetails.js` — uses `CalculateOpScoresAram.js` (different scoring than SR).
- `/arena/:matchId/...` → `ArenaDetails.js` — Cherry/Arena mode.
- `/altmatch/:matchId/...` → `GenericDetails.js` — fallback for remakes (< 5 min classic), URF, and other unsupported modes.

`SummonerSearch.js` and `SummonerProfile.js` pick the route per match by inspecting `gameMode` + `gameDuration` (`CLASSIC` / `SWIFTPLAY` / `ARAM` / `CHERRY` / `URF`). Keep that selector in sync when adding modes.

### Analysis layer (`src/functions/`)

Pure functions that take Riot match JSON and produce derived views. These are the brain of the site — UI components mostly render their output:

- `CalculateOpScores.js` / `CalculateOpScoresAram.js` — per-player 0–100 performance scores (different formulas per mode).
- `LaneAnalysis.js` (`getStatsAt15`) — extracts lane-phase stats from match timeline; powers the `LanePhaseSummaryCard*` components.
- `GenerateFeats.js`, `GenerateShortSummary.js`, `GenerateGraphData.js`, `GetBuildInfo.js` — derived feats, summary text, graph series, and item-build sequences.

### Cross-page state

There's no global store. State crosses page boundaries via:

- `localStorage` keys: `recentSearches`, `favorites`, `searchRegion`, `prevTab`, and `gameData` (a JSON-stringified payload the search/profile pages drop in before navigating, so the details pages can render immediately without re-fetching).
- React Router URL params: region, summoner name, riot ID, match ID.
- Firestore: see above.

### Static reference data

`src/jsonData/runes.json` and `summonerSpells.json` are hand-maintained snapshots of Riot data used to render rune/spell icons. Champion data and the current patch version come live from Riot's DataDragon CDN (`ddragon.leagueoflegends.com`) — version is fetched once in `App.js` and re-fetched per page.

## Conventions

- All app-level styles live in one file: `src/App.css` (~80k lines of class-based styles). New components should reuse existing classes where possible rather than introducing per-component stylesheets.
- Components are functional with hooks; no TypeScript.
- MUI's `Grid` is imported from `@mui/material/Unstable_Grid2` (Grid v2) throughout — match this when adding layout.
