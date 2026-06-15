import React, { useState, useEffect, useRef } from 'react';
import { championImg } from '../../api/ddragon';
import SummonerName from '../SummonerName';
import BattleMinimap from './BattleMinimap';

// Redesigned Battles card — a collapsible card per fight (consistent with the
// Laning Phase redesign). Each fight shows a Summoner's Rift kill map (pins
// hover-linked to the feed); the gold swing is kept as a small header chip.
// Champion icons are CIRCULAR (team-color ring) like the rest of the page.

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setM(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return m;
}

const teamColor = (teamId) => (teamId === 100 ? '#568CFF' : '#A35BFF');
const sideOfTeam = (teamId) => (teamId === 100 ? 'blue' : 'purple');
const prettyEnum = (s) => (s || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fmtClock = (ms) =>
  `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

// one event -> a map pin descriptor (position + color)
function toMapKill(ev) {
  if (ev.eventType === 'BUILDING_DESTROY') return { position: ev.position, type: 'tower', side: 'neutral' };
  if (ev.eventType === 'MONSTER_KILL') return { position: ev.position, type: 'monster', side: 'neutral' };
  const side = ev.killer ? sideOfTeam(ev.killer.teamId) : sideOfTeam((ev.victim?.teamId) === 200 ? 100 : 200);
  return { position: ev.position, type: 'champ', side };
}
function pinColor(k) {
  if (k.type === 'monster') return '#C9A227';
  if (k.type === 'tower') return '#9AA1AD';
  return k.side === 'blue' ? '#568CFF' : '#A35BFF';
}

// gold-swing chip text + which side is ahead
function goldChip(swing) {
  const ahead = swing > 30 ? 'blue' : swing < -30 ? 'purple' : 'even';
  const txt = (swing > 0 ? '+' : swing < 0 ? '−' : '±') + Math.abs(swing).toLocaleString() + 'g';
  return { ahead, txt };
}

// ---- circular avatar with a colored ring ----
function Avatar({ src, ring, alt, dim }) {
  return (
    <span className={'bcr-av' + (dim ? ' bcr-dim' : '')} style={{ '--bcr-ring': ring }}>
      <img src={src} alt={alt || ''} />
    </span>
  );
}

// ---- one kill / objective row (hover-linked to its map pin) ----
function BattleKill({ ev, i, mounted, ctx, hoveredIndex, onHover }) {
  const { champsJSON, dataDragonVersion, platformId } = ctx;
  const champUrl = (championId) => {
    const e = Object.values(champsJSON.data).find((c) => String(c.key) === String(championId));
    return e ? championImg(dataDragonVersion, e.id) : null;
  };
  const active = hoveredIndex != null;
  const isOn = hoveredIndex === i;
  const style = {
    opacity: !mounted ? 0 : (active && !isOn ? 0.45 : 1),
    transform: mounted ? 'none' : 'translateY(5px)',
    transition: mounted
      ? 'opacity .15s ease, background-color .15s ease'
      : `opacity .32s ease ${i * 45}ms, transform .32s ease ${i * 45}ms`,
  };

  const killerAv = ev.killer?.championId
    ? <Avatar src={champUrl(ev.killer.championId)} ring={teamColor(ev.killer.teamId)} alt={ev.killer.championName} />
    : <Avatar src={`/images/monsterIcons/${(ev.victim?.teamId ?? ev.teamId) === 200 ? 'blue' : 'red'}Minion.webp`} ring={teamColor((ev.victim?.teamId ?? ev.teamId) === 200 ? 100 : 200)} alt="Minion" />;

  const killerName = ev.killer?.riotIdGameName
    ? <SummonerName participant={ev.killer} version={dataDragonVersion} platformId={platformId} className="bcr-name" />
    : <span className="bcr-minion">Minion</span>;

  let mark, rightAv, text;
  if (ev.eventType === 'CHAMPION_KILL') {
    mark = <img className="bcr-mark" src="/images/swords.svg" alt="" />;
    rightAv = <Avatar src={champUrl(ev.victim?.championId)} ring={teamColor(ev.victim?.teamId)} alt={ev.victim?.championName} dim />;
    text = <>{killerName} <span className="bcr-verb">killed</span> <SummonerName participant={ev.victim} version={dataDragonVersion} platformId={platformId} className="bcr-name" /></>;
  } else if (ev.eventType === 'BUILDING_DESTROY') {
    const isTower = ev.buildingType === 'TOWER_BUILDING';
    mark = <img className="bcr-mark" src="/images/hammer.svg" alt="" />;
    rightAv = <Avatar src={`/images/monsterIcons/${isTower ? 'turret' : 'inhibitor'}_${ev.teamId === 100 ? 'blue' : 'red'}_square.webp`} ring="#9AA1AD" alt={isTower ? 'Tower' : 'Inhibitor'} />;
    text = <>{killerName} <span className="bcr-verb">destroyed</span> <span className="bcr-obj-text">{isTower ? 'a tower' : 'an inhibitor'}</span></>;
  } else {
    mark = <img className="bcr-mark" src="/images/bow.svg" alt="" />;
    rightAv = <Avatar src={`/images/monsterIcons/${ev.monsterType}.webp`} ring="#C9A227" alt={prettyEnum(ev.monsterType)} />;
    text = <>{killerName} <span className="bcr-verb">slew</span> <span className="bcr-obj-text">{prettyEnum(ev.monsterType)}</span></>;
  }

  return (
    <div
      className={'bcr-kill' + (isOn ? ' bcr-on' : '')}
      style={style}
      onMouseEnter={() => onHover(i)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="bcr-knum" style={{ '--bcr-pin': pinColor(toMapKill(ev)) }}>{i + 1}</span>
      <span className="bcr-kt">{fmtClock(ev.timestamp)}</span>
      <span className="bcr-duel">{killerAv}{mark}{rightAv}</span>
      <span className="bcr-ktext">{text}</span>
    </div>
  );
}

const Chev = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
);

function Header({ battle }) {
  const { winner, blueKills, purpleKills, noContest } = battle;
  const outCls = winner === 'blue' ? 'bcr-t-blue' : winner === 'purple' ? 'bcr-t-purple' : 'bcr-t-even';
  const outcome = noContest ? 'No contest' : winner === 'even' ? 'Even trade' : winner === 'blue' ? 'Blue wins' : 'Purple wins';

  const t = battle.title;
  const loc = battle.location;
  const idx = loc ? t.indexOf(loc) : -1;
  const locCls = winner === 'blue' ? 'bcr-blue' : winner === 'purple' ? 'bcr-purple' : '';
  const titleEl = idx >= 0 && winner !== 'even'
    ? <>{t.slice(0, idx)}<span className={'bcr-loc ' + locCls}>{loc}</span>{t.slice(idx + loc.length)}</>
    : t;

  const totalKills = blueKills + purpleKills;
  const chip = goldChip(battle.goldSwing);

  return (
    <>
      <span className="bcr-result">
        <span className={'bcr-outcome ' + outCls}>{outcome}</span>
        <span className="bcr-score">
          <span className="bcr-n bcr-blue">{blueKills}</span>
          <span className="bcr-dash">–</span>
          <span className="bcr-n bcr-purple">{purpleKills}</span>
        </span>
      </span>
      <span className="bcr-title">
        <span className="bcr-tt">{titleEl}</span>
        <span className="bcr-tags">
          {battle.firstBlood && <span className="bcr-tag bcr-fb"><span className="bcr-gd-diamond" />First blood</span>}
          {battle.objective && (
            <span className={'bcr-tag bcr-objtag ' + (winner === 'blue' ? 'bcr-blue' : '')}>{battle.objective}</span>
          )}
          <span className="bcr-tag bcr-neutral">{totalKills} {totalKills === 1 ? 'kill' : 'kills'}</span>
        </span>
      </span>
      <span className="bcr-right">
        <span className={'bcr-gd-chip bcr-' + chip.ahead}>{chip.txt}</span>
        <span className="bcr-time">{battle.timeLabel}</span>
        <span className="bcr-chev">{Chev}</span>
      </span>
    </>
  );
}

export default function BattleCard({ battle, ctx, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [hovered, setHovered] = useState(null);
  const panelRef = useRef(null);
  const [h, setH] = useState(defaultOpen ? 'none' : 0);
  const mounted = useMounted();

  useEffect(() => {
    if (!panelRef.current) return;
    setH(open ? panelRef.current.scrollHeight : 0);
  }, [open]);

  const mapKills = battle.kills.map(toMapKill);

  return (
    <div className={`bcr-card bcr-win-${battle.winner}${open ? ' bcr-open' : ''}`}>
      <button className="bcr-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Header battle={battle} />
      </button>
      <div className="bcr-panel" style={{ maxHeight: h === 'none' ? 'none' : h }}>
        <div className="bcr-body" ref={panelRef}>
          {battle.summary && (
            <p className="bcr-summary">
              <span className="bcr-q" aria-hidden="true">&ldquo;</span>
              <span>{battle.summary}</span>
            </p>
          )}
          <div className="bcr-grid">
            <div className="bcr-mapcol">
              <div className="bcr-feedhead">Battle map</div>
              <BattleMinimap kills={mapKills} hoveredIndex={hovered} onHover={setHovered} />
            </div>
            <div className="bcr-kcol">
              <div className="bcr-feedhead">Kills &amp; objectives</div>
              <div className="bcr-klist">
                {battle.kills.map((ev, i) => (
                  <BattleKill key={i} ev={ev} i={i} mounted={mounted} ctx={ctx} hoveredIndex={hovered} onHover={setHovered} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
