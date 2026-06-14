/* ============================================================
   Three lane-card variations.
   A — Unified (everything visible, no clicking)
   B — Segmented pills (redesigned tabs)
   C — Hybrid (stats always visible, feed/graph expand)
   ============================================================ */

/* shared headline with colored team word */
function Headline({ lane }) {
  const draw = lane.resTag === "draw";
  if (draw) {
    return <span className="headline">{lane.laneLabel} was a draw</span>;
  }
  const teamCls = lane.teamWonLane === 100 ? "t-blue" : "t-purple";
  const team = lane.teamWonLane === 100 ? "Blue" : "Purple";
  return (
    <span className="headline">
      <span className={teamCls}>{team}</span> {lane.resTag} {lane.laneKey}
    </span>
  );
}

function CardHeader({ lane }) {
  const draw = lane.resTag === "draw";
  return (
    <div className="card-head">
      <div className="headline-wrap">
        <Headline lane={lane} />
        <SeverityDots count={lane.bubbleCount} side={lane.teamWonLane} draw={draw} />
      </div>
      <GoldChip diff={lane.goldDifference} winnerTeam={lane.teamWonLane} draw={draw} />
    </div>
  );
}

/* small uppercase sub-section label */
function SubLabel({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "20px 2px 4px",
      fontSize: 11, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "#9AA1AD" }}>
      {icon}{children}
    </div>
  );
}

const IconSwords = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M5 14l-2 2v3h3l2-2" />
  </svg>
);
const IconChart = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18M7 14l4-4 3 3 5-6" />
  </svg>
);
const IconChevron = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ---------------- Variation A: Unified ---------------- */
function LaneCardA({ lane, prefix }) {
  return (
    <div className={"lane-card" + (lane.resTag === "draw" ? " is-draw" : "")} id={(prefix || "") + lane.anchor} data-anchor={lane.anchor}>
      <CardHeader lane={lane} />
      <Matchup lane={lane} />
      <TakeawayLine lane={lane} />
      <SubLabel icon={<span className="section-icon">{IconSwords}</span>}>Kill feed</SubLabel>
      <KillFeed lane={lane} />
      <SubLabel icon={<span className="section-icon">{IconChart}</span>}>CS over time</SubLabel>
      <CSGraph lane={lane} />
    </div>
  );
}

/* ---------------- Variation B: Segmented pills ---------------- */
function LaneCardB({ lane, prefix }) {
  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "feed", label: "Kill feed", badge: lane.kills.length || null },
    { id: "graph", label: "CS graph" },
  ];
  const [tab, setTab] = useState("summary");
  return (
    <div className={"lane-card" + (lane.resTag === "draw" ? " is-draw" : "")} id={(prefix || "") + lane.anchor} data-anchor={lane.anchor}>
      <div className="card-head" style={{ marginBottom: 14 }}>
        <div className="headline-wrap">
          <Headline lane={lane} />
          <SeverityDots count={lane.bubbleCount} side={lane.teamWonLane} draw={lane.resTag === "draw"} />
        </div>
        <GoldChip diff={lane.goldDifference} winnerTeam={lane.teamWonLane} draw={lane.resTag === "draw"} />
      </div>
      <div className="seg" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)} role="tab" aria-selected={tab === t.id}>
            {t.label}
            {t.badge ? <span className="badge">{t.badge}</span> : null}
          </button>
        ))}
      </div>
      <div className="seg-panel" key={tab}>
        {tab === "summary" && <><Matchup lane={lane} /><TakeawayLine lane={lane} /></>}
        {tab === "feed" && <KillFeed lane={lane} />}
        {tab === "graph" && <CSGraph lane={lane} />}
      </div>
    </div>
  );
}

/* ---------------- Variation C: Hybrid ---------------- */
function Expandable({ open, children }) {
  const ref = useRef(null);
  const [h, setH] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    setH(open ? ref.current.scrollHeight : 0);
  }, [open, children]);
  return (
    <div className="exp-panel" style={{ maxHeight: h, transition: "max-height .34s cubic-bezier(.4,0,.2,1)" }}>
      <div ref={ref} className="exp-inner">{children}</div>
    </div>
  );
}

function LaneCardC({ lane, prefix }) {
  const [feed, setFeed] = useState(false);
  const [graph, setGraph] = useState(false);
  return (
    <div className={"lane-card" + (lane.resTag === "draw" ? " is-draw" : "")} id={(prefix || "") + lane.anchor} data-anchor={lane.anchor}>
      <CardHeader lane={lane} />
      <Matchup lane={lane} />
      <TakeawayLine lane={lane} />
      <div className="exp-row">
        <button className={"exp-chip" + (feed ? " open" : "")} onClick={() => setFeed((v) => !v)}>
          <span className="section-icon">{IconSwords}</span>
          Kill feed <span className="count">{lane.kills.length}</span>
          <span className="chev">{IconChevron}</span>
        </button>
        <button className={"exp-chip" + (graph ? " open" : "")} onClick={() => setGraph((v) => !v)}>
          <span className="section-icon">{IconChart}</span>
          CS graph
          <span className="chev">{IconChevron}</span>
        </button>
      </div>
      <Expandable open={feed}><KillFeed lane={lane} /></Expandable>
      <Expandable open={graph}><CSGraph lane={lane} /></Expandable>
    </div>
  );
}

Object.assign(window, { Headline, CardHeader, LaneCardA, LaneCardB, LaneCardC });
