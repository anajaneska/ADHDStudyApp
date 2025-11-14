import React, { useState } from "react";
import instance from "../../../custom-axios/axios"; // adjust path if needed

export default function Summarizer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setSummary("");

    try {
      const res = await instance.post("/ai/summarize", { text });

      if (res.data.summary) {
        setSummary(res.data.summary);
      } else if (res.data.error) {
        setError(res.data.error);
      } else {
        setError("Unknown error occurred");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to summarize. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-2xl max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-center">AI Summarizer</h2>

      <textarea
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full border p-3 rounded mb-4 resize-none"
      />

      <button
        onClick={handleSummarize}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
        disabled={loading}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {summary && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Summary:</h3>
          <p className="whitespace-pre-wrap bg-gray-100 p-3 rounded">{summary}</p>
        </div>
      )}
    </div>
  );
}
