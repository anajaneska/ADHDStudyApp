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
    <li className={`task-item ${task.completed ? "completed" : ""}`}>
      {isEditing ? (
        <div className="edit-form flex flex-col gap-2 p-2 border rounded">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="Наслов"
            className="border p-1 rounded"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Опис"
            className="border p-1 rounded"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="date"
              value={editData.startDate}
              onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
              className="border p-1 rounded"
            />
            <input
              type="time"
              value={editData.startTime}
              onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
              className="border p-1 rounded"
            />
            <input
              type="time"
              value={editData.endTime}
              onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
              className="border p-1 rounded"
            />
            <input
              type="date"
              value={editData.dueDate}
              onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
              className="border p-1 rounded"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <select
              value={editData.recurrenceType}
              onChange={(e) => setEditData({ ...editData, recurrenceType: e.target.value })}
              className="border p-1 rounded"
            >
              <option value="NONE">Нема</option>
              <option value="DAILY">Дневно</option>
              <option value="WEEKLY">Неделно</option>
              <option value="MONTHLY">Месечно</option>
            </select>
            <input
              type="number"
              min="1"
              value={editData.recurrenceInterval}
              onChange={(e) => setEditData({ ...editData, recurrenceInterval: e.target.value })}
              className="border p-1 rounded"
            />
            <input
              type="date"
              value={editData.recurrenceEnd}
              onChange={(e) => setEditData({ ...editData, recurrenceEnd: e.target.value })}
              className="border p-1 rounded md:col-span-2"
            />
          </div>
          <TagPicker
            selectedTagIds={editData.tagIds}
            onTagChange={(newTagIds) => setEditData({ ...editData, tagIds: newTagIds })}
            tags={tags}
          />
          <div className="flex gap-2 mt-2">
            <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={handleSave}>
              Зачувај
            </button>
            <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => setIsEditing(false)}>
              Откажи
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!focusedTaskId && (
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                />
              )}
              <h3 className="font-semibold">{task.title}</h3>
            </div>
            {!focusedTaskId && (
              <div className="flex gap-1">
                <button onClick={() => setIsEditing(true)}><BiPencil /></button>
                <button onClick={() => deleteTask(task.id)}><BiTrash /></button>
                <button onClick={() => estimateTime(task.id)}><BsClock /></button>
                <button onClick={() => breakdownTask(task.id)}><BiDownArrow /></button>
              </div>
            )}
          </div>
          {task.description && <p className="text-gray-700 text-sm">{task.description}</p>}

          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {task.tags.map(tag => (
                <span
                  key={tag.id}
                  style={{ backgroundColor: tag.color }}
                  className="px-2 py-0.5 rounded-full text-white text-xs"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="text-sm text-gray-600 flex flex-wrap gap-2">
            {task.estimatedMinutes != null && (
              <span className="flex items-center gap-1"><BsClock /> {task.estimatedMinutes} min</span>
            )}
            {task.startDate && <span>Почеток: {task.startDate} {task.startTime || ""}</span>}
            {task.endTime && <span>Крај: {task.endTime}</span>}
            {task.dueDate && <span>Рок: {task.dueDate}</span>}
            {task.recurrenceType && task.recurrenceType !== "NONE" && (
              <span>Повторување: {task.recurrenceType} (секои {task.recurrenceInterval})</span>
            )}
          </div>

          {task.subtasks?.length > 0 && (
            <button
              className="subtasks-toggle-btn mt-1 flex items-center gap-1 text-sm"
              onClick={() => setShowSubtasks(!showSubtasks)}
            >
              {showSubtasks ? "Сокривај подзадачи" : "Прикажи подзадачи"} ▼
            </button>
          )}
        </div>
      )}

      {showSubtasks && task.subtasks?.length > 0 && (
        <div className="subtask-list pl-4 mt-1">
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
