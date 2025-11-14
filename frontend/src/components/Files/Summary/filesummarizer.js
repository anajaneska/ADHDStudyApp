import React, { useState } from "react";
import instance from "../../../custom-axios/axios";

export default function FileSummarizer() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const res = await instance.post("/ai/summarize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSummary(res.data.summary); // show only the latest summary
      setFile(null); // reset file input
    } catch (err) {
      console.error(err);
      setError("Failed to upload or summarize the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md w-full max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">Upload File & Summarize</h2>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept=".pdf,.docx,.txt"
      />
      <button
        className="ml-2 bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Processing..." : "Upload & Summarize"}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {summary && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <h3 className="font-bold">Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
