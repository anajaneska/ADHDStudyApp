// src/components/focus/ToDoList.jsx
import React, { useEffect, useState } from "react";
import instance from "../../custom-axios/axios";
import dayjs from "dayjs";

export default function ToDoList({ fetchTasks, focusedTaskId }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    plannedStart: "",
  });

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  const loadTasks = async () => {
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
    loadTasks();
  }, [userId]);

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      await instance.post(`/tasks/${userId}`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewTask({ title: "", description: "", dueDate: "", plannedStart: "" });
      fetchTasks();
      loadTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const res = await instance.put(`/tasks/${id}/complete`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await instance.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const filteredTasks = focusedTaskId
    ? tasks.filter((t) => t.id === focusedTaskId)
    : tasks;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        {focusedTaskId ? "Фокусирана задача" : "To-Do Листа"}
      </h2>

      {!focusedTaskId && (
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Task title"
              className="border p-2 rounded flex-1"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
              type="datetime-local"
              className="border p-2 rounded"
              value={newTask.plannedStart}
              onChange={(e) =>
                setNewTask({ ...newTask, plannedStart: e.target.value })
              }
            />
          </div>
          <button
            onClick={addTask}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add Task
          </button>
        </div>
      )}

      <ul className="max-h-60 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-sm">No tasks found.</p>
        ) : (
          filteredTasks.map((t) => (
            <li key={t.id} className="border-b py-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleComplete(t.id)}
                  />
                  <span className={t.completed ? "line-through" : ""}>
                    {t.title}{" "}
                    {t.plannedStart &&
                      `(${dayjs(t.plannedStart).format("DD/MM HH:mm")})`}
                  </span>
                </div>
                {!focusedTaskId && (
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="bg-red-400 px-2 py-1 rounded hover:bg-red-500 text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
