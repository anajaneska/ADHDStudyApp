import React, { useEffect, useState } from "react";
import PomodoroTimer from "../components/Pomodoro/pomodoro";
import ToDoList from "../components/ToDoList/todolist";
import CalendarView from "../components/Calendar/calendar";
import NotePad from "../components/Notes/notepad";
import instance from "../custom-axios/axios";
import { jwtDecode } from "jwt-decode";
import FeatureMenu from "../components/Menu/menu";
import Summarizer from "../components/AI/Summarizer/summarizer";
import FileSummarizer from "../components/AI/FileSummarizer/filesummarizer";

const HomePage = () => {
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [features, setFeatures] = useState({
    todo: false,
    calendar: false,
    notes: false,
    pomodoro: false,
  });

  // Decode JWT to get user info
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.sub || decoded.username || "guest");
        setUserId(decoded.id);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  // Fetch tasks once we have userId
  useEffect(() => {
    if (!userId) return;
    instance
      .get(`/tasks/${userId}`)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Error loading tasks:", err));
  }, [userId]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <FeatureMenu features={features} setFeatures={setFeatures} />

      <main className="flex flex-col items-center justify-center min-h-screen p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Welcome back, {username || "корисник"} 👋
        </h1>

        <div className="mt-8 w-full flex flex-col items-center space-y-6">
          {features.pomodoro && (
            <PomodoroTimer setFeatures={setFeatures} />
          )}
          {features.todo && (
            <ToDoList userId={userId} setFeatures={setFeatures} />
          )}
          {features.calendar && (
            <CalendarView tasks={tasks} setFeatures={setFeatures} />
          )}
          {features.notes && (
            <NotePad userId={userId} setFeatures={setFeatures} />
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
