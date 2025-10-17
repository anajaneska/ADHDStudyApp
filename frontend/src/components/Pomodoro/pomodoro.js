import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const PomodoroTimer = () => {
  const [username, setUsername] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycle, setCycle] = useState("work");

  // 🔹 Декодирање на JWT токенот
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

  // 🔹 Клуч по корисник
  const storageKey = `pomodoro_${username}`;

  // 🔹 Вчитување состојба при refresh
  useEffect(() => {
    if (!username) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const { timeLeft, isRunning, cycle, lastUpdate, date } = JSON.parse(saved);
      const today = new Date().toDateString();

      // ако е нов ден — ресетирај
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

  // 🔹 Зачувување при секоја промена
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

  // 🔹 Паузирај при гасење/refresh
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

  // 🔹 Логика на тајмерот
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

  if (!username) return <p>Се вчитува...</p>;

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-md w-80">
      <h2 className="text-xl font-semibold mb-2">
        {cycle === "work" ? "Фокус време" : "Пауза"}
      </h2>
      <p className="text-4xl font-mono mb-4">{formatTime(timeLeft)}</p>
      <div className="flex space-x-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl"
        >
          {isRunning ? "Пауза" : "Старт"}
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(25 * 60);
            setCycle("work");
            localStorage.removeItem(storageKey);
          }}
          className="bg-gray-300 px-4 py-2 rounded-xl"
        >
          Ресет
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
