/* Standout Performances — page shell */
function StandoutsApp() {
  return (
    <div className="page">
      <div className="wrap">
        <StandoutsCard standouts={window.STANDOUTS} />
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<StandoutsApp />);
