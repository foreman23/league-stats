import React, { useState, useEffect } from 'react';
import StyledTooltip from '../StyledTooltip';

// Redesigned Match Details — end-of-game results as a diverging head-to-head:
// shared center axis. Split bars for kills/gold on top, an objectives table of
// discrete tally ticks (one tick per objective, shared unit scale, growing
// outward from the center labels), and a bans card.
//
// Sides are VIEWER-RELATIVE: the viewed player's team renders on the LEFT
// (like the lane cards); team colors still follow the actual team.

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

const TEAM_LABEL = { blue: 'Blue', purple: 'Purple' };

// ---- top split bar (kills / gold); leftSide/rightSide are team names ----
function SplitBar({ label, leftSide, rightSide, left, right, fmt }) {
  const grown = useGrown();
  const total = left + right || 1;
  const lp = grown ? (left / total) * 100 : 50;
  const rp = grown ? (right / total) * 100 : 50;
  const f = fmt || ((n) => n.toLocaleString());
  const leftWin = left >= right;
  return (
    <div className="md-split">
      <div className="md-split-label">{label}</div>
      <span className={`md-sv md-l md-t-${leftSide}` + (leftWin ? '' : ' md-dim')}>{f(left)}</span>
      <div className="md-bar">
        <div className={`md-seg md-${leftSide}`} style={{ width: lp + '%' }} />
        <div className="md-seg md-gap" />
        <div className={`md-seg md-${rightSide}`} style={{ width: rp + '%' }} />
      </div>
      <span className={`md-sv md-r md-t-${rightSide}` + (!leftWin ? '' : ' md-dim')}>{f(right)}</span>
    </div>
  );
}

// ---- objective tallies: one team-colored tick per objective taken ----
// Every row shares the same unit scale (1 tick = 1 objective), so tally length
// is directly comparable across rows — unlike per-row-normalized bars. Ticks
// grow outward from the center labels with a small inside-out stagger.
// `pos` (l|r) controls justification/stagger; `team` controls tick color.
function Tally({ n, pos, team, grown, secured }) {
  return (
    <div className={`md-tally md-${pos} md-team-${team}`}>
      {pos === 'l' && secured && Chk}
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className={'md-tick' + (grown ? ' md-on' : '')}
          style={{ transitionDelay: (pos === 'l' ? n - 1 - i : i) * 45 + 'ms' }}
        />
      ))}
      {pos === 'r' && secured && Chk}
    </div>
  );
}

// ---- one objective row: [tallies] [count] [icon+label] [count] [tallies] ----
function ObjRow({ obj, leftSide, rightSide }) {
  const grown = useGrown();
  const { label, key, kind } = obj;
  const left = obj[leftSide];
  const right = obj[rightSide];
  const none = left === 0 && right === 0;
  const securedPos = kind === 'binary' && !none ? (right > left ? 'r' : 'l') : null;
  const dash = kind === 'binary' && none; // untaken binary objective reads as "–"

  return (
    <div className={'md-obj' + (kind === 'binary' ? ' md-binary' : '')}>
      <Tally n={left} pos="l" team={leftSide} grown={grown} secured={securedPos === 'l'} />
      <span className={'md-val md-l ' + (left === 0 ? 'md-zero' : `md-${leftSide}`)}>{dash ? '–' : left}</span>
      <div className="md-obj-label">
        <span className="md-ic">{OBJ_ICON[key]}</span>
        <span className={'md-nm' + (none ? ' md-none' : '')}>{label}</span>
      </div>
      <span className={'md-val md-r ' + (right === 0 ? 'md-zero' : `md-${rightSide}`)}>{dash ? '–' : right}</span>
      <Tally n={right} pos="r" team={rightSide} grown={grown} secured={securedPos === 'r'} />
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

// Mirrors the diverging card above: the viewer's team's bans on the left half,
// the opponent's on the right, label in the same 132px center spine.
function BansRow({ bans, leftSide, rightSide }) {
  if (!bans.blue.length && !bans.purple.length) return null;
  return (
    <div className="md-bans">
      <div className="md-ban-group md-l">
        {bans[leftSide].map((b, i) => <Ban key={i} b={b} side={leftSide} />)}
      </div>
      <span className="md-bl">Bans</span>
      <div className="md-ban-group md-r">
        {bans[rightSide].map((b, i) => <Ban key={i} b={b} side={rightSide} />)}
      </div>
    </div>
  );
}

export default function MatchDetails({ match, viewerTeam = 100 }) {
  // viewer's team on the left, opponent on the right
  const L = viewerTeam === 200 ? 'purple' : 'blue';
  const R = L === 'blue' ? 'purple' : 'blue';
  const leftWin = match.winner === L;

  return (
    <div className="md-wrap">
      <div className="md-card">
        <div className="md-teams">
          <div className={`md-team md-${L}`}>
            <span className="md-tname">{TEAM_LABEL[L]} Team</span>
            <span className={'md-tresult' + (leftWin ? ' md-win' : '')}>{leftWin ? 'Victory' : 'Defeat'}</span>
          </div>
          <span className="md-vs">VS</span>
          <div className={`md-team md-${R}`}>
            <span className="md-tname">{TEAM_LABEL[R]} Team</span>
            <span className={'md-tresult' + (!leftWin ? ' md-win' : '')}>{!leftWin ? 'Victory' : 'Defeat'}</span>
          </div>
        </div>

        <div className="md-splits">
          <SplitBar label="Kills" leftSide={L} rightSide={R} left={match[L].kills} right={match[R].kills} fmt={(n) => n} />
          <SplitBar label="Gold" leftSide={L} rightSide={R} left={match[L].gold} right={match[R].gold} fmt={(n) => n.toLocaleString() + 'g'} />
        </div>

        <div className="md-obj-head">
          <span className={`md-h md-l md-t-${L}`}>{TEAM_LABEL[L]}</span>
          <span className="md-h md-c">Objectives</span>
          <span className={`md-h md-r md-t-${R}`}>{TEAM_LABEL[R]}</span>
        </div>
        <div className="md-objs">
          {match.objectives.map((o) => <ObjRow key={o.key} obj={o} leftSide={L} rightSide={R} />)}
        </div>
      </div>

      <div className="md-card">
        <BansRow bans={match.bans} leftSide={L} rightSide={R} />
      </div>
    </div>
  );
}
