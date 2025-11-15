import React, { useState } from "react";
import instance from "../../custom-axios/axios";

export default function SubtaskItem({ subtask, reloadTask, token }) {
  const [loading, setLoading] = useState(false);

  const breakdownSubtask = async () => {
    setLoading(true);
    try {
      await instance.post(
        `/subtasks/${subtask.id}/breakdown`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      reloadTask();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="subtask-box" style={{ marginLeft: "20px", marginTop: "5px" }}>
      <div className="subtask-header">
        <strong>{subtask.title}</strong>
        {subtask.estimatedMinutes != null && (
          <span className="subtask-time">⏱ {subtask.estimatedMinutes} мин</span>
        )}
        <button className="subtask-breakdown-btn" onClick={breakdownSubtask}>
          {loading ? "..." : "Break down"}
        </button>
      </div>

      {subtask.description && (
        <p className="subtask-desc">{subtask.description}</p>
      )}

      {subtask.children?.length > 0 &&
        subtask.children.map((child) => (
          <SubtaskItem
            key={child.id}
            subtask={child}
            reloadTask={reloadTask}
            token={token}
          />
        ))}
    </div>
  );
}
