import React, { useState } from "react";
import instance from "../../../custom-axios/axios";

export default function SummaryViewer({ file }) {
  const [summary, setSummary] = useState(file.summary?.content || "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const userId = localStorage.getItem("userId");

  const generateSummary = async () => {
    setLoading(true);
    try {
      const res = await instance.post(`/files/${userId}/${file.id}/summarize`);
      setSummary(res.data.content);
    } finally {
      setLoading(false);
    }
  };

  const deleteSummary = async () => {
    setDeleting(true);
    try {
      await instance.delete(`/files/${file.id}/summary`);
      setSummary(""); // clear UI
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {!summary && (
        <button
          onClick={generateSummary}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Generating..." : "Generate Summary"}
        </button>
      )}

      {summary && (
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
            {summary}
          </div>

          <button
            onClick={deleteSummary}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            {deleting ? "Deleting..." : "Delete Summary"}
          </button>
        </div>
      )}
    </div>
  );
}
