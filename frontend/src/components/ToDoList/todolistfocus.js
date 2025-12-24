import React, { useEffect, useState } from "react";
import instance from "../../custom-axios/axios";
import TaskItem from "./taskitem";
import TaskInput from "./taskinput";
import "./todolist.css";
import TagPicker from "./tagpicker";
import ModalPortal from "../common/modalportal.js";

export default function ToDoList({ focusedTaskId }) {
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    start: "",
    end: "",
    tagIds: [],
  });

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");
  const [filterTagIds, setFilterTagIds] = useState([]);

  const loadTasks = async () => {
    if (!userId) return;
    try {
      const res = await instance.get(`/tasks/today/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  const loadTags = async () => {
    try {
      const res = await instance.get(`/tags/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTags(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
    loadTags();
  }, [userId]);

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      await instance.post(`/tasks/${userId}`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewTask({ title: "", description: "", dueDate: "", start: "", end: "", tagIds: [] });
      setShowAddModal(false);
      await loadTasks();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const res = await instance.put(`/tasks/${id}/complete`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await instance.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const editTask = async (id, updatedData) => {
    try {
      const res = await instance.put(
        `/tasks/${id}`,
        { ...updatedData, tagIds: updatedData.tagIds || [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const addTagToTask = async (taskId, tagId) => {
    try {
      const res = await instance.post(`/tasks/${taskId}/tags/${tagId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const removeTagFromTask = async (taskId, tagId) => {
    try {
      const res = await instance.delete(`/tasks/${taskId}/tags/${tagId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const estimateTime = async (taskId) => {
    try {
      const res = await instance.post(`/tasks/${taskId}/estimate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Error estimating time:", err);
    }
  };

  const breakdownTask = async (taskId) => {
    try {
      const res = await instance.post(`/tasks/${taskId}/breakdown`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Error breaking down task:", err);
    }
  };

  // Filter tasks by focusedTaskId or selected tags
  let filteredTasksArray = Array.isArray(tasks) ? tasks : [];
  if (focusedTaskId) {
    filteredTasksArray = filteredTasksArray.filter((t) => t.id === focusedTaskId);
  }
  if (filterTagIds.length > 0) {
    filteredTasksArray = filteredTasksArray.filter((t) =>
      t.tags?.some((tag) => filterTagIds.includes(tag.id))
    );
  }

  // SORT TASKS: incomplete first, then by startDate + startTime
filteredTasksArray.sort((a, b) => {
  if (a.completedToday && !b.completedToday) return 1;
  if (!a.completedToday && b.completedToday) return -1;

  if (a.startDate && b.startDate) {
    const dateA = new Date(`${a.startDate}T${a.startTime || "00:00"}`);
    const dateB = new Date(`${b.startDate}T${b.startTime || "00:00"}`);
    return dateA - dateB;
  }
  if (a.startDate && !b.startDate) return -1;
  if (!a.startDate && b.startDate) return 1;

  return a.title.localeCompare(b.title);
});

return (
  <div className="container my-4 bg-white rounded-3 shadow p-4">
    {/* Top bar: title + add button */}
    {!focusedTaskId && (
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h3 className="text-purple mb-2 mb-md-0">Твоите задачи за денес</h3>
        <button className="btn btn-primary btn-purple" onClick={() => setShowAddModal(true)}>
          + Додади задача
        </button>
      </div>
    )}

    {/* Filters */}
    <div className="mb-3">
      {/* Toggle filter button */}
      <button
        className="btn btn-outline-secondary mb-2"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#filterCollapse"
        aria-expanded="false"
        aria-controls="filterCollapse"
      >
        Филтри
      </button>

      {/* Collapsible filters */}
      <div className="collapse" id="filterCollapse">
        <div className="card card-body p-2 shadow-sm">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-8">
              <label className="form-label">Тагови</label>
              <TagPicker selectedTagIds={filterTagIds} onTagChange={setFilterTagIds} tags={tags} />
            </div>
            <div className="col-12 col-md-4 text-md-end">
              <button className="btn btn-secondary w-100 w-md-auto" onClick={() => setFilterTagIds([])}>
                Ресетирај филтри
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Add Task Modal */}
{/* Add Task Popup */}
{showAddModal && (
  <ModalPortal onClose={() => setShowAddModal(false)}>
    <div className="modal-header border-0 p-0 mb-3">
      <h5 className="modal-title">Додади задача</h5>
      <button
        className="btn-close"
        onClick={() => setShowAddModal(false)}
      />
    </div>

    <TaskInput
      newTask={newTask}
      setNewTask={setNewTask}
      addTask={addTask}
      tags={tags}
      userId={userId}
    />
  </ModalPortal>
)}



    {/* Task list */}
    <div>
      <ul className="list-group list-group-flush">
        {filteredTasksArray.length === 0 ? (
          <li className="list-group-item text-center text-muted">Нема задачи.</li>
        ) : (
          filteredTasksArray.map((t) => (
            <li key={t.id} className="list-group-item p-2 mb-2">
              <TaskItem
                task={t}
                toggleComplete={toggleComplete}
                deleteTask={deleteTask}
                editTask={editTask}
                addTagToTask={addTagToTask}
                removeTagFromTask={removeTagFromTask}
                tags={tags}
                estimateTime={estimateTime}
                breakdownTask={breakdownTask}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  </div>
);



}
