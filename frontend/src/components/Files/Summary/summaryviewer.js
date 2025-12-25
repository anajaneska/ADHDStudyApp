import React, { useState } from "react"; 
import instance from "../../../custom-axios/axios";
import { FaTrash } from "react-icons/fa";

export default function SummaryViewer({ file }) {
  const [summary, setSummary] = useState(file.summary?.content || "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const userId = localStorage.getItem("userId");

  // Generate summary
  const generateSummary = async () => {
    setLoading(true);
    try {
      const res = await instance.post(`/files/${userId}/${file.id}/summarize`);
      setSummary(res.data.content);
    } finally {
      setLoading(false);
    }
  };

  // Delete summary
  const deleteSummary = async () => {
    if (!window.confirm("Дали сте сигурни дека сакате да ја избришете сумаризацијата?")) return;

    setDeleting(true);
    try {
      await instance.delete(`/files/${file.id}/summary`);
      setSummary(""); // clear UI
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="position-relative"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Generate button */}
      {!summary && (
        <button
          onClick={generateSummary}
          className="btn btn-primary mb-3"
          disabled={loading}
        >
          {loading ? "Генерирање..." : "Генерирај сумаризација"}
        </button>
      )}

      {/* Summary display */}
      {summary && (
        <div className="card position-relative h-100 overflow-auto">
          {/* Trash icon (top-right) */}
          <button
            onClick={deleteSummary}
            title="Delete Summary"
            className="btn position-absolute top-0 end-0 m-2 p-0"
            style={{ fontSize: "1.2rem" }}
            disabled={deleting}
          >
            <FaTrash />
          </button>

          {/* Summary content */}
          <div className="card-body">
            <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {summary}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
