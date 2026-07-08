/* ============================================================
   Shared components for the Laning Phase cards.
   Exposed on window for the variant scripts to consume.
   ============================================================ */
const { useState, useEffect, useRef } = React;

// reveal helper: false on first paint, true after mount (drives entrance
// transitions via state so static renders/captures show the END state)
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setM(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return m;
}

const TEAM = {
  blue:   { ring: "#568CFF", link: "blue",   cls: "blue" },
  purple: { ring: "#A35BFF", link: "purple", cls: "purple" },
};

// deterministic hue per champion so placeholder avatars look distinct
function champHue(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}
function mono(name) {
  const clean = name.replace(/[^A-Za-z]/g, "");
  return clean.slice(0, 3);
}

/* ---- placeholder square portrait with team ring ---- */
function Portrait({ player, size, dim }) {
  const t = TEAM[player.side];
  const hue = champHue(player.champ);
  const step = size === "xs" ? 6 : 9;
  const bg = `repeating-linear-gradient(135deg,
      hsl(${hue} 42% 46%) 0 ${step}px,
      hsl(${hue} 42% 40%) ${step}px ${step * 2}px)`;
  const sizeCls = size === "sm" ? " sm" : size === "xs" ? " xs" : "";
  return (
    <div
      className={"portrait" + sizeCls + (dim ? " dim" : "")}
      style={{ "--ring": t.ring, background: bg }}
      title={player.champ}
    >
      <span className="mono">{mono(player.champ)}</span>
      {player.winner && size !== "xs" && (
        <span className="crown" aria-label="lane winner">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 7l4.5 3.5L12 4l4.5 6.5L21 7l-1.8 11H4.8L3 7z" />
          </svg>
        </span>
      )}
    </div>
  );
}

