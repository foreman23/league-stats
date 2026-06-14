/* ============================================================
   CS/min line graph — cumulative CS, minutes 2–15.
   One line per player, colored by team. Supports dashed.
   Draws itself in on mount.
   ============================================================ */
function CSGraph({ lane }) {
  const W = 620, H = 168;
  const padL = 34, padR = 14, padT = 14, padB = 24;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  // assemble series from both sides
  const series = [...lane.blue, ...lane.purple].map((p) => ({
    champ: p.champ,
    name: p.name,
    side: p.side,
    color: p.side === "blue" ? "#568CFF" : "#A35BFF",
    finalColor: p.side === "blue" ? "#0089D6" : "#8A3FE6",
    sup: p.role === "SUP",
    data: lane.cs[p.champ] || [],
    final: p.cs,
  }));

  const maxCS = Math.max(20, ...series.flatMap((s) => s.data.map((d) => d.cs)));
  const yMax = Math.ceil(maxCS / 25) * 25;
  const x = (m) => padL + ((m - 2) / 13) * innerW;
  const y = (cs) => padT + innerH - (cs / yMax) * innerH;

  const paths = series.map((s) => {
    const d = s.data.map((pt, i) => `${i ? "L" : "M"}${x(pt.m).toFixed(1)},${y(pt.cs).toFixed(1)}`).join(" ");
    return { ...s, d };
  });

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

  return (
    <div className="csg">
      <svg className="csg-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {/* y gridlines + labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line className="csg-grid" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />
            <text className="csg-axislabel" x={padL - 8} y={y(t) + 3} textAnchor="end">{t}</text>
          </g>
        ))}
        {/* x labels */}
        {[2, 5, 8, 11, 15].map((m) => (
          <text key={m} className="csg-axislabel" x={x(m)} y={H - 8} textAnchor="middle">{m}m</text>
        ))}
        {/* lines */}
        {paths.map((s, i) => {
          const len = lens[i] || 0;
          return (
            <path
              key={i}
              ref={(el) => (refs.current[i] = el)}
              className={"csg-line" + (s.sup ? " sup" : "")}
              d={s.d}
              stroke={s.color}
              style={{
                strokeDasharray: s.sup ? undefined : len,
                strokeDashoffset: s.sup ? undefined : (drawn ? 0 : len),
                opacity: drawn ? 1 : (s.sup ? 0 : 1),
                transition: s.sup ? "opacity .6s ease .5s" : undefined,
              }}
            />
          );
        })}
        {/* endpoint dots */}
        {drawn && paths.map((s, i) => {
          const last = s.data[s.data.length - 1];
          return last ? (
            <circle key={i} cx={x(last.m)} cy={y(last.cs)} r="3.2" fill={s.finalColor}
              style={{ opacity: drawn ? 1 : 0, transition: "opacity .4s ease 1.05s" }} />
          ) : null;
        })}
      </svg>
      <div className="csg-legend">
        {series.map((s, i) => (
          <span key={i} className="lg2" style={{ color: s.finalColor }}>
            <span className={"ln" + (s.sup ? " sup" : "")} />
            <span>{s.name}</span>
            <span className="fin">· {s.final} CS{s.sup ? " (sup)" : ""}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CSGraph });
