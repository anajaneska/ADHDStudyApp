import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import PomodoroDisplay from "./pomodorodisplay";
import PomodoroControls from "./pomodorocontrols";
import PomodoroSettings from "./pomodorosettings";
import TaskModal from "./taskmodal";
import { FaCog } from "react-icons/fa";
import "./pomodoro.css";

export default function PomodoroTimer({ tasks, selectedTask, setSelectedTask }) {
  const [username, setUsername] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycle, setCycle] = useState("work");
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [editMode, setEditMode] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Decode JWT
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.sub || decoded.username || "guest");
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  const storageKey = `pomodoro_${username}`;

  // Load saved session
  useEffect(() => {
    if (!username) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const { timeLeft, isRunning, cycle, lastUpdate, date } = JSON.parse(saved);
      const today = new Date().toDateString();
      if (date !== today) {
        localStorage.removeItem(storageKey);
        return;
      }
      const now = Date.now();
      const elapsed = Math.floor((now - lastUpdate) / 1000);
      const newTime = isRunning ? Math.max(timeLeft - elapsed, 0) : timeLeft;
      setTimeLeft(newTime);
      setIsRunning(isRunning);
      setCycle(cycle);
    }
  }, [username]);

  // Save to localStorage
  useEffect(() => {
    if (!username) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        timeLeft,
        isRunning,
        cycle,
        lastUpdate: Date.now(),
        date: new Date().toDateString(),
      })
    );
  }, [timeLeft, isRunning, cycle, username]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (cycle === "work") {
        alert("Време е за пауза ☕");
        setCycle("break");
        setTimeLeft(breakDuration * 60);
        setSelectedTask(null);
      } else {
        alert("Време е за работа 💪");
        setCycle("work");
        setTimeLeft(workDuration * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, cycle]);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(workDuration * 60);
    setCycle("work");
    setSelectedTask(null);
    localStorage.removeItem(storageKey);
  };

  const switchCycle = (newCycle) => {
    setCycle(newCycle);
    setTimeLeft(newCycle === "work" ? workDuration * 60 : breakDuration * 60);
    setIsRunning(false);
  };

  return (
    <div className="pomodoro-container">
  {/* Top header: title left, gear right */}
  <div className="pomodoro-header">
    <h2 className="pomodoro-title">Pomodoro timer</h2>
    <div className="settings-gear" onClick={() => setEditMode(true)}>
      <FaCog size={24} />
    </div>
  </div>

  {/* Top: Focus / Break buttons */}
  <div className="cycle-switch-top">
    <button
      className={`btn ${cycle === "work" ? "btn-active" : ""}`}
      onClick={() => switchCycle("work")}
    >
      Focus ({workDuration})
    </button>
    <button
      className={`btn ${cycle === "break" ? "btn-active" : ""}`}
      onClick={() => switchCycle("break")}
    >
      Break ({breakDuration})
    </button>
  </div>

  {/* Timer Display */}
  <PomodoroDisplay
    cycle={cycle}
    timeLeft={timeLeft}
    selectedTask={selectedTask}
  />

  {/* Bottom: Start / Reset buttons */}
  <PomodoroControls
    isRunning={isRunning}
    setIsRunning={setIsRunning}
    resetTimer={resetTimer}
    cycle={cycle}
    setShowTaskModal={setShowTaskModal}
  />

  {/* Settings modal */}
  <PomodoroSettings
    editMode={editMode}
    setEditMode={setEditMode}
    workDuration={workDuration}
    breakDuration={breakDuration}
    setWorkDuration={setWorkDuration}
    setBreakDuration={setBreakDuration}
    switchCycle={switchCycle}
    cycle={cycle}
  />

  {showTaskModal && (
    <TaskModal
      tasks={tasks}
      setShowTaskModal={setShowTaskModal}
      setSelectedTask={setSelectedTask}
      setIsRunning={setIsRunning}
    />
  )}
</div>
  );
}
