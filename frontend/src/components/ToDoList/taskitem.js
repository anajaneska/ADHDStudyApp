import React, { useState } from "react";
import dayjs from "dayjs";
import SubtaskItem from "./subtaskitem";

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
          <label>
            Почеток:
            <input
              type="datetime-local"
              value={editData.plannedStart}
              onChange={(e) =>
                setEditData({ ...editData, plannedStart: e.target.value })
              }
            />
          </label>
          <label>
            Краен рок:
            <input
              type="datetime-local"
              value={editData.dueDate}
              onChange={(e) =>
                setEditData({ ...editData, dueDate: e.target.value })
              }
            />
          </label>
          <div className="edit-actions">
            <button className="save" onClick={handleSave}>💾 Зачувај</button>
            <button className="cancel" onClick={() => setIsEditing(false)}>Откажи</button>
          </div>
        </div>
      ) : (
        <div className="task-display">
          <div className="task-main">
            {!focusedTaskId && (
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id)}
              />
            )}
            <div className="task-texts">
              <h3>{task.title}</h3>
              {task.description && <p>{task.description}</p>}

              {task.estimatedMinutes != null && (
                <small>⏱️ Проценето време: {task.estimatedMinutes} минути</small>
              )}

              <small>
                {task.plannedStart &&
                  `Почеток: ${dayjs(task.plannedStart).format("DD/MM HH:mm")} `}
                {task.dueDate &&
                  `• Рок: ${dayjs(task.dueDate).format("DD/MM HH:mm")}`}
              </small>
            </div>
          </div>

          {!focusedTaskId && (
            <div className="task-actions">
              <button onClick={() => setIsEditing(true)}>✏️</button>
              <button onClick={() => deleteTask(task.id)}>🗑️</button>
              <button onClick={() => estimateTime(task.id)}>estimate</button>
              <button onClick={() => breakdownTask(task.id)}>breakdown</button>
            </div>
          )}

          {/* === SUBTASK SECTION === */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="subtask-list">
              <h4>Потзадачи:</h4>
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
        </div>
      )}
    </li>
  );
}
