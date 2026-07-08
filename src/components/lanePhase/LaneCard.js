import React, { useState, useEffect } from 'react';
import { goldLabel } from './laneAdapter';
import CSGraph from './CSGraph';
import LaneMinimap from './LaneMinimap';
import StyledTooltip from '../StyledTooltip';
import NameTip from './NameTip';

// Redesigned Laning Phase card — one parameterized component for all four lanes
// (TOP/JUNGLE/MID 1v1, BOTTOM 2v2). Header (outcome headline + severity meter +
// gold chip) is always visible; a segmented control swaps Summary / Kill feed /
// CS graph below. Ported from the design handoff (variant B).

// Reveal helper: false on first paint, true after mount. Entrance transitions
// are state-driven so static renders (print / reduced-motion) show the END
// state instead of getting stuck hidden.
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setM(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return m;
}

function Portrait({ player, size, dim }) {
  const ring = player.side === 'blue' ? '#568CFF' : '#A35BFF';
  const sizeCls = size === 'sm' ? ' lpr-sm' : size === 'xs' ? ' lpr-xs' : '';
  return (
    <div className={'lpr-portrait' + sizeCls + (dim ? ' lpr-dim' : '')} style={{ '--lpr-ring': ring }} title={player.champ}>
      <img className="lpr-portrait-img" src={player.portrait} alt={player.champ} />
    </div>
  );
}

// Team color / name helpers + the shared gold breakdown shown by both the
// header chip and the center tug-of-war bar on hover.
const teamColor = (t) => (t === 100 ? '#568CFF' : '#A35BFF');
const teamName = (t) => (t === 100 ? 'Blue' : 'Purple');
const sumGold = (arr) => arr.reduce((s, p) => s + (p.gold || 0), 0);

// Rows are labeled with the summoner name(s) on each side (joined for the 2v2
// bottom lane), colored by team; the gold total per side is the row value.
function GoldTip({ left, right, leftTeam, diff, draw }) {
  const rightTeam = leftTeam === 100 ? 200 : 100;
  const namesOf = (arr) => arr.map((p) => p.name).join(' + ');
  return (
    <span className="lpr-tug-tip">
      <span className="lpr-tug-tip-row">
        <b style={{ color: teamColor(leftTeam) }}>{namesOf(left)}</b>
        <span>{sumGold(left).toLocaleString()}g</span>
      </span>
      <span className="lpr-tug-tip-row">
        <b style={{ color: teamColor(rightTeam) }}>{namesOf(right)}</b>
        <span>{sumGold(right).toLocaleString()}g</span>
      </span>
      <span className="lpr-tug-tip-diff">
        {draw
          ? `Even — within ${diff.toLocaleString()} gold`
          : `+${diff.toLocaleString()} gold · ${goldLabel(diff)}`}
      </span>
    </span>
  );
}

function GoldChip({ diff, winnerTeam, leftTeam, left, right, draw }) {
  const tier = goldLabel(diff);
  const cls = draw ? ' lpr-t-even' : winnerTeam === 100 ? ' lpr-t-blue' : ' lpr-t-purple';
  return (
    <StyledTooltip
      placement="top"
      disableInteractive
      title={<GoldTip left={left} right={right} leftTeam={leftTeam} diff={diff} draw={draw} />}
    >
      <span className="lpr-gold-chip">
        <span className={'lpr-amt' + cls}>+{diff.toLocaleString()}</span>
        <span className="lpr-tier">{tier} gold</span>
      </span>
    </StyledTooltip>
  );
}

