import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const PomodoroTimer = ({ setFeatures }) => {
  const [username, setUsername] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycle, setCycle] = useState("work");
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [editMode, setEditMode] = useState(false);
  const [tempWork, setTempWork] = useState(workDuration);
  const [tempBreak, setTempBreak] = useState(breakDuration);

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

  // Drag functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const shiftX = e.clientX - position.x;
    const shiftY = e.clientY - position.y;

    const onMouseMove = (event) => {
      setPosition({
        x: event.clientX - shiftX,
        y: event.clientY - shiftY,
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  if (!username) return <p>Се вчитува...</p>;

  // Switch cycle manually
  const switchCycle = (newCycle) => {
    setCycle(newCycle);
    setTimeLeft(newCycle === "work" ? workDuration * 60 : breakDuration * 60);
    setIsRunning(false);
  };

  // Save edited durations
  const saveEdit = () => {
    if (tempWork > 0) setWorkDuration(tempWork);
    if (tempBreak > 0) setBreakDuration(tempBreak);
    switchCycle(cycle); // reset current cycle with new durations
    setEditMode(false);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        transition: isDragging ? "none" : "transform 0.2s ease",
        zIndex: 1000,
      }}
      className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-2xl rounded-2xl p-6 w-72 select-none relative"
    >
      {/* X button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setFeatures((prev) => ({ ...prev, pomodoro: false }));
        }}
        className="absolute top-2 right-2 text-red-400 font-bold text-lg hover:text-red-600"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold mb-2 text-center">
        {cycle === "work" ? "Фокус време" : "Пауза"}
      </h2>

      <p className="text-5xl font-mono text-center mb-4 drop-shadow-lg">{formatTime(timeLeft)}</p>

      <div className="flex justify-center space-x-3 mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsRunning(!isRunning);
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
          onClick={(e) => {
            e.stopPropagation();
            setIsRunning(false);
            setTimeLeft(workDuration * 60);
            setCycle("work");
            localStorage.removeItem(storageKey);
          }}
          className="bg-gray-200 text-black px-4 py-2 rounded-xl hover:bg-gray-300"
        >
          Ресет
        </button>
      </div>

      {/* Cycle switch */}
      <div className="flex justify-center space-x-2 mb-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            switchCycle("work");
          }}
          className={`px-3 py-1 rounded-lg ${
            cycle === "work" ? "bg-white text-black" : "bg-gray-300 text-black"
          }`}
        >
          Фокус
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            switchCycle("break");
          }}
          className={`px-3 py-1 rounded-lg ${
            cycle === "break" ? "bg-white text-black" : "bg-gray-300 text-black"
          }`}
        >
          Пауза
        </button>
      </div>

      {/* Edit durations form */}
      {editMode ? (
        <div className="flex flex-col items-center space-y-2">
          <input
            type="number"
            className="w-20 px-2 py-1 rounded text-black text-center"
            value={tempWork}
            onChange={(e) => setTempWork(parseInt(e.target.value))}
            placeholder="Work min"
          />
          <input
            type="number"
            className="w-20 px-2 py-1 rounded text-black text-center"
            value={tempBreak}
            onChange={(e) => setTempBreak(parseInt(e.target.value))}
            placeholder="Break min"
          />
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                saveEdit();
              }}
              className="px-3 py-1 rounded-lg bg-green-400 hover:bg-green-500"
            >
              Save
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditMode(false);
              }}
              className="px-3 py-1 rounded-lg bg-red-400 hover:bg-red-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditMode(true);
            }}
            className="px-3 py-1 rounded-lg bg-purple-400 hover:bg-purple-500"
          >
            Измени време
          </button>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
