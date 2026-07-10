import React, { useState, useEffect, useRef } from 'react';
import StyledTooltip from '../StyledTooltip';
import NameTip from './NameTip';

// CS/min line graph — cumulative CS, minutes 2–15. One line per player, colored
// by team; support lines dashed. Draws itself in on mount via stroke-dashoffset.
// Hover anywhere over the plot to snap a crosshair to the nearest minute and read
// each player's CS at that point. Hand-rolled SVG (rather than MUI x-charts) to
// match the redesign spec exactly.
export default function CSGraph({ lane }) {
  const W = 620, H = 168;
  const padL = 34, padR = 14, padT = 14, padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const series = [...lane.left, ...lane.right].map((p) => ({
    key: p.participantId,
    name: p.name,
    tag: p.tag,
    href: p.href,
    profilePic: p.profilePic,
    portrait: p.portrait,
    champ: p.champ,
    side: p.side,
    color: p.side === 'blue' ? '#568CFF' : '#A35BFF',
    finalColor: p.side === 'blue' ? '#0074B7' : '#8A3FE6',
    sup: p.role === 'SUP',
    data: lane.cs[p.participantId] || [],
    final: p.cs,
  }));

  const maxCS = Math.max(20, ...series.flatMap((s) => s.data.map((d) => d.cs)));
  const yMax = Math.ceil(maxCS / 25) * 25;
  const x = (m) => padL + ((m - 2) / 13) * innerW;
  const y = (cs) => padT + innerH - (cs / yMax) * innerH;

  const paths = series.map((s) => ({
    ...s,
    d: s.data.map((pt, i) => `${i ? 'L' : 'M'}${x(pt.m).toFixed(1)},${y(pt.cs).toFixed(1)}`).join(' '),
  }));

  const [drawn, setDrawn] = useState(false);
  const refs = useRef([]);
  const [lens, setLens] = useState([]);

  useEffect(() => {
    const L = refs.current.map((el) => (el ? el.getTotalLength() : 0));
    setLens(L);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const yTicks = [0, yMax / 2, yMax];

  // ---- hover crosshair (snapped to the nearest minute) ----
  const svgRef = useRef(null);
  const [hoverM, setHoverM] = useState(null);

  const handleMove = (e) => {
    const svg = svgRef.current;
    const ctm = svg && svg.getScreenCTM();
    if (!ctm) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const loc = pt.matrixTransform(ctm.inverse()); // -> viewBox units
    let m = Math.round(2 + ((loc.x - padL) / innerW) * 13);
    m = Math.max(2, Math.min(15, m));
    setHoverM(m);
  };

  // Readout content/placement for the hovered minute.
  let readout = null;
  if (hoverM != null) {
    const hx = x(hoverM);
    const rows = series.map((s) => {
      const pt = s.data.find((d) => d.m === hoverM);
      return { ...s, cs: pt ? pt.cs : null };
    });
    const boxW = 132;
    const lineStep = 16;
    const boxH = 24 + rows.length * lineStep + 8;
    let bx = hx + 12;
    if (bx + boxW > W - 2) bx = hx - 12 - boxW; // flip near the right edge
    bx = Math.max(2, bx);
    const by = padT;
    readout = { hx, rows, boxW, boxH, bx, by, lineStep };
  }

  return (
    <div className="lpr-csg">
      <svg
        ref={svgRef}
        className="lpr-csg-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {yTicks.map((t, i) => (
          <g key={i}>
            <line className="lpr-csg-grid" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />
            <text className="lpr-csg-axislabel" x={padL - 8} y={y(t) + 3} textAnchor="end">{t}</text>
          </g>
        ))}
        {[2, 5, 8, 11, 15].map((m) => (
          <text key={m} className="lpr-csg-axislabel" x={x(m)} y={H - 8} textAnchor="middle">{m}m</text>
        ))}
        {paths.map((s, i) => {
          const len = lens[i] || 0;
          return (
            <path
              key={s.key}
              ref={(el) => (refs.current[i] = el)}
              className={'lpr-csg-line' + (s.sup ? ' lpr-sup' : '')}
              d={s.d}
              stroke={s.color}
              style={{
                strokeDasharray: s.sup ? undefined : len,
                strokeDashoffset: s.sup ? undefined : (drawn ? 0 : len),
                opacity: drawn ? 1 : (s.sup ? 0 : 1),
                transition: s.sup ? 'opacity .6s ease .5s' : undefined,
              }}
            />
          );
        })}
        {drawn && paths.map((s) => {
          const last = s.data[s.data.length - 1];
          return last ? (
            <circle
              key={s.key}
              cx={x(last.m)}
              cy={y(last.cs)}
              r="3.2"
              fill={s.finalColor}
              style={{ opacity: drawn ? 1 : 0, transition: 'opacity .4s ease 1.05s' }}
            />
          ) : null;
        })}

        {/* hover crosshair: guideline + per-line markers + readout */}
        {readout && (
          <g style={{ pointerEvents: 'none' }}>
            <line
              className="lpr-csg-guide"
              x1={readout.hx}
              x2={readout.hx}
              y1={padT}
              y2={padT + innerH}
            />
            {readout.rows.map((r) =>
              r.cs == null ? null : (
                <circle key={r.key} cx={readout.hx} cy={y(r.cs)} r="3.6" fill={r.finalColor} stroke="#fff" strokeWidth="1.5" />
              )
            )}
            <rect
              className="lpr-csg-readout-bg"
              x={readout.bx}
              y={readout.by}
              width={readout.boxW}
              height={readout.boxH}
              rx="7"
            />
            <text className="lpr-csg-readout-h" x={readout.bx + 10} y={readout.by + 17}>{hoverM}m</text>
            {readout.rows.map((r, i) => {
              const ly = readout.by + 34 + i * readout.lineStep;
              return (
                <g key={r.key}>
                  <circle cx={readout.bx + 13} cy={ly - 3.5} r="3.6" fill={r.finalColor} />
                  <text className="lpr-csg-readout-name" x={readout.bx + 22} y={ly}>{r.name}{r.sup ? ' (sup)' : ''}</text>
                  <text className="lpr-csg-readout-cs" x={readout.bx + readout.boxW - 10} y={ly} textAnchor="end">{r.cs == null ? '—' : `${r.cs} CS`}</text>
                </g>
              );
            })}
          </g>
        )}

        {/* transparent capture layer (on top) drives the hover */}
        <rect
          x="0"
          y="0"
          width={W}
          height={H}
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverM(null)}
        />
      </svg>
      <div className="lpr-csg-legend">
        {series.map((s) => (
          <span key={s.key} className="lpr-lg2" style={{ color: s.finalColor }}>
            <span className={'lpr-ln' + (s.sup ? ' lpr-sup' : '')} />
            <img className="lpr-lgic" src={s.portrait} alt={s.champ} />
            <StyledTooltip placement="top" disableInteractive title={<NameTip player={s} />}>
              <a className="lpr-csg-legend-name" href={s.href} style={{ color: 'inherit' }}>{s.name}</a>
            </StyledTooltip>
            <span className="lpr-fin">· {s.final} CS{s.sup ? ' (sup)' : ''}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
