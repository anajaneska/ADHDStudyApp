import React, { useState, useEffect } from "react";
import PomodoroDisplay from "./pomodorodisplay";
import PomodoroControls from "./pomodorocontrols";
import PomodoroSettings from "./pomodorosettings";
import TaskModal from "./taskmodal";
import { FaCog } from "react-icons/fa";
import "./pomodoro.css";
import instance from "../../custom-axios/axios";
import useSound from "use-sound";
import ding from "../../assets/sounds/ding.mp3";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function PomodoroTimer({ tasks, selectedTask, setSelectedTask }) {
  const token = localStorage.getItem("jwt");
  const userId = localStorage.getItem("userId");

  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [cycle, setCycle] = useState("work");
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [editMode, setEditMode] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [playDing] = useSound(ding, { volume: 0.7 });

  const storageKey = `pomodoro_${userId}`;

  useEffect(() => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}, []);

  //Load Pomodoro settings from backend
  useEffect(() => {
    if (!userId || settingsLoaded) return;

    const loadSettings = async () => {
      setLoadingSettings(true);
      try {
        const res = await instance.get(`/pomodoro/settings/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWorkDuration(res.data.focusDuration);
        setBreakDuration(res.data.breakDuration);
        setTimeLeft(res.data.focusDuration * 60);
        setSettingsLoaded(true);
      } catch (err) {
        console.error("Failed to load pomodoro settings:", err);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, [userId, token, settingsLoaded]);


  //Load saved localStorage state
  useEffect(() => {
    if (!userId) return;

    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setTimeLeft(workDuration * 60);
      return;
    }

    const { timeLeft: savedTime, isRunning: savedRunning, cycle: savedCycle, lastUpdate, date } = JSON.parse(saved);
    const today = new Date().toDateString();

    if (date !== today) {
      localStorage.removeItem(storageKey);
      setTimeLeft(workDuration * 60);
      return;
    }

    const now = Date.now();
    const elapsed = Math.floor((now - lastUpdate) / 1000);
    const newTime = savedRunning ? Math.max(savedTime - elapsed, 0) : savedTime;

    setTimeLeft(newTime);
    setIsRunning(savedRunning);
    setCycle(savedCycle);
  }, [userId]);


   //Save state to localStorage
  useEffect(() => {
    if (!userId) return;

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
  }, [timeLeft, isRunning, cycle, userId]);

  //Timer logic
  useEffect(() => {
    if (timeLeft === null || !isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playDing();

if (Notification.permission === "granted") {
  new Notification(
    cycle === "work" ? "Време за пауза ☕" : "Време за работа 💪",
    {
      body:
        cycle === "work"
          ? "Направи кратка пауза"
          : "Ајде назад на фокус 💪",
    }
  );
}

if (cycle === "work") {
  setCycle("break");
  setTimeLeft(breakDuration * 60);
  setSelectedTask(null);
} else {
  setCycle("work");
  setTimeLeft(workDuration * 60);
}

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, cycle, workDuration, breakDuration, setSelectedTask]);

  /** ------------------------------ */
  const resetTimer = () => {
    setIsRunning(false);
    setCycle("work");
    setTimeLeft(workDuration * 60);
    setSelectedTask(null);
    localStorage.removeItem(storageKey);
  };

  const switchCycle = (newCycle) => {
    setCycle(newCycle);
    setTimeLeft(newCycle === "work" ? workDuration * 60 : breakDuration * 60);
    setIsRunning(false);
  };

  if (loadingSettings) return <div className="loading">Loading settings...</div>;

  return (
<div className="container my-4">
  <div className="shadow-lg rounded-4 p-4 bg-white" style={{ minHeight: "450px" }}>
    {/* Header: title + gear */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="text-purple">Помодоро тајмер</h2>
      <div className="settings-gear" onClick={() => setEditMode(true)}>
        <FaCog size={24} className="text-secondary" />
      </div>
    </div>

    {/* Cycle switch buttons */}
    <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
      <button
        className={`btn ${cycle === "work" ? "btn-purple" : "btn-outline-purple"}`}
        onClick={() => switchCycle("work")}
      >
        Фокус ({workDuration}мин)
      </button>
      <button
        className={`btn ${cycle === "break" ? "btn-purple" : "btn-outline-purple"}`}
        onClick={() => switchCycle("break")}
      >
        Пауза ({breakDuration}мин)
      </button>
    </div>

    {/* Timer display */}
    <PomodoroDisplay 
      cycle={cycle} 
      timeLeft={timeLeft} 
      selectedTask={selectedTask} 
    />

    <PomodoroControls
      isRunning={isRunning}
      setIsRunning={setIsRunning}
      resetTimer={resetTimer}
      cycle={cycle}
      selectedTask={selectedTask}
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
      cycle={cycle}
      setTimeLeft={setTimeLeft}
    />

    {/* Task modal */}
    {showTaskModal && cycle === "work" && (
      <TaskModal
        tasks={tasks}
        setShowTaskModal={setShowTaskModal}
        setSelectedTask={(task) => {
          setSelectedTask(task);
          setShowTaskModal(false);
          setIsRunning(true);
        }}
        setIsRunning={setIsRunning}
      />
    )}
  </div>
</div>

  );
}
