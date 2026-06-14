import React, { useState, useEffect } from 'react';
import { goldLabel } from './laneAdapter';
import CSGraph from './CSGraph';
import LaneMinimap from './LaneMinimap';

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

function Portrait({ player, size }) {
  const ring = player.side === 'blue' ? '#568CFF' : '#A35BFF';
  const sizeCls = size === 'sm' ? ' lpr-sm' : size === 'xs' ? ' lpr-xs' : '';
  return (
    <div className={'lpr-portrait' + sizeCls} style={{ '--lpr-ring': ring }} title={player.champ}>
      <img className="lpr-portrait-img" src={player.portrait} alt={player.champ} />
    </div>
  );
}

function SeverityDots({ count, side, draw }) {
  const mounted = useMounted();
  const onCls = side === 100 ? ' lpr-on-blue' : side === 200 ? ' lpr-on-purple' : '';
  return (
    <span className="lpr-sev" aria-label={`severity ${count} of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={'lpr-pip' + (i < count ? onCls : '')}
          style={{
            transform: mounted ? 'scale(1)' : 'scale(0)',
            transition: `transform .26s cubic-bezier(.34,1.56,.64,1) ${i * 55}ms`,
          }}
        />
      ))}
      {draw && <span className="lpr-sev-label">Even</span>}
    </span>
  );
}

function GoldChip({ diff, winnerTeam, draw }) {
  const tier = goldLabel(diff);
  const cls = draw ? ' lpr-t-even' : winnerTeam === 100 ? ' lpr-t-blue' : ' lpr-t-purple';
  return (
    <span className="lpr-gold-chip">
      <span className={'lpr-amt' + cls}>+{diff.toLocaleString()}</span>
      <span className="lpr-tier">{tier} gold</span>
    </span>
  );
}

// Center gold tug-of-war (SVG, rendered at final geometry — no transform anim).
function GoldTug({ diff, winnerTeam, draw }) {
  const VB = 200, C = 100, H = 14;
  const len = Math.min(diff / 4000, 1) * C; // up to half the bar
  const winnerBlue = winnerTeam === 100;
  const blue = draw ? { x: C - 16, w: 16 } : winnerBlue ? { x: C - len, w: len } : { x: C, w: 0 };
  const purple = draw ? { x: C, w: 16 } : !winnerBlue ? { x: C, w: len } : { x: C, w: 0 };
  const op = draw ? 0.5 : 1;
  return (
    <div className="lpr-gold-center">
      <span className="lpr-gold-vs">VS</span>
      <svg className="lpr-tug" viewBox={`0 0 ${VB} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <rect x="0" y="1" width={VB} height="12" rx="6" fill="#E7E9EE" />
        {blue.w > 0 && <rect x={blue.x} y="1" width={blue.w} height="12" rx="6" fill="#568CFF" opacity={op} />}
        {purple.w > 0 && <rect x={purple.x} y="1" width={purple.w} height="12" rx="6" fill="#A35BFF" opacity={op} />}
        <rect x={C - 1} y="-1" width="2" height="16" fill="#fff" />
      </svg>
      <div className="lpr-gold-ends">
        <span className={!draw && winnerBlue ? 'lpr-e-blue' : 'lpr-e-off'}>Blue</span>
        <span className={!draw && !winnerBlue ? 'lpr-e-purple' : 'lpr-e-off'}>Purple</span>
      </div>
    </div>
  );
}

function PlayerRow({ player, sizeSm }) {
  const nameCls = player.side === 'blue' ? ' lpr-blue' : ' lpr-purple';
  return (
    <div className="lpr-player">
      <Portrait player={player} size={sizeSm ? 'sm' : null} />
      <div className="lpr-pmeta">
        <a className={'lpr-pname' + nameCls} href={player.href}>{player.name}</a>
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
        {lane.blue.map((p) => <PlayerRow key={p.participantId} player={p} sizeSm={sizeSm} />)}
      </div>
      <GoldTug diff={lane.goldDifference} winnerTeam={lane.teamWonLane} draw={lane.resTag === 'draw'} />
      <div className="lpr-side lpr-right">
        {lane.purple.map((p) => <PlayerRow key={p.participantId} player={p} sizeSm={sizeSm} />)}
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
      <a className={'lpr-kf-name' + nameCls} href={actor.href}>{actor.name}</a>
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

function TakeawayLine({ lane }) {
  const draw = lane.resTag === 'draw';
  let inner;
  if (draw) {
    inner = (
      <>
        <b>Dead even.</b> {lane.blue[0].name} and {lane.purple[0].name} traded blows and CS,
        separated by just <b className="lpr-c-even">+{lane.goldDifference.toLocaleString()} gold</b>.
      </>
    );
  } else {
    const win = (lane.teamWonLane === 100 ? lane.blue : lane.purple)[0];
    const cls = lane.teamWonLane === 100 ? 'lpr-c-blue' : 'lpr-c-purple';
    const team = lane.teamWonLane === 100 ? 'Blue' : 'Purple';
    const tier = goldLabel(lane.goldDifference);
    const lead = {
      obliterates: 'crushed the lane',
      dominates: 'won the trades',
      won: 'came out ahead',
    }[lane.resTag] || 'won the lane';
    inner = (
      <>
        <b className={cls}>{win.name}</b> {lead} (<b>{win.kda}</b>) — {tier},{' '}
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
          <SeverityDots count={lane.bubbleCount} side={lane.teamWonLane} draw={draw} />
        </div>
        <GoldChip diff={lane.goldDifference} winnerTeam={lane.teamWonLane} draw={draw} />
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
            <Matchup lane={lane} />
            <TakeawayLine lane={lane} />
          </>
        )}
        {tab === 'feed' && <KillFeedPanel lane={lane} />}
        {tab === 'graph' && <CSGraph lane={lane} />}
      </div>
    </div>
  );
}
