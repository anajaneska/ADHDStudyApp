import React from "react";

export default function TaskModal({
  tasks,
  setShowTaskModal,
  setSelectedTask,
  setIsRunning,
}) {
  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "500px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        <h3>Избери задача за фокус</h3>
        <ul>
          {tasks.map((t) => (
            <li key={t.id} style={{ marginBottom: "8px" }}>
              <button
                onClick={() => {
                  setSelectedTask(t);
                  setShowTaskModal(false);
                  setIsRunning(true);
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: "#f0f0f0",
                  cursor: "pointer",
                }}
              >
                {t.title}
              </button>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: "12px", textAlign: "right" }}>
          <button
            className="btn-secondary"
            onClick={() => setShowTaskModal(false)}
          >
            Откажи
          </button>
        </div>
      </div>
    </div>
  );
}
