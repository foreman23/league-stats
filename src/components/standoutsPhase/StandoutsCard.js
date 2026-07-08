import React, { useState } from 'react';
import SummonerName from '../SummonerName';

// Redesigned Standout Performances — a rank-themed card. Clicking one of the
// three avatars (MVP / 2nd / Int) recolors the whole card and swaps the detail.

const CrownIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7l4.5 3.5L12 4l4.5 6.5L21 7l-1.8 11H4.8L3 7z" /></svg>
);
const MedalIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a6 6 0 100-12 6 6 0 000 12zM9 14l-1 7 4-2 4 2-1-7" /></svg>
);
const WarnIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v5M12 16h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z" /></svg>
);

const RANK_META = {
  MVP: { full: 'Most Valuable', pill: 'MVP', silver: false, icon: CrownIcon },
  '2ND': { full: 'Runner-up', pill: '2nd', silver: true, icon: MedalIcon },
  INT: { full: 'Struggled', pill: 'Int', silver: false, icon: WarnIcon },
};

function Portrait({ s }) {
  const ring = s.side === 'blue' ? '#568CFF' : '#A35BFF';
  return (
    <span className="so-port" style={{ '--so-ring': ring }}>
      <img className="so-port-img" src={s.portrait} alt={s.champ} />
    </span>
  );
}

function RankPill({ rank }) {
  const m = RANK_META[rank];
  return <span className={'so-rankpill' + (m.silver ? ' so-silver' : '')}>{m.pill}</span>;
}

function StandoutDetail({ s, version, platformId }) {
  const m = RANK_META[s.rank];
  return (
    <div className="so-detail">
      <span className={'so-badge' + (m.silver ? ' so-silver' : '')}>
        <span className="so-ic">{m.icon}</span>{m.full}
      </span>
      <div className="so-who">
        <SummonerName participant={s.player} version={version} platformId={platformId} className="so-name">
          {s.name}
        </SummonerName>
        <span className="so-champ">{s.champ}</span>
      </div>
      <div className="so-stats">
        <div className="so-stat so-accent">
          <span className="so-v">{s.kda.toFixed(1)}</span>
          <span className="so-l">KDA</span>
        </div>
        <div className="so-stat">
          <span className="so-v">{s.k}<span className="so-sl">/</span>{s.d}<span className="so-sl">/</span>{s.a}</span>
          <span className="so-l">K / D / A</span>
        </div>
        {s.kp != null && (
          <div className="so-stat">
            <span className="so-v">{s.kp}%</span>
            <span className="so-l">Kill part.</span>
          </div>
        )}
      </div>
      <p className="so-summary">
        {s.summary.lead ? <><b>{s.summary.lead}</b>, {s.summary.detail}</> : s.summary.detail}
      </p>
    </div>
  );
}

export default function StandoutsCard({ standouts, version, platformId }) {
  const [sel, setSel] = useState(0);
  const cur = standouts[sel];

  return (
    <div className={'so-card so-rank-' + cur.rank}>
      <div className="so-head"><h2>Standout Performances</h2></div>
      <div className="so-grid">
        <div className="so-rail">
          {standouts.map((s, i) => (
            <button
              key={s.rank}
              className={'so-item so-rank-' + s.rank + (i === sel ? ' so-active' : '')}
              onClick={() => setSel(i)}
              aria-pressed={i === sel}
            >
              <Portrait s={s} />
              <RankPill rank={s.rank} />
            </button>
          ))}
        </div>
        <StandoutDetail s={cur} version={version} platformId={platformId} />
      </div>
    </div>
  );
}
