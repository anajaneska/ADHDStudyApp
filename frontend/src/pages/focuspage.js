// src/pages/FocusPage.jsx
import React, { useState, useEffect } from "react";
import PomodoroTimer from "../components/Pomodoro/pomodoro.js";
import ToDoList from "../components/ToDoList/todolist.js";
import instance from "../custom-axios/axios";

export default function FocusPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const token = localStorage.getItem("jwt");
  const userId = localStorage.getItem("userId");

  const fetchTasks = async () => {
    if (!userId) return;
    try {
      const res = await instance.get(`/tasks/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Focus Mode</h1>
      <div className="flex flex-col items-center space-y-8 w-full max-w-3xl">
        <PomodoroTimer
          tasks={tasks}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
        />
        <ToDoList
          fetchTasks={fetchTasks}
          focusedTaskId={selectedTask?.id}
        />
      </div>
    </div>
  );
}
