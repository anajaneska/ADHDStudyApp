import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const PomodoroTimer = () => {
  const [username, setUsername] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycle, setCycle] = useState("work");
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

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

  // Pause on unload
  useEffect(() => {
    const handleUnload = () => {
      if (!username) return;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.isRunning = false;
        parsed.lastUpdate = Date.now();
        localStorage.setItem(storageKey, JSON.stringify(parsed));
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [username, storageKey]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (cycle === "work") {
        alert("Време е за пауза ☕");
        setCycle("break");
        setTimeLeft(5 * 60);
      } else {
        alert("Време е за работа 💪");
        setCycle("work");
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, cycle]);

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
      className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-2xl rounded-2xl p-6 w-72 select-none"
    >
      <h2 className="text-2xl font-bold mb-2 text-center">
        {cycle === "work" ? "Фокус време" : "Пауза"}
      </h2>
      <p className="text-5xl font-mono text-center mb-4 drop-shadow-lg">
        {formatTime(timeLeft)}
      </p>
      <div className="flex justify-center space-x-3">
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
            setTimeLeft(25 * 60);
            setCycle("work");
            localStorage.removeItem(storageKey);
          }}
          className="bg-gray-200 text-black px-4 py-2 rounded-xl hover:bg-gray-300"
        >
          Ресет
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
