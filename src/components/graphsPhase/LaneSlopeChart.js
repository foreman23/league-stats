import React, { useState, useId } from 'react';
import { championImg } from '../../api/ddragon';
import StyledTooltip from '../StyledTooltip';
import { focusLaneCard } from '../../hooks/useLaneFocus';

// "Lanes → Endgame" slope chart: one line per viewer-team player, from their
// gold lead vs their direct lane opponent at 15:00 (left column) to the same
// lead at the end of the game (right column). Rising green lines converted or
// flipped their lane; falling rose lines leaked it. Clicking a row scrolls to
// that lane's card.

const ROLE_ORDER = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
const LANE_TAG = { TOP: 'TOP', JUNGLE: 'JG', MIDDLE: 'MID', BOTTOM: 'BOT', UTILITY: 'SUP' };
const LANE_ANCHOR = {
  TOP: 'laningTopAnchor',
  JUNGLE: 'laningJgAnchor',
  MIDDLE: 'laningMidAnchor',
  BOTTOM: 'laningBotAnchor',
  UTILITY: 'laningBotAnchor',
};
const TEAM_RING = { 100: '#568CFF', 200: '#A35BFF' };
const YOU_RING = { 100: '#0074B7', 200: '#8A3FE6' };
// light tints for text on the dark tooltip surface
const TEAM_TEXT = { 100: '#8FB8FF', 200: '#C9A6FF' };
const LANE_LABEL = { TOP: 'Top lane', JUNGLE: 'Jungle', MIDDLE: 'Mid lane', BOTTOM: 'Bot lane', UTILITY: 'Bot lane (support)' };

// geometry (viewBox units)
const W = 780, TOP = 40, BOTTOM = 396;
const X1 = 250, X2 = 560;
const PX = 172; // portrait-cluster center x (label gutter, left of the axis)

const fmtDiff = (v) => {
  const a = Math.abs(v);
  const n = a >= 1000 ? `${(a / 1000).toFixed(1)}k` : String(a);
  return (v >= 0 ? '+' : '−') + n;
};
// value texts are colored by their SIGN (ahead/behind, like the summary lane
// chips); the lines are colored by TREND (improved/declined) — two signals
const signColor = (v) => (Math.abs(v) < 150 ? '#6B7280' : v > 0 ? '#17754C' : '#B14457');
// lighter sign tints for the dark tooltip surface
const signText = (v) => (Math.abs(v) < 150 ? '#C7CBD2' : v > 0 ? '#7FD7A8' : '#F5A3B0');
const kShort = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v));

// nudge sorted y positions apart so portraits/labels can't overlap
const spread = (ys, gap) => {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < order.length; k++) {
    if (order[k].y - order[k - 1].y < gap) order[k].y = order[k - 1].y + gap;
  }
  for (let k = order.length - 1; k >= 0; k--) {
    const max = BOTTOM - 4 - (order.length - 1 - k) * gap;
    if (order[k].y > max) order[k].y = max;
    if (k < order.length - 1 && order[k + 1].y - order[k].y < gap) order[k].y = order[k + 1].y - gap;
  }
  const out = [];
  order.forEach(({ y, i }) => { out[i] = y; });
  return out;
};

