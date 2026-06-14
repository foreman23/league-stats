/* ============================================================
   App shell — final deliverable: Option B (segmented pills).
   Desktop section (real anchor IDs) + mobile frame.
   ============================================================ */
function Section({ prefix }) {
  return (
    <div className="section-head">
      <h2>Laning Phase Results</h2>
      <p className="sub">How each lane was performing @ 15 minutes</p>
    </div>
  );
}

function App() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>Laning Phase Results</h1>
        <p>
          Redesigned section — the original Summary / Bloodshed / CS&nbsp;Graph tabs, rebuilt as a clean
          segmented control. Each lane leads with the outcome, severity meter and gold tug-of-war, plus a
          one-line takeaway; the kill feed and CS graph swap in on demand.
        </p>
      </div>

      <div className="wrap">
        <div className="var-block">
          <Section />
          {window.LANES.map((lane) => <LaneCardB key={lane.anchor} lane={lane} prefix="" />)}
        </div>

        <div className="var-block">
          <span className="var-tag"><span className="dot" />Mobile · stacked</span>
          <p className="var-desc">
            On a phone the matchup collapses to a single column: portraits stack, the gold tug-of-war moves
            to the top, and stats left-align. The segmented control and all three views behave identically.
          </p>
          <div className="phone">
            <div className="phone-screen">
              <div className="section-head">
                <h2>Laning Phase Results</h2>
                <p className="sub">How each lane was performing @ 15 minutes</p>
              </div>
              {window.LANES.map((lane) => <LaneCardB key={lane.anchor} lane={lane} prefix="m-" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
