import React, { useState } from "react";
import instance from "../../custom-axios/axios";

export default function SubtaskItem({ subtask, reloadTask, token }) {
  const [loading, setLoading] = useState(false);


  return (
    <div className="subtask-box" style={{ marginLeft: "20px", marginTop: "5px" }}>
      <div className="subtask-header">
        <strong>{subtask.title}</strong>
      </div>

      {subtask.description && (
        <p className="subtask-desc">{subtask.description}</p>
      )}


    </div>
  );
}
