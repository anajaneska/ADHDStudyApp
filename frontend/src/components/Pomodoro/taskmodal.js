import React from "react";

export default function TaskModal({
  tasks,
  setShowTaskModal,
  setSelectedTask,
  setIsRunning,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Избери задача за фокус</h3>
        <ul>
          {tasks.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => {
                  setSelectedTask(t);
                  setShowTaskModal(false);
                  setIsRunning(true);
                }}
              >
                {t.title}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="btn btn-cancel"
          onClick={() => setShowTaskModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
