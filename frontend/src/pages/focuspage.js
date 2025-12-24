import React, { useState, useEffect } from "react";
import PomodoroTimer from "../components/Pomodoro/pomodoro.js";
import ToDoList from "../components/ToDoList/todolistfocus.js";
import instance from "../custom-axios/axios";

export default function FocusPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const token = localStorage.getItem("jwt");
  const userId = localStorage.getItem("userId");

  const fetchTasks = async () => {
    if (!userId) return;
    try {
      const res = await instance.get(`/tasks/today/${userId}`, {
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
<div className="container-fluid pt-5 px-3">
  <div className="row justify-content-center g-4" style={{ maxWidth: "1400px", margin: "0 auto" }}>
    
    {/* Pomodoro - left column */}
    <div className="col-12 col-md-6 col-lg-5">
      <PomodoroTimer
        tasks={tasks}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
      />
    </div>

    {/* To-Do - right column */}
    <div className="col-12 col-md-6 col-lg-5">
      <ToDoList
        fetchTasks={fetchTasks}
        focusedTaskId={selectedTask?.id}
      />
    </div>

  </div>
</div>

);
}
