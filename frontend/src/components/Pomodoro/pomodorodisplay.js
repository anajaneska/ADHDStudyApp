import React from "react";

export default function PomodoroDisplay({ cycle, timeLeft, selectedTask }) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="pomodoro-display text-center my-4">
      <p className="timer mb-3">{formatTime(timeLeft)}</p>
      {selectedTask && (
        <p className="task mb-0">
          задача: <span className="fw-bold">{selectedTask.title}</span>
        </p>
      )}
    </div>
  );
}
