/* ============================================================
   Standout Performances — components.
   Reuses Portrait from components.jsx (window global).
   ============================================================ */
const { useState: useStateS } = React;

const RANK_META = {
  MVP: { label: "MVP", full: "Most Valuable", silver: false,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M3 7l4.5 3.5L12 4l4.5 6.5L21 7l-1.8 11H4.8L3 7z" /></svg> },
  "2ND": { label: "2nd", full: "Runner-up", silver: true,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a6 6 0 100-12 6 6 0 000 12zM9 14l-1 7 4-2 4 2-1-7" /></svg> },
  INT: { label: "Int", full: "Struggled", silver: false,
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v5M12 16h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z" /></svg> },
};

function RankPill({ rank, active }) {
  const m = RANK_META[rank];
  return <span className={"rankpill" + (m.silver ? " silver" : "")}>{m.label}</span>;
}

function StandoutDetail({ s }) {
  const t = s.side === "blue" ? "blue" : "purple";
  const m = RANK_META[s.rank];
  const href = `https://riftreport.gg/summoner/${encodeURIComponent(s.name)}-${s.tag}`;
  return (
    <div className="so-detail">
      <span className={"so-badge" + (m.silver ? " silver" : "")}>
        <span className="ic">{m.icon}</span>{m.full}
      </span>
      <div className="so-who">
        <a className={"so-name " + t} href={href} onClick={(e) => e.preventDefault()}>
          &lsquo;{s.name}&rsquo;
        </a>
        <span className="so-champ">{s.champ}</span>
      </div>
      <div className="so-stats">
        <div className="so-stat accent">
          <span className="v">{s.kda.toFixed(1)}</span>
          <span className="l">KDA</span>
        </div>
        <div className="so-stat">
          <span className="v">{s.k}<span className="sl">/</span>{s.d}<span className="sl">/</span>{s.a}</span>
          <span className="l">K / D / A</span>
        </div>
        <div className="so-stat">
          <span className="v">{s.kp}%</span>
          <span className="l">Kill part.</span>
        </div>
      </div>
      <p className="so-summary">
        <span className={"nm " + t}>&lsquo;{s.name}&rsquo;</span> ({s.champ}) <b>{s.summary.lead}</b>, {s.summary.detail}
      </p>
    </div>
  );
}

function StandoutsCard({ standouts }) {
  const [sel, setSel] = useStateS(0);
  const cur = standouts[sel];
  return (
    <div className={"so-card so-rank-" + cur.rank}>
      <div className="so-head"><h2>Standout Performances</h2></div>
      <div className="so-grid">
        <div className="so-rail">
          {standouts.map((s, i) => (
            <button
              key={i}
              className={"so-item so-rank-" + s.rank + (i === sel ? " active" : "")}
              onClick={() => setSel(i)}
              aria-pressed={i === sel}
            >
              <span className="so-port">
                <Portrait player={{ champ: s.champ, side: s.side, winner: false }} />
              </span>
              <RankPill rank={s.rank} active={i === sel} />
            </button>
          ))}
        </div>
        <StandoutDetail s={cur} />
      </div>
    </div>
  );
}

Object.assign(window, { StandoutsCard, StandoutDetail });
