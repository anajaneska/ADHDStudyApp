import React, { useState } from "react";
import dayjs from "dayjs";
import SubtaskItem from "./subtaskitem";
import { BsClock } from "react-icons/bs";
import { BiDownArrow, BiPencil, BiTrash } from "react-icons/bi";

export default function TaskItem({
  task,
  toggleComplete,
  deleteTask,
  editTask,
  estimateTime,
  breakdownTask,
  focusedTaskId,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || "",
    plannedStart: task.plannedStart
      ? dayjs(task.plannedStart).format("YYYY-MM-DDTHH:mm")
      : "",
    dueDate: task.dueDate ? dayjs(task.dueDate).format("YYYY-MM-DDTHH:mm") : "",
  });

  const handleSave = () => {
    editTask(task.id, editData);
    setIsEditing(false);
  };

  return (
    <li className={`task-item ${task.completed ? "completed" : ""}`}>

      {/* -------------------- EDIT MODE -------------------- */}
      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            value={editData.title}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
          />
          <textarea
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
          />

          <label>Start:</label>
          <input
            type="datetime-local"
            value={editData.plannedStart}
            onChange={(e) =>
              setEditData({ ...editData, plannedStart: e.target.value })
            }
          />

          <label>Due:</label>
          <input
            type="datetime-local"
            value={editData.dueDate}
            onChange={(e) =>
              setEditData({ ...editData, dueDate: e.target.value })
            }
          />

          <div className="edit-actions">
            <button className="save" onClick={handleSave}>Save</button>
            <button className="cancel" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (


        /* -------------------- DISPLAY MODE -------------------- */
        <div className="flex flex-col gap-2">

          {/* === FIRST ROW: checkbox + title + right-side buttons === */}
          <div className="flex items-start justify-between w-full">

            {/* LEFT: checkbox + title */}
            <div className="flex items-start gap-3 w-full pr-4">

              {!focusedTaskId && (
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  className="mt-1"
                />
              )}

              <h3 className="font-semibold break-words text-lg leading-tight">
                {task.title}
              </h3>
            </div>

            {/* RIGHT: action buttons */}
            {!focusedTaskId && (
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setIsEditing(true)}><BiPencil /></button>
                <button onClick={() => deleteTask(task.id)}><BiTrash /></button>
                <button onClick={() => estimateTime(task.id)}><BsClock /></button>
                <button onClick={() => breakdownTask(task.id)}><BiDownArrow /></button>
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          {task.description && (
            <p className="text-gray-700 text-sm">{task.description}</p>
          )}

          {/* ESTIMATE + DATES */}
          <div className="text-sm text-gray-600 flex flex-wrap gap-4">
            {task.estimatedMinutes != null && (
              <span className="flex items-center gap-1">
                <BsClock /> {task.estimatedMinutes} min
              </span>
            )}

            {task.plannedStart && (
              <span>Start: {dayjs(task.plannedStart).format("DD/MM HH:mm")}</span>
            )}

            {task.dueDate && (
              <span>Due: {dayjs(task.dueDate).format("DD/MM HH:mm")}</span>
            )}
          </div>

          {/* SUBTASK TOGGLE */}
          {task.subtasks?.length > 0 && (
            <button
              className="sutasks-toggle-btn mt-1"
              onClick={() => setShowSubtasks(!showSubtasks)}
            >
              {showSubtasks ? "Hide subtasks" : "Show subtasks V"}
            </button>
          )}
        </div>
      )}

      {/* SUBTASK LIST */}
      {showSubtasks && task.subtasks?.length > 0 && (
        <div className="subtask-list">
          {task.subtasks.map((st) => (
            <SubtaskItem
              key={st.id}
              subtask={st}
              reloadTask={() => breakdownTask(task.id)}
              token={localStorage.getItem("jwt")}
            />
          ))}
        </div>
      )}
    </li>
  );
}
