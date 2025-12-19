import React, { useState } from "react";
import instance from "../../../custom-axios/axios";

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
    if (!window.confirm("Are you sure you want to delete the summary?")) return;

    setDeleting(true);
    try {
      await instance.delete(`/files/${file.id}/summary`);
      setSummary(""); // clear UI
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative">
      {/* Generate button */}
      {!summary && (
        <button
          onClick={generateSummary}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Summary"}
        </button>
      )}

      {/* Summary display */}
      {summary && (
        <div className="mt-4 relative">
          {/* Trash icon (top-right) */}
          <button
            onClick={deleteSummary}
            title="Delete Summary"
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition text-xl"
            disabled={deleting}
          >
            🗑️
          </button>

          {/* Summary content */}
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}
    </div>
  );
}
