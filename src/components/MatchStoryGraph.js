import React, { useEffect, useRef, useState, useId } from 'react';
import StyledTooltip from './StyledTooltip';
import { MOMENT_ICONS } from '../functions/GenerateMatchStory';
import { focusBattleAt } from '../hooks/useBattleFocus';

// The Match Summary's gold-lead chart — the story's picture. Blue fill while
// blue leads, purple while purple leads, and the story's Key Moments pinned
// on the line as team-tinted icon markers (tooltips carry the tile text).
// The SVG fills its container (measured via ResizeObserver), so the right
// column always matches the left column's height exactly.

const PIN_COLOR = { blue: '#3D6FD6', purple: '#8A3FE6' };
const TEAM_FILL = { 100: '#568CFF', 200: '#A35BFF' };
const TEAM_LINE = { 100: '#4A76D2', 200: '#8546D2' };
const TEAM_WORD = { 100: 'Blue', 200: 'Purple' };
const PAD = { l: 44, r: 12, t: 12, b: 24 };

function niceStep(range) {
  for (const s of [500, 1000, 2000, 2500, 5000, 10000, 20000]) {
    if (range / s <= 7) return s;
  }
  return 25000;
}

const fmtGold = (g) => {
  const a = Math.abs(g);
  return a >= 1000 ? `${(a / 1000).toFixed(1)}k` : String(a);
};

