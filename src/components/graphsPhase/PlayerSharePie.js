import React from 'react';
import StyledTooltip from '../StyledTooltip';

// Share pie: one slice per player with the champion portrait clipped into the
// slice at its centroid and a % label on larger slices — "who did what share"
// readable at a glance. Hover-linked to the bars via hovered/onHover; the
// hovered slice lifts slightly along its mid-angle.
//
// Tiny slices skip the icon (< 5.5%) and the % label (< 8%) so nothing
// overlaps; the tooltip still identifies them.

const TAU = Math.PI * 2;

export default function PlayerSharePie({ players, hovered, onHover, size = 250, idPrefix = 'pie', fmt = (v) => v.toLocaleString() }) {
  const total = players.reduce((t, x) => t + x.value, 0) || 1;
  const C = size / 2;
  const R = C - 9; // margin for the hover lift
  const iconR = Math.max(10, Math.round(size * 0.052)); // portrait radius scales with the pie
  const labelFs = size < 220 ? 10 : 11;

  let angle = -Math.PI / 2;
  const slices = players.map((x, i) => {
    const frac = x.value / total;
    const a0 = angle;
    const a1 = angle + frac * TAU;
    angle = a1;
    return { x, i, frac, a0, a1, mid: (a0 + a1) / 2 };
  });

  const arc = ({ a0, a1 }) => {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${C} ${C} L ${(C + R * Math.cos(a0)).toFixed(2)} ${(C + R * Math.sin(a0)).toFixed(2)} ` +
      `A ${R} ${R} 0 ${large} 1 ${(C + R * Math.cos(a1)).toFixed(2)} ${(C + R * Math.sin(a1)).toFixed(2)} Z`;
  };

  return (
    <svg className="gp-piesvg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Share per player">
      {slices.map((s) => {
        const { x, i, frac, mid } = s;
        const pull = hovered === i ? 3 : 0;
        const showIcon = frac >= 0.055;
        const showLabel = frac >= 0.08;
        // icon sits further in when a % label shares the ray below it
        const ir = R * (showLabel ? 0.52 : 0.62);
        const icx = C + Math.cos(mid) * ir;
        const icy = C + Math.sin(mid) * ir;
        const lx = C + Math.cos(mid) * R * 0.82;
        const ly = C + Math.sin(mid) * R * 0.82;
        const dimmed = hovered != null && hovered !== i;
        return (
          <StyledTooltip
            key={i}
            disableInteractive
            placement="top"
            title={<><b>{x.p.riotIdGameName}</b> · {x.champName}<br />{fmt(x.value)} ({Math.round(frac * 100)}%)</>}
          >
            <g
              className={'gp-slice' + (dimmed ? ' gp-dim' : '')}
              style={{ transform: `translate(${(Math.cos(mid) * pull).toFixed(1)}px, ${(Math.sin(mid) * pull).toFixed(1)}px)` }}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
            >
              <path d={arc(s)} fill={x.color} stroke="#fff" strokeWidth="2" />
              {showIcon && (
                <g pointerEvents="none">
                  <clipPath id={`${idPrefix}-clip-${i}`}><circle cx={icx} cy={icy} r={iconR} /></clipPath>
                  <image
                    href={x.img}
                    x={icx - iconR}
                    y={icy - iconR}
                    width={iconR * 2}
                    height={iconR * 2}
                    clipPath={`url(#${idPrefix}-clip-${i})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <circle cx={icx} cy={icy} r={iconR} fill="none" stroke="#fff" strokeWidth="1.6" />
                </g>
              )}
              {showLabel && (
                <text pointerEvents="none" x={lx} y={ly + 3.5} fontSize={labelFs} fontWeight="700" fill="#fff" textAnchor="middle">
                  {Math.round(frac * 100)}%
                </text>
              )}
            </g>
          </StyledTooltip>
        );
      })}
    </svg>
  );
}
