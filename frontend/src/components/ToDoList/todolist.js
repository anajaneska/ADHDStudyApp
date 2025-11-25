import React, { useEffect, useState } from "react";
import instance from "../../custom-axios/axios";
import TaskItem from "./taskitem";
import TaskInput from "./taskinput";
import "./todolist.css";

export default function ToDoList({ fetchTasks, focusedTaskId }) {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

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
      setShowAddModal(false);
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

  const estimateTime = async (taskId) => {
    try {
      const res = await instance.post(
        `/tasks/${taskId}/estimate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? res.data : t))
      );
    } catch (err) {
      console.error("Error estimating time:", err);
    }
  };

  const breakdownTask = async (taskId) => {
    try {
      const res = await instance.post(
        `/tasks/${taskId}/breakdown`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Error breaking down task:", err);
    }
  };

  const filteredTasks = focusedTaskId
    ? tasks.filter((t) => t.id === focusedTaskId)
    : tasks;

  return (
    <div className="todo-container">

      {/* --- TOP BAR --- */}
      {!focusedTaskId && (
        <div className="top-bar">
          <h3 className="todo-title">To-Do List</h3>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            + Add Task
          </button>
        </div>
      )}

      {/* --- ADD TASK MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add task</h3>

            <TaskInput
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
            />

            <button className="close-modal" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- TASK LIST --- */}
      <ul className="todo-list">
        {filteredTasks.length === 0 ? (
          <p className="no-tasks">No tasks.</p>
        ) : (
          filteredTasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              focusedTaskId={focusedTaskId}
              toggleComplete={toggleComplete}
              deleteTask={deleteTask}
              editTask={editTask}
              estimateTime={estimateTime}
              breakdownTask={breakdownTask}
            />
          ))
        )}
      </ul>
    </div>
  );
}
