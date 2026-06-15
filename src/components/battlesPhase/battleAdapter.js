// Adapter: map an existing Battles `fight` payload (built in Battles.js) onto the
// view-model the redesigned BattleCard consumes. The raw per-event `details`
// are passed straight through as `kills` — BattleKill renders them per type.

const LANES = ['Top', 'Jungle', 'Mid', 'Middle', 'Bottom', 'Bot', 'Base'];

// winner from the outcome string ("Blue wins…" / "Purple wins…" / "Even…" / "No Contest…")
function winnerOf(fight) {
  const c = fight.outcome?.[0];
  if (c === 'B') return 'blue';
  if (c === 'P') return 'purple';
  return 'even';
}

// objective tag derived from the generated battle name
function objectiveOf(fight) {
  const n = (fight.battleName || '').toLowerCase();
  if (n.includes('dragon')) return 'dragon';
  if (n.includes('herald')) return 'herald';
  if (n.includes('baron')) return 'baron';
  if (n.includes('grub')) return 'void grubs';
  if (n.includes('base') || n.includes('tower') || n.includes('inhib')) return 'structures';
  return null;
}

// the lane/location word to emphasize in the title (if present)
function locationOf(fight) {
  const loc = (fight.battleLocation || '').trim();
  if (loc) return loc;
  const word = (fight.battleName || '').split(/\s+/).find((w) => LANES.includes(w));
  return word || '';
}

// per-fight gold swing (blue perspective), windowed from the whole-game series
// (graphData.xAxisGold = minute, graphData.yAxisGold = blueGold − purpleGold).
function goldSeries(fight, graphData) {
  const xs = graphData?.xAxisGold || [];
  const ys = graphData?.yAxisGold || [];
  const details = fight.details || [];
  const startMs = details[0]?.timestamp ?? 0;
  const endMs = details[details.length - 1]?.timestamp ?? startMs;

  if (!xs.length) {
    return [{ m: startMs / 60000, diff: 0 }, { m: endMs / 60000, diff: 0 }];
  }

  const base = xs[0];
  let lo = Math.max(0, Math.floor(startMs / 60000) - base);
  let hi = Math.min(xs.length - 1, Math.ceil(endMs / 60000) - base);
  if (hi <= lo) {
    lo = Math.max(0, lo - 1);
    hi = Math.min(xs.length - 1, lo + 1);
  }

  const slice = [];
  for (let i = lo; i <= hi; i++) slice.push({ m: xs[i], diff: ys[i] ?? 0 });
  if (slice.length < 2) {
    return [{ m: Math.floor(startMs / 60000), diff: 0 }, { m: Math.ceil(endMs / 60000), diff: 0 }];
  }
  // rebase so the window starts at 0 — the swing during this fight is what matters.
  const rebase = slice[0].diff;
  return slice.map((p) => ({ m: p.m, diff: p.diff - rebase }));
}

export function toBattleVM(fight, index, graphData) {
  const winner = winnerOf(fight);
  const blueKills = fight.blueKills || 0;
  const purpleKills = fight.redKills || 0;
  const series = goldSeries(fight, graphData);
  const goldSwing = Math.round(series[series.length - 1].diff);

  return {
    id: index,
    winner,
    blueKills,
    purpleKills,
    noContest: fight.outcome?.[0] === 'E' && blueKills === 0 && purpleKills === 0,
    timeLabel: fight.timespan,
    title: fight.battleName || 'Teamfight',
    location: locationOf(fight),
    firstBlood: (fight.battleName || '').toLowerCase().includes('first blood'),
    objective: objectiveOf(fight),
    summary: fight.battleDesc,
    goldSwing,
    kills: fight.details || [],
  };
}
