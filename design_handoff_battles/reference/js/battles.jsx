/* ============================================================
   Battles (BETA) — components
   Reuses Portrait + useMounted from components.jsx (window globals).
   ============================================================ */
const { useState: useStateB, useEffect: useEffectB, useRef: useRefB } = React;

const TEAMB = {
  blue:   { cls: "blue", color: "#568CFF", link: "#0089D6" },
  purple: { cls: "purple", color: "#A35BFF", link: "#8A3FE6" },
};

/* a single linked IGN with its champion avatar */
function Duelist({ player, fallen }) {
  const t = TEAMB[player.side];
  const href = `https://riftreport.gg/summoner/${encodeURIComponent(player.name)}-${player.tag}`;
  return (
    <a className={"bk-name " + t.cls} href={href} onClick={(e) => e.preventDefault()}>{player.name}</a>
  );
}

/* gold-differential area chart for one battle (blue-perspective) */
function GoldDiffGraph({ battle }) {
  const W = 320, H = 150, padL = 40, padR = 10, padT = 12, padB = 22;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const data = battle.goldSeries;
  const xs = data.map((d) => d.m);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const peak = Math.max(800, ...data.map((d) => Math.abs(d.diff)));
  const yMax = Math.ceil(peak / 250) * 250;

  const x = (m) => padL + ((m - minX) / (maxX - minX || 1)) * innerW;
  const y = (v) => padT + innerH / 2 - (v / yMax) * (innerH / 2);
  const zeroY = y(0);

  const linePts = data.map((d) => `${x(d.m).toFixed(1)},${y(d.diff).toFixed(1)}`);
  const areaD = `M${x(data[0].m).toFixed(1)},${zeroY} L${linePts.join(" L")} L${x(data[data.length - 1].m).toFixed(1)},${zeroY} Z`;
  const lineD = `M${linePts.join(" L")}`;

  const ahead = battle.goldSwing > 30 ? "blue" : battle.goldSwing < -30 ? "purple" : "even";
  const stroke = ahead === "blue" ? "#568CFF" : ahead === "purple" ? "#A35BFF" : "#9AA1AD";
  const fill = ahead === "blue" ? "#568CFF" : ahead === "purple" ? "#A35BFF" : "#9AA1AD";

  const mounted = window.useMounted ? window.useMounted() : true;
  const lineRef = useRefB(null);
  const [len, setLen] = useStateB(0);
  useEffectB(() => { if (lineRef.current) setLen(lineRef.current.getTotalLength()); }, []);

  const swing = battle.goldSwing;
  const chipCls = ahead;
  const chipTxt = (swing > 0 ? "+" : swing < 0 ? "−" : "±") + Math.abs(swing).toLocaleString() + "g";

  return (
    <div className="gd-panel">
      <div className="gd-headrow">
        <span className="gd-label">Gold swing</span>
        <span className={"gd-chip " + chipCls}>{chipTxt}</span>
      </div>
      <svg className="gd-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={"gdg-" + battle.id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="0.28" />
            <stop offset="100%" stopColor={fill} stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {/* y grid: 0 baseline + ±max */}
        {[yMax, 0, -yMax].map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)}
              stroke={v === 0 ? "rgba(20,23,31,.16)" : "var(--line)"} strokeWidth="1"
              strokeDasharray={v === 0 ? "none" : "3 3"} />
            <text className="gd-axislabel" x={padL - 7} y={y(v) + 3} textAnchor="end">
              {v === 0 ? "0" : (v > 0 ? "+" : "−") + (Math.abs(v) >= 1000 ? (Math.abs(v) / 1000) + "k" : Math.abs(v))}
            </text>
          </g>
        ))}
        {/* area */}
        <path d={areaD} fill={`url(#gdg-${battle.id})`}
          style={{ opacity: mounted ? 1 : 0, transition: "opacity .5s ease .35s" }} />
        {/* line draws in */}
        <path ref={lineRef} d={lineD} fill="none" stroke={stroke} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round"
          style={{ strokeDasharray: len, strokeDashoffset: mounted ? 0 : len,
            transition: "stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)" }} />
        {/* endpoint */}
        <circle cx={x(data[data.length - 1].m)} cy={y(data[data.length - 1].diff)} r="3.2" fill={stroke}
          style={{ opacity: mounted ? 1 : 0, transition: "opacity .3s ease .9s" }} />
      </svg>
      <div className="gd-foot">
        <span>{fmtMin(minX)}</span>
        <span>{fmtMin(maxX)}</span>
      </div>
    </div>
  );
}

