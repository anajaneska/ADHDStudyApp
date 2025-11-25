import React from "react";

export default function TaskInput({ newTask, setNewTask, addTask }) {
  return (
    <div className="task-input">
      <input
        type="text"
        placeholder="Наслов"
        value={newTask.title}
        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
      />
      <textarea
        placeholder="Опис"
        value={newTask.description}
        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
      />
      <div className="task-dates">
        <label>
          Start:
          <input
            type="datetime-local"
            value={newTask.plannedStart}
            onChange={(e) => setNewTask({ ...newTask, plannedStart: e.target.value })}
          />
        </label>
        <br/>
        <label>
         Due date:
          <input
            type="datetime-local"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
        </label>
      </div>
      <button onClick={addTask}>Add task</button>
    </div>
  );
}
