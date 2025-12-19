import React from "react";
import TagPicker from "./tagpicker";

export default function TaskInput({ newTask, setNewTask, addTask, tags, userId }) {

  const handleTagChange = (tagIds) => {
    setNewTask({ ...newTask, tagIds });
  };

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto flex flex-col gap-4 p-4 bg-white shadow-lg rounded-lg">

      {/* TITLE */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Наслов</label>
        <input
          type="text"
          placeholder="Наслов на задача"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="border rounded p-2 focus:ring focus:ring-blue-200"
        />
      </div>

      {/* DESCRIPTION */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Опис</label>
        <textarea
          placeholder="Опис на задача"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="border rounded p-2 h-24 resize-none focus:ring focus:ring-blue-200"
        />
      </div>

      {/* DATES & TIMES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="flex flex-col">
          <label className="font-semibold mb-1">Датум на почеток</label>
          <input
            type="date"
            value={newTask.startDate}
            onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
            className="border rounded p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1">Време на почеток</label>
          <input
            type="time"
            value={newTask.startTime}
            onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
            className="border rounded p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1">Време на крај</label>
          <input
            type="time"
            value={newTask.endTime}
            onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
            className="border rounded p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1">Рок</label>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="border rounded p-2 focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      {/* RECURRENCE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Тип на повторување</label>
          <select
            value={newTask.recurrenceType || "NONE"}
            onChange={(e) => setNewTask({ ...newTask, recurrenceType: e.target.value })}
            className="border rounded p-2 focus:ring focus:ring-blue-200"
          >
            <option value="NONE">Нема</option>
            <option value="DAILY">Дневно</option>
            <option value="WEEKLY">Неделно</option>
            <option value="MONTHLY">Месечно</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1">Интервал на повторување</label>
          <input
            type="number"
            min="1"
            value={newTask.recurrenceInterval || 1}
            onChange={(e) => setNewTask({ ...newTask, recurrenceInterval: e.target.value })}
            className="border rounded p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1">Крај на повторување</label>
          <input
            type="date"
            value={newTask.recurrenceEnd || ""}
            onChange={(e) => setNewTask({ ...newTask, recurrenceEnd: e.target.value })}
            className="border rounded p-2 focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      {/* TAG PICKER */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Тагови</label>
        <TagPicker
          userId={userId}
          selectedTagIds={newTask.tagIds}
          onTagChange={handleTagChange}
          tags={tags}
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={addTask}
        className="mt-2 text-white py-2 rounded transition"
        style={{ backgroundColor: "rgba(139, 127, 199, 1)" }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(120, 110, 175, 1)")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "rgba(139, 127, 199, 1)")}
      >
        Додади задача
      </button>
    </div>
  );
}
