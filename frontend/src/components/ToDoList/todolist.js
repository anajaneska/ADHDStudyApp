import React, { useEffect, useState } from "react";
import instance from "../../custom-axios/axios";
import TaskItem from "./taskitem";
import TaskInput from "./taskinput";
import "./todolist.css";

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
      fetchTasks?.();
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

  const editTask = async (id, updatedData) => {
    try {
      const res = await instance.put(`/tasks/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error("Error editing task:", err);
    }
  };

  const filteredTasks = focusedTaskId
    ? tasks.filter((t) => t.id === focusedTaskId)
    : tasks;

  return (
    <div className="todo-container">
      <h2 className="todo-title">
        {focusedTaskId ? "Фокусирана задача" : "To-Do Листа"}
      </h2>

      {!focusedTaskId && (
        <TaskInput newTask={newTask} setNewTask={setNewTask} addTask={addTask} />
      )}

      <ul className="todo-list">
        {filteredTasks.length === 0 ? (
          <p className="no-tasks">Нема задачи.</p>
        ) : (
          filteredTasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              focusedTaskId={focusedTaskId}
              toggleComplete={toggleComplete}
              deleteTask={deleteTask}
              editTask={editTask}
            />
          ))
        )}
      </ul>
    </div>
  );
}