// Center gold tug-of-war (SVG, rendered at final geometry — no transform anim).
// `leftTeam` is the team shown in the left column; the winner's fill grows from
// center toward whichever side its column is on, and the end labels follow.
// Hovering the bar reveals each side's total gold and the lead.
function GoldTug({ diff, winnerTeam, leftTeam, left, right, draw }) {
  const VB = 200, C = 100, H = 14;
  const len = Math.min(diff / 4000, 1) * C; // up to half the bar
  const rightTeam = leftTeam === 100 ? 200 : 100;
  const endCls = (t) => (t === 100 ? 'lpr-e-blue' : 'lpr-e-purple');
  const fill = draw ? null : (winnerTeam === leftTeam ? { x: C - len, w: len } : { x: C, w: len });
  const op = draw ? 0.5 : 1;
  return (
    <div className="lpr-gold-center">
      <span className="lpr-gold-vs">VS</span>
      <StyledTooltip
        placement="top"
        disableInteractive
        title={<GoldTip left={left} right={right} leftTeam={leftTeam} diff={diff} draw={draw} />}
      >
        <svg className="lpr-tug" viewBox={`0 0 ${VB} ${H}`} preserveAspectRatio="none">
          <rect x="0" y="1" width={VB} height="12" rx="6" fill="#E7E9EE" />
          {draw && (
            <>
              <rect x={C - 16} y="1" width="16" height="12" rx="6" fill={teamColor(leftTeam)} opacity={op} />
              <rect x={C} y="1" width="16" height="12" rx="6" fill={teamColor(rightTeam)} opacity={op} />
            </>
          )}
          {fill && fill.w > 0 && (
            <rect x={fill.x} y="1" width={fill.w} height="12" rx="6" fill={teamColor(winnerTeam)} opacity={op} />
          )}
          <rect x={C - 1} y="-1" width="2" height="16" fill="#fff" />
        </svg>
      </StyledTooltip>
      <div className="lpr-gold-ends">
        <span className={!draw && winnerTeam === leftTeam ? endCls(leftTeam) : 'lpr-e-off'}>{teamName(leftTeam)}</span>
        <span className={!draw && winnerTeam === rightTeam ? endCls(rightTeam) : 'lpr-e-off'}>{teamName(rightTeam)}</span>
      </div>
    </div>
  );
}