/* ---- 0–5 severity dots ---- */
function SeverityDots({ count, side, draw }) {
  const mounted = useMounted();
  const onCls = side === 100 ? "on-blue" : side === 200 ? "on-purple" : "";
  return (
    <div className="sev" aria-label={`severity ${count} of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={"pip" + (i < count ? " " + onCls : "")}
          style={{
            transform: mounted ? "scale(1)" : "scale(0)",
            transition: `transform .26s cubic-bezier(.34,1.56,.64,1) ${i * 55}ms`,
          }}
        />
      ))}
      {draw && <span className="sev-label">Even</span>}
    </div>
  );
}

/* ---- gold tier chip (header, right) ---- */
function GoldChip({ diff, winnerTeam, draw }) {
  const tier = LaneHelpers.goldLabel(diff);
  const cls = draw ? "t-even" : winnerTeam === 100 ? "t-blue" : "t-purple";
  return (
    <div className="gold-chip">
      <span className={"amt " + cls}>{draw ? "+" + diff : "+" + diff.toLocaleString()}</span>
      <span className="tier">{tier} gold</span>
    </div>
  );
}

/* ---- center gold tug-of-war bar (SVG, static geometry) ---- */
function GoldTug({ diff, winnerTeam, draw }) {
  const VB = 200, C = 100, H = 14;
  const len = Math.min(diff / 4000, 1) * C; // up to half the bar
  const winnerBlue = winnerTeam === 100;
  const blue = draw ? { x: C - 16, w: 16 } : winnerBlue ? { x: C - len, w: len } : { x: C, w: 0 };
  const purple = draw ? { x: C, w: 16 } : !winnerBlue ? { x: C, w: len } : { x: C, w: 0 };
  const op = draw ? 0.5 : 1;
  return (
    <div className="gold-center">
      <span className="gold-vs">VS</span>
      <svg className="tug" viewBox={`0 0 ${VB} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <rect x="0" y="1" width={VB} height="12" rx="6" fill="#E7E9EE" />
        {blue.w > 0 && <rect x={blue.x} y="1" width={blue.w} height="12" rx="6" fill="#568CFF" opacity={op} />}
        {purple.w > 0 && <rect x={purple.x} y="1" width={purple.w} height="12" rx="6" fill="#A35BFF" opacity={op} />}
        <rect x={C - 1} y="-1" width="2" height="16" fill="#fff" />
      </svg>
      <div className="gold-ends">
        <span className={!draw && winnerBlue ? "e-blue" : "e-off"}>Blue</span>
        <span className={!draw && !winnerBlue ? "e-purple" : "e-off"}>Purple</span>
      </div>
    </div>
  );
}

/* ---- one player row (portrait + name + KDA/CS) ---- */
function PlayerRow({ player, sizeSm }) {
  const t = TEAM[player.side];
  const href = `https://riftreport.gg/summoner/${encodeURIComponent(player.name)}-${player.tag}`;
  return (
    <div className="player">
      <Portrait player={player} size={sizeSm ? "sm" : null} dim={!player.winner && player.loserDim} />
      <div className="pmeta">
        <a className={"pname " + t.cls} href={href} onClick={(e) => e.preventDefault()}>{player.name}</a>
        <span className="pchamp">
          {player.champ}{player.role ? <span className="role-tag"> · {player.role}</span> : null}
        </span>
        <span className="pstats">
          <span className="stat-k">{player.kda.replace(/\//g, " / ")}</span>
          <span className="stat-cs">{player.cs} CS</span>
        </span>
      </div>
    </div>
  );
}

/* ---- full matchup row: side / gold / side ---- */
function Matchup({ lane }) {
  const sizeSm = lane.duo;
  return (
    <div className={"matchup" + (lane.duo ? " duo" : "")}>
      <div className="side left">
        {lane.blue.map((p, i) => <PlayerRow key={i} player={p} sizeSm={sizeSm} />)}
      </div>
      <GoldTug diff={lane.goldDifference} winnerTeam={lane.teamWonLane} draw={lane.resTag === "draw"} />
      <div className="side right">
        {lane.purple.map((p, i) => <PlayerRow key={i} player={p} sizeSm={sizeSm} />)}
      </div>
    </div>
  );
}

/* champ-name -> player lookup for a lane */
function champMap(lane) {
  const m = {};
  [...lane.blue, ...lane.purple].forEach((p) => { m[p.champ] = p; });
  return m;
}

/* one linked IGN with its champion avatar */
function FeedActor({ player }) {
  const t = TEAM[player.side];
  const href = `https://riftreport.gg/summoner/${encodeURIComponent(player.name)}-${player.tag}`;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Portrait player={{ ...player, winner: false }} size="xs" />
      <a className={"kf-name " + t.cls} href={href} onClick={(e) => e.preventDefault()}>{player.name}</a>
    </span>
  );
}

/* ---- kill feed: modern timeline list ---- */
function KillFeed({ lane }) {
  const kills = lane.kills;
  const mounted = useMounted();
  if (!kills.length) {
    return <div className="feed-empty">No kills or objectives before 15:00 — a quiet, even lane.</div>;
  }
  const map = champMap(lane);
  return (
    <div className="feed">
      <div className="kf-list">
        {kills.map((k, i) => {
          const dotCls = k.type === "monster" ? "monster" : k.type === "tower" ? "tower" : k.side;
          const killer = map[k.killer];
          const victim = map[k.victim];
          let body;
          if (k.type === "monster") {
            body = (<>
              <FeedActor player={killer} />
              <span className="kf-verb">secured</span>
              <span className="kf-obj"><span className="od" />{k.victim}</span>
            </>);
          } else if (k.type === "tower") {
            body = (<>
              <span className="kf-turret" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 21V8l3-2V3h2v3h4V3h2v3l3 2v13M5 21h14M9 21v-4h6v4" />
                </svg>
              </span>
              <FeedActor player={victim} />
              <span className="kf-verb">fell to turret</span>
            </>);
          } else {
            body = (<>
              <FeedActor player={killer} />
              <span className="kf-verb">killed</span>
              <FeedActor player={victim} />
            </>);
          }
          return (
            <div className="kf-item" key={i}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "none" : "translateY(5px)",
                transition: `opacity .34s ease ${i * 55}ms, transform .34s ease ${i * 55}ms`,
              }}>
              <span className="kf-time">{k.t}:00</span>
              <span className="kf-node"><span className={"kf-dot " + dotCls} /></span>
              <span className="kf-evt">{body}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- brief dynamic takeaway sentence ---- */
function TakeawayLine({ lane }) {
  const draw = lane.resTag === "draw";
  let inner;
  if (draw) {
    inner = (<>
      <b>Dead even.</b> {lane.blue[0].champ} and {lane.purple[0].champ} traded blows and CS, separated by just <b className="c-even">+{lane.goldDifference} gold</b>.
    </>);
  } else {
    const win = (lane.teamWonLane === 100 ? lane.blue : lane.purple)[0];
    const cls = lane.teamWonLane === 100 ? "c-blue" : "c-purple";
    const team = lane.teamWonLane === 100 ? "Blue" : "Purple";
    const tier = LaneHelpers.goldLabel(lane.goldDifference);
    const lead = {
      obliterates: "hard-carried the lane",
      dominates: "won the trades",
      won: "came out ahead",
    }[lane.resTag] || "won the lane";
    inner = (<>
      <b className={cls}>{win.champ}</b> {lead} (<b>{win.kda.replace(/\//g, "/")}</b>) — {tier}, <b className={cls}>+{lane.goldDifference.toLocaleString()} gold</b> for {team}.
    </>);
  }
  return (
    <p className="takeaway">
      <span className="tk-quote" aria-hidden="true">&ldquo;</span>
      <span>{inner}</span>
    </p>
  );
}

Object.assign(window, {
  TEAM, champHue, mono, Portrait, SeverityDots, useMounted,
  GoldChip, GoldTug, PlayerRow, Matchup, KillFeed,
  champMap, FeedActor, TakeawayLine,
});
