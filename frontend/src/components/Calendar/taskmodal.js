import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import instance from "../../custom-axios/axios";
import TaskInput from "../ToDoList/taskinput"; // adjust path if needed
import "./calendar.css";

export default function TaskModal({ onClose, task, selectedSlot, refresh }) {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwt");

  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    dueDate: "",
    tagIds: [],
  });

  // fill form when modal opens or task/slot changes
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        start: task.start
          ? dayjs(task.start).format("YYYY-MM-DDTHH:mm")
          : selectedSlot?.start
          ? dayjs(selectedSlot.start).format("YYYY-MM-DDTHH:mm")
          : "",
        // If backend has end, use it. Otherwise, if we have selected slot end use it; else blank (we will default on submit)
        end: task.end
          ? dayjs(task.end).format("YYYY-MM-DDTHH:mm")
          : selectedSlot?.end
          ? dayjs(selectedSlot.end).format("YYYY-MM-DDTHH:mm")
          : "",
        dueDate: task.dueDate
          ? dayjs(task.dueDate).format("YYYY-MM-DDTHH:mm")
          : selectedSlot?.end
          ? dayjs(selectedSlot.end).format("YYYY-MM-DDTHH:mm")
          : "",
        tagIds: task.tags?.map((t) => t.id) || [],
      });
    } else {
      // create mode: initialize from selectedSlot if present
      setForm({
        title: "",
        description: "",
        start: selectedSlot?.start
          ? dayjs(selectedSlot.start).format("YYYY-MM-DDTHH:mm")
          : "",
        // default end to start (we will set +1h before sending if empty)
        end: selectedSlot?.end
          ? dayjs(selectedSlot.end).format("YYYY-MM-DDTHH:mm")
          : "",
        dueDate: selectedSlot?.end
          ? dayjs(selectedSlot.end).format("YYYY-MM-DDTHH:mm")
          : "",
        tagIds: [],
      });
    }
  }, [task, selectedSlot]);

  // apply frontend default: if start exists and end missing => end = start + 1 hour
  const ensureEndDefaults = (payload) => {
    if (payload.start && !payload.end) {
      payload.end = dayjs(payload.start).add(1, "hour").toISOString();
    }
    return payload;
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;

    let payload = {
      title: form.title,
      description: form.description,
      start: form.start ? dayjs(form.start).toISOString() : null,
      end: form.end ? dayjs(form.end).toISOString() : null,
      dueDate: form.dueDate ? dayjs(form.dueDate).toISOString() : null,
      tagIds: form.tagIds || [],
    };

    payload = ensureEndDefaults(payload);

    try {
      await instance.post(`/tasks/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refresh();
      onClose();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleUpdate = async () => {
    if (!task) return;

    let payload = {
      title: form.title,
      description: form.description,
      start: form.start ? dayjs(form.start).toISOString() : null,
      end: form.end ? dayjs(form.end).toISOString() : null,
      dueDate: form.dueDate ? dayjs(form.dueDate).toISOString() : null,
      tagIds: form.tagIds || [],
    };

    payload = ensureEndDefaults(payload);

    try {
      await instance.put(`/tasks/${task.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refresh();
      onClose();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await instance.delete(`/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refresh();
      onClose();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <div className="modal-overlay" style={modalOverlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <h3>{task ? "Edit task" : "Create task"}</h3>

        {/* reuse your TaskInput UI — it expects newTask, setNewTask, addTask */}
        <TaskInput
          newTask={form}
          setNewTask={setForm}
          addTask={task ? handleUpdate : handleCreate}
          tags={[]} /* TaskInput/TagPicker fetches tags by userId */
          userId={userId}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {task ? (
            <>
              <button onClick={handleUpdate} className="btn-primary">
                Save
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
            </>
          ) : (
            <button onClick={handleCreate} className="btn-primary">
              Create
            </button>
          )}
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// minimal inline styles (you can move to CSS)
const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalContentStyle = {
  width: 720,
  maxWidth: "95%",
  background: "white",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
};
