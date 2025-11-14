import React, { useState } from "react";
import instance from "../../../custom-axios/axios";

export default function SummaryViewer({ file }) {
  const [summary, setSummary] = useState(file.summary?.content || "");
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const generateSummary = async () => {
    setLoading(true);
    const res = await instance.post(`/files/${userId}/${file.id}/summarize`);
    setSummary(res.data.content);
    setLoading(false);
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
        <div className="mt-4 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
          {summary}
        </div>
      )}
    </div>
  );
}
