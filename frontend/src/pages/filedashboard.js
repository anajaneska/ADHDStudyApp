import React, { useState, useEffect } from "react";
import instance from "../custom-axios/axios";

const FileDashboard = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  // Load user files
  useEffect(() => {
    instance.get(`/files/${userId}`)
      .then(res => setFiles(res.data))
      .catch(err => console.error("Error loading files:", err));
  }, [userId]);

  // Upload file
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await instance.post(`/files/${userId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFiles(prev => [...prev, res.data]);
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  // Generate summary
  const handleSummarize = async (fileId) => {
    setLoading(true);
    try {
      const res = await instance.post(`/files/${userId}/${fileId}/summarize`);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, summary: res.data } : f));
      alert("Summary generated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to summarize file.");
    } finally {
      setLoading(false);
    }
  };

  // Generate flashcards
  const handleFlashcards = async (fileId) => {
    setLoading(true);
    try {
      const res = await instance.post(`/files/${userId}/${fileId}/flashcards`);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, flashcards: res.data } : f));
      alert("Flashcards generated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to generate flashcards.");
    } finally {
      setLoading(false);
    }
  };

  // Generate quiz
  const handleQuiz = async (fileId) => {
    setLoading(true);
    try {
      const res = await instance.post(`/files/${userId}/${fileId}/quiz`);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, quiz: res.data } : f));
      alert("Quiz generated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  // View summary
  const viewSummary = async (fileId) => {
    setLoading(true);
    try {
      const res = await instance.get(`/files/${userId}/${fileId}/summary`);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, summary: res.data } : f));
    } catch (err) {
      console.error(err);
      alert("No summary found for this file.");
    } finally {
      setLoading(false);
    }
  };

  // View flashcards
  const viewFlashcards = async (fileId) => {
    setLoading(true);
    try {
      const res = await instance.get(`/files/${userId}/${fileId}/flashcards`);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, flashcards: res.data } : f));
    } catch (err) {
      console.error(err);
      alert("No flashcards found for this file.");
    } finally {
      setLoading(false);
    }
  };

  // View quiz
  const viewQuiz = async (fileId) => {
    setLoading(true);
    try {
      const res = await instance.get(`/files/${userId}/${fileId}/quiz`);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, quiz: res.data } : f));
    } catch (err) {
      console.error(err);
      alert("No quiz found for this file.");
    } finally {
      setLoading(false);
    }
  };

  // Delete summary
  const deleteSummary = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this summary?")) return;
    try {
      await instance.delete(`/files/${fileId}/summary`);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, summary: null } : f));
      alert("Summary deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete summary.");
    }
  };

  // Delete flashcards
  const deleteFlashcards = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete these flashcards?")) return;
    try {
      await instance.delete(`/files/${fileId}/flashcards`);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, flashcards: null } : f));
      alert("Flashcards deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete flashcards.");
    }
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">📂 File Dashboard</h1>

      {/* Upload Section */}
      <div className="mb-6">
        <input type="file" onChange={handleFileUpload} disabled={uploading} />
        {uploading && <p className="text-gray-600 mt-2">Uploading...</p>}
      </div>

      {/* File List */}
      <h2 className="text-xl font-semibold mb-2">Your Files</h2>
      <ul className="border rounded p-4 bg-gray-50">
        {files.length === 0 && <p>No files uploaded yet.</p>}
        {files.map(file => {
          // Parse flashcards JSON safely
          let flashcardsArray = [];
          if (file.flashcards?.flashcardData) {
            try {
              const cleanData = file.flashcards.flashcardData.replace(/```/g, "").trim();
              flashcardsArray = JSON.parse(cleanData);
            } catch (err) {
              console.error("Failed to parse flashcards JSON:", err);
            }
          }

          // Parse quiz JSON safely
          let quizArray = [];
          if (file.quiz?.quizData) {
            try {
              const cleanQuiz = file.quiz.quizData.replace(/```/g, "").trim();
              quizArray = JSON.parse(cleanQuiz);
            } catch (err) {
              console.error("Failed to parse quiz JSON:", err);
            }
          }

          return (
            <li key={file.id} className="mb-6 border-b pb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{file.fileName}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSummarize(file.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Summarize
                  </button>
                  <button
                    onClick={() => handleFlashcards(file.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Flashcards
                  </button>
                  <button
                    onClick={() => handleQuiz(file.id)}
                    className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                  >
                    Quiz
                  </button>
                  <button
                    onClick={() => viewSummary(file.id)}
                    className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                  >
                    View Summary
                  </button>
                  <button
                    onClick={() => viewFlashcards(file.id)}
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                  >
                    View Flashcards
                  </button>
                  <button
                    onClick={() => viewQuiz(file.id)}
                    className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900"
                  >
                    View Quiz
                  </button>
                </div>
              </div>

              {/* Summary Display */}
              {file.summary && (
                <div className="mt-2 border p-4 rounded bg-gray-100">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold mb-2">📝 Summary</h3>
                    <button
                      onClick={() => deleteSummary(file.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="whitespace-pre-line">{file.summary.content}</p>
                </div>
              )}

              {/* Flashcards Display */}
              {flashcardsArray.length > 0 && (
                <div className="mt-2 border p-4 rounded bg-gray-100">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold mb-2">🎓 Flashcards</h3>
                    <button
                      onClick={() => deleteFlashcards(file.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {flashcardsArray.map((card, idx) => (
                      <li key={idx} className="p-2 border rounded bg-white shadow-sm">
                        <strong>Q:</strong> {card.question}
                        <br />
                        <strong>A:</strong> {card.answer}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quiz Display */}
              {quizArray.length > 0 && (
                <div className="mt-2 border p-4 rounded bg-gray-100">
                  <h3 className="text-lg font-semibold mb-2">📝 Quiz</h3>
                  {quizArray.map((q, idx) => (
                    <div key={idx} className="mb-2 p-2 border rounded bg-white shadow-sm">
                      <p className="font-medium">{idx + 1}. {q.question}</p>
                      <ul className="mt-1 space-y-1">
                        {q.options.map((opt, i) => (
                          <li key={i}>
                            <input type="radio" name={`q${idx}`} id={`q${idx}_opt${i}`} className="mr-2"/>
                            <label htmlFor={`q${idx}_opt${i}`}>{opt}</label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {loading && <p className="mt-4 text-gray-500">Processing...</p>}
    </div>
  );
};

export default FileDashboard;
