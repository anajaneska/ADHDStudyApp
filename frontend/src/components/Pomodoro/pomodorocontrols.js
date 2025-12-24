export default function PomodoroControls({
  isRunning,
  setIsRunning,
  resetTimer,
  setShowTaskModal,
}) {
  return (
    <div className="d-flex justify-content-center gap-3 mt-4">
      <button
        className={`btn start-btn ${isRunning ? "btn-stop" : "btn-start"}`}
        onClick={() => {
          if (!isRunning) setShowTaskModal(true);
          else setIsRunning(false);
        }}
      >
        {isRunning ? "Стоп" : "Старт"}
      </button>

      <button className="btn btn-secondary" onClick={resetTimer}>
        Ресетирај
      </button>
    </div>
  );
}