export default function LaneSlopeChart({ gameData, timelineData, champsJSON, dataDragonVersion, viewerTeam = 100, viewerPuuid }) {
  const [hovered, setHovered] = useState(null);
  const uid = useId().replace(/:/g, '');

  const frames = timelineData?.info?.frames || [];
  if (frames.length < 2) return null;
  // 15:00, or the last frame for games that ended earlier (LaneAnalysis convention)
  const frameIdx = Math.min(15, frames.length - 1);
  const pf = frames[frameIdx].participantFrames;

  const participants = gameData.info.participants;
  const rows = [];
  ROLE_ORDER.forEach((role) => {
    const me = participants.find((p) => p.teamId === viewerTeam && p.teamPosition === role);
    const opp = participants.find((p) => p.teamId !== viewerTeam && p.teamPosition === role);
    if (!me || !opp || !pf[me.participantId] || !pf[opp.participantId]) return;
    const champ = Object.values(champsJSON.data).find((c) => c.key === String(me.championId));
    const oppChamp = Object.values(champsJSON.data).find((c) => c.key === String(opp.championId));
    rows.push({
      role,
      me,
      opp,
      champName: champ?.name,
      img: championImg(dataDragonVersion, champ?.id),
      oppChampName: oppChamp?.name,
      oppImg: championImg(dataDragonVersion, oppChamp?.id),
      meG15: pf[me.participantId].totalGold,
      oppG15: pf[opp.participantId].totalGold,
      start: pf[me.participantId].totalGold - pf[opp.participantId].totalGold,
      end: me.goldEarned - opp.goldEarned,
      isViewer: me.puuid === viewerPuuid,
    });
  });
  if (!rows.length) return null;

  const values = rows.flatMap((r) => [r.start, r.end]);
  const max = Math.max(0, ...values) + 500;
  const min = Math.min(0, ...values) - 500;
  const Y = (v) => TOP + ((max - v) / (max - min)) * (BOTTOM - TOP);

  // Portrait cluster and end labels get nudged apart freely; the @15 dots get
  // only a SMALL order-preserving separation (13px) so clustered lanes don't
  // all spring from one pinch point — the value labels carry the exact truth,
  // and the green/rose tone still encodes the direction.
  const portraitYs = spread(rows.map((r) => Y(r.start)), 50);
  const startDotYs = spread(rows.map((r) => Y(r.start)), 13);
  const endYs = spread(rows.map((r) => Y(r.end)), 22);
  const oppTeam = viewerTeam === 100 ? 200 : 100;

  return (
    <div className="gp-card gp-slope">
      <div className="gp-head">
        <h2>
          Lanes → Endgame
          <span className="gp-hic" style={{ color: '#7A4FC9' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 17l16-8M4 8l16 9" /><circle cx="4" cy="17" r="2" fill="currentColor" stroke="none" /><circle cx="4" cy="8" r="2" fill="currentColor" stroke="none" /><circle cx="20" cy="9" r="2" fill="currentColor" stroke="none" /><circle cx="20" cy="17" r="2" fill="currentColor" stroke="none" /></svg>
          </span>
        </h2>
        <p className="gp-sub">Gold lead vs your lane opponent — @ {frameIdx}:00 vs the end of the game</p>
      </div>

      <svg className="gp-slope-svg" viewBox={`0 0 ${W} 440`} role="img" aria-label="Lane gold leads at 15 minutes versus end of game">
        <defs>
          {rows.map((r, i) => (
            <React.Fragment key={i}>
              <clipPath id={`${uid}-sl-${i}`}><circle cx="0" cy="0" r="17" /></clipPath>
              <clipPath id={`${uid}-slo-${i}`}><circle cx="14" cy="-12" r="10.5" /></clipPath>
            </React.Fragment>
          ))}
        </defs>

        <line x1={X1} y1={TOP - 6} x2={X1} y2={BOTTOM} stroke="#E3E5EA" />
        <line x1={X2} y1={TOP - 6} x2={X2} y2={BOTTOM} stroke="#E3E5EA" />
        <text x={X1} y="24" fontSize="12.5" fontWeight="800" letterSpacing="1" fill="#6B7280" textAnchor="middle">@ {frameIdx}:00</text>
        <text x={X2} y="24" fontSize="12.5" fontWeight="800" letterSpacing="1" fill="#6B7280" textAnchor="middle">END OF GAME</text>

        {/* zero line */}
        <line x1={PX - 96} y1={Y(0)} x2={X2 + 110} y2={Y(0)} stroke="#C7CBD2" strokeDasharray="4 4" />
        <text x={PX - 102} y={Y(0) + 4} fontSize="11" fill="#9AA1AD" textAnchor="end">even</text>

        {rows.map((r, i) => {
          const delta = r.end - r.start;
          const tone = Math.abs(delta) < 250 ? '#6B7280' : delta > 0 ? '#17754C' : '#B14457';
          const dim = hovered != null && hovered !== i;
          // matchup card in the summary tooltip's visual system (lmt- classes):
          // header = lane + the lead's journey, then the two players stacked,
          // each with their own gold @15 / end, losing side dimmed
          const tip = (
            <span className="lmt">
              <span className="lmt-head">
                <span className="lmt-lane">{LANE_LABEL[r.role]}</span>
                <span className="lmt-res">
                  <span style={{ color: signText(r.start) }}>{fmtDiff(r.start)} @{frameIdx}</span>
                  {' → '}
                  <span style={{ color: signText(r.end) }}>{fmtDiff(r.end)} end</span>
                </span>
              </span>
              <span className="lmt-side">
                <span className="lmt-row" style={{ cursor: 'default' }}>
                  <img className="lmt-ic" style={{ borderColor: TEAM_RING[viewerTeam] }} src={r.img} alt={r.champName} />
                  <span className="lmt-id">
                    <span className="lmt-name" style={{ color: TEAM_TEXT[viewerTeam] }}>{r.me.riotIdGameName}</span>
                    <span className="lmt-champ">{r.champName}</span>
                  </span>
                  <span className="lmt-stats">
                    <span className="lmt-kda">{kShort(r.meG15)} @{frameIdx}</span>
                    <span className="lmt-cs">{kShort(r.me.goldEarned)} end</span>
                  </span>
                </span>
              </span>
              <span className="lmt-vs">vs</span>
              <span className="lmt-side">
                <span className="lmt-row" style={{ cursor: 'default' }}>
                  <img className="lmt-ic" style={{ borderColor: TEAM_RING[oppTeam] }} src={r.oppImg} alt={r.oppChampName} />
                  <span className="lmt-id">
                    <span className="lmt-name" style={{ color: TEAM_TEXT[oppTeam] }}>{r.opp.riotIdGameName}</span>
                    <span className="lmt-champ">{r.oppChampName}</span>
                  </span>
                  <span className="lmt-stats">
                    <span className="lmt-kda">{kShort(r.oppG15)} @{frameIdx}</span>
                    <span className="lmt-cs">{kShort(r.opp.goldEarned)} end</span>
                  </span>
                </span>
              </span>
            </span>
          );
          return (
            <StyledTooltip key={i} disableInteractive placement="top" title={tip}>
              <g
                style={{ cursor: 'pointer', opacity: dim ? 0.25 : 1, transition: 'opacity .15s ease' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => focusLaneCard(LANE_ANCHOR[r.role])}
              >
                {/* fat invisible hit areas — the visible strokes are too thin
                    to hover precisely */}
                <line x1={X1} y1={startDotYs[i]} x2={X2} y2={Y(r.end)} stroke="transparent" strokeWidth="16" />
                <line x1={PX + 23} y1={portraitYs[i]} x2={X1 - 7} y2={startDotYs[i]} stroke="transparent" strokeWidth="16" />

                {/* the slope: from the (minimally separated) @15 dot to the true end */}
                <line x1={X1} y1={startDotYs[i]} x2={X2} y2={Y(r.end)} stroke={tone} strokeWidth="3" opacity=".85" />
                <circle cx={X1} cy={startDotYs[i]} r="6" fill={tone} />
                <circle cx={X2} cy={Y(r.end)} r="6" fill={tone} />

                {/* tone-colored leader ties portrait → dot → slope into one path */}
                <line x1={PX + 23} y1={portraitYs[i]} x2={X1 - 7} y2={startDotYs[i]} stroke={tone} strokeWidth="1.6" opacity=".5" />

                {/* portrait cluster: portrait (+ opponent shoulder badge) + lane tag + @15 value.
                    Standard team ring for everyone — the YOU badge does the marking. */}
                <g transform={`translate(${PX},${portraitYs[i]})`}>
                  <circle r="19" fill="#fff" stroke={TEAM_RING[viewerTeam]} strokeWidth="2.5" />
                  <image href={r.img} x="-17" y="-17" width="34" height="34" clipPath={`url(#${uid}-sl-${i})`} preserveAspectRatio="xMidYMid slice" />
                  <circle cx="14" cy="-12" r="11.5" fill="#fff" stroke={TEAM_RING[oppTeam]} strokeWidth="2" />
                  <image href={r.oppImg} x="3.5" y="-22.5" width="21" height="21" clipPath={`url(#${uid}-slo-${i})`} preserveAspectRatio="xMidYMid slice" />
                  <text x="-30" y="4.5" fontSize="13" fontWeight="700" fill={signColor(r.start)} textAnchor="end">{fmtDiff(r.start)}</text>
                  <text x="-78" y="4.5" fontSize="11" fontWeight="700" fill="#9AA1AD" textAnchor="end">{LANE_TAG[r.role]}</text>
                </g>

                {/* end label at the nudged spot */}
                <text x={X2 + 15} y={endYs[i] + 4.5} fontSize="13" fontWeight="700" fill={signColor(r.end)}>{fmtDiff(r.end)}</text>
              </g>
            </StyledTooltip>
          );
        })}

        {/* the YOU badge paints last — SVG has no z-index, only document
            order — so no other row's portrait can ever cover it */}
        {(() => {
          const vi = rows.findIndex((r) => r.isViewer);
          if (vi === -1) return null;
          const dim = hovered != null && hovered !== vi;
          return (
            <g
              transform={`translate(${PX},${portraitYs[vi]})`}
              pointerEvents="none"
              style={{ opacity: dim ? 0.25 : 1, transition: 'opacity .15s ease' }}
            >
              <rect x="-15" y="11" width="30" height="14" rx="7" fill={YOU_RING[viewerTeam]} />
              <text x="0" y="21.5" fontSize="9.5" fontWeight="800" letterSpacing=".5" fill="#fff" textAnchor="middle">YOU</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