export default function MatchStoryGraph({ graphData, moments, viewerTeam = 100, hideHead = false }) {
  const oppTeam = viewerTeam === 100 ? 200 : 100;
  // unique clip ids — the component renders more than once per page (summary
  // + Gold Advantage card); shared ids would clip every instance to the first
  const uid = useId().replace(/:/g, '');
  const upId = `msg-up-${uid}`;
  const dnId = `msg-dn-${uid}`;
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState(null); // index into the series

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const minutes = graphData?.xAxisGold || [];
  // yAxisGold is blue-minus-purple; flip for purple viewers so "my team is
  // ahead" always reads as positive/up
  const series = (graphData?.yAxisGold || []).map((v) => (viewerTeam === 200 ? -v : v));
  const n = series.length;
  const { w: W, h: H } = size;
  const ready = W > 0 && H > 0 && n > 1;

  let svg = null;
  let tip = null;
  if (ready) {
    const xMin = minutes[0];
    const xMax = minutes[n - 1];
    const step = niceStep(Math.max(...series, 0) - Math.min(...series, 0) || 1000);
    const yMax = Math.max(Math.ceil(Math.max(...series, 0) / step), 1) * step;
    const yMin = Math.min(Math.floor(Math.min(...series, 0) / step), 0) * step;
    const X = (m) => PAD.l + ((m - xMin) / (xMax - xMin)) * (W - PAD.l - PAD.r);
    const Y = (g) => PAD.t + ((yMax - g) / (yMax - yMin)) * (H - PAD.t - PAD.b);

    const line = series.map((g, i) => `${i ? 'L' : 'M'}${X(minutes[i]).toFixed(1)} ${Y(g).toFixed(1)}`).join(' ');
    const area = `${line} L ${X(xMax).toFixed(1)} ${Y(0)} L ${X(xMin).toFixed(1)} ${Y(0)} Z`;

    const yTicks = [];
    for (let g = yMin; g <= yMax; g += step) yTicks.push(g);
    const xTicks = [];
    for (let m = Math.ceil(xMin / 5) * 5; m <= xMax; m += 5) xTicks.push(m);

    // y on the line at an arbitrary minute (pins can sit between samples)
    const interp = (m) => {
      if (m <= minutes[0]) return Y(series[0]);
      for (let i = 1; i < n; i++) {
        if (minutes[i] >= m) {
          const f = (m - minutes[i - 1]) / (minutes[i] - minutes[i - 1]);
          return Y(series[i - 1] + (series[i] - series[i - 1]) * f);
        }
      }
      return Y(series[n - 1]);
    };

    // pin positions: chronological, nudged apart when they'd overlap, clamped
    // to the plot area (co-timed moments end up side by side)
    const pins = (moments || []).map((m) => ({
      m,
      x: Math.min(Math.max(X(m.at / 60000), PAD.l + 12), W - PAD.r - 12),
      y: Math.min(Math.max(interp(m.at / 60000), PAD.t + 12), H - PAD.b - 12),
    })).sort((a, b) => a.x - b.x);
    for (let i = 1; i < pins.length; i++) {
      if (pins[i].x - pins[i - 1].x < 23) pins[i].x = pins[i - 1].x + 23;
    }
    for (let i = pins.length - 1; i >= 0; i--) {
      const max = W - PAD.r - 12 - (pins.length - 1 - i) * 0;
      if (pins[i].x > max) pins[i].x = max;
      if (i < pins.length - 1 && pins[i + 1].x - pins[i].x < 23) pins[i].x = pins[i + 1].x - 23;
    }

    svg = (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Team gold lead over time">
        <defs>
          <clipPath id={upId}><rect x="0" y="0" width={W} height={Y(0)} /></clipPath>
          <clipPath id={dnId}><rect x="0" y={Y(0)} width={W} height={H - Y(0)} /></clipPath>
        </defs>
        {yTicks.map((g) => (
          <g key={g}>
            <line x1={PAD.l} x2={W - PAD.r} y1={Y(g)} y2={Y(g)} stroke={g === 0 ? '#C7CBD2' : '#F0F1F4'} />
            <text x={PAD.l - 7} y={Y(g) + 3.5} fontSize="9.5" fill="#9AA1AD" textAnchor="end">
              {g / 1000}k
            </text>
          </g>
        ))}
        <path d={area} fill={TEAM_FILL[viewerTeam]} opacity=".8" clipPath={`url(#${upId})`} />
        <path d={area} fill={TEAM_FILL[oppTeam]} opacity=".8" clipPath={`url(#${dnId})`} />
        <path d={line} fill="none" stroke={TEAM_LINE[viewerTeam]} strokeWidth="2" strokeLinejoin="round" />
        {xTicks.map((m) => (
          <text key={m} x={X(m)} y={H - 7} fontSize="9.5" fill="#9AA1AD" textAnchor="middle">
            {m}:00
          </text>
        ))}
        {/* trace layer: nearest-minute crosshair + dot (rect sits under the pins) */}
        <rect
          x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} fill="transparent"
          onMouseMove={(e) => {
            const box = e.currentTarget.ownerSVGElement.getBoundingClientRect();
            const frac = (e.clientX - box.left - PAD.l) / (W - PAD.l - PAD.r);
            const m = xMin + Math.min(1, Math.max(0, frac)) * (xMax - xMin);
            let best = 0, bd = Infinity;
            minutes.forEach((mm, i) => { const d = Math.abs(mm - m); if (d < bd) { bd = d; best = i; } });
            setHover(best);
          }}
          onMouseLeave={() => setHover(null)}
        />
        {hover != null && hover < n && (
          <g pointerEvents="none">
            <line x1={X(minutes[hover])} x2={X(minutes[hover])} y1={PAD.t} y2={H - PAD.b} stroke="#B0B6C0" strokeDasharray="3 3" />
            <circle cx={X(minutes[hover])} cy={Y(series[hover])} r="4.5" fill="#fff" stroke={TEAM_LINE[viewerTeam]} strokeWidth="2" />
          </g>
        )}
        {pins.map(({ m, x, y }, i) => (
          <StyledTooltip key={i} disableInteractive arrow placement="top"
            title={<><b>{m.title}</b><br />{m.sub}</>}>
            <g
              transform={`translate(${x},${y})`}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={`Jump to the battle around ${m.title}`}
              onClick={() => focusBattleAt(m.at)}
            >
              <circle r="10" fill="#fff" stroke={PIN_COLOR[m.side] || '#6B7280'} strokeWidth="2" />
              <g transform="translate(-6.5,-6.5)" style={{ color: PIN_COLOR[m.side] || '#6B7280' }}>
                {MOMENT_ICONS[m.icon]}
              </g>
            </g>
          </StyledTooltip>
        ))}
      </svg>
    );

    if (hover != null && hover < n) {
      const v = series[hover];
      const leader = v === 0 ? null : v > 0 ? viewerTeam : oppTeam;
      tip = (
        <div
          className="msg-tip"
          style={{ left: Math.min(Math.max(X(minutes[hover]), 62), W - 62), top: Math.max(Y(v) - 12, 8) }}
        >
          <span className="msg-tip-t">{minutes[hover]}:00</span>
          {leader === null
            ? 'Even'
            : <span className={leader === 100 ? 'msg-tip-blue' : 'msg-tip-purple'}>{TEAM_WORD[leader]} +{fmtGold(v)}</span>}
        </div>
      );
    }
  }

  return (
    <div className="msg-root">
      {!hideHead && <div className="msg-head">Team Gold Lead</div>}
      <div className="msg-wrap" ref={wrapRef}>{svg}{tip}</div>
      <div className="msg-legend">
        <span><span className="msg-swatch" style={{ background: TEAM_FILL[viewerTeam] }} />{TEAM_WORD[viewerTeam]} ahead</span>
        <span><span className="msg-swatch" style={{ background: TEAM_FILL[oppTeam] }} />{TEAM_WORD[oppTeam]} ahead</span>
        {(moments || []).length > 0 && (
          <span>
            <svg width="12" height="12" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5" fill="#fff" stroke="#3D6FD6" strokeWidth="2" /></svg>
            key moment
          </span>
        )}
      </div>
    </div>
  );
}
