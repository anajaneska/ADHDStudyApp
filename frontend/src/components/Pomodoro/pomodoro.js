// src/components/focus/PomodoroTimer.jsx
import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export default function PomodoroTimer({ tasks, selectedTask, setSelectedTask }) {
  const [username, setUsername] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycle, setCycle] = useState("work");
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [editMode, setEditMode] = useState(false);
  const [tempWork, setTempWork] = useState(workDuration);
  const [tempBreak, setTempBreak] = useState(breakDuration);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Decode JWT
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.sub || decoded.username || decoded.user || "guest");
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  const storageKey = `pomodoro_${username}`;

  // Load saved state
  useEffect(() => {
    if (!username) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const { timeLeft, isRunning, cycle, lastUpdate, date } = JSON.parse(saved);
      const today = new Date().toDateString();

      if (date && date !== today) {
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
        setSelectedTask(null); // show all tasks again
      } else {
        alert("Време е за работа 💪");
        setCycle("work");
        setTimeLeft(workDuration * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, cycle, workDuration, breakDuration]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const switchCycle = (newCycle) => {
    setCycle(newCycle);
    setTimeLeft(newCycle === "work" ? workDuration * 60 : breakDuration * 60);
    setIsRunning(false);
  };

  const saveEdit = () => {
    if (tempWork > 0) setWorkDuration(tempWork);
    if (tempBreak > 0) setBreakDuration(tempBreak);
    switchCycle(cycle);
    setEditMode(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-2xl rounded-2xl p-6 w-80">
      <h2 className="text-2xl font-bold mb-2 text-center">
        {cycle === "work" ? "Фокус време" : "Пауза"}
      </h2>

      <p className="text-5xl font-mono text-center mb-4 drop-shadow-lg">
        {formatTime(timeLeft)}
      </p>

      {selectedTask && (
        <p className="text-center text-lg font-semibold mb-2">
          Задача: <span className="italic">{selectedTask.title}</span>
        </p>
      )}

      <div className="flex justify-center space-x-3 mb-2">
        <button
          onClick={() => {
            if (!isRunning) {
              setShowTaskModal(true);
            } else {
              setIsRunning(false);
            }
          }}
          className={`px-4 py-2 rounded-xl font-semibold ${
            isRunning
              ? "bg-yellow-400 text-black hover:bg-yellow-500"
              : "bg-green-400 text-black hover:bg-green-500"
          }`}
        >
          {isRunning ? "Пауза" : "Старт"}
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(workDuration * 60);
            setCycle("work");
            setSelectedTask(null);
            localStorage.removeItem(storageKey);
          }}
          className="bg-gray-200 text-black px-4 py-2 rounded-xl hover:bg-gray-300"
        >
          Ресет
        </button>
      </div>

      <div className="flex justify-center space-x-2 mb-2">
        <button
          onClick={() => switchCycle("work")}
          className={`px-3 py-1 rounded-lg ${
            cycle === "work" ? "bg-white text-black" : "bg-gray-300 text-black"
          }`}
        >
          Фокус
        </button>
        <button
          onClick={() => switchCycle("break")}
          className={`px-3 py-1 rounded-lg ${
            cycle === "break" ? "bg-white text-black" : "bg-gray-300 text-black"
          }`}
        >
          Пауза
        </button>
      </div>

      {editMode ? (
        <div className="flex flex-col items-center space-y-2">
          <input
            type="number"
            className="w-20 px-2 py-1 rounded text-black text-center"
            value={tempWork}
            onChange={(e) => setTempWork(parseInt(e.target.value))}
          />
          <input
            type="number"
            className="w-20 px-2 py-1 rounded text-black text-center"
            value={tempBreak}
            onChange={(e) => setTempBreak(parseInt(e.target.value))}
          />
          <div className="flex space-x-2">
            <button
              onClick={saveEdit}
              className="px-3 py-1 rounded-lg bg-green-400 hover:bg-green-500"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-3 py-1 rounded-lg bg-red-400 hover:bg-red-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setEditMode(true)}
            className="px-3 py-1 rounded-lg bg-purple-400 hover:bg-purple-500"
          >
            Измени време
          </button>
        </div>
      )}

      {/* Task Selection Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Избери задача за фокус
            </h3>
            <ul className="max-h-60 overflow-y-auto">
              {tasks.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setSelectedTask(t);
                      setShowTaskModal(false);
                      setIsRunning(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-200 rounded mb-1"
                  >
                    {t.title}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowTaskModal(false)}
              className="mt-4 bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
