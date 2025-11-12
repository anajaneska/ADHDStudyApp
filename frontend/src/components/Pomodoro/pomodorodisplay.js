import React from "react";

export default function PomodoroDisplay({ cycle, timeLeft, selectedTask }) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="pomodoro-display">
      <h2>{cycle === "work" ? "Фокус време" : "Пауза"}</h2>
      <p className="timer">{formatTime(timeLeft)}</p>
      {selectedTask && (
        <p className="task">Задача: <span>{selectedTask.title}</span></p>
      )}
    </div>
  );
}
