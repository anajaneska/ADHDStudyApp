import React, { useEffect, useState } from "react";
import instance from "../../custom-axios/axios";
import TaskItem from "./taskitem";
import TaskInput from "./taskinput";
import "./todolist.css";
import TagPicker from "./tagpicker";

export default function ToDoList({ fetchTasks, focusedTaskId }) {
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

  const [filterTagIds, setFilterTagIds] = useState([]); // selected tags for filtering
  const [filterDate, setFilterDate] = useState("");     // start date filter

  const loadTasks = async () => {
    if (!userId) return;
    try {
      const res = await instance.get(`/tasks/${userId}`, {
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
      setNewTask({ title: "", description: "", dueDate: "", start: "", end: "",tagIds: [] });
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
      {
        ...updatedData,
        tagIds: updatedData.tagIds || []   // IMPORTANT!!!
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
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

  let filteredTasksArray = Array.isArray(tasks) ? tasks : [];

if (focusedTaskId) {
  filteredTasksArray = filteredTasksArray.filter(t => t.id === focusedTaskId);
}

// Filter by selected tags
if (filterTagIds.length > 0) {
  filteredTasksArray = filteredTasksArray.filter(t =>
    t.tags?.some(tag => filterTagIds.includes(tag.id))
  );
}

// Filter by start date
if (filterDate) {
  filteredTasksArray = filteredTasksArray.filter(t =>
    t.start && t.start.startsWith(filterDate)
  );
}


  return (
    <div className="todo-container">
      {!focusedTaskId && (
        <div className="top-bar">
          <h3 className="todo-title">To-Do Листа</h3>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Додади задача</button>
        </div>
      )}

<div className="filters-wrapper">

  <div className="filters-bar">
    {/* Tag Filter */}
    <div className="filter-group full-width">
      <label className="filter-label">Тагови</label>
      <TagPicker
        selectedTagIds={filterTagIds}
        onTagChange={setFilterTagIds}
        tags={tags}
      />
    </div>

    {/* Date Filter */}
    <div className="filter-group">
      <label className="filter-label">Датум</label>
      <input
        type="date"
        className="filter-input"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />
    </div>

    {/* Reset */}
    <button
      className="reset-btn"
      onClick={() => {
        setFilterTagIds([]);
        setFilterDate("");
      }}
    >
      Ресетирај филтри
    </button>
  </div>
</div>


      {showAddModal && (
  <div
    className="modal-overlay"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      className="modal-content"
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "500px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        position: "relative",
      }}
    >
      <h3>Додади задача</h3>
      <TaskInput
        newTask={newTask}
        setNewTask={setNewTask}
        addTask={addTask}
        tags={tags}
      />
      <div style={{ marginTop: "12px", textAlign: "right" }}>
        <button
          className="btn-secondary"
          onClick={() => setShowAddModal(false)}
        >
          Откажи
        </button>
      </div>
    </div>
  </div>
)}


      <ul className="todo-list">
  {filteredTasksArray.length === 0 ? (
    <p className="no-tasks">Нема задачи.</p>
  ) : (
    filteredTasksArray.map((t) => (
      <TaskItem
        key={t.id}
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
    ))
  )}
</ul>
    </div>
  );
}