function fmtMin(m) {
  const mm = Math.floor(m);
  const ss = Math.round((m - mm) * 60);
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

/* one kill row: time · killer ⨯ victim · sentence */
function BattleKill({ k, i, mounted }) {
  const style = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? "none" : "translateY(5px)",
    transition: `opacity .32s ease ${i * 55}ms, transform .32s ease ${i * 55}ms`,
  };
  if (k.type === "objective") {
    return (
      <div className="bk-item" style={style}>
        <span className="bk-time">{k.t}</span>
        <span className="bk-duel">
          <Portrait player={{ champ: k.killer.champ, side: k.killer.side, winner: false }} size="xs" />
          <span className="bk-x">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </span>
          <span className="bk-obj"><span className="gd" /></span>
        </span>
        <span className="bk-text">
          <a className={"bk-name " + k.killer.side} href="#" onClick={(e) => e.preventDefault()}>{k.killer.name === "Drake" ? "Purple" : k.killer.name}</a>
          <span className="bk-verb"> secured </span>
          <span className="bk-obj"><span className="ot" style={{ fontWeight: 600 }}>{k.objLabel}</span></span>
        </span>
      </div>
    );
  }
  const kt = TEAMB[k.killer.side];
  return (
    <div className="bk-item" style={style}>
      <span className="bk-time">{k.t}</span>
      <span className="bk-duel">
        <Portrait player={{ champ: k.killer.champ, side: k.killer.side, winner: false }} size="xs" />
        <span className="bk-x">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </span>
        <Portrait player={{ champ: k.victim.champ, side: k.victim.side, winner: false }} size="xs" dim />
      </span>
      <span className="bk-text">
        <Duelist player={k.killer} />
        <span className="bk-verb"> killed </span>
        <Duelist player={k.victim} fallen />
      </span>
    </div>
  );
}

/* outcome label + colored scoreline (blue left, purple right) */
function BattleScore({ battle }) {
  const { winner, blueKills, purpleKills } = battle;
  const outcomeCls = winner === "blue" ? "t-blue" : winner === "purple" ? "t-purple" : "t-even";
  const outcome = winner === "even" ? "Even trade" : (winner === "blue" ? "Blue wins" : "Purple wins");
  return (
    <div className="b-result">
      <span className={"b-outcome " + outcomeCls}>{outcome}</span>
      <span className="b-score">
        <span className="n blue">{blueKills}</span>
        <span className="dash">–</span>
        <span className="n purple">{purpleKills}</span>
      </span>
    </div>
  );
}

/* title with emphasized location word */
function BattleTitle({ battle }) {
  const t = battle.title;
  const loc = battle.location;
  const idx = t.indexOf(loc);
  const sideCls = battle.winner === "blue" ? "blue" : battle.winner === "purple" ? "purple" : "";
  let titleEl;
  if (idx >= 0 && battle.winner !== "even") {
    titleEl = (<>{t.slice(0, idx)}<span className={"loc " + sideCls}>{loc}</span>{t.slice(idx + loc.length)}</>);
  } else {
    titleEl = t;
  }
  return (
    <div className="b-title">
      <div className="tt">{titleEl}</div>
      <div className="b-tags">
        {battle.firstBlood && <span className="b-tag fb"><span className="gd" />First blood</span>}
        {battle.objective && (
          <span className={"b-tag obj " + (battle.winner === "blue" ? "blue" : "")}>
            {battle.objective} secured
          </span>
        )}
        <span className="b-tag" style={{ color: "var(--faint)", background: "#F4F5F7", border: "1px solid var(--line)" }}>
          {battle.blueKills + battle.purpleKills} {battle.blueKills + battle.purpleKills === 1 ? "kill" : "kills"}
        </span>
      </div>
    </div>
  );
}

const ChevB = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
);

function BattleCard({ battle, defaultOpen }) {
  const [open, setOpen] = useStateB(!!defaultOpen);
  const panelRef = useRefB(null);
  const [h, setH] = useStateB(defaultOpen ? "none" : 0);
  const mounted = window.useMounted ? window.useMounted() : true;

  useEffectB(() => {
    if (!panelRef.current) return;
    if (open) setH(panelRef.current.scrollHeight);
    else setH(0);
  }, [open]);

  const sumSideCls = battle.winner === "blue" ? "c-blue" : battle.winner === "purple" ? "c-purple" : "";

  return (
    <div className={"battle win-" + battle.winner + (open ? " open" : "")}>
      <button className="b-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <BattleScore battle={battle} />
        <BattleTitle battle={battle} />
        <span className="b-right">
          <span className="b-time">{battle.timeLabel}</span>
          <span className="b-chev">{ChevB}</span>
        </span>
      </button>
      <div className="b-panel" style={{ maxHeight: h === "none" ? "none" : h }}>
        <div className="b-body" ref={panelRef}>
          <p className="b-summary">
            <span className="q" aria-hidden="true">&ldquo;</span>
            <span><b className={sumSideCls}>{battle.summary.lead}</b> — {battle.summary.detail}</span>
          </p>
          <div className="b-grid">
            <GoldDiffGraph battle={battle} />
            <div className="bk-col">
              <div className="b-feedhead">Kills &amp; objectives</div>
              <div className="bk-list">
                {battle.kills.map((k, i) => <BattleKill key={i} k={k} i={i} mounted={mounted} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BattleCard, GoldDiffGraph, BattleKill, BattleScore, BattleTitle, Duelist });
