import React, { useState } from "react";
import dayjs from "dayjs";
import SubtaskItem from "./subtaskitem";
import { BsClock } from "react-icons/bs";
import { BiDownArrow, BiPencil, BiTrash } from "react-icons/bi";
import TagPicker from "./tagpicker";

export default function TaskItem({
  task,
  toggleComplete,
  deleteTask,
  editTask,
  estimateTime,
  breakdownTask,
  focusedTaskId,
  tags
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

const [editData, setEditData] = useState({
  title: task.title,
  description: task.description || "",
  start: task.start
    ? dayjs(task.start).format("YYYY-MM-DDTHH:mm")
    : "",
    end: task.end
    ? dayjs(task.end).format("YYYY-MM-DDTHH:mm")
    : "",
  dueDate: task.dueDate ? dayjs(task.dueDate).format("YYYY-MM-DDTHH:mm") : "",
  tagIds: task.tags?.map(t => t.id) || []   // <-- use optional chaining + fallback
});

const handleSave = () => {
  editTask(task.id, {
    ...editData,
    tagIds: editData.tagIds   // make sure we send tagIds to backend
  });
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
            value={editData.start}
            onChange={(e) =>
              setEditData({ ...editData, start: e.target.value })
            }
          />

          <label>End:</label>
          <input
            type="datetime-local"
            value={editData.end}
            onChange={(e) =>
              setEditData({ ...editData, end: e.target.value })
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

          <TagPicker
              selectedTagIds={editData.tagIds}   // ✅ use tagIds
              onTagChange={(newTagIds) =>
                setEditData({ ...editData, tagIds: newTagIds })   // ✅ update tagIds
              }
              tags={tags}  // pass all available tags
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

          {/* TAGS DISPLAY */}
          {/* TAGS DISPLAY */}
{task.tags?.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-1">
    {task.tags.map(tag => (
      <span
        key={tag.id}
        style={{ backgroundColor: tag.color }}
        className="px-2 py-1 rounded-full text-white text-xs"
      >
        {tag.name}
      </span>
    ))}
  </div>
)}




          {/* ESTIMATE + DATES */}
          <div className="text-sm text-gray-600 flex flex-wrap gap-4">
            {task.estimatedMinutes != null && (
              <span className="flex items-center gap-1">
                <BsClock /> {task.estimatedMinutes} min
              </span>
            )}

            {task.start && (
              <span>Start: {dayjs(task.start).format("DD/MM HH:mm")}</span>
            )}

            {task.end && (
              <span>End: {dayjs(task.end).format("DD/MM HH:mm")}</span>
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
