import React, { useEffect, useState } from "react";
import PomodoroTimer from "../components/Pomodoro/pomodoro";
import ToDoList from "../components/ToDoList/todolist";
import CalendarView from "../components/Calendar/calendar";
import instance from "../custom-axios/axios";
import { jwtDecode } from "jwt-decode";
import Notes from "../components/Notes/notes";

const HomePage = () => {
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

  // ✅ Decode JWT to get user info
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.sub || decoded.username || "guest");
        setUserId(decoded.id); // make sure your JWT contains the numeric userId
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  // ✅ Fetch tasks once we have userId
  useEffect(() => {
    if (!userId) return;

    instance
      .get(`/tasks/${userId}`)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Error loading tasks:", err));
  }, [userId]);

 // if (!username || !userId) return <p>Се вчитува...</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <main>
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <h1 className="text-3xl font-bold mb-6">Добредојде назад, {username} 👋</h1>
          <PomodoroTimer />
          <ToDoList userId={userId} /> {/* pass userId instead of username */}
          <CalendarView tasks={tasks} />
          <Notes userId={userId} />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
