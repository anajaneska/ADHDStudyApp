import React, { useEffect, useState } from "react"; 
import instance from "../../custom-axios/axios";
import TaskItem from "./taskitem";
import TaskInput from "./taskinput";
import "./todolist.css";
import TagPicker from "./tagpicker";

export default function OrganizationToDoList({ focusedTaskId }) {
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
      const res = await instance.get(`/tasks/organization/${userId}`, {
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

  return (
    <div className="todo-container">
      {!focusedTaskId && (
        <div className="top-bar">
          <h3 className="todo-title">Организација - Сите Задачи</h3>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Додади задача</button>
        </div>
      )}

      <div className="filters-wrapper">
        <div className="filters-bar">
          <div className="filter-group full-width">
            <label className="filter-label">Тагови</label>
            <TagPicker selectedTagIds={filterTagIds} onTagChange={setFilterTagIds} tags={tags} />
          </div>
          <button className="reset-btn" onClick={() => setFilterTagIds([])}>Ресетирај филтри</button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 flex justify-center items-start pt-10 bg-black/40 z-50 overflow-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Додади задача</h3>
            <TaskInput
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
              tags={tags}
              userId={userId}
            />
            <div className="mt-4 text-right">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
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
