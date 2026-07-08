/* ============================================================
   Match Details — components.
   Reuses Portrait from components.jsx (window global).
   Objective icons are minimal/abstract line glyphs (functional,
   monochrome). Swap for real Riot objective icons if available.
   ============================================================ */
const { useState: useStateM, useEffect: useEffectM } = React;

// reveal flag that flips true shortly after mount. Uses setTimeout (NOT rAF —
// requestAnimationFrame is paused in hidden/background iframes, which left the
// bars stuck at width:0). End-state is the visible one.
function useGrown() {
  const [g, setG] = useStateM(false);
  useEffectM(() => {
    const t = setTimeout(() => setG(true), 60);
    return () => clearTimeout(t);
  }, []);
  return g;
}

const OBJ_ICON = {
  grubs: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="7" cy="9" r="2.4"/><circle cx="13" cy="7" r="2.4"/><circle cx="12" cy="14" r="2.4"/><circle cx="17" cy="13" r="2.4"/></svg>,
  herald: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>,
  dragons: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2l3 5 5 1-3.5 3.5L18 20l-6-3-6 3 1.5-8.5L4 8l5-1z"/></svg>,
  atakhan: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z"/></svg>,
  barons: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 3l7 4v6c0 4-3 6.5-7 8-4-1.5-7-4-7-8V7z"/><path d="M9 11l1.5 2M15 11l-1.5 2" strokeLinecap="round"/></svg>,
  towers: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M6 21V9l3-2V4h2v3h2V4h2v3l3 2v12M6 21h12M10 21v-4h4v4"/></svg>,
  inhibs: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 2l6 6-6 14L6 8z"/><path d="M6 8h12M12 2v20" strokeWidth="1.4"/></svg>,
};

const CheckSm = <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;

/* ---- top split bar (kills / gold) ---- */
function SplitBar({ label, blue, purple, fmt }) {
  const grown = useGrown();
  const total = blue + purple || 1;
  const bp = grown ? (blue / total) * 100 : 50;
  const pp = grown ? (purple / total) * 100 : 50;
  const f = fmt || ((n) => n.toLocaleString());
  const blueWin = blue >= purple;
  return (
    <div className="md-split">
      <span className={"sv l" + (blueWin ? "" : " dim")}>{f(blue)}</span>
      <div className="md-split-mid">
        <div className="md-split-label">{label}</div>
        <div className="md-bar">
          <div className="seg blue" style={{ width: bp + "%" }} />
          <div className="seg gap" />
          <div className="seg purple" style={{ width: pp + "%" }} />
        </div>
      </div>
      <span className={"sv r" + (!blueWin ? "" : " dim")}>{f(purple)}</span>
    </div>
  );
}

/* ---- one diverging objective row ---- */
function ObjRow({ obj }) {
  const grown = useGrown();
  const { blue, purple, cap, label, key, kind } = obj;
  const none = blue === 0 && purple === 0;
  const bluePct = grown ? Math.max(blue > 0 ? 8 : 0, (blue / cap) * 100) : 0;
  const purplePct = grown ? Math.max(purple > 0 ? 8 : 0, (purple / cap) * 100) : 0;
  const blueWin = blue > purple;
  const securedSide = kind === "binary" && !none ? (purple > blue ? "purple" : "blue") : null;
  const chk = <span className="chk"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>;

  return (
    <div className={"md-obj" + (kind === "binary" ? " binary" : "")}>
      <span className={"md-val l " + (blue === 0 ? "zero" : "blue")}>
        {securedSide === "blue" && chk}{blue}
      </span>
      <div className="md-half l">
        <div className={"fill" + (blue === 0 ? " empty" : "")} style={{ width: blue === 0 ? undefined : bluePct + "%" }} />
      </div>
      <div className="md-obj-label">
        <span className="ic">{OBJ_ICON[key]}</span>
        <span className={"nm" + (none ? " none" : "")}>{label}</span>
      </div>
      <div className="md-half r">
        <div className={"fill" + (purple === 0 ? " empty" : "")} style={{ width: purple === 0 ? undefined : purplePct + "%" }} />
      </div>
      <span className={"md-val r " + (purple === 0 ? "zero" : "purple")}>
        {purple}{securedSide === "purple" && chk}
      </span>
    </div>
  );
}

/* ---- bans row ---- */
function BansRow({ bans }) {
  return (
    <div className="md-bans">
      <span className="bl">Bans</span>
      <div className="md-ban-group">
        {bans.blue.map((b, i) => (
          <span className="md-ban" key={i} title={b.champ}>
            <Portrait player={{ champ: b.champ, side: "blue", winner: false }} />
          </span>
        ))}
      </div>
      <span className="md-ban-sep" />
      <div className="md-ban-group">
        {bans.purple.map((b, i) => (
          <span className="md-ban" key={i} title={b.champ}>
            <Portrait player={{ champ: b.champ, side: "purple", winner: false }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---- whole section ---- */
function MatchDetails({ match }) {
  const blueWin = match.winner === "blue";
  return (
    <div className="wrap">
      <div className="md-head">
        <h2>Match Details</h2>
        <p className="sub">Results at the end of the game</p>
      </div>

      <div className="md-card">
        <div className="md-teams">
          <div className="md-team blue">
            <span className="tname">Blue Team</span>
            <span className={"tresult" + (blueWin ? " win" : "")}>{blueWin ? "Victory" : "Defeat"}</span>
          </div>
          <span className="md-vs">VS</span>
          <div className="md-team purple">
            <span className="tname">Purple Team</span>
            <span className={"tresult" + (!blueWin ? " win" : "")}>{!blueWin ? "Victory" : "Defeat"}</span>
          </div>
        </div>

        <div className="md-splits">
          <SplitBar label="Kills" blue={match.blue.kills} purple={match.purple.kills} fmt={(n) => n} />
          <SplitBar label="Gold" blue={match.blue.gold} purple={match.purple.gold} fmt={(n) => n.toLocaleString() + "g"} />
        </div>

        <div className="md-obj-head">
          <span className="h l">Blue</span>
          <span className="h c">Objectives</span>
          <span className="h r">Purple</span>
        </div>
        <div className="md-objs">
          {match.objectives.map((o) => <ObjRow key={o.key} obj={o} />)}
        </div>
      </div>

      <div className="md-card">
        <BansRow bans={match.bans} />
      </div>
    </div>
  );
}

Object.assign(window, { MatchDetails, SplitBar, ObjRow, BansRow });
