/* ============================================================
   Battles (BETA) — page shell
   ============================================================ */
function BattlesApp() {
  return (
    <div className="page">
      <div className="wrap">
        <div className="battles-head">
          <div className="bh-title">
            <h2>Battles</h2>
            <span className="beta-pill">Beta</span>
          </div>
          <p className="bh-sub">Fights that occurred during the match</p>
          <p className="bh-note">Descriptions are generated and may not be 100% accurate.</p>
        </div>

        {window.BATTLES.map((b, i) => (
          <BattleCard key={b.id} battle={b} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<BattlesApp />);
