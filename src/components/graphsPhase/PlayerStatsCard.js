import React, { useState, useEffect } from 'react';
import { championImg } from '../../api/ddragon';
import StyledTooltip from '../StyledTooltip';
import PlayerSharePie from './PlayerSharePie';

// The Player Stats card: one bars+pie comparison at a time, switched via a
// row of icon pills — one instance of the chart instead of seven clone cards.
// Bars (viewer's team first) sit left, the share pie right; they're
// hover-linked through a shared index. Add a graph by adding a METRICS entry.

// per-team shade ramps (lightest → darkest); slice/bar colors correspond 1:1
const TEAM_RAMP = {
  100: ['#568CFF', '#5081E8', '#4A76D2', '#456BBB', '#3F60A5'],
  200: ['#A35BFF', '#9450E8', '#8546D2', '#763BBB', '#673189'],
};
const TEAM_RING = { 100: '#568CFF', 200: '#A35BFF' };

const kFmt = (v) => (v >= 1000 ? `${Math.floor(v / 1000)}k` : String(v));
const icon = (color, paths) => (
  <span className="gp-hic" style={{ color }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
  </span>
);

const METRICS = {
  dealt: {
    title: 'Damage Dealt',
    sub: 'Damage to champions, per player',
    icon: icon('#E8833A', <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" />),
    total: (p) => p.totalDamageDealtToChampions,
    fmt: kFmt,
    breakdown: (p) => [
      ['AD', p.physicalDamageDealtToChampions],
      ['AP', p.magicDamageDealtToChampions],
      ['True', p.trueDamageDealtToChampions],
    ],
  },
  taken: {
    title: 'Damage Taken',
    sub: 'Damage absorbed, per player',
    icon: icon('#E5737B', <path d="M12 3l7 4v6c0 4-3 6.5-7 8-4-1.5-7-4-7-8V7z" />),
    total: (p) => p.totalDamageTaken,
    fmt: kFmt,
    breakdown: (p) => [
      ['Physical', p.physicalDamageTaken],
      ['Magic', p.magicDamageTaken],
      ['True', p.trueDamageTaken],
    ],
  },
  gold: {
    title: 'Gold Earned',
    sub: 'Total gold earned, per player',
    icon: icon('#C9A227', <><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1 1.8 3 2 3 1 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5" /></>),
    total: (p) => p.goldEarned,
    fmt: kFmt,
    breakdown: (p) => [['Spent', p.goldSpent]],
  },
  vision: {
    title: 'Vision',
    sub: 'Vision score, per player',
    icon: icon('#4E97A8', <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.6" /></>),
    total: (p) => p.visionScore,
    fmt: String,
    breakdown: (p) => [
      ['Wards placed', p.wardsPlaced],
      ['Wards killed', p.wardsKilled],
      ['Control wards', p.detectorWardsPlaced ?? p.visionWardsBoughtInGame],
    ],
  },
  objdmg: {
    title: 'Objective Damage',
    sub: 'Damage to towers & monsters, per player',
    icon: icon('#A97142', <path d="M6 21V9l3-2V4h2v3h2V4h2v3l3 2v12M6 21h12M10 21v-4h4v4" />),
    total: (p) => p.damageDealtToObjectives,
    fmt: kFmt,
    breakdown: (p) => [
      ['Buildings', p.damageDealtToBuildings],
      ['Monsters', Math.max(0, p.damageDealtToObjectives - p.damageDealtToBuildings)],
    ],
  },
  sustain: {
    title: 'Healing & Shielding',
    sub: 'Healing + shields on allies, per player',
    icon: icon('#3FA76E', <path d="M12 21C7 16.5 3 13 3 8.8 3 6 5 4 7.5 4c1.7 0 3.2.9 4.5 2.6C13.3 4.9 14.8 4 16.5 4 19 4 21 6 21 8.8c0 4.2-4 7.7-9 12.2z" />),
    total: (p) => p.totalHealsOnTeammates + p.totalDamageShieldedOnTeammates,
    fmt: kFmt,
    breakdown: (p) => [
      ['Healing', p.totalHealsOnTeammates],
      ['Shielding', p.totalDamageShieldedOnTeammates],
    ],
  },
  cc: {
    title: 'Crowd Control',
    sub: 'Seconds of CC dealt, per player',
    icon: icon('#D9A521', <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />),
    total: (p) => p.timeCCingOthers,
    fmt: (v) => `${v}s`,
    breakdown: (p) => [['Total CC duration dealt', `${p.totalTimeCCDealt}s`]],
  },
};
const METRIC_KEYS = Object.keys(METRICS);

export default function PlayerStatsCard({ gameData, champsJSON, dataDragonVersion, viewerTeam = 100, viewerPuuid }) {
  const [type, setType] = useState('dealt');
  const [hovered, setHovered] = useState(null);

  // re-run the bar reveal on every metric switch
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    setGrown(false);
    const t = setTimeout(() => setGrown(true), 60);
    return () => clearTimeout(t);
  }, [type]);

  const metric = METRICS[type];
  const platformId = gameData.info.platformId.toLowerCase();

  // viewer's team first, matching the page-wide convention
  const teams = viewerTeam === 200 ? [200, 100] : [100, 200];
  const players = [];
  teams.forEach((teamId) => {
    gameData.info.participants
      .filter((p) => p.teamId === teamId)
      .forEach((p, i) => {
        const champ = Object.values(champsJSON.data).find((c) => c.key === String(p.championId));
        players.push({
          p,
          teamId,
          value: metric.total(p),
          color: TEAM_RAMP[teamId][i % 5],
          img: championImg(dataDragonVersion, champ?.id),
          champName: champ?.name,
          isViewer: p.puuid === viewerPuuid,
        });
      });
  });
  const max = Math.max(...players.map((x) => x.value), 1);

  return (
    <div className="gp-card gp-stats">
      <div className="gp-head">
        <h2>Player Stats</h2>
        <p className="gp-sub">{metric.sub}</p>
      </div>
      <div className="gp-tabs" role="tablist" aria-label="Player stat">
        {METRIC_KEYS.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={key === type}
            className={'gp-tab' + (key === type ? ' gp-tab-on' : '')}
            onClick={() => { setType(key); setHovered(null); }}
          >
            {METRICS[key].icon}
            {METRICS[key].title}
          </button>
        ))}
      </div>
      <div className="gp-body">
        <div className="gp-bars">
          {teams.map((teamId) => (
            <div key={teamId} className="gp-team">
              {players.map((x, gi) => {
                if (x.teamId !== teamId) return null;
                const dimmed = hovered != null && hovered !== gi;
                return (
                  <div
                    key={gi}
                    className={'gp-col' + (dimmed ? ' gp-dim' : '')}
                    onMouseEnter={() => setHovered(gi)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span className="gp-val">{metric.fmt(x.value)}</span>
                    <StyledTooltip
                      disableInteractive
                      placement="top"
                      title={<>{metric.breakdown(x.p).map(([label, v]) => <div key={label}>{label}: {typeof v === 'number' ? v.toLocaleString() : v}</div>)}</>}
                    >
                      <div
                        className="gp-bar"
                        style={{ height: grown ? Math.max(5, Math.round((x.value / max) * 150)) : 0, background: x.color }}
                      />
                    </StyledTooltip>
                    <StyledTooltip disableInteractive placement="bottom" title={`${x.p.riotIdGameName} · ${x.champName}`}>
                      <a
                        className="gp-port"
                        style={{ '--gp-ring': TEAM_RING[teamId] }}
                        href={`/profile/${platformId}/${x.p.riotIdGameName}/${x.p.riotIdTagline.toLowerCase()}`}
                      >
                        <img src={x.img} alt={x.champName} />
                        {x.isViewer && <span className={'gp-you ' + (teamId === 100 ? 'gp-you-blue' : 'gp-you-purple')}>you</span>}
                      </a>
                    </StyledTooltip>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="gp-pie">
          <PlayerSharePie idPrefix={`gp-${type}`} players={players} hovered={hovered} onHover={setHovered} size={240} fmt={metric.fmt === kFmt ? undefined : metric.fmt} />
        </div>
      </div>
    </div>
  );
}
