/* Post-game Scoreboard — page shell */
function ScoreboardApp() {
  return (
    <div className="page">
      <Scoreboard data={window.SCOREBOARD} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<ScoreboardApp />);
