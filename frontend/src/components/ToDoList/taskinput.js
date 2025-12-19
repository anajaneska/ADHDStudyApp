import React from "react";
import TagPicker from "./tagpicker";

export default function TaskInput({ newTask, setNewTask, addTask, tags, userId }) {
  const handleTagChange = (tagIds) => {
    setNewTask({ ...newTask, tagIds });
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 bg-white shadow rounded-lg">

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

      {/* DATES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Почеток</label>
          <input
            type="datetime-local"
            value={newTask.start}
            onChange={(e) => setNewTask({ ...newTask, start: e.target.value })}
            className="border rounded p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1">Крај</label>
          <input
            type="datetime-local"
            value={newTask.end}
            onChange={(e) => setNewTask({ ...newTask, end: e.target.value })}
            className="border rounded p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Рок</label>
          <input
            type="datetime-local"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
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
  style={{
    backgroundColor: "rgba(139, 127, 199, 1)",
  }}
  onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(120, 110, 175, 1)")}
  onMouseOut={(e) => (e.target.style.backgroundColor = "rgba(139, 127, 199, 1)")}
>
  Додади задача
</button>
    </div>
  );
}