function PlayerRow({ player, sizeSm }) {
  const nameCls = player.side === 'blue' ? ' lpr-blue' : ' lpr-purple';
  return (
    <div className="lpr-player">
      <Portrait player={player} size={sizeSm ? 'sm' : null} dim={player.lost} />
      <div className="lpr-pmeta">
        <StyledTooltip placement="top" disableInteractive title={<NameTip player={player} />}>
          <a className={'lpr-pname' + nameCls} href={player.href}>{player.name}</a>
        </StyledTooltip>
        {player.me && <span className={'lpr-you' + (player.side === 'blue' ? ' lpr-you-blue' : ' lpr-you-purple')}>you</span>}
        <span className="lpr-pchamp">
          {player.champ}{player.role ? <span className="lpr-role-tag"> · {player.role}</span> : null}
        </span>
        <span className="lpr-pstats">
          <span className="lpr-stat-k">{player.kda.replace(/\//g, ' / ')}</span>
          <span className="lpr-stat-cs">{player.cs} CS</span>
        </span>
      </div>
    </div>
  );
}

function Matchup({ lane }) {
  const sizeSm = lane.duo;
  return (
    <div className={'lpr-matchup' + (lane.duo ? ' lpr-duo' : '')}>
      <div className="lpr-side lpr-left">
        {lane.left.map((p) => <PlayerRow key={p.participantId} player={p} sizeSm={sizeSm} />)}
      </div>
      <GoldTug
        diff={lane.goldDifference}
        winnerTeam={lane.teamWonLane}
        leftTeam={lane.leftTeam}
        left={lane.left}
        right={lane.right}
        draw={lane.resTag === 'draw'}
      />
      <div className="lpr-side lpr-right">
        {lane.right.map((p) => <PlayerRow key={p.participantId} player={p} sizeSm={sizeSm} />)}
      </div>
    </div>
  );
}

function FeedActor({ actor }) {
  if (!actor) return null;
  const nameCls = actor.side === 'blue' ? ' lpr-blue' : ' lpr-purple';
  return (
    <span className="lpr-feed-actor">
      <Portrait player={actor} size="xs" />
      <StyledTooltip placement="top" disableInteractive title={<NameTip player={actor} />}>
        <a className={'lpr-kf-name' + nameCls} href={actor.href}>{actor.name}</a>
      </StyledTooltip>
    </span>
  );
}

const TurretSvg = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 21V8l3-2V3h2v3h4V3h2v3l3 2v13M5 21h14M9 21v-4h6v4" />
  </svg>
);

// The chronological feed list. Rows are hover-linked to the minimap pins via
// shared `hoveredIndex` state lifted to KillFeedPanel; the leading numbered node
// matches the pin number for the same event.
function KillList({ kills, hoveredIndex, onHover }) {
  const mounted = useMounted();
  const active = hoveredIndex != null;
  return (
    <div className="lpr-kf-list">
      {kills.map((k, i) => {
        const dotCls = k.type === 'monster' ? 'lpr-monster' : k.type === 'tower' ? 'lpr-tower' : ('lpr-' + k.side);
        const isOn = hoveredIndex === i;
        let body;
        if (k.type === 'monster') {
          body = (
            <>
              <FeedActor actor={k.killer} />
              <span className="lpr-kf-verb">secured</span>
              <span className="lpr-kf-obj"><span className="lpr-od" />{k.objective}</span>
            </>
          );
        } else if (k.type === 'tower') {
          body = (
            <>
              <span className="lpr-kf-turret" aria-hidden="true">{TurretSvg}</span>
              <FeedActor actor={k.victim} />
              <span className="lpr-kf-verb">fell to turret</span>
            </>
          );
        } else {
          body = (
            <>
              <FeedActor actor={k.killer} />
              <span className="lpr-kf-verb">killed</span>
              <FeedActor actor={k.victim} />
            </>
          );
        }
        return (
          <div
            className={'lpr-kf-item' + (isOn ? ' lpr-on' : '')}
            key={i}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            style={{
              // Mount = staggered reveal; once mounted, a fast no-delay transition
              // takes over so hover dimming/highlighting feels instant.
              opacity: !mounted ? 0 : (active && !isOn ? 0.45 : 1),
              transform: mounted ? 'none' : 'translateY(5px)',
              transition: mounted
                ? 'opacity .15s ease, background-color .15s ease'
                : `opacity .34s ease ${i * 55}ms, transform .34s ease ${i * 55}ms`,
            }}
          >
            <span className="lpr-kf-time">{k.t}</span>
            <span className="lpr-kf-node"><span className={'lpr-kf-num ' + dotCls}>{i + 1}</span></span>
            <span className="lpr-kf-evt">{body}</span>
          </div>
        );
      })}
    </div>
  );
}

// Kill-feed tab: the feed list beside a Summoner's Rift minimap, sharing a
// single hovered-event index so the two stay cross-highlighted.
function KillFeedPanel({ lane }) {
  const [hovered, setHovered] = useState(null);
  const kills = lane.kills;
  if (!kills.length) {
    return <div className="lpr-feed-empty">No kills or objectives before 15:00 — a quiet, even lane.</div>;
  }
  return (
    <div className="lpr-feed">
      <div className="lpr-kf-main">
        <KillList kills={kills} hoveredIndex={hovered} onHover={setHovered} />
      </div>
      <LaneMinimap kills={kills} hoveredIndex={hovered} onHover={setHovered} />
    </div>
  );
}

// A summoner name inside the takeaway sentence: clickable profile link + the
// same hover card, bold and team-colored.
function TakeawayName({ player }) {
  const cls = player.side === 'blue' ? 'lpr-c-blue' : 'lpr-c-purple';
  return (
    <StyledTooltip placement="top" disableInteractive title={<NameTip player={player} />}>
      <a className={'lpr-takeaway-name ' + cls} href={player.href}>{player.name}</a>
    </StyledTooltip>
  );
}

function TakeawayLine({ lane }) {
  const draw = lane.resTag === 'draw';
  let inner;
  if (draw) {
    inner = (
      <>
        <b>Dead even.</b> <TakeawayName player={lane.left[0]} /> and <TakeawayName player={lane.right[0]} /> traded blows and CS,
        separated by just <b className="lpr-c-even">+{lane.goldDifference.toLocaleString()} gold</b>.
      </>
    );
  } else {
    const win = (lane.teamWonLane === lane.leftTeam ? lane.left : lane.right)[0];
    const cls = lane.teamWonLane === 100 ? 'lpr-c-blue' : 'lpr-c-purple';
    const team = lane.teamWonLane === 100 ? 'Blue' : 'Purple';
    const tier = goldLabel(lane.goldDifference);
    const where = lane.laneKey === 'jungle' ? 'the jungle' : `in ${lane.laneKey} lane`;
    const lead = {
      obliterates: `obliterates ${where}`,
      dominates: `dominates ${where}`,
      won: `won ${where}`,
    }[lane.resTag] || `won ${where}`;
    inner = (
      <>
        <TakeawayName player={win} /> {lead} (<b>{win.kda}</b>) — {tier},{' '}
        <b className={cls}>+{lane.goldDifference.toLocaleString()} gold</b> for {team}.
      </>
    );
  }
  return (
    <p className="lpr-takeaway">
      <span className="lpr-tk-quote" aria-hidden="true">&ldquo;</span>
      <span>{inner}</span>
    </p>
  );
}

// The receipts: the raw side-vs-side gold behind the verdict, always visible
// under the takeaway. (CS already appears on each player row, so gold — the
// stat the verdict is actually computed from — is the only number here.)
// Winning side is listed first (left side on a draw); duo-lane values are the
// pair's combined totals.
function ReceiptLine({ lane }) {
  const winnerRight = lane.resTag !== 'draw' && lane.teamWonLane !== lane.leftTeam;
  const a = winnerRight ? lane.right : lane.left;
  const b = winnerRight ? lane.left : lane.right;
  const sum = (side, key) => side.reduce((t, p) => t + (p[key] || 0), 0);
  const clsA = a[0].side === 'blue' ? 'lpr-c-blue' : 'lpr-c-purple';
  const clsB = b[0].side === 'blue' ? 'lpr-c-blue' : 'lpr-c-purple';
  return (
    <p className="lpr-receipt">
      <span className="lpr-receipt-stat">
        <b className={clsA}>{sum(a, 'gold').toLocaleString()}</b>
        <span className="lpr-receipt-vs">vs</span>
        <b className={clsB}>{sum(b, 'gold').toLocaleString()}</b>
      </span>
      <span className="lpr-receipt-at">gold @ {lane.atClock}</span>
    </p>
  );
}

const LANE_ICON = {
  top: 'TopLane.png',
  jungle: 'Jungle.png',
  mid: 'Middle.png',
  bottom: 'Bottom.png',
};

function Headline({ lane }) {
  const icon = LANE_ICON[lane.laneKey];
  const laneImg = icon ? (
    <img className="lpr-lane-icon" src={`/images/laneIcons/${icon}`} alt={`${lane.laneLabel} lane`} />
  ) : null;
  if (lane.resTag === 'draw') {
    return <span className="lpr-headline">{lane.laneLabel} was a draw{laneImg}</span>;
  }
  const teamCls = lane.teamWonLane === 100 ? 'lpr-t-blue' : 'lpr-t-purple';
  const team = lane.teamWonLane === 100 ? 'Blue' : 'Purple';
  return (
    <span className="lpr-headline">
      <span className={teamCls}>{team}</span> {lane.resTag} {lane.laneKey}{laneImg}
    </span>
  );
}

export default function LaneCard({ lane }) {
  const draw = lane.resTag === 'draw';
  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'feed', label: 'Kill feed', badge: lane.kills.length || null },
    { id: 'graph', label: 'CS graph' },
  ];
  const [tab, setTab] = useState('summary');

  return (
    <div className={'lpr-lane-card' + (draw ? ' lpr-is-draw' : '')} id={lane.anchor}>
      <div className="lpr-card-head">
        <div className="lpr-headline-wrap">
          <Headline lane={lane} />
        </div>
        <GoldChip
          diff={lane.goldDifference}
          winnerTeam={lane.teamWonLane}
          leftTeam={lane.leftTeam}
          left={lane.left}
          right={lane.right}
          draw={draw}
        />
      </div>

      <div className="lpr-seg" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'lpr-seg-active' : ''}
            onClick={() => setTab(t.id)}
            role="tab"
            aria-selected={tab === t.id}
          >
            {t.label}
            {t.badge ? <span className="lpr-badge">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      <div className="lpr-seg-panel" key={tab}>
        {tab === 'summary' && (
          <>
            <ReceiptLine lane={lane} />
            <TakeawayLine lane={lane} />
            <Matchup lane={lane} />
          </>
        )}
        {tab === 'feed' && <KillFeedPanel lane={lane} />}
        {tab === 'graph' && <CSGraph lane={lane} />}
      </div>
    </div>
  );
}
