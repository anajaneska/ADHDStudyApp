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

  const isCompleted = task.completedToday === true;
  
  const recurrenceLabels = {
  NONE: "Нема",
  DAILY: "Дневно",
  WEEKLY: "Неделно",
  MONTHLY: "Месечно",
};

  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || "",
    startDate: task.startDate || "",
    startTime: task.startTime || "",
    endTime: task.endTime || "",
    dueDate: task.dueDate || "",
    recurrenceType: task.recurrenceType || "NONE",
    recurrenceInterval: task.recurrenceInterval || 1,
    recurrenceEnd: task.recurrenceEnd || "",
    tagIds: task.tags?.map(t => t.id) || []
  });

  const handleSave = () => {
    editTask(task.id, { ...editData, tagIds: editData.tagIds });
    setIsEditing(false);
  };
return (
  <li
    className={`list-group-item ${isCompleted ? "list-group-item-success" : ""} shadow-sm rounded mb-2`}
  >
    {isEditing ? (
      <div className="p-3">
        {/* Title & Description */}
        <div className="mb-3">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="Наслов"
            className="form-control mb-2"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Опис"
            className="form-control"
          />
        </div>

        {/* Dates & Times */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <input
              type="date"
              value={editData.startDate}
              onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
              className="form-control"
            />
          </div>
          <div className="col-6">
            <input
              type="time"
              value={editData.startTime}
              onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
              className="form-control"
            />
          </div>
          <div className="col-6">
            <input
              type="time"
              value={editData.endTime}
              onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
              className="form-control"
            />
          </div>
          <div className="col-6">
            <input
              type="date"
              value={editData.dueDate}
              onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
              className="form-control"
            />
          </div>
        </div>

        {/* Recurrence */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <select
              value={editData.recurrenceType}
              onChange={(e) => setEditData({ ...editData, recurrenceType: e.target.value })}
              className="form-select"
            >
              <option value="NONE">Нема</option>
              <option value="DAILY">Дневно</option>
              <option value="WEEKLY">Неделно</option>
              <option value="MONTHLY">Месечно</option>
            </select>
          </div>
          <div className="col-6">
            <input
              type="number"
              min="1"
              value={editData.recurrenceInterval}
              onChange={(e) => setEditData({ ...editData, recurrenceInterval: e.target.value })}
              className="form-control"
            />
          </div>
          <div className="col-12">
            <input
              type="date"
              value={editData.recurrenceEnd}
              onChange={(e) => setEditData({ ...editData, recurrenceEnd: e.target.value })}
              className="form-control"
            />
          </div>
        </div>

        {/* Tag Picker */}
        <div className="mb-3">
          <TagPicker
            selectedTagIds={editData.tagIds}
            onTagChange={(newTagIds) => setEditData({ ...editData, tagIds: newTagIds })}
            tags={tags}
          />
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-success" onClick={handleSave}>
            Зачувај
          </button>
          <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
            Откажи
          </button>
        </div>
      </div>
    ) : (
      <div className="p-3">
        {/* Task header */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <div className="d-flex align-items-center gap-2">
            {!focusedTaskId && (
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => toggleComplete(task.id)}
                className="form-check-input"
              />
            )}
            <h5 className="mb-0">{task.title}</h5>
          </div>
          {!focusedTaskId && (
            <div className="btn-group">
              <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(true)}>
                <BiPencil />
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTask(task.id)}>
                <BiTrash />
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => estimateTime(task.id)}>
                <BsClock />
              </button>
              <button className="btn btn-sm btn-outline-info" onClick={() => breakdownTask(task.id)}>
                <BiDownArrow />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        {task.description && <p className="text-muted">{task.description}</p>}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-1">
            {task.tags.map((tag) => (
              <span
                key={tag.id}
                className="badge text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Task meta */}
        <div className="text-muted small d-flex flex-wrap gap-2 mb-1">
          {task.estimatedMinutes != null && (
            <span className="d-flex align-items-center gap-1">
              <BsClock /> {task.estimatedMinutes} min
            </span>
          )}
          {task.startDate && <span>Почеток: {task.startDate} {task.startTime || ""}</span>}
          {task.endTime && <span>Крај: {task.endTime}</span>}
          {task.dueDate && <span>Рок: {task.dueDate}</span>}
          {task.recurrenceType && task.recurrenceType !== "NONE" && (
            <span>
              Повторување: {recurrenceLabels[task.recurrenceType]} (секои {task.recurrenceInterval})
            </span>
          )}
        </div>

        {/* Subtasks toggle */}
        {task.subtasks?.length > 0 && (
          <button
            className="btn btn-sm  p-0"
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            {showSubtasks ? "Сокривај подзадачи" : "Прикажи подзадачи"} ▼
          </button>
        )}

        {/* Subtasks */}
        {showSubtasks && task.subtasks?.length > 0 && (
          <div className="ps-3 mt-2">
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
