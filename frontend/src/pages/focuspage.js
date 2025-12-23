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
  <div className="min-h-screen flex justify-center items-start pt-32 px-8">
    <div className="flex flex-row justify-center items-start gap-12 max-w-[1400px] w-full">

      {/* Pomodoro */}
<div className="flex-1 max-w-[520px] min-h-[650px]">
  <div className="h-full">
    <PomodoroTimer
      tasks={tasks}
      selectedTask={selectedTask}
      setSelectedTask={setSelectedTask}
    />
  </div>
</div>

{/* To-Do */}
<div className="flex-1 max-w-[520px] min-h-[650px]">
  <div className="h-full">
    <ToDoList
      fetchTasks={fetchTasks}
      focusedTaskId={selectedTask?.id}
    />
  </div>
</div>

    </div>
  </div>
);
}
