import React from "react";

export default function PomodoroControls({
  isRunning,
  setIsRunning,
  resetTimer,
  cycle,
  switchCycle,
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

      <div className="cycle-switch">
        <button
          className={`btn ${cycle === "work" ? "btn-active" : ""}`}
          onClick={() => switchCycle("work")}
        >
          Фокус
        </button>
        <button
          className={`btn ${cycle === "break" ? "btn-active" : ""}`}
          onClick={() => switchCycle("break")}
        >
          Пауза
        </button>
      </div>
    </div>
  );
}
