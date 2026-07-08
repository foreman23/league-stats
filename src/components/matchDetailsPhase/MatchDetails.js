import React, { useState, useEffect } from 'react';
import StyledTooltip from '../StyledTooltip';

// Redesigned Match Details — end-of-game results as a diverging head-to-head:
// shared center axis. Split bars for kills/gold on top, an objectives table of
// discrete tally ticks (one tick per objective, shared unit scale, growing
// outward from the center labels), and a bans card.

// Reveal flag — uses setTimeout (NOT requestAnimationFrame, which is paused in
// hidden/background iframes and left the bars stuck at width:0). End-state is
// the visible one, so print / reduced-motion still show the bars.
function useGrown() {
  const [g, setG] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setG(true), 60);
    return () => clearTimeout(t);
  }, []);
  return g;
}

const OBJ_ICON = {
  grubs: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="7" cy="9" r="2.4" /><circle cx="13" cy="7" r="2.4" /><circle cx="12" cy="14" r="2.4" /><circle cx="17" cy="13" r="2.4" /></svg>,
  herald: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /></svg>,
  dragons: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2l3 5 5 1-3.5 3.5L18 20l-6-3-6 3 1.5-8.5L4 8l5-1z" /></svg>,
  atakhan: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z" /></svg>,
  barons: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 3l7 4v6c0 4-3 6.5-7 8-4-1.5-7-4-7-8V7z" /><path d="M9 11l1.5 2M15 11l-1.5 2" strokeLinecap="round" /></svg>,
  towers: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M6 21V9l3-2V4h2v3h2V4h2v3l3 2v12M6 21h12M10 21v-4h4v4" /></svg>,
  inhibs: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 2l6 6-6 14L6 8z" /><path d="M6 8h12M12 2v20" strokeWidth="1.4" /></svg>,
};

const Chk = (
  <span className="md-chk"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>
);

// ---- top split bar (kills / gold) ----
function SplitBar({ label, blue, purple, fmt }) {
  const grown = useGrown();
  const total = blue + purple || 1;
  const bp = grown ? (blue / total) * 100 : 50;
  const pp = grown ? (purple / total) * 100 : 50;
  const f = fmt || ((n) => n.toLocaleString());
  const blueWin = blue >= purple;
  return (
    <div className="md-split">
      <span className={'md-sv md-l' + (blueWin ? '' : ' md-dim')}>{f(blue)}</span>
      <div className="md-split-mid">
        <div className="md-split-label">{label}</div>
        <div className="md-bar">
          <div className="md-seg md-blue" style={{ width: bp + '%' }} />
          <div className="md-seg md-gap" />
          <div className="md-seg md-purple" style={{ width: pp + '%' }} />
        </div>
      </div>
      <span className={'md-sv md-r' + (!blueWin ? '' : ' md-dim')}>{f(purple)}</span>
    </div>
  );
}

// ---- objective tallies: one team-colored tick per objective taken ----
// Every row shares the same unit scale (1 tick = 1 objective), so tally length
// is directly comparable across rows — unlike per-row-normalized bars. Ticks
// grow outward from the center labels with a small inside-out stagger.
function Tally({ n, side, grown, secured }) {
  return (
    <div className={'md-tally md-' + side}>
      {side === 'l' && secured && Chk}
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className={'md-tick' + (grown ? ' md-on' : '')}
          style={{ transitionDelay: (side === 'l' ? n - 1 - i : i) * 45 + 'ms' }}
        />
      ))}
      {side === 'r' && secured && Chk}
    </div>
  );
}

// ---- one objective row: [tallies] [count] [icon+label] [count] [tallies] ----
function ObjRow({ obj }) {
  const grown = useGrown();
  const { blue, purple, label, key, kind } = obj;
  const none = blue === 0 && purple === 0;
  const securedSide = kind === 'binary' && !none ? (purple > blue ? 'purple' : 'blue') : null;
  const dash = kind === 'binary' && none; // untaken binary objective reads as "–"

  return (
    <div className={'md-obj' + (kind === 'binary' ? ' md-binary' : '')}>
      <Tally n={blue} side="l" grown={grown} secured={securedSide === 'blue'} />
      <span className={'md-val md-l ' + (blue === 0 ? 'md-zero' : 'md-blue')}>{dash ? '–' : blue}</span>
      <div className="md-obj-label">
        <span className="md-ic">{OBJ_ICON[key]}</span>
        <span className={'md-nm' + (none ? ' md-none' : '')}>{label}</span>
      </div>
      <span className={'md-val md-r ' + (purple === 0 ? 'md-zero' : 'md-purple')}>{dash ? '–' : purple}</span>
      <Tally n={purple} side="r" grown={grown} secured={securedSide === 'purple'} />
    </div>
  );
}

function Ban({ b, side }) {
  const ring = side === 'blue' ? '#568CFF' : '#A35BFF';
  return (
    <StyledTooltip disableInteractive arrow placement="top" title={b.champ}>
      <span className="md-ban" style={{ '--md-ring': ring }}>
        <img className="md-ban-img" src={b.portrait} alt={b.champ} />
      </span>
    </StyledTooltip>
  );
}

// Mirrors the diverging card above: blue bans on the left half, purple on the
// right, with the label in the same 132px center spine as the objectives.
function BansRow({ bans }) {
  if (!bans.blue.length && !bans.purple.length) return null;
  return (
    <div className="md-bans">
      <div className="md-ban-group md-l">
        {bans.blue.map((b, i) => <Ban key={i} b={b} side="blue" />)}
      </div>
      <span className="md-bl">Bans</span>
      <div className="md-ban-group md-r">
        {bans.purple.map((b, i) => <Ban key={i} b={b} side="purple" />)}
      </div>
    </div>
  );
}

export default function MatchDetails({ match }) {
  const blueWin = match.winner === 'blue';
  return (
    <div className="md-wrap">
      <div className="md-card">
        <div className="md-teams">
          <div className="md-team md-blue">
            <span className="md-tname">Blue Team</span>
            <span className={'md-tresult' + (blueWin ? ' md-win' : '')}>{blueWin ? 'Victory' : 'Defeat'}</span>
          </div>
          <span className="md-vs">VS</span>
          <div className="md-team md-purple">
            <span className="md-tname">Purple Team</span>
            <span className={'md-tresult' + (!blueWin ? ' md-win' : '')}>{!blueWin ? 'Victory' : 'Defeat'}</span>
          </div>
        </div>

        <div className="md-splits">
          <SplitBar label="Kills" blue={match.blue.kills} purple={match.purple.kills} fmt={(n) => n} />
          <SplitBar label="Gold" blue={match.blue.gold} purple={match.purple.gold} fmt={(n) => n.toLocaleString() + 'g'} />
        </div>

        <div className="md-obj-head">
          <span className="md-h md-l">Blue</span>
          <span className="md-h md-c">Objectives</span>
          <span className="md-h md-r">Purple</span>
        </div>
        <div className="md-objs">
          {match.objectives.map((o) => <ObjRow key={o.key} obj={o} />)}
        </div>
      </div>

      <div className="md-card">
        <BansRow bans={match.bans} />
      </div>
    </div>
  );
}
