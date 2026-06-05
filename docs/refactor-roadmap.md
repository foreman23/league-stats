# Refactor Roadmap

Tracking the codebase cleanup work. Items came from an architecture review of the
duplication and structure in `src/`. Each "R#" is one refactor.

## ✅ Done

| # | What | Notes |
|---|------|-------|
| **R1** | `src/utils/regions.js` — region/cluster mapping | Deduped platform→cluster logic copied across 6 files (`getAccountCluster`, `getMatchCluster`, `isSeaServer`, `regionValues`). Tests in `src/__tests__/regions.test.js`. |
| **R2** | `src/api/proxy.js` — backend proxy client | Replaced ~16 inline `${REACT_APP_REST_URL}/...` axios calls with typed helpers. axios now lives in one file. Tests in `src/__tests__/proxy.test.js`. |
| **R3** | Patch version in context | Effectively resolved by the perf work — `getVersion()` in `src/api/ddragon.js` is cached, so the old per-page refetch is gone. No separate module needed. |
| **R7** | `src/utils/queues.js` — queue-title mapping | Deduped the description→title map across 4 files. Fixed a latent bug where GameDetails showed ranked games as "Game". Tests in `src/__tests__/queues.test.js`. |
| **R9** | Dead-code removal | Removed abandoned commented-out debug logging + a superseded region block. **Kept** parked/WIP features (Navbar dark-mode toggle + mobile drawer, Arena section-nav buttons, half-built calc blocks). |

Conventions established by R1/R2/R7: pure helpers live in `src/utils/`, API clients in
`src/api/`, tests in `src/__tests__/`. New utilities should follow suit and ship with tests.

## ⬜ Remaining

| # | What | Effort / Impact | Risk |
|---|------|-----------------|------|
| **R4** | `src/utils/matchCache.js` — Firestore read-through dedup | Med / Med-High | **Higher.** Consolidates the `getDoc → /matchinfo → setDoc` pattern + the `7776000000` (90-day) magic number (~6 copies). Failure is *silent* — a subtle bug stops cache hits and silently burns the Riot rate budget. Needs mocked-Firestore tests **and** a live smoke test. Best done together with the timeline-caching perf item (timelines aren't cached at all today). |
| **R5** | `useMatchData` hook + `<MatchDetailsShell>` | High / High | Med. The 4 `*Details` pages share a near-identical scaffold (state, bootstrap effect, region/version/champ loading). Extract into a shared hook + shell so each page is just its mode-specific body. Biggest structural payoff; builds on R2/R4; touches the most code. |
| **R6** | Collapse the 4 `LanePhaseSummaryCard*` into one `lane`-prop component (~700 lines) | Low-Med / Med | Med (visual). Explored and paused: the 4 files have **drifted** (different indentation, `marginTop`/`flex` quirks, div nesting) and contain copy-paste bugs in the Top card (tie text says "bottom lane"; a winner border uses `laneLoser.teamId === 200`). Consolidating means normalizing to one template → some lanes' rendering shifts. Needs visual verification on a cached match (can't be unit-tested). |
| **R8** | `src/App.css` cleanup | High / Med | Low. ~3,750-line single global stylesheet. Add section headers, consolidate media queries, and use CSS Modules for *new* components going forward. Ongoing, lowest urgency. |

### Suggested order
R4 (paired with timeline caching) → R5 is the high-value spine. R6 and R8 are independent
cleanups that can slot in anytime.

## Testing notes
- `npm test` (watch) or `CI=true npm test` (once); single file: `npm test -- src/__tests__/<file>`.
- Pure helpers (regions, queues) are unit-tested directly. The proxy client mocks axios via a
  **factory** (`jest.mock('axios', () => ...)`) because axios v1 ships ESM that CRA's Jest won't
  transform from `node_modules`.
- Several refactors can't be fully verified here (no live Riot key / Firestore). For those,
  the safety net is: exhaustive unit tests for the pure parts + a manual smoke-test checklist
  for the I/O parts.
