import React, { useEffect, useState } from "react";
import instance from "../../custom-axios/axios";
import dayjs from "dayjs";

export default function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    plannedStart: ""
  });

  // ✅ Widget drag state
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

  // ✅ Get userId and token
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  // ✅ Fetch tasks
  const fetchTasks = async () => {
    if (!userId) return console.error("User ID not found in localStorage");
    try {
      const res = await instance.get(`/tasks/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  // ✅ Add task
  const addTask = async () => {
    if (!userId || !newTask.title.trim()) return;
    try {
      await instance.post(`/tasks/${userId}`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTask({ title: "", description: "", dueDate: "", plannedStart: "" });
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // ✅ Toggle complete
  const toggleComplete = async (id) => {
    try {
      const res = await instance.put(`/tasks/${id}/complete`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  // ✅ Delete task
  const deleteTask = async (id) => {
    try {
      await instance.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // ✅ Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const shiftX = e.clientX - position.x;
    const shiftY = e.clientY - position.y;

    const onMouseMove = (event) => {
      setPosition({
        x: event.clientX - shiftX,
        y: event.clientY - shiftY
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

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        zIndex: 1000,
        transition: isDragging ? "none" : "transform 0.2s ease"
      }}
      className="p-6 bg-white rounded-2xl shadow-2xl w-80 select-none"
    >
      <h2 className="text-xl font-bold mb-4 text-center">To-Do List</h2>

      <div className="mb-4 flex gap-2">
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
        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <ul>
        {tasks.length === 0 && (
          <p className="text-gray-500 text-sm">No tasks yet — add one!</p>
        )}
        {tasks.map((t) => (
          <li
            key={t.id}
            className="flex justify-between items-center border-b py-2"
          >
            <div>
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleComplete(t.id)}
              />
              <span className={t.completed ? "line-through ml-2" : "ml-2"}>
                {t.title}{" "}
                {t.plannedStart &&
                  `(${dayjs(t.plannedStart).format("DD/MM HH:mm")})`}
              </span>
            </div>
            <button
              onClick={() => deleteTask(t.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
