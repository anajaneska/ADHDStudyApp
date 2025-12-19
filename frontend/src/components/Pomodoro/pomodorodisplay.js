import React from "react";

export default function PomodoroDisplay({ cycle, timeLeft, selectedTask }) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="pomodoro-display">
      <p className="timer">{formatTime(timeLeft)}</p>
      {selectedTask && (
        <p className="task">задача: <span>{selectedTask.title}</span></p>
      )}
    </div>
  );
}
