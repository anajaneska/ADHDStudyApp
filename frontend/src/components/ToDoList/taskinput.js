import React from "react";
import TagPicker from "./tagpicker";
import "./todolist.css";

export default function TaskInput({
  newTask,
  setNewTask,
  addTask,
  tags,
  userId,
}) {
  const handleChange = (field, value) =>
    setNewTask({ ...newTask, [field]: value });

  return (
    <div className="task-input bg-white rounded-4 shadow-lg p-3 w-100">
      
      {/* ROW 1: TITLE + DESCRIPTION */}
      <div className="row g-2">
        <div className="col-6">
          <label className="form-label">Наслов</label>
          <input
            className="form-control"
            value={newTask.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>
        <div className="col-6">
          <label className="form-label">Опис</label>
          <textarea
            rows="1"
            className="form-control"
            value={newTask.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>
      </div>

      {/* ROW 2: START DATE + START TIME + END TIME */}
      <div className="row g-2">
        <div className="col-4">
          <label className="form-label">Почеток датум</label>
          <input
            type="date"
            className="form-control"
            value={newTask.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
        </div>
        <div className="col-4">
          <label className="form-label">Од</label>
          <input
            type="time"
            className="form-control"
            value={newTask.startTime}
            onChange={(e) => handleChange("startTime", e.target.value)}
          />
        </div>
        <div className="col-4">
          <label className="form-label">До</label>
          <input
            type="time"
            className="form-control"
            value={newTask.endTime}
            onChange={(e) => handleChange("endTime", e.target.value)}
          />
        </div>
      </div>

      {/* ROW 3: DUE DATE + PRIORITY + STATUS */}
      <div className="row g-2">
        <div className="col-4">
          <label className="form-label">Рок</label>
          <input
            type="date"
            className="form-control"
            value={newTask.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
          />
        </div>



      </div>

      {/* ROW 4: RECURRENCE (ALL SHOWN) */}
      <div className="row g-2">
        <div className="col-4">
          <label className="form-label">Повторување</label>
          <select
            className="form-select"
            value={newTask.recurrenceType}
            onChange={(e) => handleChange("recurrenceType", e.target.value)}
          >
            <option value="NONE">Нема</option>
            <option value="DAILY">Дневно</option>
            <option value="WEEKLY">Неделно</option>
            <option value="MONTHLY">Месечно</option>
          </select>
        </div>

        <div className="col-4">
          <label className="form-label">Интервал</label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={newTask.recurrenceInterval}
            onChange={(e) =>
              handleChange("recurrenceInterval", e.target.value)
            }
          />
        </div>

        <div className="col-4">
          <label className="form-label">Крај датум</label>
          <input
            type="date"
            className="form-control"
            value={newTask.recurrenceEnd}
            onChange={(e) =>
              handleChange("recurrenceEnd", e.target.value)
            }
          />
        </div>
      </div>

      {/* ROW 5: TAGS */}
      <div className="row g-2">
        <div className="col-12">
          <label className="form-label">Тагови</label>
          <TagPicker
            userId={userId}
            selectedTagIds={newTask.tagIds}
            onTagChange={(tagIds) =>
              handleChange("tagIds", tagIds)
            }
            tags={tags}
          />
        </div>
      </div>

      {/* ACTION */}
      <div className="mt-2 d-grid">
        <button
          onClick={addTask}
          className="btn text-white"
          style={{ backgroundColor: "#8b7fc7" }}
        >
          Додади задача
        </button>
      </div>
    </div>
  );
}
