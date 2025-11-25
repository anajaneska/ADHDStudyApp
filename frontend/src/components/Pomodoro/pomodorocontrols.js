import React from "react";

export default function PomodoroControls({
  isRunning,
  setIsRunning,
  resetTimer,
  setShowTaskModal,
}) {
  return (
    <div className="pomodoro-controls">
      <button
        className={`btn ${isRunning ? "btn-pause" : "btn-start"}`}
        onClick={() => {
          if (!isRunning) setShowTaskModal(true);
          else setIsRunning(false);
        }}
      >
        {isRunning ? "Пауза" : "Старт"}
      </button>

      <button className="btn btn-reset" onClick={resetTimer}>
        Ресет
      </button>
    </div>
  );
}
