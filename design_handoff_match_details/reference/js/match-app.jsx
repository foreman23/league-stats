/* Match Details — page shell */
function MatchApp() {
  return (
    <div className="page">
      <MatchDetails match={window.MATCH} />
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<MatchApp />);
