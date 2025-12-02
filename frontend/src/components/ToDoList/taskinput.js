import React from "react";
import TagPicker from "./tagpicker";

export default function TaskInput({ newTask, setNewTask, addTask, tags, userId }) {

  const handleTagChange = (tagIds) => {
    setNewTask({ ...newTask, tagIds });
  };

  return (
    <div className="task-input">
      <input
        type="text"
        placeholder="Title"
        value={newTask.title}
        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
      />

      <textarea
        placeholder="Description"
        value={newTask.description}
        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
      />

      <div className="task-dates">
        <label>
          Start:
          <input
            type="datetime-local"
            value={newTask.start}
            onChange={(e) => setNewTask({ ...newTask, start: e.target.value })}
          />
        </label>
        <label>
          End:
          <input
            type="datetime-local"
            value={newTask.end}
            onChange={(e) => setNewTask({ ...newTask, end: e.target.value })}
          />
        </label>
        <br />
        <label>
          Due date:
          <input
            type="datetime-local"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
        </label>
      </div>

      {/* Tag Picker */}
      <TagPicker
        userId={userId}
        selectedTagIds={newTask.tagIds}
        onTagChange={handleTagChange}
        tags = {tags}
      />

      <button onClick={addTask}>Add Task</button>
    </div>
  );
}
